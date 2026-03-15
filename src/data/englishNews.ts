import { Article } from "./mockNews";
import techImg from "@/assets/tech-news.jpg";
import economyImg from "@/assets/economy-news.jpg";

export const englishArticles: Article[] = [
  {
    id: "en-1",
    title: "Global AI Summit Announces Breakthrough in Quantum Computing Integration",
    description: "Leading tech companies unveiled a new framework combining AI models with quantum processors, promising exponential gains in drug discovery and climate modeling.",
    image: techImg,
    category: "Technology",
    source: "Reuters",
    publishedAt: "2 hours ago",
    isBreaking: true,
  },
  {
    id: "en-2",
    title: "World Markets Rally as Central Banks Signal Rate Cuts",
    description: "Stock markets across Europe and Asia surged after the Federal Reserve and ECB hinted at upcoming interest rate reductions in the second half of 2026.",
    image: economyImg,
    category: "Economy",
    source: "Bloomberg",
    publishedAt: "3 hours ago",
  },
  {
    id: "en-3",
    title: "UN Climate Report Warns of Accelerating Ice Sheet Loss",
    description: "A new report from the United Nations highlights alarming acceleration in polar ice melt, with sea levels projected to rise faster than previously estimated.",
    image: "",
    category: "Science",
    source: "BBC News",
    publishedAt: "4 hours ago",
  },
  {
    id: "en-4",
    title: "SpaceX Successfully Launches First Commercial Lunar Cargo Mission",
    description: "The Starship vehicle delivered a multi-ton payload to lunar orbit, marking a milestone for private sector space logistics.",
    image: "",
    category: "Science",
    source: "AP News",
    publishedAt: "5 hours ago",
  },
  {
    id: "en-5",
    title: "Champions League Quarter-Finals Draw Produces Blockbuster Ties",
    description: "Real Madrid face Manchester City while Barcelona draw Bayern Munich in a repeat of classic European encounters.",
    image: "",
    category: "Sports",
    source: "ESPN",
    publishedAt: "6 hours ago",
  },
  {
    id: "en-6",
    title: "New Study Links Ultra-Processed Foods to Higher Dementia Risk",
    description: "Researchers from Harvard and Oxford found a significant correlation between diets high in ultra-processed foods and cognitive decline over a 10-year period.",
    image: "",
    category: "Health",
    source: "The Guardian",
    publishedAt: "7 hours ago",
  },
];
