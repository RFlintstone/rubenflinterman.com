'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {Campaign, Character, LoreEntry, Quest, Quote} from '@/types';

const INITIAL_CAMPAIGNS: Campaign[] = [
    {
        id: '1',
        name: "My First Adventure",
        theme: "amber",
        summary: "Welcome to your new campaign."
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
    setParty: (party: Character[]) => void;
    quests: Quest[];
    setQuests: (quests: Quest[]) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({children}: { children: ReactNode }) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [lore, setLore] = useState<LoreEntry[]>([]);
    const [party, setParty] = useState<Character[]>([]);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Mocking an API call based on a "user"
    useEffect(() => {
        async function fetchUserCampaigns() {
            try {
                setIsLoading(true);
                // Replace this with your actual API call:
                // const data = await api.getCampaigns(user.id);
                const data = INITIAL_CAMPAIGNS;

                setCampaigns(data);
                if (data.length > 0) setActiveCampaign(data[0]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchUserCampaigns();
    }, [/* user?.id would go here */]);

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
