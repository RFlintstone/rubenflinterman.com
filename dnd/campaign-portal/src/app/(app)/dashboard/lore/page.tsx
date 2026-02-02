'use client';

import './lore.css';
import { Book, Lock, ChevronDown, Edit3, Ghost, Layers, MessageCircle, Trash2, X, LucideIcon } from 'lucide-react';
import { useCampaign } from '@/lib/CampaignContext';
import { useUser } from '@/lib/UserContext';
import {useEffect, useMemo, useState} from "react";

type LoreEntry = {
    id: string;
    title: string;
    content: string;
    status: string;
    campaignId: string;
    createdAt: string;
    updatedAt: string;
};

export default function LorePage() {
    const { activeCampaign } = useCampaign();
    const { user } = useUser();
    const [isLorePromptOpen, setIsLorePromptOpen] = useState(false);
    const [editingLore, setEditingLore] = useState<LoreEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loreToDelete, setLoreToDelete] = useState<string | null>(null);

    const isDM = useMemo(() => {
        // If no user or no active campaign, return false
        if (!user?.id || !activeCampaign) return false;

        // Compare user ID with DM ID from campaign
        const dmId = activeCampaign.dungeonmaster?.id || activeCampaign.dungeonMasterId;

        // Return boolean comparison (case-insensitive)
        return user.id.toString().toLowerCase() === dmId?.toString().toLowerCase();
    }, [user?.id, activeCampaign]);

    const isBlue = activeCampaign?.campaignTheme === 'blue';
    const bgClass = isBlue ? 'bg-blue-600' : 'bg-amber-600';
    const hoverClass = isBlue ? 'hover:bg-blue-700' : 'hover:bg-amber-700';
    const ringClass = isBlue ? 'focus:ring-blue-500' : 'focus:ring-amber-500';

    const [newLoreIds, setNewLoreIds] = useState<Set<string>>(new Set());

    const fetchLore = async () => {
        if (!activeCampaign?.id) return;
        const userToken = localStorage.getItem('userToken');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign.id}/lore`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            if (response.ok) {
                const fetchedLore = await response.json();
                setLoreEntries(fetchedLore);
            }
        } catch (err) {
            console.error("Failed to fetch lore", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLore(); }, [activeCampaign?.id]);

    const handleSaveLore = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isDM) return;
        const userToken = localStorage.getItem('userToken');
        const formData = new FormData(e.currentTarget);
        const loreData = {
            title: formData.get('title'),
            content: formData.get('content'),
            status: formData.get('status')
        };
        const url = editingLore ? `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/lore/${editingLore.id}` : `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/lore`;

        try {
            const response = await fetch(url, {
                method: editingLore ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
                body: JSON.stringify(loreData),
            });
            if (response.ok) {
                fetchLore();
                closeModal();
            }
        } catch (err) { console.error("Operation failed", err); }
    };

    const confirmDelete = async () => {
        if (!loreToDelete || !isDM) return;
        const userToken = localStorage.getItem('userToken');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/lore/${loreToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            if (response.ok) {
                setLoreEntries(prev => prev.filter(l => l.id !== loreToDelete));
            }
        } catch (err) { console.error("Delete failed", err); } finally { setIsDeleteModalOpen(false); setLoreToDelete(null); }
    };

    const closeModal = () => { setIsLorePromptOpen(false); setEditingLore(null); };
    const closeDeleteModal = () => { setIsDeleteModalOpen(false); setLoreToDelete(null); };

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            // case 'not-published': return { color: "#666d7a", icon: Ghost, css: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
            // case 'known': return { color: "#18794e", icon: Book, css: 'bg-green-500/20 text-green-300 border-green-500/30' };
            // case 'rumor': return { color: "#a16207", icon: MessageCircle, css: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
            // case 'secret': return { color: "#7c3aed", icon: Lock, css: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
            // default: return { color: "#64748b", icon: Layers, css: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
            case 'not-published': return { color: "#64748b", icon: Ghost, css: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
            case 'known': return { color: "#64748b", icon: Book, css: 'bg-green-500/20 text-green-300 border-green-500/30' };
            case 'rumor': return { color: "#64748b", icon: MessageCircle, css: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
            case 'secret': return { color: "#64748b", icon: Lock, css: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
            default: return { color: "#64748b", icon: Layers, css: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
        }
    };

    return (
        <div className="flex flex-col items-center min-h-64 text-slate-600 p-4 pb-24">
            {loading ? (
                <div className="animate-pulse flex flex-col items-center mt-20">
                    <Layers size={48} className="mb-4 opacity-10 text-slate-400" />
                    <p className="text-sm uppercase tracking-widest opacity-30">Loading Lore...</p>
                </div>
            ) : loreEntries.length > 0 ? (
                <div className="w-full max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {loreEntries.map((lore) => {
                            const styles = getStatusStyles(lore.status);
                            const IconComponent = styles.icon;

                            if (lore.status === 'not-published' && !isDM) return null;

                            return (
                                <div key={lore.id} className={`group relative p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg shadow-lg hover:border-slate-500 transition-all ${newLoreIds.has(lore.id) ? 'new-lore' : ''}`}>

                                    <IconComponent
                                        color={styles.color}
                                        size={90}
                                        className="absolute top-[42%] left-[80%] -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none"
                                    />

                                    {isDM && (
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button onClick={() => { setEditingLore(lore); setIsLorePromptOpen(true); }} className="p-1 text-slate-400 hover:text-white transition-colors bg-slate-800/80 rounded">
                                                <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => { setLoreToDelete(lore.id); setIsDeleteModalOpen(true); }} className="p-1 text-slate-400 hover:text-red-400 transition-colors bg-slate-800/80 rounded">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}

                                    <div className="mb-2">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${styles.css}`}>
                                            {lore.status.replace('-', ' ')}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-200 mb-2 line-clamp-2">{lore.title}</h3>
                                    <p className="text-sm text-slate-400 line-clamp-4">{lore.content}</p>

                                    <div className="text-xs text-slate-500 italic mt-4 space-y-1 block">
                                        <p>Created: {new Date(lore.createdAt).toLocaleDateString()}</p>
                                        {new Date(lore.updatedAt) > new Date(lore.createdAt) ? (
                                            <p>Updated: {new Date(lore.updatedAt).toLocaleDateString()}</p>
                                        ) : (
                                            <p>Updated: never</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center mt-20">
                    <Layers size={48} className="mb-4 opacity-20" />
                    <p className="text-xl font-serif uppercase tracking-widest opacity-50">lore system ready</p>
                </div>
            )}

            {isDM && (
                <button
                    onClick={() => setIsLorePromptOpen(true)}
                    className={`fixed bottom-24 right-8 md:bottom-12 md:right-12 group ${bgClass} ${hoverClass} text-white rounded-full p-5 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 z-40 animate-pulse hover:animate-none`}
                >
                    <Edit3 size={28} />
                </button>
            )}

            {/* Modals Logic */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-slate-900">
                        <h2 className="text-2xl font-bold mb-6">Confirm Deletion</h2>
                        <div className="flex justify-end gap-4">
                            <button onClick={closeDeleteModal} className="px-6 py-2 bg-slate-200 rounded-lg">Cancel</button>
                            <button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-lg">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {isLorePromptOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-slate-900">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">{editingLore ? 'Edit Lore' : 'New Lore'}</h2>
                            <button onClick={closeModal}><X size={24}/></button>
                        </div>
                        <form className="space-y-4" onSubmit={handleSaveLore}>
                            <input name="title" defaultValue={editingLore?.title} className={`w-full border rounded-md p-2 outline-none focus:ring-2 ${ringClass}`} placeholder="Title" required />
                            <select name="status" defaultValue={editingLore?.status || "known"} className="w-full border rounded-md p-2 bg-white">
                                <option value="not-published">Not Published</option>
                                <option value="known">Known</option>
                                <option value="rumor">Rumor</option>
                                <option value="secret">Secret</option>
                            </select>
                            <textarea name="content" rows={6} defaultValue={editingLore?.content} className={`w-full border rounded-md p-2 outline-none focus:ring-2 ${ringClass}`} placeholder="Content" required />
                            <button type="submit" className={`w-full py-3 ${bgClass} text-white rounded-lg font-bold`}>Save</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}