import { useState, useEffect } from "react";

interface MetalPrice {
  name: string;
  nameEn: string;
  price: string;
  change: string;
  up: boolean;
}

const MetalPrices = () => {
  const [prices, setPrices] = useState<MetalPrice[]>([
    { name: "الذهب", nameEn: "Gold", price: "$2,648.30", change: "+0.45%", up: true },
    { name: "الفضة", nameEn: "Silver", price: "$31.42", change: "+0.82%", up: true },
    { name: "البلاتين", nameEn: "Platinum", price: "$978.50", change: "-0.23%", up: false },
    { name: "النحاس", nameEn: "Copper", price: "$4.21", change: "+1.12%", up: true },
    { name: "النفط", nameEn: "Oil", price: "$72.85", change: "-0.67%", up: false },
  ]);

  return (
    <div className="bg-secondary/50 border-b border-border py-2 overflow-hidden">
      <div className="container mx-auto">
        <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar">
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap shrink-0">
            أسعار المعادن
          </span>
          {prices.map((m) => (
            <div key={m.name} className="flex items-center gap-2 whitespace-nowrap shrink-0">
              <span className="text-xs font-medium text-foreground">{m.name}</span>
              <span className="text-xs font-latin font-semibold text-foreground">{m.price}</span>
              <span className={`text-xs font-latin font-bold ${m.up ? "text-green-500" : "text-urgent"}`}>
                {m.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetalPrices;
