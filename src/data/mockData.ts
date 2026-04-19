export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number; // in seconds
  colorClass: string; // Tailwind gradient for the player
  previewUrl?: string; // Audio preview url
  lyrics?: { time: number; text: string }[];
}

export interface FriendActivity {
  id: string;
  name: string;
  avatarUrl: string;
  currentTrack: Track;
  timeAgo: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  colorClass: string;
}

export const MOCK_TRACKS: Track[] = [
  {
    id: "1",
    title: "Midnight City",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400",
    duration: 243,
    colorClass: "from-blue-900/80 to-purple-900/80",
    lyrics: [
      { time: 0, text: "(Instrumental Intro)" },
      { time: 30, text: "Waiting in a car" },
      { time: 35, text: "Waiting for a ride in the dark" },
      { time: 42, text: "The night city grows" },
      { time: 46, text: "Look and see her eyes, they glow" },
      { time: 54, text: "Waiting in a car" },
      { time: 58, text: "Waiting for a ride in the dark" },
      { time: 64, text: "Drinking in the lounge" },
      { time: 68, text: "Following the neon signs" },
      { time: 76, text: "Waiting for a roar" },
      { time: 80, text: "Looking at the mutating skyline" },
      { time: 87, text: "The city is my church" },
      { time: 91, text: "It wraps me in the sparkling twilight" }
    ]
  },
  {
    id: "2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92b?auto=format&fit=crop&q=80&w=400&h=400",
    duration: 200,
    colorClass: "from-red-900/80 to-black/80",
    lyrics: [
      { time: 0, text: "(Intro upbeat synth)" },
      { time: 26, text: "Yeah..." },
      { time: 28, text: "I've been tryna call" },
      { time: 32, text: "I've been on my own for long enough" },
      { time: 37, text: "Maybe you can show me how to love, maybe" },
      { time: 43, text: "I'm going through withdrawals" },
      { time: 47, text: "You don't even have to do too much" },
      { time: 51, text: "You can turn me on with just a touch, baby" },
      { time: 58, text: "I look around and" },
      { time: 60, text: "Sin City's cold and empty (oh)" },
      { time: 64, text: "No one's around to judge me (oh)" },
      { time: 67, text: "I can't see clearly when you're gone" },
      { time: 73, text: "I said, ooh, I'm blinded by the lights" },
      { time: 81, text: "No, I can't sleep until I feel your touch" },
      { time: 88, text: "I said, ooh, I'm drowning in the night" },
      { time: 95, text: "Oh, when I'm like this, you're the one I trust" }
    ]
  },
  {
    id: "3",
    title: "Instant Crush",
    artist: "Daft Punk",
    album: "Random Access Memories",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400&h=400",
    duration: 338,
    colorClass: "from-orange-900/80 to-yellow-900/80",
    lyrics: [
      { time: 0, text: "(Intro)" },
      { time: 20, text: "I didn't want to be the one to forget" },
      { time: 25, text: "I thought of everything I'd never regret" },
      { time: 30, text: "A little time with you is all that I get" },
      { time: 35, text: "That's all we need because it's all we can take" }
    ]
  },
  {
    id: "4",
    title: "Ocean Eyes",
    artist: "Billie Eilish",
    album: "Don't Smile at Me",
    coverUrl: "https://images.unsplash.com/photo-1458560871784-56d23406c091?auto=format&fit=crop&q=80&w=400&h=400",
    duration: 200,
    colorClass: "from-cyan-900/80 to-blue-900/80",
    lyrics: [
      { time: 0, text: "I've been watching you for some time" },
      { time: 5, text: "Can't stop staring at those ocean eyes" },
      { time: 12, text: "Burning cities and napalm skies" },
      { time: 17, text: "Fifteen flares inside those ocean eyes" }
    ]
  },
  {
    id: "5",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    coverUrl: "https://images.unsplash.com/photo-1520092364052-d3527b140fe3?auto=format&fit=crop&q=80&w=400&h=400",
    duration: 203,
    colorClass: "from-fuchsia-900/80 to-pink-900/80",
    lyrics: [
      { time: 0, text: "If you wanna run away with me, I know a galaxy" },
      { time: 4, text: "And I can take you for a ride" },
      { time: 8, text: "I had a premonition that we fell into a rhythm" },
      { time: 13, text: "Where the music don't stop for life" }
    ]
  },
  {
    id: "6",
    title: "STAY",
    artist: "The Kid LAROI & Justin Bieber",
    album: "F*CK LOVE 3: OVER YOU",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400&h=400",
    duration: 141,
    colorClass: "from-blue-600/80 to-purple-600/80",
    lyrics: [
      { time: 0, text: "I do the same thing I told you that I never would" },
      { time: 4, text: "I told you I'd change, even when I knew I never could" },
      { time: 8, text: "I know that I can't find nobody else as good as you" },
      { time: 12, text: "I need you to stay, need you to stay, hey (hey)" },
      { time: 16, text: "I get drunk, wake up, I'm wasted still" },
      { time: 20, text: "I realize the time that I wasted here" },
      { time: 24, text: "I feel like you can't feel the way I feel" },
      { time: 28, text: "Oh, I'll be fucked up if you can't be right here" },
      { time: 32, text: "Oh-oh-oh-oh, oh-oh-oh-oh, oh-oh-oh-oh" },
      { time: 38, text: "Oh-oh-oh-oh, oh-oh-oh-oh, oh-oh-oh-oh" },
      { time: 44, text: "I do the same thing I told you that I never would" },
      { time: 48, text: "I told you I'd change, even when I knew I never could" }
    ]
  },
  {
    id: "7",
    title: "São Paulo",
    artist: "The Weeknd & Anitta",
    album: "Hurry Up Tomorrow",
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400",
    duration: 302,
    colorClass: "from-orange-700/80 to-stone-900/80",
    lyrics: [
      { time: 0, text: "(Intro Instrumental)" },
      { time: 2, text: "I've been on a mission for a while" },
      { time: 6, text: "I've been tryna see if I can smile" },
      { time: 10, text: "Wait, I think I'm losing all my mind" },
      { time: 16, text: "São Paulo, tell me where to find the light" },
      { time: 32, text: "Anitta, can you take me to the place?" },
      { time: 38, text: "Where the music never leaves a trace" },
      { time: 44, text: "Just a rhythm, just a body, just a soul" },
      { time: 50, text: "I'm losing control" },
      { time: 60, text: "São Paulo, São Paulo..." },
      { time: 70, text: "Midnight in the concrete jungle" }
    ]
  }
];

export const MOCK_ALBUMS: Album[] = [
  {
    id: "a1",
    title: "Neon Nights",
    artist: "Synthwave Collection",
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-blue-500/20 to-purple-500/20"
  },
  {
    id: "a2",
    title: "Urban Echoes",
    artist: "Lo-Fi Beats",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92b?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-red-500/20 to-orange-500/20"
  },
  {
    id: "a3",
    title: "Deep Focus",
    artist: "Ambient Essentials",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-emerald-500/20 to-teal-500/20"
  },
  {
    id: "a4",
    title: "Golden Hour",
    artist: "Indie Pop",
    coverUrl: "https://images.unsplash.com/photo-1458560871784-56d23406c091?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-yellow-500/20 to-amber-500/20"
  },
  {
    id: "a5",
    title: "Midnight Drive",
    artist: "Electronic",
    coverUrl: "https://images.unsplash.com/photo-1520092364052-d3527b140fe3?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-indigo-500/20 to-violet-500/20"
  },
  {
    id: "a6",
    title: "Acoustic Origins",
    artist: "Various Artists",
    coverUrl: "https://images.unsplash.com/photo-1460036521480-c1b742b66cb6?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-stone-500/20 to-neutral-500/20"
  },
  {
    id: "a7",
    title: "After Hours",
    artist: "The Weeknd",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92b?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-red-900/40 to-black/40"
  },
  {
    id: "a8",
    title: "Future Nostalgia",
    artist: "Dua Lipa",
    coverUrl: "https://images.unsplash.com/photo-1520092364052-d3527b140fe3?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-fuchsia-900/40 to-pink-900/40"
  },
  {
    id: "a9",
    title: "Random Access Memories",
    artist: "Daft Punk",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-orange-500/40 to-yellow-500/40"
  },
  {
    id: "a10",
    title: "Hurry Up Tomorrow",
    artist: "The Weeknd",
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-amber-900/40 to-black/40"
  },
  {
    id: "a11",
    title: "Starboy",
    artist: "The Weeknd",
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-blue-900/40 to-red-900/40"
  },
  {
    id: "a12",
    title: "Dawn FM",
    artist: "The Weeknd",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92b?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-blue-400/20 to-cyan-800/20"
  },
  {
    id: "a13",
    title: "Evolve",
    artist: "Imagine Dragons",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-rainbow/20 to-transparent"
  },
  {
    id: "a14",
    title: "Divide",
    artist: "Ed Sheeran",
    coverUrl: "https://images.unsplash.com/photo-1458560871784-56d23406c091?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-blue-500/40 to-blue-700/40"
  },
  {
    id: "a15",
    title: "Lover",
    artist: "Taylor Swift",
    coverUrl: "https://images.unsplash.com/photo-1520092364052-d3527b140fe3?auto=format&fit=crop&q=80&w=400&h=400",
    colorClass: "from-pink-300/40 to-blue-300/40"
  }
];

export const MOCK_FRIENDS: FriendActivity[] = [
  {
    id: "f1",
    name: "Alex M.",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    currentTrack: MOCK_TRACKS[1],
    timeAgo: "2m ago"
  },
  {
    id: "f2",
    name: "Sarah K.",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704e",
    currentTrack: MOCK_TRACKS[3],
    timeAgo: "15m ago"
  },
  {
    id: "f3",
    name: "David L.",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704f",
    currentTrack: MOCK_TRACKS[0],
    timeAgo: "1h ago"
  }
];
