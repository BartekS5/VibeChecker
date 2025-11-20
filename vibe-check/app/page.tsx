"use strict";
"use client"; // This is required for React hooks (useState) in the App Router

import { useState } from 'react';
import { Music, Zap, CloudRain, Coffee, PartyPopper, Play } from 'lucide-react';

// Define Types for our data
interface Track {
  id: string;
  name: string;
  external_urls: { spotify: string };
  album: {
    images: { url: string }[];
  };
  artists: { name: string }[];
}

interface Vibe {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  params: {
    seed_genres: string;
    target_valence: number;
    target_energy: number;
  };
}

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeVibe, setActiveVibe] = useState<string | null>(null);

  const vibes: Vibe[] = [
    {
      id: 'sad',
      label: 'Melancholy',
      icon: <CloudRain size={24} />,
      color: 'bg-blue-500',
      params: { seed_genres: 'sad,rainy-day,piano', target_valence: 0.2, target_energy: 0.3 }
    },
    {
      id: 'hyped',
      label: 'Hyped',
      icon: <Zap size={24} />,
      color: 'bg-yellow-500',
      params: { seed_genres: 'work-out,edm,hard-rock', target_valence: 0.8, target_energy: 0.9 }
    },
    {
      id: 'chill',
      label: 'Focus',
      icon: <Coffee size={24} />,
      color: 'bg-green-600',
      params: { seed_genres: 'study,classical,jazz', target_valence: 0.5, target_energy: 0.2 }
    },
    {
      id: 'party',
      label: 'Party',
      icon: <PartyPopper size={24} />,
      color: 'bg-purple-600',
      params: { seed_genres: 'pop,dance,party', target_valence: 0.9, target_energy: 0.85 }
    }
  ];

  const getVibe = async (vibe:VQ) => {
    setLoading(true);
    setActiveVibe(vibe.id);
    setTracks([]);

    try {
      // Note the path change to /api/recommend
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vibe.params),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTracks(data);
    } catch (err) {
      alert('Failed to fetch vibes. Check console.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            <Music className="text-green-500" size={48} />
            Vibe Check
          </h1>
          <p className="text-zinc-400 text-lg">
            Select your current mood, get a curated Spotify playlist instantly.
          </p>
        </div>

        {/* Vibe Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {vibes.map((vibe) => (
            <button
              key={vibe.id}
              onClick={() => getVibe(vibe)}
              className={`
                p-6 rounded-xl transition-all duration-300 flex flex-col items-center gap-3
                hover:scale-105 hover:shadow-2xl
                ${activeVibe === vibe.id ? `${vibe.color} shadow-lg scale-105` : 'bg-zinc-800 hover:bg-zinc-700'}
              `}
            >
              <div className={activeVibe === vibe.id ? 'text-white' : 'text-zinc-300'}>
                {vibe.icon}
              </div>
              <span className="font-bold text-lg">{vibe.label}</span>
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-zinc-800 h-24 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tracks.map((track) => (
                <a 
                  key={track.id} 
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-800 group rounded-lg p-4 flex items-center gap-4 hover:bg-zinc-700 transition-colors"
                >
                  {/* Album Art */}
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <img 
                      src={track.album.images[0]?.url} 
                      alt={track.name}
                      className="w-full h-full object-cover rounded-md shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                      <Play size={20} className="text-white fill-white" />
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="overflow-hidden">
                    <h3 className="font-bold truncate text-zinc-100">{track.name}</h3>
                    <p className="text-sm text-zinc-400 truncate">
                      {track.artists.map(a => a.name).join(', ')}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
          
          {!loading && tracks.length === 0 && !activeVibe && (
            <div className="text-center text-zinc-500 mt-12">
              Pick a vibe above to start discoverin'
            </div>
          )}
        </div>

      </div>
    </div>
  );
}