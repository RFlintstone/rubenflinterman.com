'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Map as MapIcon, Plus, Trash2, Maximize2, ZoomIn, ZoomOut, Edit3, X, Eye,
    EyeOff, Loader2, Folder, ChevronDown, ChevronRight, FolderPlus, Lock, Menu
} from 'lucide-react';
import { useCampaign } from '@/lib/CampaignContext';
import { useUser } from '@/lib/UserContext';

type MapEntry = {
    id: string;
    title: string;
    imageUrl: string;
    isPublic: boolean;
    category: string;
};

export default function MapPage() {
    const { activeCampaign } = useCampaign();
    const { user } = useUser();

    const isDM = useMemo(() => {
        if (!user?.id || !activeCampaign) return false;
        const dmId = activeCampaign.dungeonmaster?.id || activeCampaign.dungeonMasterId;
        return user.id.toString().toLowerCase() === dmId?.toString().toLowerCase();
    }, [user, activeCampaign]);

    const [maps, setMaps] = useState<MapEntry[]>([]);
    const [activeMap, setActiveMap] = useState<MapEntry | null>(null);
    const [zoom, setZoom] = useState(1);
    const [isSyncing, setIsSyncing] = useState(false);

    // Interaction State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [touchActiveMapId, setTouchActiveMapId] = useState<string | null>(null);

    const [customCategories, setCustomCategories] = useState<string[]>(["Private", "Uncategorized"]);
    const [expandedCats, setExpandedCats] = useState<string[]>(["Uncategorized", "Private"]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ title: '', imageUrl: '', isPublic: true, category: 'Uncategorized' });

    const isBlue = activeCampaign?.campaignTheme === 'blue';
    const bgClass = isBlue ? 'bg-blue-600' : 'bg-amber-600';

    const occupiedCats = useMemo(() =>
            Array.from(new Set(maps.map(m => m.category || "Uncategorized"))),
        [maps]);

    const allCategories = useMemo(() => {
        return Array.from(new Set([...customCategories, ...occupiedCats]))
            .filter(cat => {
                if (isDM) return true;
                if (cat === "Private") return false;
                return occupiedCats.includes(cat);
            });
    }, [customCategories, occupiedCats, isDM]);

    useEffect(() => {
        setExpandedCats(prev => {
            const stillOccupied = prev.filter(cat => occupiedCats.includes(cat));
            const newlyOccupied = occupiedCats.filter(cat => !prev.includes(cat));
            const nextState = [...stillOccupied, ...newlyOccupied];
            if (JSON.stringify(prev.sort()) !== JSON.stringify(nextState.sort())) {
                return nextState;
            }
            return prev;
        });
    }, [occupiedCats]);

    const fetchMaps = useCallback(async (silent = false) => {
        if (!activeCampaign?.id) return;
        if (!silent) setIsSyncing(true);
        const token = localStorage.getItem('userToken');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/Campaign/${activeCampaign.id}/maps`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });
            if (res.ok) {
                const data: MapEntry[] = await res.json();
                const filtered = isDM ? data : data.filter(m => m.isPublic);
                setMaps(prev => JSON.stringify(prev) === JSON.stringify(filtered) ? prev : filtered);
                if (filtered.length > 0 && !activeMap) setActiveMap(filtered[0]);
                if (activeMap && !isDM) {
                    const exists = filtered.find(m => m.id === activeMap.id);
                    if (!exists) setActiveMap(null);
                }
            }
        } finally { setIsSyncing(false); }
    }, [activeCampaign?.id, activeMap, isDM]);

    useEffect(() => {
        fetchMaps();
        const interval = setInterval(() => fetchMaps(true), 4000);
        return () => clearInterval(interval);
    }, [fetchMaps]);

    // MAP MOVE LOGIC (Unified for Desktop/Mobile)
    const moveMapToCategory = async (mapId: string, targetCategory: string) => {
        const mapToUpdate = maps.find(m => m.id === mapId);
        if (!mapToUpdate || mapToUpdate.category === targetCategory) return;

        const token = localStorage.getItem('userToken');
        const updatedMap = {
            ...mapToUpdate,
            category: targetCategory,
            isPublic: targetCategory === "Private" ? false : mapToUpdate.isPublic
        };

        // Optimistic UI update
        setMaps(prev => prev.map(m => m.id === mapId ? updatedMap : m));

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/Campaign/${activeCampaign?.id}/map/${mapId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updatedMap)
            });
            fetchMaps(true);
        } catch (err) {
            console.error("Failed to move map:", err);
            fetchMaps(); // Rollback on error
        }
    };

    const onDrop = (e: React.DragEvent, targetCategory: string) => {
        e.preventDefault();
        const mapId = e.dataTransfer.getData("mapId");
        moveMapToCategory(mapId, targetCategory);
    };

    const handleTouchEnd = (targetCategory: string) => {
        if (touchActiveMapId) {
            moveMapToCategory(touchActiveMapId, targetCategory);
            setTouchActiveMapId(null);
        }
    };

    const addCategory = () => {
        const name = prompt("Enter new category name:");
        if (name && !customCategories.includes(name)) {
            setCustomCategories(prev => [...prev, name]);
        }
    };

    const deleteCategory = (cat: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (cat === "Uncategorized" || cat === "Private") return;
        if (maps.some(m => m.category === cat)) {
            alert("Cannot delete a category that contains maps.");
            return;
        }
        setCustomCategories(prev => prev.filter(c => c !== cat));
    };

    const toggleVisibility = async (map: MapEntry, e: React.MouseEvent) => {
        e.stopPropagation();
        if (map.category === "Private") return;
        const token = localStorage.getItem('userToken');
        const newStatus = !map.isPublic;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/Campaign/${activeCampaign?.id}/map/${map.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...map, isPublic: newStatus })
            });
            fetchMaps();
        } catch (err) { console.error(err); }
    };

    const handleSaveMap = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('userToken');
        const finalData = { ...formData, isPublic: formData.category === "Private" ? false : formData.isPublic };
        const isEditing = !!editingId;
        const url = isEditing
            ? `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/Campaign/${activeCampaign?.id}/map/${editingId}`
            : `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/Campaign/${activeCampaign?.id}/map`;

        const res = await fetch(url, {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(finalData)
        });
        if (res.ok) {
            setIsModalOpen(false);
            setEditingId(null);
            fetchMaps();
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] md:h-[calc(100vh-160px)] gap-4 overflow-hidden relative">

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden absolute top-4 left-4 z-40 p-2 bg-slate-900 rounded-lg border border-slate-700 text-white shadow-lg"
            >
                <Menu size={20} />
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 p-4 transform transition-transform duration-300 md:relative md:translate-x-0 md:flex md:w-80 md:bg-transparent md:p-0
                ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                <div className="flex flex-col w-full h-full gap-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-serif text-slate-300">Atlas</h2>
                            {isSyncing && <Loader2 size={14} className="animate-spin text-slate-600" />}
                        </div>
                        <div className="flex gap-1">
                            {isDM && <button onClick={addCategory} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-800 transition-colors"><FolderPlus size={18} /></button>}
                            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1.5 text-slate-400"><X size={20}/></button>
                            {isDM && (
                                <button onClick={() => { setEditingId(null); setFormData({title: '', imageUrl: '', isPublic: true, category: 'Uncategorized'}); setIsModalOpen(true); }} className={`${bgClass} p-1.5 rounded-md text-white shadow-lg`}><Plus size={18} /></button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {allCategories.map(cat => (
                            <div
                                key={cat}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => onDrop(e, cat)}
                                onTouchEnd={() => handleTouchEnd(cat)}
                                className={`rounded-xl transition-all ${touchActiveMapId ? 'border-2 border-dashed border-white/20 bg-white/5 p-1' : ''}`}
                            >
                                <div className="group flex items-center justify-between w-full p-2 text-slate-500 hover:text-slate-300">
                                    <button onClick={() => setExpandedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])} className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                                        {expandedCats.includes(cat) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                                        {cat === "Private" ? <Lock size={14} className="text-red-500/50" /> : <Folder size={14} className="text-blue-500/50" />}
                                        {cat}
                                    </button>
                                    {isDM && cat !== "Uncategorized" && cat !== "Private" && (
                                        <button onClick={(e) => deleteCategory(cat, e)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400"><Trash2 size={12} /></button>
                                    )}
                                </div>
                                {expandedCats.includes(cat) && (
                                    <div className="mt-1 space-y-1 ml-4 border-l border-slate-800/50 pl-2 mb-2 min-h-[10px]">
                                        {maps.filter(m => m.category === cat).map(m => (
                                            <div
                                                key={m.id}
                                                draggable={isDM}
                                                onDragStart={(e) => e.dataTransfer.setData("mapId", m.id)}
                                                onTouchStart={() => isDM && setTouchActiveMapId(m.id)}
                                                className={`group relative ${touchActiveMapId === m.id ? 'opacity-50 ring-2 ring-white/50 rounded-lg' : ''}`}
                                            >
                                                <button
                                                    onClick={() => { setActiveMap(m); setZoom(1); setIsSidebarOpen(false); }}
                                                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-sm ${activeMap?.id === m.id ? `${bgClass} border-transparent text-white shadow-md` : 'bg-slate-900/40 border-slate-800/50 text-slate-400 hover:border-slate-700'}`}
                                                >
                                                    <div className="flex items-center gap-2 truncate pr-14">
                                                        <MapIcon size={14} />
                                                        <span className="truncate">{m.title}</span>
                                                        {!m.isPublic && <EyeOff size={10} className="text-amber-500" />}
                                                    </div>
                                                </button>
                                                {isDM && (
                                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center md:opacity-0 group-hover:opacity-100 bg-slate-900/90 rounded-md border border-slate-700 p-0.5">
                                                        <button onClick={(e) => toggleVisibility(m, e)} className="p-1 text-slate-400 hover:text-white transition-colors">
                                                            {m.isPublic ? <Eye size={12}/> : <EyeOff size={12} className={m.category === "Private" ? "text-slate-600" : "text-amber-500"}/>}
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); setEditingId(m.id); setFormData(m); setIsModalOpen(true); }} className="p-1 text-slate-400 hover:text-white"><Edit3 size={12}/></button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Mobile Backdrop */}
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" />}

            {/* Main Viewer */}
            <main className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden group shadow-2xl">
                {activeMap ? (
                    <>
                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => setZoom(z => Math.min(z + 0.5, 4))} className="p-2 bg-slate-900/90 text-white rounded-lg border border-slate-700 hover:bg-slate-800"><ZoomIn size={20}/></button>
                            <button onClick={() => setZoom(1)} className="p-2 bg-slate-900/90 text-white rounded-lg border border-slate-700 hover:bg-slate-800"><Maximize2 size={20}/></button>
                            <button onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))} className="p-2 bg-slate-900/90 text-white rounded-lg border border-slate-700 hover:bg-slate-800"><ZoomOut size={20}/></button>
                        </div>
                        <div className="w-full h-full overflow-auto flex items-center justify-center p-4 md:p-12 custom-scrollbar">
                            <img
                                src={activeMap.imageUrl}
                                alt={activeMap.title}
                                style={{ transform: `scale(${zoom})`, transition: 'transform 0.25s' }}
                                className={`max-w-full max-h-full rounded shadow-2xl origin-center ${!activeMap.isPublic ? 'grayscale-[0.5] brightness-50' : ''}`}
                            />
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto flex flex-col bg-slate-900/80 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">{activeMap.category}</span>
                            <h3 className="text-lg md:text-xl font-serif text-white truncate">{activeMap.title}</h3>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-800 font-serif tracking-widest uppercase opacity-20 text-center px-4">Select a map from the Atlas</div>
                )}
            </main>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-2 md:p-4">
                    <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] w-full max-w-md shadow-2xl text-slate-900 overflow-y-auto max-h-[95vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif font-bold">{editingId ? 'Modify Map' : 'New Map'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900"><X size={28}/></button>
                        </div>
                        <form onSubmit={handleSaveMap} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Title</label>
                                    <input type="text" className="w-full p-3 bg-slate-100 rounded-2xl outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Category</label>
                                    <select className="w-full p-3 bg-slate-100 rounded-2xl outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className={`flex items-center gap-3 bg-slate-100 rounded-2xl px-4 min-h-[52px] ${formData.category === "Private" ? "opacity-50" : ""}`}>
                                    <input type="checkbox" className="w-5 h-5" checked={formData.category === "Private" ? false : formData.isPublic} onChange={(e) => setFormData({...formData, isPublic: e.target.checked})} disabled={formData.category === "Private"} />
                                    <span className="text-xs font-bold text-slate-600">Public</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Image URL</label>
                                <input type="url" className="w-full p-3 bg-slate-100 rounded-2xl outline-none" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} required />
                            </div>
                            <button type="submit" className={`w-full py-4 ${bgClass} text-white rounded-2xl font-black shadow-2xl transition-all active:scale-95 text-base uppercase tracking-widest`}>Save</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}