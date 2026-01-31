'use client';

import {useState} from 'react';
import {ExternalLink, Link as LinkIcon, UserPlus, X} from 'lucide-react';
import {useCampaign} from '@/lib/CampaignContext';

export default function PartyPage() {
    const {activeCampaign, party, setParty} = useCampaign();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({name: '', dndBeyondUrl: ''});

    // Theme Logic
    const isBlue = activeCampaign?.theme === 'blue';
    const textClass = isBlue ? 'text-blue-500' : 'text-amber-500';
    const bgClass = isBlue ? 'bg-blue-600' : 'bg-amber-600';
    const ringClass = isBlue ? 'focus:ring-blue-500' : 'focus:ring-amber-500';

    const handleAddCharacter = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!activeCampaign?.id) return;

        const userToken = localStorage.getItem('userToken');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign.id}/character`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const newCharacter = await response.json();
                setParty((prev) => [...prev, newCharacter]); // Update the party state
                setIsOpen(false); // Close the modal
                setFormData({name: '', dndBeyondUrl: ''}); // Reset the form
            } else {
                console.error('Failed to add character');
            }
        } catch (err) {
            console.error('Error adding character:', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className={`text-3xl font-serif ${textClass}`}>Characters</h2>
                <button
                    onClick={() => setIsOpen(true)}
                    className={`${bgClass} text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:brightness-110 transition-all shadow-md`}
                >
                    <UserPlus size={18}/>
                    <span>Add Member</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(!party || party.length === 0) ? (
                    <div
                        className="col-span-full text-center py-20 text-slate-600 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                        <p className="text-xl font-serif italic text-slate-500">The road is empty. Add characters to
                            begin.</p>
                    </div>
                ) : (
                    party.map((member) => (
                        <div key={member.id}
                             className="group bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg hover:border-slate-700 transition-all">
                            <h3 className="text-xl font-bold text-white mb-4">{member.name}</h3>
                            <a
                                href={member.dndBeyondUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                <ExternalLink size={14}/>
                                <span>View on D&D Beyond</span>
                            </a>
                        </div>
                    ))
                )}
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div
                        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">New Party Member</h2>
                            <button onClick={() => setIsOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24}/>
                            </button>
                        </div>

                        <form className="space-y-6" onSubmit={handleAddCharacter}>
                            <div>
                                <label
                                    className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Character
                                    Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Bob the Artificer"
                                    className={`w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 ${ringClass} text-slate-700`}
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">D&D
                                    Beyond Link</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                              size={18}/>
                                    <input
                                        type="url"
                                        placeholder="https://www.dndbeyond.com/characters/..."
                                        className={`w-full border border-slate-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 ${ringClass} text-slate-700 text-sm`}
                                        value={formData.dndBeyondUrl}
                                        onChange={(e) => setFormData({...formData, dndBeyondUrl: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit"
                                    className={`w-full py-4 ${bgClass} text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]`}>
                                Add to Party
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}