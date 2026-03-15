const SiteFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-12">
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-3">
              شبام <span className="text-urgent">نيوز</span>
            </h2>
            <p className="text-sm text-primary-foreground/70 max-w-md leading-relaxed">
              منصة إخبارية ذكية تعتمد على الذكاء الاصطناعي لتقديم أخبار دقيقة وتحليلات معمّقة من مصادر موثوقة حول العالم.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">أقسام</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              {["سياسة", "اقتصاد", "تكنولوجيا", "رياضة", "ثقافة"].map((s) => (
                <li key={s}>
                  <a href="#" className="hover:text-primary-foreground transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">تواصل معنا</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li>info@shibamnews.com</li>
              <li>تويتر / إكس</li>
              <li>فيسبوك</li>
              <li>يوتيوب</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-8 pt-6 text-center text-xs text-primary-foreground/40">
          © 2026 شبام نيوز. جميع الحقوق محفوظة. مدعوم بالذكاء الاصطناعي.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
