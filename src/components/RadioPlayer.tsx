import { useState, useEffect, useRef, useCallback } from "react";
import { Radio, Play, Pause, Volume2, VolumeX, X, ChevronDown, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Hls from "hls.js";

interface RadioStation {
  id: string;
  name: string;
  stream_urls: string[];
  logo_url: string | null;
  frequency: string | null;
  quality_score: number;
  is_working: boolean;
}

const RadioPlayer = () => {
  const [open, setOpen] = useState(false);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [current, setCurrent] = useState<RadioStation | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const streamIndexRef = useRef(0);

  // Load stations
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("radio_stations")
        .select("id, name, stream_urls, logo_url, frequency, quality_score, is_working")
        .eq("is_active", true)
        .order("quality_score", { ascending: false });
      if (data) {
        const mapped = data.map((s: any) => ({
          ...s,
          stream_urls: Array.isArray(s.stream_urls) ? s.stream_urls : [],
        }));
        setStations(mapped);
        // Resume last station
        const lastId = localStorage.getItem("shibam_radio_last");
        if (lastId) {
          const found = mapped.find((s: RadioStation) => s.id === lastId);
          if (found) setCurrent(found);
        }
      }
    };
    load();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const playStream = useCallback((station: RadioStation, urlIndex = 0) => {
    if (!station.stream_urls.length) return;
    const url = station.stream_urls[urlIndex];
    if (!url) return;

    destroyHls();
    const audio = audioRef.current;
    if (!audio) return;

    streamIndexRef.current = urlIndex;

    if (url.includes(".m3u8") || url.includes("m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: false });
        hls.loadSource(url);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          audio.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) tryNextStream(station, urlIndex);
        });
        hlsRef.current = hls;
      } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
        audio.src = url;
        audio.play().catch(() => {});
      }
    } else {
      audio.src = url;
      audio.play().catch(() => tryNextStream(station, urlIndex));
    }
  }, [destroyHls]);

  const tryNextStream = useCallback((station: RadioStation, currentIdx: number) => {
    const next = currentIdx + 1;
    if (next < station.stream_urls.length) {
      playStream(station, next);
    } else {
      setPlaying(false);
    }
  }, [playStream]);

  const handlePlay = (station: RadioStation) => {
    if (current?.id === station.id && playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    setCurrent(station);
    localStorage.setItem("shibam_radio_last", station.id);
    setPlaying(true);
    playStream(station, 0);

    // Track play count
    supabase.from("radio_stations").update({ play_count: station.quality_score + 1 }).eq("id", station.id).then(() => {});
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  const filtered = stations.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.frequency && s.frequency.includes(search))
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <audio
        ref={audioRef}
        onError={() => {
          if (current) tryNextStream(current, streamIndexRef.current);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Header icon */}
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-lg hover:bg-secondary transition-colors relative ${playing ? "text-urgent" : "text-muted-foreground"}`}
        aria-label="راديو"
      >
        <Radio className="w-5 h-5" />
        {playing && (
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-urgent animate-pulse" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-80 max-h-[70vh] bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden" dir="rtl">
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-urgent" /> راديو شبام
              </h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-secondary">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث عن محطة..."
                className="w-full pl-3 pr-8 py-2 text-xs bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Now playing */}
          {current && playing && (
            <div className="p-3 bg-urgent/5 border-b border-border flex items-center gap-3">
              {current.logo_url ? (
                <img src={current.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-urgent/10 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-urgent" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{current.name}</p>
                {current.frequency && <p className="text-xs text-muted-foreground">{current.frequency}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setMuted(!muted)} className="text-muted-foreground hover:text-foreground">
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={(e) => { handleVolumeChange(parseFloat(e.target.value)); setMuted(false); }}
                  className="w-16 h-1 accent-urgent"
                />
              </div>
            </div>
          )}

          {/* Station list */}
          <div className="overflow-y-auto max-h-[50vh]">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">لا توجد محطات</p>
            ) : (
              filtered.map((station) => (
                <button
                  key={station.id}
                  onClick={() => handlePlay(station)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-secondary transition-colors border-b border-border/50 last:border-b-0 ${
                    current?.id === station.id && playing ? "bg-urgent/5" : ""
                  }`}
                >
                  {station.logo_url ? (
                    <img src={station.logo_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Radio className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-medium text-foreground truncate">{station.name}</p>
                    {station.frequency && <p className="text-xs text-muted-foreground">{station.frequency}</p>}
                  </div>
                  <div className="shrink-0">
                    {current?.id === station.id && playing ? (
                      <Pause className="w-5 h-5 text-urgent" />
                    ) : (
                      <Play className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RadioPlayer;
