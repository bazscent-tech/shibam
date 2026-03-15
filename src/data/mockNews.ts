import heroImg from "@/assets/hero-news.jpg";
import techImg from "@/assets/tech-news.jpg";
import economyImg from "@/assets/economy-news.jpg";
import politicsImg from "@/assets/politics-news.jpg";
import sportsImg from "@/assets/sports-news.jpg";

export interface Article {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  source: string;
  publishedAt: string;
  isBreaking?: boolean;
  isLive?: boolean;
}

export const categories = [
  "الرئيسية",
  "سياسة",
  "اقتصاد",
  "تكنولوجيا",
  "رياضة",
  "ثقافة",
  "صحة",
  "علوم",
  "منوعات",
  "عالمي",
];

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "قمة التقنية العالمية تكشف عن مستقبل الذكاء الاصطناعي في المنطقة العربية",
    description: "أعلنت قمة التقنية العالمية المنعقدة في دبي عن شراكات استراتيجية جديدة تهدف إلى تعزيز الابتكار في مجال الذكاء الاصطناعي وتطبيقاته في القطاعات الحيوية.",
    image: heroImg,
    category: "تكنولوجيا",
    source: "شبام نيوز",
    publishedAt: "منذ 15 دقيقة",
    isBreaking: true,
  },
  {
    id: "2",
    title: "الأسواق الخليجية تسجل ارتفاعاً قياسياً مع تحسن أسعار النفط",
    description: "شهدت البورصات الخليجية ارتفاعات ملحوظة في تعاملات اليوم مدعومة بتحسن أسعار النفط العالمية وتفاؤل المستثمرين.",
    image: economyImg,
    category: "اقتصاد",
    source: "رويترز",
    publishedAt: "منذ 30 دقيقة",
  },
  {
    id: "3",
    title: "مباحثات دبلوماسية رفيعة المستوى لتعزيز الاستقرار الإقليمي",
    description: "استقبل وزير الخارجية نظيره في جولة مباحثات تناولت تعزيز العلاقات الثنائية والتعاون في مجالات الأمن والتنمية.",
    image: politicsImg,
    category: "سياسة",
    source: "وكالة أنباء",
    publishedAt: "منذ ساعة",
  },
  {
    id: "4",
    title: "نهائي كأس آسيا: مواجهة تاريخية تنتظر المنتخبات العربية",
    description: "تتأهب المنتخبات العربية لمواجهات حاسمة في نصف نهائي كأس آسيا وسط حضور جماهيري كبير وتوقعات بأداء استثنائي.",
    image: sportsImg,
    category: "رياضة",
    source: "بي إن سبورتس",
    publishedAt: "منذ ساعتين",
    isLive: true,
  },
  {
    id: "5",
    title: "اكتشاف تقني جديد يعزز كفاءة الطاقة المتجددة بنسبة 40%",
    description: "كشف فريق بحثي عربي عن تطوير خلايا شمسية من الجيل الجديد قادرة على تحويل ضوء الشمس بكفاءة غير مسبوقة.",
    image: techImg,
    category: "علوم",
    source: "ناشونال جيوغرافيك",
    publishedAt: "منذ 3 ساعات",
  },
  {
    id: "6",
    title: "منظمة الصحة العالمية تطلق حملة توعوية جديدة في الشرق الأوسط",
    description: "أطلقت المنظمة حملة شاملة تستهدف تعزيز الوعي الصحي ومكافحة الأمراض المزمنة في المنطقة العربية.",
    image: heroImg,
    category: "صحة",
    source: "WHO",
    publishedAt: "منذ 4 ساعات",
  },
  {
    id: "7",
    title: "معرض الكتاب الدولي يستقطب أكثر من مليون زائر في نسخته الأخيرة",
    description: "حقق المعرض أرقاماً قياسية في عدد الزوار والناشرين المشاركين من مختلف أنحاء العالم.",
    image: politicsImg,
    category: "ثقافة",
    source: "الشرق الأوسط",
    publishedAt: "منذ 5 ساعات",
  },
  {
    id: "8",
    title: "إطلاق مشروع المدينة الذكية بتقنيات الجيل الخامس",
    description: "أعلنت الحكومة عن مشروع طموح لتحويل المدن الرئيسية إلى مدن ذكية متكاملة باستخدام أحدث التقنيات.",
    image: techImg,
    category: "تكنولوجيا",
    source: "تك كرانش",
    publishedAt: "منذ 6 ساعات",
  },
];

export const trendingTopics = [
  { id: 1, title: "الذكاء الاصطناعي", count: 1245 },
  { id: 2, title: "أسعار النفط", count: 980 },
  { id: 3, title: "كأس آسيا 2026", count: 876 },
  { id: 4, title: "الطاقة المتجددة", count: 654 },
  { id: 5, title: "العملات الرقمية", count: 543 },
  { id: 6, title: "التغير المناخي", count: 432 },
  { id: 7, title: "الفضاء", count: 321 },
  { id: 8, title: "الأمن السيبراني", count: 298 },
];
