'use client';

import './quotes.css';
import {ChevronDown, Edit3, Layers, Trash2, X} from 'lucide-react';
import {useCampaign} from '@/lib/CampaignContext';
import {useEffect, useState} from "react";

type Quote = {
    id: string;
    text: string;
    author: string;
    campaignId: string;
    createdAt: string;
    updatedAt: string;
};

export default function QuotesPage() {
    const {party, activeCampaign} = useCampaign();
    const [isQuotePromptOpen, setIsQuotePromptOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);
    const [quotes, setQuotes] = useState<{
        totalQuotes: number;
        recent: Quote[];
        all: Quote[];
    }>({
        totalQuotes: 0,
        recent: [],
        all: [],
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);

    const isBlue = activeCampaign?.campaignTheme === 'blue';
    const bgClass = isBlue ? 'bg-blue-600' : 'bg-amber-600';
    const hoverClass = isBlue ? 'hover:bg-blue-700' : 'hover:bg-amber-700';
    const ringClass = isBlue ? 'focus:ring-blue-500' : 'focus:ring-amber-500';

    const [newQuoteIds, setNewQuoteIds] = useState<Set<string>>(new Set());

    const fetchQuotes = async () => {
        if (!activeCampaign?.id) return;

        const userToken = localStorage.getItem('userToken');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign.id}`, {
                headers: {'Authorization': `Bearer ${userToken}`}
            });
            if (response.ok) {
                const data = await response.json();
                const fetchedQuotes = Array.isArray(data.quotes) ? data.quotes : (data.quotes?.all || []);

                // Check for new quotes BEFORE updating state
                const newQuotes = fetchedQuotes.filter((q: {
                    id: string;
                }) => !quotes.all.some(existing => existing.id === q.id));

                // Check for deleted quotes
                const deletedQuotes = quotes.all.filter(q => !fetchedQuotes.some((fetched: {
                    id: string;
                }) => fetched.id === q.id));

                // Check for edited quotes (updatedAt timestamp changed)
                const editedQuotes = fetchedQuotes.filter((fetched: { id: string; updatedAt: string; }) => {
                    const existing = quotes.all.find(q => q.id === fetched.id);
                    return existing && existing.updatedAt !== fetched.updatedAt;
                });

                // Only update state if there are new quotes, deleted quotes, edited quotes, OR this is the initial load
                if (newQuotes.length > 0 || deletedQuotes.length > 0 || editedQuotes.length > 0 || quotes.all.length === 0) {
                    setQuotes({
                        all: fetchedQuotes,
                        totalQuotes: fetchedQuotes.length,
                        recent: fetchedQuotes.slice(-3)
                    });

                    // Add only the new quote IDs to the state (skip on initial load)
                    if (quotes.all.length > 0 && newQuotes.length > 0) {
                        setNewQuoteIds(new Set(newQuotes.map((q: { id: any; }) => q.id)));

                        // Remove the `new-quote` class after animation
                        setTimeout(() => {
                            setNewQuoteIds(new Set());
                        }, 3000);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to fetch quotes", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchQuotes();
    }, [activeCampaign?.id]);

    // Periodic check for new quotes
    useEffect(() => {
        if (!activeCampaign?.id) return;

        const interval = setInterval(() => {
            fetchQuotes();
        }, 5000);

        return () => clearInterval(interval);
    }, [activeCampaign?.id, quotes.all]);

    const handleSaveQuote = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const userToken = localStorage.getItem('userToken');
        const formData = new FormData(e.currentTarget);
        const quoteData = {text: formData.get('text'), author: formData.get('author')};

        const url = editingQuote
            ? `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/quote/${editingQuote.id}`
            : `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/quote`;

        try {
            const response = await fetch(url, {
                method: editingQuote ? 'PUT' : 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}`},
                body: JSON.stringify(quoteData),
            });

            if (response.ok) {
                const saved = await response.json();
                setQuotes((prev) => {
                    const updatedQuotes = editingQuote
                        ? prev.all.map((q) => (q.id === saved.id ? saved : q))
                        : [saved, ...prev.all];

                    return {
                        ...prev,
                        all: updatedQuotes,
                        totalQuotes: editingQuote ? prev.totalQuotes : prev.totalQuotes + 1,
                    };
                });

                // Trigger animation for new quotes
                if (!editingQuote) {
                    setNewQuoteIds((prev) => new Set([...prev, saved.id]));
                    setTimeout(() => {
                        setNewQuoteIds((prev) => {
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
        setQuoteToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!quoteToDelete) return;

        const userToken = localStorage.getItem('userToken');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/quote/${quoteToDelete}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${userToken}`}
            });
            if (response.ok) {
                setQuotes(prev => ({
                    ...prev,
                    all: prev.all.filter(q => q.id !== quoteToDelete),
                    totalQuotes: prev.totalQuotes - 1
                }));
            }
        } catch (err) {
            console.error("Delete failed", err);
        } finally {
            setIsDeleteModalOpen(false);
            setQuoteToDelete(null);
        }
    };

    const closeModal = () => {
        setIsQuotePromptOpen(false);
        setEditingQuote(null);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setQuoteToDelete(null);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-64 text-slate-600 p-4 pb-24">
            {loading ? (
                <div className="animate-pulse flex flex-col items-center">
                    <Layers size={48} className="mb-4 opacity-10 text-slate-400"/>
                    <p className="text-sm uppercase tracking-widest opacity-30">Loading Chronicles...</p>
                </div>
            ) : quotes.all.length > 0 ? (
                <div className="w-full max-w-2xl space-y-6">
                    {quotes.all.map((q: Quote) => (
                        <div
                            key={q.id}
                            className={`group relative p-6 bg-gradient-to-r from-blue-500/10 to-amber-500/10 border border-slate-700 rounded-xl shadow-md text-center hover:border-slate-500 transition-all ${
                                newQuoteIds.has(q.id) ? 'new-quote' : ''
                            }`}
                        >
                            {/* Management Actions */}
                            <div
                                className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        setEditingQuote(q);
                                        setIsQuotePromptOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                                >
                                    <Edit3 size={16}/>
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(q.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>

                            {/* Quote Content */}
                            <p className="text-lg font-serif italic text-slate-200">
                                "{q.text}"
                            </p>
                            <p className="mt-2 text-sm font-bold text-slate-400">
                                — {q.author}{q.author === activeCampaign?.dungeonmaster?.username ? " (DM)" : ""}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <Layers size={48} className="mb-4 opacity-20"/>
                    <p className="text-xl font-serif uppercase tracking-widest opacity-50">quotes system ready</p>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setIsQuotePromptOpen(true)}
                className={`fixed bottom-8 right-8 md:bottom-12 md:right-12 group ${bgClass} ${hoverClass} text-white rounded-full p-5 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-3xl z-40 animate-pulse hover:animate-none`}
                title="Add new quote"
            >
                <div className="relative flex items-center gap-3">
                    <Edit3 size={28} className="transition-transform group-hover:rotate-12"/>
                    {/* Label that appears on hover */}
                    <span
                        className="absolute right-full mr-4 whitespace-nowrap bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg pointer-events-none">
                        Add New Quote
                    </span>
                    <span
                        className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-ping"></span>
                </div>
            </button>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
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
                        <p className="text-slate-700 mb-6">Are you sure you want to delete this quote forever?</p>
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
            )}

            {/* Add/Edit Quote Modal */}
            {isQuotePromptOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {editingQuote ? 'Edit Quote' : 'New Quote'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                                <X size={24}/>
                            </button>
                        </div>

                        <form className="space-y-4" onSubmit={handleSaveQuote}>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">Author</label>
                                <div className="relative">
                                    <select
                                        name="author"
                                        className="w-full border border-slate-200 rounded-md p-2 appearance-none text-slate-700 bg-white"
                                        defaultValue={editingQuote?.author || ""}
                                        required
                                    >
                                        <option value="" disabled>Select a character</option>
                                        {party?.map((char) => (
                                            <option key={char.id} value={char.name}>{char.name}</option>
                                        ))}
                                        <option value={activeCampaign?.dungeonmaster?.username || "The DM"}>The DM
                                        </option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-3 text-slate-400 pointer-events-none"
                                                 size={16}/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">The Quote</label>
                                <textarea
                                    name="text"
                                    rows={3}
                                    defaultValue={editingQuote?.text || ""}
                                    placeholder="What was said?"
                                    className={`w-full border border-slate-200 rounded-md p-2 outline-none focus:ring-2 ${ringClass} text-slate-800`}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className={`w-full py-3 ${bgClass} text-white rounded-lg font-bold mt-2 shadow-md hover:brightness-110 transition-all`}
                            >
                                {editingQuote ? 'Update Quote' : 'Save to Campaign'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}