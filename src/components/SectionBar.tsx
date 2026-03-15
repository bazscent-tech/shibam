import { useState, useRef, useEffect } from "react";
import { categories } from "@/data/mockNews";

interface SectionBarProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

const SectionBar = ({ activeCategory, onCategoryChange }: SectionBarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="py-3 border-b border-border">
      <div className="container mx-auto">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto hide-scrollbar"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`section-chip ${activeCategory === cat ? "active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionBar;
