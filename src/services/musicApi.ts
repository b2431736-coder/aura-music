import { Track, MOCK_TRACKS } from '../data/mockData';

const SAAVN_API = 'https://jiosaavn-api-privatecvc2.vercel.app/search';

// Helper to normalize strings for comparison
const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/gi, '').trim();

export const fetchTopTracks = async (term: string = 'pop'): Promise<Track[]> => {
  try {
    const response = await fetch(`${SAAVN_API}/songs?query=${encodeURIComponent(term)}&limit=25`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    const results = data?.data?.results || [];
    
    return results.map((track: any, i: number) => {
      // Generate some interesting gradient colors sequentially 
      const gradients = [
        "from-blue-500/40 to-indigo-500/40",
        "from-rose-500/40 to-pink-500/40",
        "from-emerald-500/40 to-teal-500/40",
        "from-amber-500/40 to-orange-500/40",
        "from-violet-500/40 to-purple-500/40",
        "from-cyan-500/40 to-blue-500/40",
      ];
      
      const highResArt = track.image?.find((img: any) => img.quality === '500x500')?.link 
        || track.image?.find((img: any) => img.quality === '500x500')?.url
        || track.image?.[track.image.length - 1]?.link 
        || track.image?.[track.image.length - 1]?.url
        || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17";
        
      const targetAudio = track.downloadUrl?.find((d: any) => d.quality === '320kbps' || d.quality === '160kbps') || track.downloadUrl?.[0];
      const fullAudioUrl = targetAudio?.link || targetAudio?.url || track.url;

      const trackTitle = track.name || '';
      const normalizedTitle = normalize(trackTitle);

      // Find matching lyrics from our mock database
      const mockMatch = MOCK_TRACKS.find(m => {
        const mNormalized = normalize(m.title);
        return mNormalized === normalizedTitle || mNormalized.includes(normalizedTitle) || normalizedTitle.includes(mNormalized);
      });

      return {
        id: track.id,
        title: track.name,
        artist: track.primaryArtists || 'Unknown Artist',
        album: track.album?.name || 'Unknown Album',
        coverUrl: highResArt,
        duration: parseInt(track.duration || '180', 10), 
        colorClass: gradients[i % gradients.length],
        previewUrl: fullAudioUrl,
        lyrics: mockMatch?.lyrics
      };
    });
  } catch (error) {
    console.error("Error fetching tracks from API:", error);
    return [];
  }
};

export const fetchAlbums = async (term: string = 'album'): Promise<any[]> => {
  try {
    const response = await fetch(`${SAAVN_API}/albums?query=${encodeURIComponent(term)}&limit=12`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    const results = data?.data?.results || [];
    
    return results.map((album: any, i: number) => {
      const highResArt = album.image?.find((img: any) => img.quality === '500x500')?.link 
        || album.image?.find((img: any) => img.quality === '500x500')?.url
        || album.image?.[album.image.length - 1]?.link 
        || album.image?.[album.image.length - 1]?.url
        || "https://images.unsplash.com/photo-1621360811013-c76831f1628c";
        
      const primaryArtist = album.primaryArtists?.map((a: any) => a.name).join(', ') || 'Various Artists';
      
      const gradients = [
        "from-blue-500/40 to-indigo-500/40",
        "from-rose-500/40 to-pink-500/40",
        "from-emerald-500/40 to-teal-500/40",
        "from-amber-500/40 to-orange-500/40",
      ];
      
      return {
        id: album.id,
        title: album.name,
        artist: primaryArtist,
        coverUrl: highResArt,
        colorClass: gradients[i % gradients.length],
      };
    });
  } catch (error) {
    console.error("Error fetching albums from API:", error);
    return [];
  }
};
