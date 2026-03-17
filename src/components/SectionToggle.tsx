import { Globe, BookOpen } from "lucide-react";

interface Props {
  activeSection: "ar" | "en";
  onChange: (section: "ar" | "en") => void;
}

const SectionToggle = ({ activeSection, onChange }: Props) => {
  return (
    <div className="container mx-auto py-4">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => onChange("ar")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
            activeSection === "ar"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          أخبار عربية
        </button>
        <button
          onClick={() => onChange("en")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
            activeSection === "en"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          <Globe className="w-5 h-5" />
          Global News
        </button>
      </div>
    </div>
  );
};

export default SectionToggle;
