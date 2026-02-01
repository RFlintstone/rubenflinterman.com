'use client';

import {useEffect, useState} from 'react';
import {ExternalLink, Link as LinkIcon, UserCheck, UserMinus, UserPlus, Users, X} from 'lucide-react';
import {useCampaign} from '@/lib/CampaignContext';
import {useUser} from "@/lib/UserContext";

type User = {
    isDm: boolean;
    id: string;
    username: string;
    email: string;
};

export default function PartyPage() {
    const {activeCampaign, party, setParty} = useCampaign();
    const {user: currentUser} = useUser();

    const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [formData, setFormData] = useState({name: '', dndBeyondUrl: '', enrolledUserId: '', isNpc: false});

    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [enrolledUsers, setEnrolledUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [enrollEmail, setEnrollEmail] = useState('');
    const [enrollError, setEnrollError] = useState('');

    // Theme Logic
    const isBlue = activeCampaign?.campaignTheme === 'blue';
    const textClass = isBlue ? 'text-blue-500' : 'text-amber-500';
    const bgClass = isBlue ? 'bg-blue-600' : 'bg-amber-600';
    const hoverClass = isBlue ? 'hover:bg-blue-700' : 'hover:bg-amber-700';
    const ringClass = isBlue ? 'focus:ring-blue-500' : 'focus:ring-amber-500';

    // Filter Logic
    const playerCharacters = party?.filter(member => !member.name.startsWith('[NPC]')) || [];
    const npcCharacters = party?.filter(member => member.name.startsWith('[NPC]')) || [];

    const openCharacterModal = (isNpcDefault: boolean) => {
        setFormData({name: '', dndBeyondUrl: '', enrolledUserId: '', isNpc: isNpcDefault});
        setIsCharacterModalOpen(true);
    };

    useEffect(() => {
        if (activeCampaign?.id) {
            fetchEnrolledUsers();
        }
    }, [activeCampaign?.id, isCharacterModalOpen, isEnrollModalOpen]);

    const fetchEnrolledUsers = async () => {
        if (!activeCampaign?.id) return;
        setLoadingUsers(true);
        const userToken = localStorage.getItem('userToken');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign.id}`, {
                headers: {'Authorization': `Bearer ${userToken}`},
            });
            if (response.ok) {
                const data = await response.json();
                const enrolled = data.enrolledUsers || [];
                if (Array.isArray(enrolled)) {
                    const enrolledFiltered = enrolled.map((user: User) => ({
                        ...user,
                        isDm: data.dungeonmaster && user.id === data.dungeonmaster.id
                    }));
                    setEnrolledUsers(enrolledFiltered);
                    setAvailableUsers(enrolledFiltered);
                }
            }
        } catch (err) {
            console.error('Error fetching enrolled users:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleAddCharacter = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!activeCampaign?.id) return;

        const finalName = formData.isNpc ? `[NPC] ${formData.name}` : formData.name;
        const userToken = localStorage.getItem('userToken');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign.id}/character`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    name: finalName,
                    dndBeyondUrl: formData.dndBeyondUrl || 'https://www.dndbeyond.com/characters/null',
                    userId: formData.enrolledUserId || null
                }),
            });

            if (response.ok) {
                const newCharacter = await response.json();
                setParty((prev) => [...prev, newCharacter]);
                setIsCharacterModalOpen(false);
                setFormData({name: '', dndBeyondUrl: '', enrolledUserId: '', isNpc: false});
            }
        } catch (err) {
            console.error('Error adding character:', err);
        }
    };

    const handleEnrollUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!activeCampaign?.id || !enrollEmail) return;
        setEnrollError('');
        const userToken = localStorage.getItem('userToken');
        try {
            const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign.id}/search-user?email=${encodeURIComponent(enrollEmail)}`, {
                headers: {'Authorization': `Bearer ${userToken}`},
            });
            if (!searchResponse.ok) {
                setEnrollError('User not found');
                return;
            }
            const userToEnroll = await searchResponse.json();
            const enrollResponse = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign.id}/enroll/${userToEnroll.id}`, {
                method: 'POST',
                headers: {'Authorization': `Bearer ${userToken}`},
            });
            if (enrollResponse.ok) {
                setEnrolledUsers(prev => [...prev, userToEnroll]);
                setEnrollEmail('');
            }
        } catch (err) {
            setEnrollError('Failed to enroll user.');
        }
    };

    const handleUnenrollUser = async (userId: string) => {
        if (!activeCampaign?.id || !confirm('Remove player?')) return;
        const userToken = localStorage.getItem('userToken');
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign.id}/unenroll/${userId}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${userToken}`},
            });
            setEnrolledUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            alert('Failed to remove player');
        }
    };

    const getCharacterPlayer = (character: any) => {
        if (character.userId) {
            const user = availableUsers.find(u => u.id === character.userId);
            return user?.username || 'Unknown Player';
        }
        return null;
    };

    const CharacterCard = ({member, isNpc = false}: { member: any, isNpc?: boolean }) => (
        <div
            className={`group bg-slate-900 border ${isNpc ? 'border-slate-800/40' : 'border-slate-800'} p-6 rounded-2xl shadow-lg hover:border-slate-700 transition-all`}>
            <div className="flex items-start justify-between mb-3">
                <h3 className={`text-xl font-bold ${isNpc ? 'text-slate-400' : 'text-white'}`}>
                    {member.name.replace('[NPC] ', '')}
                </h3>
                {member.userId && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded-md">
                        <Users size={14} className="text-slate-400"/>
                        <span className="text-xs text-slate-400">Linked</span>
                    </div>
                )}
            </div>
            {member.userId && (
                <p className="text-sm text-slate-500 mb-3">
                    Player: <span className="text-slate-300 font-medium">{getCharacterPlayer(member)}</span>
                </p>
            )}
            {!member.dndBeyondUrl || member.dndBeyondUrl.toString().includes('null') ? (
                <p className="text-sm italic text-slate-600">{isNpc ? "No sheet." : "No link."}</p>
            ) : (
                <a href={member.dndBeyondUrl} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                    <ExternalLink size={14}/>
                    <span>View on D&D Beyond</span>
                </a>
            )}
        </div>
    );

    return (
        <div className="space-y-12">
            {/* Player Characters Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className={`text-3xl font-serif ${textClass}`}>Characters</h2>
                    <div className="flex-1 border-t border-slate-800 mx-4 mt-1"/>
                    <button
                        onClick={() => openCharacterModal(false)}
                        className={`${bgClass} ${hoverClass} text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-md`}
                    >
                        <UserPlus size={18}/>
                        <span>Add Character</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {playerCharacters.length === 0 ? (
                        <div
                            className="col-span-full text-center py-10 text-slate-600 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                            <p className="text-lg font-serif italic text-slate-500">No active player characters.</p>
                        </div>
                    ) : (
                        playerCharacters.map((member) => <CharacterCard key={member.id} member={member}/>)
                    )}
                </div>
            </div>

            {/* NPCs Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className={`text-3xl font-serif ${textClass}`}>Non-Player Characters</h2>
                    <div className="flex-1 border-t border-slate-800 mx-4 mt-1"/>
                    <button
                        onClick={() => openCharacterModal(true)}
                        className={`${bgClass} ${hoverClass} text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-md`}
                    >
                        <UserPlus size={18}/>
                        <span>Add NPC</span>
                    </button>
                </div>
                {npcCharacters.length === 0 ? (
                    <div
                        className="col-span-full text-center py-10 text-slate-600 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                        <p className="text-lg font-serif italic text-slate-500">No NPCs recorded yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-90">
                        {npcCharacters.map((member) => <CharacterCard key={member.id} member={member} isNpc/>)}
                    </div>
                )}
            </div>

            {/* Enrolled Players Section */}
            <div className="space-y-6 pt-6">
                <div className="flex justify-between items-center">
                    <h2 className={`text-3xl font-serif ${textClass}`}>Enrolled Players</h2>
                    <div className="flex-1 border-t border-slate-800 mx-4 mt-1"/>
                    <button
                        onClick={() => setIsEnrollModalOpen(true)}
                        className={`${bgClass} ${hoverClass} text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-md`}
                    >
                        <UserCheck size={18}/>
                        <span>Enroll Player</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrolledUsers.map((user) => (
                        <div key={user.id}
                             className="group bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold">{user.username}</h4>
                                    {user.isDm && <p className="text-xs text-amber-500 font-bold">Dungeon Master</p>}
                                </div>
                            </div>
                            {!user.isDm && currentUser?.role == 'dm' || user.id == currentUser?.id && (
                                <button onClick={() => handleUnenrollUser(user.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-400">
                                    <UserMinus size={18}/>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Character Modal */}
            {isCharacterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div
                        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">New {formData.isNpc ? 'NPC' : 'Party Member'}</h2>
                            <button onClick={() => setIsCharacterModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                        </div>
                        <form className="space-y-6" onSubmit={handleAddCharacter}>
                            <div>
                                <label
                                    className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Name</label>
                                <input type="text"
                                       className={`w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 ${ringClass} text-slate-700`}
                                       value={formData.name}
                                       onChange={(e) => setFormData({...formData, name: e.target.value})} required/>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-100">
                                <input type="checkbox" id="isNpc"
                                       className={`w-5 h-5 rounded border-slate-300 ${textClass} focus:ring-2 ${ringClass}`}
                                       checked={formData.isNpc}
                                       onChange={(e) => setFormData({...formData, isNpc: e.target.checked})}/>
                                <label htmlFor="isNpc" className="text-sm font-medium text-slate-700 cursor-pointer">Mark
                                    as NPC</label>
                            </div>
                            <div>
                                <label
                                    className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">D&D
                                    Beyond Link</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                              size={18}/>
                                    <input type="url" placeholder="https://..."
                                           className={`w-full border border-slate-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 ${ringClass} text-slate-700 text-sm`}
                                           value={formData.dndBeyondUrl}
                                           onChange={(e) => setFormData({...formData, dndBeyondUrl: e.target.value})}/>
                                </div>
                            </div>
                            <div>
                                <label
                                    className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Link
                                    to Player</label>
                                <select
                                    className={`w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 ${ringClass} text-slate-700`}
                                    value={formData.enrolledUserId}
                                    onChange={(e) => setFormData({...formData, enrolledUserId: e.target.value})}>
                                    <option value="">No player linked</option>
                                    {availableUsers.map((user) => (
                                        user.isDm ? (
                                            <option key={user.id} value={user.id}>{user.username} (DM)</option>
                                        ) : (
                                            <option key={user.id} value={user.id}>{user.username}</option>
                                        )
                                    ))}
                                </select>
                            </div>
                            <button type="submit"
                                    className={`w-full py-4 ${bgClass} text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]`}>Add {formData.isNpc ? 'NPC' : 'Character'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Enroll Modal (Simplified) */}
            {isEnrollModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div
                        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Enroll Player</h2>
                            <button onClick={() => setIsEnrollModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                        </div>
                        <form className="space-y-6" onSubmit={handleEnrollUser}>
                            <div>
                                <label
                                    className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Email</label>
                                <input type="email"
                                       className={`w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 ${ringClass} text-slate-700`}
                                       value={enrollEmail} onChange={(e) => setEnrollEmail(e.target.value)} required/>
                            </div>
                            <button type="submit"
                                    className={`w-full py-4 ${bgClass} text-white rounded-xl font-bold shadow-lg`}>Enroll
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}