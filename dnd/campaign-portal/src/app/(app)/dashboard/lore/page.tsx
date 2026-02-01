'use client';

import './lore.css';
import {ChevronDown, Edit3, Layers, Trash2, X} from 'lucide-react';
import {useCampaign} from '@/lib/CampaignContext';
import {useEffect, useState} from "react";

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
    const {activeCampaign} = useCampaign();
    const [isLorePromptOpen, setIsLorePromptOpen] = useState(false);
    const [editingLore, setEditingLore] = useState<LoreEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loreToDelete, setLoreToDelete] = useState<string | null>(null);

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
                headers: {'Authorization': `Bearer ${userToken}`}
            });
            if (response.ok) {
                const fetchedLore = await response.json();

                // Check for new lore entries
                const newLore = fetchedLore.filter((l: {
                    id: string;
                }) => !loreEntries.some(existing => existing.id === l.id));

                // Check for deleted lore entries
                const deletedLore = loreEntries.filter(l => !fetchedLore.some((fetched: {
                    id: string;
                }) => fetched.id === l.id));

                // Check for edited lore entries (updatedAt timestamp changed)
                const editedLore = fetchedLore.filter((fetched: { id: string; updatedAt: string; }) => {
                    const existing = loreEntries.find(l => l.id === fetched.id);
                    return existing && existing.updatedAt !== fetched.updatedAt;
                });

                // Only update state if there are changes OR this is the initial load
                if (newLore.length > 0 || deletedLore.length > 0 || editedLore.length > 0 || loreEntries.length === 0) {
                    setLoreEntries(fetchedLore);

                    // Add only the new lore IDs to the state (skip on initial load)
                    if (loreEntries.length > 0 && newLore.length > 0) {
                        setNewLoreIds(new Set(newLore.map((l: { id: any; }) => l.id)));

                        // Remove the animation class after animation
                        setTimeout(() => {
                            setNewLoreIds(new Set());
                        }, 3000);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to fetch lore", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchLore();
    }, [activeCampaign?.id]);

    // Periodic check for new lore
    useEffect(() => {
        if (!activeCampaign?.id) return;

        const interval = setInterval(() => {
            fetchLore();
        }, 5000);

        return () => clearInterval(interval);
    }, [activeCampaign?.id, loreEntries]);

    const handleSaveLore = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const userToken = localStorage.getItem('userToken');
        const formData = new FormData(e.currentTarget);
        const loreData = {
            title: formData.get('title'),
            content: formData.get('content'),
            status: formData.get('status')
        };

        const url = editingLore
            ? `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/lore/${editingLore.id}`
            : `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/lore`;

        try {
            const response = await fetch(url, {
                method: editingLore ? 'PUT' : 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}`},
                body: JSON.stringify(loreData),
            });

            if (response.ok) {
                const saved = await response.json();
                setLoreEntries((prev) => {
                    const updatedLore = editingLore
                        ? prev.map((l) => (l.id === saved.id ? saved : l))
                        : [saved, ...prev];

                    return updatedLore;
                });

                // Trigger animation for new lore
                if (!editingLore) {
                    setNewLoreIds((prev) => new Set([...prev, saved.id]));
                    setTimeout(() => {
                        setNewLoreIds((prev) => {
                            const updated = new Set(prev);
                            updated.delete(saved.id);
                            return updated;
                        });
                    }, 3000);
                }

                closeModal();
            }
        } catch (err) {
            console.error("Operation failed", err);
        }
    };

    const handleDeleteClick = (id: string) => {
        setLoreToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!loreToDelete) return;

        const userToken = localStorage.getItem('userToken');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/lore/${loreToDelete}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${userToken}`}
            });
            if (response.ok) {
                setLoreEntries(prev => prev.filter(l => l.id !== loreToDelete));
            }
        } catch (err) {
            console.error("Delete failed", err);
        } finally {
            setIsDeleteModalOpen(false);
            setLoreToDelete(null);
        }
    };

    const closeModal = () => {
        setIsLorePromptOpen(false);
        setEditingLore(null);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setLoreToDelete(null);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'known':
                return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'rumor':
                return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            case 'secret':
                return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            default:
                return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        }
    };

    return (
        <div className="flex flex-col items-center min-h-64 text-slate-600 p-4 pb-24">
            {loading ? (
                <div className="animate-pulse flex flex-col items-center mt-20">
                    <Layers size={48} className="mb-4 opacity-10 text-slate-400"/>
                    <p className="text-sm uppercase tracking-widest opacity-30">Loading Lore...</p>
                </div>
            ) : loreEntries.length > 0 ? (
                <div className="w-full max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {loreEntries.map((lore: LoreEntry) => (
                            <div
                                key={lore.id}
                                className={`group relative p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg shadow-lg hover:border-slate-500 transition-all ${
                                    newLoreIds.has(lore.id) ? 'new-lore' : ''
                                }`}
                            >
                                {/* Management Actions */}
                                <div
                                    className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setEditingLore(lore);
                                            setIsLorePromptOpen(true);
                                        }}
                                        className="p-1 text-slate-400 hover:text-white transition-colors bg-slate-800/80 rounded"
                                    >
                                        <Edit3 size={14}/>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(lore.id)}
                                        className="p-1 text-slate-400 hover:text-red-400 transition-colors bg-slate-800/80 rounded"
                                    >
                                        <Trash2 size={14}/>
                                    </button>
                                </div>

                                {/* Status Badge */}
                                <div className="mb-2">
                                    <span
                                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(lore.status)}`}>
                                        {lore.status}
                                    </span>
                                </div>

                                {/* Lore Content */}
                                <h3 className="text-base font-bold text-slate-200 mb-2 line-clamp-2">
                                    {lore.title}
                                </h3>
                                <p className="text-sm text-slate-400 line-clamp-4">
                                    {lore.content}
                                </p>
                                <p>
                                    {new Date(lore.updatedAt) > new Date(lore.createdAt) ? (
                                        <span className="text-xs text-slate-500 italic mt-4 block">
                                            Last updated: {new Date(lore.updatedAt).toLocaleDateString()}
                                            <br/>
                                            Created on: {new Date(lore.createdAt).toLocaleDateString()}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-500 italic mt-4 block">
                                            Created on: {new Date(lore.createdAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center mt-20">
                    <Layers size={48} className="mb-4 opacity-20"/>
                    <p className="text-xl font-serif uppercase tracking-widest opacity-50">lore system ready</p>
                </div>
            )}

            {/* Floating Action Button */
            }
            <button
                onClick={() => setIsLorePromptOpen(true)}
                className={`fixed bottom-8 right-8 md:bottom-12 md:right-12 group ${bgClass} ${hoverClass} text-white rounded-full p-5 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-3xl z-40 animate-pulse hover:animate-none`}
                title="Add new lore entry"
            >
                <div className="relative flex items-center gap-3">
                    <Edit3 size={28} className="transition-transform group-hover:rotate-12"/>
                    <span
                        className="absolute right-full mr-4 whitespace-nowrap bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg pointer-events-none">
                        Add Lore Entry
                    </span>
                    <span
                        className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-ping"></span>
                </div>
            </button>

            {/* Delete Confirmation Modal */
            }
            {
                isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Confirm Deletion</h2>
                                <button
                                    onClick={closeDeleteModal}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X size={24}/>
                                </button>
                            </div>
                            <p className="text-slate-700 mb-6">Are you sure you want to delete this lore entry forever?</p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={closeDeleteModal}
                                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add/Edit Lore Modal */
            }
            {
                isLorePromptOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">
                                    {editingLore ? 'Edit Lore Entry' : 'New Lore Entry'}
                                </h2>
                                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                                    <X size={24}/>
                                </button>
                            </div>

                            <form className="space-y-4" onSubmit={handleSaveLore}>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-slate-700">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        defaultValue={editingLore?.title || ""}
                                        placeholder="Enter a title for this lore entry"
                                        className={`w-full border border-slate-200 rounded-md p-2 outline-none focus:ring-2 ${ringClass} text-slate-800`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-slate-700">Status</label>
                                    <div className="relative">
                                        <select
                                            name="status"
                                            className="w-full border border-slate-200 rounded-md p-2 appearance-none text-slate-700 bg-white"
                                            defaultValue={editingLore?.status || "known"}
                                            required
                                        >
                                            <option value="known">Known</option>
                                            <option value="rumor">Rumor</option>
                                            <option value="secret">Secret</option>
                                        </select>
                                        <ChevronDown className="absolute right-2 top-3 text-slate-400 pointer-events-none"
                                                     size={16}/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-slate-700">Content</label>
                                    <textarea
                                        name="content"
                                        rows={6}
                                        defaultValue={editingLore?.content || ""}
                                        placeholder="Describe this piece of lore..."
                                        className={`w-full border border-slate-200 rounded-md p-2 outline-none focus:ring-2 ${ringClass} text-slate-800`}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className={`w-full py-3 ${bgClass} text-white rounded-lg font-bold mt-2 shadow-md hover:brightness-110 transition-all`}
                                >
                                    {editingLore ? 'Update Lore Entry' : 'Save to Campaign'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>
    )
        ;
}