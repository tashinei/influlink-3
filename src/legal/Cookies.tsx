import { Card, CardContent } from "@/components/ui/card";
import { Cookie, ShieldCheck, Settings, Info, Clock, ExternalLink } from "lucide-react";
import { useEffect } from "react";

const Cookies = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cookieCategories = [
    {
      title: "Strictly Necessary Cookies",
      description: "These are essential for you to browse the website and use its features, such as accessing secure areas (Login) and maintaining your session. The platform cannot function without these.",
      status: "Always Active",
      icon: ShieldCheck,
      examples: ["Auth Session", "CSRF Protection", "Cookie Preference Storage"]
    },
    {
      title: "Performance & Analytics",
      description: "We use these to understand how visitors interact with InfluLink. They help us discover which pages are most popular and where we might have technical errors. All data is aggregated and anonymous.",
      status: "Optional",
      icon: Info,
      examples: ["Google Analytics", "Vercel Insights"]
    },
    {
      title: "Functional Cookies",
      description: "These allow the website to remember choices you make (such as your preferred language or region) to provide a more personalized experience.",
      status: "Optional",
      icon: Settings,
      examples: ["Language Preference", "Chat Support Widget"]
    }
  ];

  return (
    <div className="min-h-screen pt-20" style={{ position: "relative", top: "-80px" }}>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary via-secondary to-[#6EC5E9]">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Cookie <span className="text-white">Policy</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Transparency about how we use tracking technologies to power the InfluLink experience.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="rounded-3xl border-border overflow-hidden">
            <CardContent className="p-8 md:p-12 space-y-10 text-gray-700">
              
              {/* Introduction */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">1. What are Cookies?</h2>
                <p>
                  Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site. On InfluLink, we use cookies to keep you logged in, remember your preferences, and analyze our traffic.
                </p>
              </div>

              {/* Cookie Categories */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">2. Categories of Cookies We Use</h2>
                <div className="grid gap-6">
                  {cookieCategories.map((cat, i) => (
                    <div key={i} className="p-6 border rounded-2xl bg-gray-50/50 hover:bg-white transition-colors border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <cat.icon className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="font-bold text-lg">{cat.title}</h3>
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded ${cat.status === 'Always Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {cat.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {cat.examples.map(ex => (
                          <span key={ex} className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-500">
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retention & Third Parties */}
              <div className="grid md:grid-cols-2 gap-8 pt-6">
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2 italic">
                    <Clock className="w-4 h-4" /> Duration
                  </h3>
                  <p className="text-sm">
                    <strong>Session Cookies:</strong> Deleted automatically when you close your browser.<br />
                    <strong>Persistent Cookies:</strong> Remain on your device for a set period (usually 30 days to 1 year) or until manually deleted.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2 italic">
                    <ExternalLink className="w-4 h-4" /> Third-Party Cookies
                  </h3>
                  <p className="text-sm">
                    Some cookies are placed by third-party services that appear on our pages (like Google or Stripe). We do not control these cookies directly.
                  </p>
                </div>
              </div>

              {/* Management */}
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                <h2 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <Cookie className="w-5 h-5" />
                  3. Managing Your Preferences
                </h2>
                <p className="text-sm text-amber-800 leading-relaxed mb-4">
                  You have the right to decide whether to accept or reject non-essential cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality may be restricted.
                </p>
                <button 
                  onClick={() => alert("Cookie settings panel would open here.")}
                  className="text-sm font-bold text-amber-900 underline underline-offset-4 hover:text-amber-700"
                >
                  Open Cookie Settings Panel
                </button>
              </div>

              <div className="pt-8 text-center border-t border-gray-100">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Last Updated: January 2026 • INFLULINK LTD. (Bulgaria)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Cookies;