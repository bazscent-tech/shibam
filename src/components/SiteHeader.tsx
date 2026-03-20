import { useState, useEffect, useRef } from "react";
import { Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "./ThemeToggle";

interface SearchResult {
  id: string;
  title: string;
  category: string | null;
  image_url: string | null;
}

const SiteHeader = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const navLinks = ["الرئيسية", "سياسة", "اقتصاد", "تكنولوجيا", "رياضة", "ثقافة", "منوعات", "المقالات", "فنون", "لقاءات"];

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from("articles")
        .select("id, title, category, image_url")
        .eq("is_published", true)
        .ilike("title", `%${query}%`)
        .order("published_at", { ascending: false })
        .limit(8);
      setResults((data as SearchResult[]) || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <header className="sticky-header border-b border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link to="/">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                <span className="text-urgent">شبام نيوز</span>
              </h1>
            </Link>
            <span className="live-badge hidden sm:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground" />
              مباشر
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded"
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => { setSearchOpen(!searchOpen); setQuery(""); setResults([]); }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="بحث"
            >
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pb-3 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث في شبام نيوز..."
                  className="w-full px-4 py-3 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
                {results.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {results.map((r) => (
                      <Link
                        key={r.id}
                        to={`/article/${r.id}`}
                        onClick={() => { setSearchOpen(false); setQuery(""); }}
                        className="flex items-center gap-3 p-3 hover:bg-secondary transition-colors border-b border-border last:border-b-0"
                      >
                        {r.image_url && (
                          <img src={r.image_url} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">{r.title}</p>
                          {r.category && <span className="text-xs text-muted-foreground">{r.category}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {searching && query && (
                  <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
                    جاري البحث...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <div className="py-3 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default SiteHeader;
