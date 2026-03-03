import { useState, useEffect, useRef } from "react";
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Copy, 
  MessageSquare, 
  ChevronDown, 
  Clock, 
  Music, 
  Volume2, 
  VolumeX,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@supabase/supabase-js";
import bgm from "./assets/music.mp3";

// --- Types ---
interface GuestbookEntry {
  id: string;
  site_id: string;
  name: string;
  message: string;
  created_at: string;
}

// --- Supabase Client ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

const SITE_ID = typeof window !== "undefined" ? window.location.hostname : "localhost";

// --- Constants ---
const GROOM_NAME = "김철수";
const BRIDE_NAME = "이영희";
const WEDDING_DATE = "2026년 5월 23일 토요일 오후 1시";
const WEDDING_LOCATION = "그랜드 하얏트 서울, 그랜드 볼룸";
const WEDDING_ADDRESS = "서울특별시 용산구 소월로 322";

export default function App() {
  // --- States ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [gbLoading, setGbLoading] = useState(false);
  const [gbSubmitting, setGbSubmitting] = useState(false);
  const [gbError, setGbError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteracted = useRef(false);

  // --- Effects ---
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchGuestbook();
    }

    const handleFirstInteraction = () => {
      if (!hasInteracted.current && audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Auto-play might still fail
        });
        hasInteracted.current = true;
      }
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);

  // --- Functions ---
  const fetchGuestbook = async () => {
    if (!supabase) return;
    setGbLoading(true);
    try {
      const { data, error } = await supabase
        .from("guestbook")
        .select("*")
        .eq("site_id", SITE_ID)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setGuestbook(data || []);
    } catch (err: any) {
      console.error("Guestbook load error:", err);
      setGbError("방명록을 불러오는데 실패했습니다.");
    } finally {
      setGbLoading(false);
    }
  };

  const handleSubmitGuestbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !newName.trim() || !newMessage.trim()) return;

    setGbSubmitting(true);
    setGbError(null);
    try {
      const { data, error } = await supabase
        .from("guestbook")
        .insert([{ site_id: SITE_ID, name: newName, message: newMessage }])
        .select();

      if (error) throw error;
      
      if (data) {
        setGuestbook(prev => [data[0], ...prev]);
        setNewName("");
        setNewMessage("");
      }
    } catch (err: any) {
      console.error("Guestbook submit error:", err);
      setGbError("메시지 전송에 실패했습니다.");
    } finally {
      setGbSubmitting(false);
    }
  };

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("계좌번호가 복사되었습니다.");
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#4A4A4A] font-sans selection:bg-[#E5D5C5]">
      {/* Background Music */}
      <audio ref={audioRef} src={bgm} loop />
      
      {/* Music Toggle Button */}
      <button
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 p-3 bg-white/80 backdrop-blur-sm border border-[#E5D5C5] rounded-full shadow-lg text-[#8B7E74] transition-transform active:scale-95"
      >
        {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>

      {/* Main Container */}
      <main className="max-width-[420px] mx-auto bg-white shadow-xl min-h-screen relative overflow-hidden">
        
        {/* 1. Opening Cover */}
        <section className="h-screen flex flex-col items-center justify-center relative px-8 text-center bg-[#F9F7F2]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <span className="text-sm tracking-[0.3em] text-[#8B7E74] uppercase">Wedding Invitation</span>
            <div className="space-y-2">
              <h1 className="text-4xl font-serif text-[#5C544E] tracking-tight">
                {GROOM_NAME} <span className="text-2xl align-middle mx-1">&</span> {BRIDE_NAME}
              </h1>
            </div>
            <div className="h-[1px] w-12 bg-[#D4C4B5] mx-auto my-8"></div>
            <div className="space-y-1 text-[#8B7E74]">
              <p className="text-lg">{WEDDING_DATE}</p>
              <p className="text-sm">{WEDDING_LOCATION}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-[#D4C4B5]"
          >
            <span className="text-xs tracking-widest mb-2">SCROLL</span>
            <ChevronDown size={20} className="animate-bounce" />
          </motion.div>
        </section>

        {/* 2. Our Story Timeline */}
        <section className="py-20 px-8 bg-white">
          <div className="text-center mb-12">
            <Heart className="mx-auto text-[#D4C4B5] mb-4" size={28} />
            <h2 className="text-2xl font-serif text-[#5C544E]">우리의 이야기</h2>
          </div>
          
          <div className="space-y-12 relative before:content-[''] before:absolute before:left-4 before:top-0 before:bottom-0 before:w-[1px] before:bg-[#F0EBE3]">
            {[
              { date: "2022.04.12", title: "첫 만남", desc: "벚꽃이 흩날리던 어느 봄날, 우리는 처음 만났습니다." },
              { date: "2024.12.24", title: "약속", desc: "서로의 평생을 약속하며 소중한 인연을 맺었습니다." },
              { date: "2026.05.23", title: "결혼", desc: "이제 하나가 되어 새로운 시작을 하려 합니다." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative pl-10"
              >
                <div className="absolute left-0 top-1.5 w-8 h-8 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#D4C4B5]"></div>
                </div>
                <span className="text-xs font-mono text-[#B0A498]">{item.date}</span>
                <h3 className="text-lg font-medium text-[#5C544E] mt-1">{item.title}</h3>
                <p className="text-sm text-[#8B7E74] mt-2 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. Gallery */}
        <section className="py-20 px-4 bg-[#F9F7F2]">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-serif text-[#5C544E]">갤러리</h2>
            <p className="text-xs text-[#B0A498] mt-2 tracking-widest">OUR PRECIOUS MOMENTS</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="aspect-[3/4] overflow-hidden rounded-lg bg-white border border-[#E5D5C5]/30"
              >
                <img 
                  src={`https://picsum.photos/seed/wedding-${i}/600/800`} 
                  alt={`Gallery ${i}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. Wedding Info */}
        <section className="py-20 px-8 bg-white">
          <div className="text-center mb-12">
            <Calendar className="mx-auto text-[#D4C4B5] mb-4" size={28} />
            <h2 className="text-2xl font-serif text-[#5C544E]">예식 안내</h2>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <Clock className="text-[#D4C4B5] shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-medium text-[#5C544E]">일시</h4>
                <p className="text-sm text-[#8B7E74] mt-1">{WEDDING_DATE}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="text-[#D4C4B5] shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-medium text-[#5C544E]">장소</h4>
                <p className="text-sm text-[#8B7E74] mt-1">{WEDDING_LOCATION}</p>
                <p className="text-xs text-[#B0A498] mt-1">{WEDDING_ADDRESS}</p>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="w-full aspect-video bg-[#F9F7F2] rounded-xl border border-[#E5D5C5] flex flex-col items-center justify-center text-[#B0A498]">
              <MapPin size={32} className="mb-2 opacity-50" />
              <span className="text-xs">지도 영역 (Placeholder)</span>
            </div>
          </div>
        </section>

        {/* 5. Accounts */}
        <section className="py-20 px-8 bg-[#F9F7F2]">
          <div className="text-center mb-12">
            <Heart className="mx-auto text-[#D4C4B5] mb-4" size={28} />
            <h2 className="text-2xl font-serif text-[#5C544E]">마음 전하실 곳</h2>
            <p className="text-sm text-[#8B7E74] mt-4 leading-relaxed">
              축복의 의미로 보내주시는 마음,<br />소중히 간직하여 예쁘게 살겠습니다.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { label: "신랑측 계좌", bank: "신한은행", account: "110-123-456789", owner: "김철수" },
              { label: "신부측 계좌", bank: "국민은행", account: "987654-01-123456", owner: "이영희" }
            ].map((acc, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-[#E5D5C5] shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-[#B0A498]">{acc.label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-[#5C544E]">
                    <span className="font-semibold">{acc.bank}</span> {acc.account}
                    <p className="text-xs text-[#8B7E74] mt-1">예금주: {acc.owner}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(acc.account)}
                    className="p-2 text-[#D4C4B5] hover:bg-[#F9F7F2] rounded-full transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Guestbook */}
        <section className="py-20 px-8 bg-white">
          <div className="text-center mb-12">
            <MessageSquare className="mx-auto text-[#D4C4B5] mb-4" size={28} />
            <h2 className="text-2xl font-serif text-[#5C544E]">방명록</h2>
          </div>

          {!isSupabaseConfigured ? (
            <div className="bg-[#FFF4F4] border border-[#FFDADA] p-6 rounded-2xl text-center">
              <h3 className="text-[#E54D4D] font-semibold mb-2">Supabase 설정이 필요합니다</h3>
              <p className="text-sm text-[#8B7E74] leading-relaxed">
                방명록 기능을 사용하려면 Netlify 환경변수(Secrets)에<br />
                <code className="bg-white px-1 rounded font-mono text-xs">VITE_SUPABASE_URL</code>과<br />
                <code className="bg-white px-1 rounded font-mono text-xs">VITE_SUPABASE_ANON_KEY</code>를<br />
                추가해주세요.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Form */}
              <form onSubmit={handleSubmitGuestbook} className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="성함"
                    maxLength={20}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5D5C5] focus:outline-none focus:ring-2 focus:ring-[#D4C4B5]/30 text-sm"
                    required
                  />
                  <textarea
                    placeholder="축하의 메시지를 남겨주세요"
                    maxLength={300}
                    rows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5D5C5] focus:outline-none focus:ring-2 focus:ring-[#D4C4B5]/30 text-sm resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={gbSubmitting}
                  className="w-full py-4 bg-[#D4C4B5] text-white rounded-xl font-medium hover:bg-[#C4B4A5] transition-colors disabled:opacity-50"
                >
                  {gbSubmitting ? "전송 중..." : "메시지 남기기"}
                </button>
                {gbError && <p className="text-xs text-red-500 text-center">{gbError}</p>}
              </form>

              {/* List */}
              <div className="space-y-4">
                {gbLoading ? (
                  <p className="text-center text-sm text-[#B0A498]">불러오는 중...</p>
                ) : guestbook.length === 0 ? (
                  <p className="text-center text-sm text-[#B0A498] py-10">첫 번째 축하 메시지를 남겨주세요.</p>
                ) : (
                  <AnimatePresence initial={false}>
                    {guestbook.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#F9F7F2] p-5 rounded-2xl border border-[#E5D5C5]/50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <User size={14} className="text-[#D4C4B5]" />
                          <span className="text-sm font-semibold text-[#5C544E]">{entry.name}</span>
                          <span className="text-[10px] text-[#B0A498] ml-auto">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-[#8B7E74] leading-relaxed whitespace-pre-wrap">
                          {entry.message}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 7. Ending Message */}
        <section className="py-32 px-8 bg-[#F9F7F2] text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Heart className="mx-auto text-[#D4C4B5]" size={32} />
            <div className="space-y-4">
              <p className="text-lg text-[#5C544E] font-serif leading-relaxed">
                저희의 시작을 축복해주시는<br />모든 분들께 진심으로 감사드립니다.
              </p>
              <p className="text-sm text-[#8B7E74]">
                예쁘게 잘 살겠습니다.
              </p>
            </div>
            <div className="pt-8">
              <p className="text-sm text-[#B0A498] tracking-widest">
                {GROOM_NAME} · {BRIDE_NAME} 올림
              </p>
            </div>
          </motion.div>
        </section>

      </main>

      {/* Global Styles for Max Width */}
      <style>{`
        body {
          background-color: #FDFCF8;
        }
        main {
          max-width: 420px;
          margin-left: auto;
          margin-right: auto;
          box-shadow: 0 0 50px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
}
