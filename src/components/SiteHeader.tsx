import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SiteHeader = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = ["الرئيسية", "سياسة", "اقتصاد", "تكنولوجيا", "رياضة", "ثقافة", "منوعات"];

  return (
    <header className="sticky-header border-b border-border">
      <div className="container mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3">
          {/* Logo - right side in RTL */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              شبام <span className="text-urgent">نيوز</span>
            </h1>
            <span className="live-badge hidden sm:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground" />
              مباشر
            </span>
          </div>

          {/* Center nav - desktop */}
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

          {/* Left actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
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

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pb-3">
                <input
                  type="text"
                  placeholder="ابحث في شبام نيوز..."
                  className="w-full px-4 py-3 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu */}
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
