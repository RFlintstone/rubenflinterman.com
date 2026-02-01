'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {Campaign, Character, LoreEntry, QuestsCollection, Quote} from '@/types';
import {useUser} from "@/lib/UserContext";

const INITIAL_CAMPAIGNS: Campaign[] = [
    {
        id: '1',
        name: "My First Adventure",
        campaignTheme: "Fantasy",
        summary: "Welcome to your new campaign.",
        dungeonmaster: null
    },
];

interface CampaignContextType {
    campaigns: Campaign[];
    activeCampaign: Campaign | null;
    setActiveCampaign: (campaign: Campaign) => void;
    quotes: Quote[];
    setQuotes: (quotes: Quote[]) => void;
    lore: LoreEntry[];
    setLore: (lore: LoreEntry[]) => void;
    party: Character[];
    setParty: (party: (prev: any) => any[]) => void;
    quests: QuestsCollection | null;
    setQuests: (quests: QuestsCollection | null) => void;
    getDm: Character | null;
    setDm: (dm: Character | null) => void;
    isLoading: boolean;
    updateCampaign: (data: { name: string; summary: string; campaignTheme: string }) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({children}: { children: ReactNode }) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [lore, setLore] = useState<LoreEntry[]>([]);
    const [party, setParty] = useState<Character[]>([]);
    const [quests, setQuests] = useState<QuestsCollection | null>(null);
    const [getDm, setDm] = useState<Character | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const {user} = useUser(); // Get user from UserContext
    const addQuote = (newQuote: Quote) => {
        setQuotes(prev => [...prev, newQuote]);
    };

    const updateCampaign = async (data: { name: string; campaignTheme: string; summary: string }) => {
        // Logic to update the campaign (e.g., API call or state update)
        console.log("Trying to save: ", data);

        if (!activeCampaign) return;

        // Update the activeCampaign state for the current page
        setActiveCampaign(prev =>
            prev
                ? {
                    ...prev,
                    name: data.name,
                    campaignTheme: data.campaignTheme,
                    summary: data.summary
                } as Campaign
                : null
        );

        // Update the database
        const response = fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: data.name || activeCampaign.name,
                theme: data.campaignTheme || activeCampaign.campaignTheme,
                summary: data.summary || activeCampaign.summary,
                dungeonmaster: activeCampaign.dungeonmaster ? {id: activeCampaign.dungeonmaster.id} : null
            })
        });

        console.log("Update response: ", response);
    };

    // Fetch campaigns for the user
    useEffect(() => {
        async function fetchUserCampaigns() {
            const token = localStorage.getItem('userToken');

            if (!token) return;

            try {
                setIsLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/mine`, {
                    headers: {'Authorization': `Bearer ${token}`}
                });

                if (response.ok) {
                    const data = await response.json();
                    const campaignsList = (data.campaigns || []).map((campaign: any) => ({
                        ...campaign,
                        campaignTheme: campaign.theme, // Map `theme` to `campaignTheme`
                    }));

                    setCampaigns(campaignsList);
                    console.log("Campaigns fetched:", campaignsList);

                    if (campaignsList.length > 0) {
                        const storedCampaignId = localStorage.getItem('campaignId');
                        const selectedCampaign = campaignsList.find((c: {
                            id: string
                        }) => c.id === storedCampaignId) || campaignsList[0];

                        setActiveCampaign(selectedCampaign);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        }

        fetchUserCampaigns();
    }, [user]);

    // When activeCampaign changes, fetch the sub-data (Quotes, Party, etc.)
    useEffect(() => {
        if (!activeCampaign) return;

        // Clear old data immediately so the UI shows a clean slate/loading state
        setQuotes([]);
        setParty([]);
        setQuests(null);
        setLore([]);
        setDm(null);

        async function fetchCampaignDetails() {
            const token = localStorage.getItem('userToken');

            try {
                // Check if there is an active campaign
                if (!activeCampaign) return;

                // Fetch campaign details
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign.id}`, {
                    headers: {'Authorization': `Bearer ${token}`}
                });

                // If response is OK, parse and set the data
                if (response.ok && activeCampaign) {
                    const data = await response.json();

                    // Map your backend properties to your frontend state
                    setQuotes(data.quotes || []);
                    setParty(data.party.party || []);
                    setQuests(data.quests || null);
                    setLore(data.loreEntries || []);
                    setDm(data.dungeonmaster || null);

                    // Store current campaign ID in localStorage
                    localStorage.setItem('campaignId', activeCampaign.id);
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
                updateCampaign
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
