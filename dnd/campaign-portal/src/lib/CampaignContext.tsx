'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {Campaign, Character, LoreEntry, Quest, Quote} from '@/types';
import {useUser} from "@/lib/UserContext";

const INITIAL_CAMPAIGNS: Campaign[] = [
    {
        id: '1',
        name: "My First Adventure",
        theme: "amber",
        summary: "Welcome to your new campaign.",
        dungeonmaster: undefined
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
    quests: Quest[];
    setQuests: (quests: Quest[]) => void;
    getDm: Character | null;
    setDm: (dm: Character | null) => void;
    isLoading: boolean;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({children}: { children: ReactNode }) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [lore, setLore] = useState<LoreEntry[]>([]);
    const [party, setParty] = useState<Character[]>([]);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [getDm, setDm] = useState<Character | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const {user} = useUser(); // Get user from UserContext
    const addQuote = (newQuote: Quote) => {
        setQuotes(prev => [...prev, newQuote]);
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
                    const campaignsList = data.campaigns || []; // Extract the array

                    setCampaigns(campaignsList);
                    console.log("Campaigns fetched:", campaignsList);

                    if (campaignsList.length > 0) {
                        setActiveCampaign(campaignsList[0]);
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
        if (!activeCampaign?.id) return;

        // Clear old data immediately so the UI shows a clean slate/loading state
        setQuotes([]);
        setParty([]);
        setQuests([]);
        setLore([]);
        setDm(null);

        async function fetchCampaignDetails() {
            const token = localStorage.getItem('userToken');
            try {
                // Using your new [HttpGet("{id}")] endpoint
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}`, {
                    headers: {'Authorization': `Bearer ${token}`}
                });

                if (response.ok) {
                    const data = await response.json();
                    // Map your backend properties to your frontend state
                    setQuotes(data.quotes || []);
                    setParty(data.party.party || []);
                    setQuests(data.quests || []);
                    setLore(data.loreEntries || []);
                    setDm(data.dungeonmaster || null);
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
