import { Link2, Send, Facebook, MessageCircle } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  url?: string;
  articleId?: string;
  author?: string | null;
  description?: string | null;
}

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const ShareButtons = ({ title, url, articleId, author, description }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  const siteBase = window.location.origin;
  const shareUrl = articleId ? `${siteBase}/article/${articleId}` : (url?.startsWith("manual-") || url?.startsWith("http") ? `${siteBase}${window.location.pathname}` : `${siteBase}/article/${articleId || ""}`);
  const authorLine = author ? `\n✍️ ${author}` : "";
  const descLine = description ? `\n${description.slice(0, 100)}` : "";
  const shareText = `${title}${authorLine}${descLine}\n\n#شبام_نيوز`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={copyLink}
        className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        title={copied ? "تم النسخ!" : "نسخ الرابط"}
      >
        <Link2 className="w-3.5 h-3.5" />
      </button>
      <a
        href={`https://wa.me/?text=${encodedText}%0A${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        title="WhatsApp"
      >
        <MessageCircle className="w-3.5 h-3.5" />
      </a>
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        title="Telegram"
      >
        <Send className="w-3.5 h-3.5" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        title="Facebook"
      >
        <Facebook className="w-3.5 h-3.5" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        title="X (Twitter)"
      >
        <XIcon />
      </a>
    </div>
  );
};

export default ShareButtons;
