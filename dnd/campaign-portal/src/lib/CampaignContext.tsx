'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState, useCallback } from 'react';
import { Campaign, Character, LoreEntry, QuestsCollection, Quote } from '@/types';
import { useUser } from "@/lib/UserContext";

interface CampaignContextType {
    campaigns: Campaign[];
    activeCampaign: Campaign | null;
    setActiveCampaign: (campaign: Campaign) => void;
    quotes: Quote[];
    setQuotes: (quotes: Quote[]) => void;
    lore: LoreEntry[];
    setLore: (lore: LoreEntry[]) => void;
    party: Character[];
    setParty: (party: any[]) => void;
    quests: QuestsCollection | null;
    setQuests: (quests: QuestsCollection | null) => void;
    getDm: Character | null;
    setDm: (dm: Character | null) => void;
    isLoading: boolean;
    updateCampaign: (data: { name: string; summary: string; campaignTheme: string }) => Promise<void>;
    refreshCampaigns: () => Promise<void>;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: ReactNode }) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [lore, setLore] = useState<LoreEntry[]>([]);
    const [party, setParty] = useState<Character[]>([]);
    const [quests, setQuests] = useState<QuestsCollection | null>(null);
    const [getDm, setDm] = useState<Character | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { user } = useUser();

    /**
     * Fetches all campaigns owned by or shared with the user.
     * Exported as refreshCampaigns to allow manual triggers after creation/deletion.
     */
    const refreshCampaigns = useCallback(async () => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/mine`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const campaignsList = (data.campaigns || []).map((campaign: any) => ({
                    ...campaign,
                    campaignTheme: campaign.theme, // Map backend 'theme' to frontend 'campaignTheme'
                }));

                setCampaigns(campaignsList);

                if (campaignsList.length > 0) {
                    const storedCampaignId = localStorage.getItem('campaignId');
                    const selectedCampaign = campaignsList.find((c: { id: string }) =>
                        c.id === storedCampaignId
                    ) || campaignsList[0];

                    setActiveCampaign(selectedCampaign);
                } else {
                    setActiveCampaign(null);
                }
            }
        } catch (error) {
            console.error("Error refreshing campaigns:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Updates an existing campaign's metadata.
     */
    const updateCampaign = async (data: { name: string; campaignTheme: string; summary: string }) => {
        if (!activeCampaign) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: data.name || activeCampaign.name,
                    theme: data.campaignTheme || activeCampaign.campaignTheme,
                    summary: data.summary || activeCampaign.summary,
                    dungeonmaster: activeCampaign.dungeonmaster ? { id: activeCampaign.dungeonmaster.id } : null
                })
            });

            if (response.ok) {
                // Refresh local state
                setActiveCampaign(prev => prev ? { ...prev, ...data } : null);
                await refreshCampaigns();
            }
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    // Initial Load
    useEffect(() => {
        refreshCampaigns();
    }, [user, refreshCampaigns]);

    /**
     * Sub-data Fetching
     * Triggers whenever the activeCampaign ID changes.
     */
    useEffect(() => {
        if (!activeCampaign?.id) return;

        // Reset sub-states for clean loading UI
        setQuotes([]);
        setParty([]);
        setQuests(null);
        setLore([]);
        setDm(null);

        async function fetchCampaignDetails() {
            const token = localStorage.getItem('userToken');
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setQuotes(data.quotes || []);
                    setParty(data.party?.party || []);
                    setQuests(data.quests || null);
                    setLore(data.loreEntries || []);
                    setDm(data.dungeonmaster || null);

                    localStorage.setItem('campaignId', activeCampaign?.id as string);
                }
            } catch (err) {
                console.error("Failed to sync campaign details:", err);
            }
        }

        fetchCampaignDetails();
    }, [activeCampaign?.id]);

    return (
        <CampaignContext.Provider
            value={{
                campaigns,
                activeCampaign,
                setActiveCampaign,
                quotes,
                setQuotes,
                lore,
                setLore,
                party,
                setParty,
                quests,
                setQuests,
                getDm,
                setDm,
                isLoading,
                updateCampaign,
                refreshCampaigns
            }}
        >
            {children}
        </CampaignContext.Provider>
    );
}

export function useCampaign() {
    const context = useContext(CampaignContext);
    if (context === undefined) {
        throw new Error('useCampaign must be used within a CampaignProvider');
    }
    return context;
}