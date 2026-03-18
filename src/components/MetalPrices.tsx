import { useState } from "react";
import { motion } from "framer-motion";

interface MetalPrice {
  name: string;
  nameEn: string;
  price: string;
  change: string;
  up: boolean;
}

const MetalPrices = () => {
  const [prices] = useState<MetalPrice[]>([
    { name: "الذهب", nameEn: "Gold", price: "$2,648.30", change: "+0.45%", up: true },
    { name: "الفضة", nameEn: "Silver", price: "$31.42", change: "+0.82%", up: true },
    { name: "البلاتين", nameEn: "Platinum", price: "$978.50", change: "-0.23%", up: false },
    { name: "النحاس", nameEn: "Copper", price: "$4.21", change: "+1.12%", up: true },
    { name: "النفط", nameEn: "Oil", price: "$72.85", change: "-0.67%", up: false },
  ]);

  const text = prices
    .map((m) => `${m.name} ${m.price} ${m.change}`)
    .join("  ◆  ");

  // Duplicate for seamless loop
  const fullText = `${text}  ◆  ${text}`;

  return (
    <div className="bg-secondary/50 border-b border-border py-2 overflow-hidden">
      <div className="container mx-auto flex items-center gap-3">
        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap shrink-0">
          أسعار المعادن
        </span>
        <div className="overflow-hidden flex-1 relative">
          <motion.div
            className="whitespace-nowrap text-sm font-medium"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: prices.length * 8, repeat: Infinity, ease: "linear" }}
          >
            {prices.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-2 mx-3">
                <span className="text-xs font-medium text-foreground">{m.name}</span>
                <span className="text-xs font-latin font-semibold text-foreground">{m.price}</span>
                <span className={`text-xs font-latin font-bold ${m.up ? "text-green-500" : "text-urgent"}`}>
                  {m.change}
                </span>
                {i < prices.length - 1 && <span className="text-muted-foreground mx-1">◆</span>}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MetalPrices;
