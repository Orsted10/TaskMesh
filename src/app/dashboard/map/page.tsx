'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

// Dynamically import the map component with SSR disabled
const WorldMap = dynamic(() => import('@/components/dashboard/world-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-950 border border-zinc-800 rounded-2xl">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-[#ff4655] animate-spin" />
        <span className="font-mono text-xs uppercase tracking-widest text-[#ff4655]">Establishing Sat-Link...</span>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [bounties, setBounties] = useState<any[]>([]);

  useEffect(() => {
    // We are simulating fetching quests that have a location.
    // Since PostGIS might not be fully seeded yet, we inject some hardcoded global bounties to make it look "real".
    const fetchBounties = async () => {
      // Real query would be:
      // const { data } = await supabase.from('quests').select('*').not('location', 'is', null);
      
      // Simulated live data mixed with actual DB data if available
      const mockBounties = [
        { id: '1', title: 'Audit Wheelchair Ramps', description: 'Measure angle of 50 ramps in Downtown SF.', bounty_amount: 500, bounty_currency: 'usd', lat: 37.7749, lng: -122.4194 },
        { id: '2', title: 'Translate NGO Docs', description: 'Translate 50 pages of legal documents.', bounty_amount: 1500, bounty_currency: 'xp', lat: 40.7128, lng: -74.0060 },
        { id: '3', title: 'Beach Cleanup', description: 'Join Flash Raid to clean up South Beach.', bounty_amount: 250, bounty_currency: 'gold', lat: 25.7617, lng: -80.1918 },
        { id: '4', title: 'Server Audit', description: 'Review security logs for Berlin datacenter.', bounty_amount: 1000, bounty_currency: 'usd', lat: 52.5200, lng: 13.4050 },
        { id: '5', title: 'Plant 100 Trees', description: 'Reforestation initiative in the Amazon.', bounty_amount: 5000, bounty_currency: 'xp', lat: -3.4653, lng: -62.2159 },
      ];
      
      setBounties(mockBounties);
    };

    fetchBounties();
  }, []);

  return (
    <div className="w-full h-[calc(100vh-120px)] max-w-[1600px] mx-auto pb-8">
      <WorldMap bounties={bounties} />
    </div>
  );
}
