'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {AlertTriangle, Edit3, LogOut, Scroll, Shield, Trash2, UserCheck, UserCircle, X} from 'lucide-react';
import {useCampaign} from '@/lib/CampaignContext';
import {useUser} from "@/lib/UserContext";

// --- STABLE AVATAR POOL ---
const FANTASY_AVATARS = [
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.publicdomainpictures.net%2Fpictures%2F170000%2Fvelka%2Fforest-fantasy-6.jpg",
    "https://www.publicdomainpictures.net/pictures/620000/velka/image-1720021218ohE.jpg",
    "https://www.publicdomainpictures.net/pictures/550000/velka/fantasie-drachen-mythologie-kreatur-1698000633kcP.jpg",
];

const getAvatar = (id: string, isNpc: boolean) => {
    if (isNpc) return null;
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FANTASY_AVATARS[Math.abs(hash) % FANTASY_AVATARS.length];
};

type User = { isDm: boolean; id: string; username: string; email: string; };
type Character = { id: string; name: string; dndBeyondUrl: string; ownerId?: string; };

export default function PartyPage() {
    const {activeCampaign, party, setParty} = useCampaign();
    const {user: currentUser} = useUser();

    const isDM = useMemo(() => {
        if (!currentUser?.id || !activeCampaign) return false;
        const dmId = activeCampaign.dungeonmaster?.id || activeCampaign.dungeonMasterId;
        return currentUser.id.toString().toLowerCase() === dmId?.toString().toLowerCase();
    }, [currentUser, activeCampaign]);

    const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);
    const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
    const [formData, setFormData] = useState({name: '', enrolledUserId: '', isNpc: false});
    const [enrolledUsers, setEnrolledUsers] = useState<User[]>([]);
    const [enrollEmail, setEnrollEmail] = useState('');
    const [enrollError, setEnrollError] = useState('');

    const syncData = useCallback(async () => {
        if (!activeCampaign?.id) return;
        const userToken = localStorage.getItem('userToken');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign.id}`, {
                headers: {'Authorization': `Bearer ${userToken}`},
                cache: 'no-store'
            });
            if (response.ok) {
                const data = await response.json();
                setParty([...(data.party?.party || [])]);
                if (data.enrolledUsers) {
                    setEnrolledUsers(data.enrolledUsers.map((u: User) => ({
                        ...u,
                        isDm: data.dungeonmaster && u.id === data.dungeonmaster.id
                    })));
                }
            }
        } catch (err) {
            console.error('Sync error:', err);
        }
    }, [activeCampaign?.id, setParty]);

    useEffect(() => {
        syncData();
        const interval = setInterval(syncData, 8000);
        return () => clearInterval(interval);
    }, [syncData]);

    const themeColor = activeCampaign?.campaignTheme === 'blue' ? 'blue' : 'amber';
    const textClass = themeColor === 'blue' ? 'text-blue-500' : 'text-amber-500';
    const bgClass = themeColor === 'blue' ? 'bg-blue-600' : 'bg-amber-600';
    const hoverClass = themeColor === 'blue' ? 'hover:bg-blue-700' : 'hover:bg-amber-700';

    const handleUnenroll = async (userId: string) => {
        const isSelf = userId === currentUser?.id;
        if (!confirm(isSelf ? "Leave campaign?" : "Remove player?")) return;
        const userToken = localStorage.getItem('userToken');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/enroll/${userId}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${userToken}`}
            });
            if (res.ok) isSelf ? window.location.href = '/campaigns' : await syncData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddCharacter = async (e: React.FormEvent) => {
        e.preventDefault();
        const userToken = localStorage.getItem('userToken');
        const finalOwnerId = formData.isNpc ? (activeCampaign?.dungeonmaster?.id || activeCampaign?.dungeonMasterId) : formData.enrolledUserId;

        try {
            const url = editingCharacter
                ? `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/character/${editingCharacter.id}`
                : `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/character`;

            const res = await fetch(url, {
                method: editingCharacter ? 'PUT' : 'POST',
                headers: {'Content-Type': 'application/json', Authorization: `Bearer ${userToken}`},
                body: JSON.stringify({
                    name: formData.isNpc ? `[NPC] ${formData.name}` : formData.name,
                    dndBeyondUrl: editingCharacter?.dndBeyondUrl || 'https://www.dndbeyond.com/characters/null',
                    ownerId: finalOwnerId || null
                }),
            });

            if (res.ok) {
                await syncData();
                setIsCharacterModalOpen(false);
                setEditingCharacter(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEnrollUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnrollError('');
        const userToken = localStorage.getItem('userToken');
        try {
            const searchRes = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/search-user?email=${encodeURIComponent(enrollEmail)}`, {
                headers: {'Authorization': `Bearer ${userToken}`},
            });
            if (!searchRes.ok) return setEnrollError('User not found.');
            const targetUser = await searchRes.json();
            const enrollRes = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/enroll/${targetUser.id}`, {
                method: 'POST',
                headers: {'Authorization': `Bearer ${userToken}`},
            });
            if (enrollRes.ok) {
                setEnrollEmail('');
                setIsEnrollModalOpen(false);
                await syncData();
            }
        } catch (err) {
            setEnrollError('Error enrolling user.');
        }
    };

    const handleDeleteCharacter = async () => {
        const userToken = localStorage.getItem('userToken');
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/character/${characterToDelete}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${userToken}`}
            });
            await syncData();
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4">
            {/* HEROES */}
            <section className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className={`text-3xl font-serif ${textClass}`}>Party Members</h2>
                    {isDM && (
                        <button onClick={() => {
                            setEditingCharacter(null);
                            setFormData({name: '', enrolledUserId: '', isNpc: false});
                            setIsCharacterModalOpen(true);
                        }} className={`${bgClass} text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg`}>
                            <Shield size={18}/><span>Add Character</span>
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {party?.filter(m => !m.name.startsWith('[NPC]')).map(m => (
                        <CharacterCard key={m.id} member={m} isDmUser={isDM} currentUserId={currentUser?.id}
                                       enrolledUsers={enrolledUsers}
                                       onEdit={() => {
                                           setEditingCharacter(m);
                                           setFormData({name: m.name, enrolledUserId: m.ownerId || '', isNpc: false});
                                           setIsCharacterModalOpen(true);
                                       }}
                                       onDelete={() => {
                                           setCharacterToDelete(m.id);
                                           setIsDeleteModalOpen(true);
                                       }}/>
                    ))}
                </div>
            </section>

            {/* NPCS */}
            <section className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className={`text-3xl font-serif ${textClass}`}>World NPCs</h2>
                    {isDM && (
                        <button onClick={() => {
                            setEditingCharacter(null);
                            setFormData({name: '', enrolledUserId: '', isNpc: true});
                            setIsCharacterModalOpen(true);
                        }} className="bg-slate-800 text-slate-300 px-6 py-2 rounded-xl flex items-center gap-2">
                            <Scroll size={18}/><span>Add NPC</span>
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                    {party?.filter(m => m.name.startsWith('[NPC]')).map(m => (
                        <CharacterCard key={m.id} member={m} isDmUser={isDM} currentUserId={currentUser?.id}
                                       enrolledUsers={enrolledUsers} isNpc
                                       onEdit={() => {
                                           setEditingCharacter(m);
                                           setFormData({
                                               name: m.name.replace('[NPC] ', ''),
                                               enrolledUserId: m.ownerId || '',
                                               isNpc: true
                                           });
                                           setIsCharacterModalOpen(true);
                                       }}
                                       onDelete={() => {
                                           setCharacterToDelete(m.id);
                                           setIsDeleteModalOpen(true);
                                       }}/>
                    ))}
                </div>
            </section>

            {/* ENROLLED PLAYERS */}
            <section className="space-y-6 pt-6 border-t border-slate-800">
                <div className="flex justify-between items-center">
                    <h2 className={`text-2xl font-serif ${textClass}`}>Enrolled Players</h2>
                    {isDM && (
                        <button onClick={() => setIsEnrollModalOpen(true)}
                                className={`${bgClass} text-white px-4 py-2 rounded-lg flex items-center gap-2`}>
                            <UserCheck size={18}/><span>Enroll Player</span>
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {enrolledUsers.map((u) => (
                        <div key={u.id}
                             className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 ${bgClass} rounded-full flex items-center justify-center font-bold text-white uppercase`}>{u.username[0]}</div>
                                <div>
                                    <p className="text-white font-bold">{u.username}</p>
                                    <p className="text-xs text-slate-500">{u.isDm ? 'Dungeon Master' : 'Player'}</p>
                                </div>
                            </div>
                            {((isDM && !u.isDm) || (u.id === currentUser?.id)) && (
                                <button onClick={() => handleUnenroll(u.id)}
                                        className="text-slate-500 hover:text-red-500 p-2"><LogOut size={18}/></button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* CHARACTER MODAL */}
            {isCharacterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div
                        className={`p-8 rounded-3xl w-full max-w-md border ${formData.isNpc ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white text-slate-900'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">{editingCharacter ? 'Edit' : 'New'} {formData.isNpc ? 'NPC' : 'Character'}</h2>
                            <button onClick={() => setIsCharacterModalOpen(false)}><X size={24}/></button>
                        </div>
                        <form className="space-y-5" onSubmit={handleAddCharacter}>
                            <input type="text" className="w-full rounded-xl p-3 border bg-transparent"
                                   placeholder="Name" value={formData.name}
                                   onChange={(e) => setFormData({...formData, name: e.target.value})} required/>
                            {!formData.isNpc && isDM && (
                                <select className="w-full rounded-xl p-3 border bg-transparent"
                                        value={formData.enrolledUserId}
                                        onChange={(e) => setFormData({...formData, enrolledUserId: e.target.value})}>
                                    <option value="">Assign to Player...</option>
                                    {enrolledUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                                </select>
                            )}
                            <button type="submit"
                                    className={`w-full py-4 rounded-xl font-bold text-white ${bgClass}`}>Save
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ENROLL MODAL */}
            {isEnrollModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-md text-white">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Enroll Player</h2>
                            <button onClick={() => setIsEnrollModalOpen(false)}><X size={24}/></button>
                        </div>
                        <form className="space-y-4" onSubmit={handleEnrollUser}>
                            <input type="email" className="w-full rounded-xl p-3 border border-slate-700 bg-slate-800"
                                   placeholder="User Email" value={enrollEmail}
                                   onChange={(e) => setEnrollEmail(e.target.value)} required/>
                            {enrollError && <p className="text-red-500 text-sm">{enrollError}</p>}
                            <button type="submit"
                                    className={`w-full py-4 rounded-xl font-bold text-white ${bgClass}`}>Enroll
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
                    <div
                        className="bg-slate-900 border border-red-900/50 p-8 rounded-3xl max-w-sm w-full text-center space-y-6">
                        <AlertTriangle size={40} className="mx-auto text-red-500"/>
                        <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 py-3 bg-slate-800 text-white rounded-xl">Cancel
                            </button>
                            <button onClick={handleDeleteCharacter}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CharacterCard({member, isNpc, isDmUser, currentUserId, onEdit, onDelete, enrolledUsers}: any) {
    const owner = enrolledUsers.find((u: any) => u.id === member.ownerId);
    const isOwner = member.ownerId === currentUserId;
    const canEdit = isDmUser || (isOwner && !isNpc);
    const avatar = useMemo(() => getAvatar(member.id, !!isNpc), [member.id, isNpc]);

    return (
        <div
            className={`group border p-5 rounded-2xl relative transition-all bg-slate-900 border-slate-800 shadow-lg hover:border-slate-700`}>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {canEdit &&
                    <button onClick={onEdit} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                        <Edit3 size={14}/></button>}
                {isDmUser && <button onClick={onDelete}
                                     className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-500"><Trash2
                    size={14}/></button>}
            </div>
            <div className="flex items-center gap-4 text-white">
                <div
                    className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-800 flex-shrink-0">
                    {avatar ? <img src={avatar} className="w-full h-full object-cover" alt=""/> :
                        <div className="w-full h-full flex items-center justify-center text-xl font-serif text-slate-500">{isNpc ? "NPC" : member.name[0]} </div>
                    }
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold truncate text-lg">{member.name.replace('[NPC] ', '')}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">{isNpc ? <Scroll size={12}/> :
                        <UserCircle
                            size={12}/>} {isNpc ? 'NPC' : owner ? `Played by ${owner.username}` : 'No Owner'}</p>
                </div>
            </div>
        </div>
    );
}