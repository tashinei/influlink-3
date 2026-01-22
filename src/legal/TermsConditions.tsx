import { Card, CardContent } from "@/components/ui/card";
import { FileText, Scale, AlertCircle, Rocket, UserCheck, ShieldAlert } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Terms = () => {
  const { t } = useTranslation();

  const termHighlights = [
    {
      icon: Rocket,
      title: "Platform Status",
      content: "InfluLink is currently in its pre-launch/waitlist phase. Joining the waitlist does not guarantee immediate access to services.",
    },
    {
      icon: UserCheck,
      title: "Eligibility",
      content: "Users must provide accurate social media data. We reserve the right to verify or decline applications to the waitlist.",
    },
    {
      icon: ShieldAlert,
      title: "Liability",
      content: "As a pre-launch platform, we are not liable for any temporary service interruptions or data adjustments during development.",
    },
  ];

  return (
    <div className="min-h-screen pt-20" style={{ position: "relative", top: "-80px" }}>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary via-secondary to-[#6EC5E9]">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in text-muted">
            Terms & <span className="text-white">Conditions</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            The rules and guidelines for using the InfluLink platform and joining our waitlist.
          </p>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {termHighlights.map((item, index) => (
              <Card key={index} className="rounded-2xl border-border text-center hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Terms Content */}
          <div className="max-w-3xl mx-auto">
            <Card className="rounded-3xl border-border overflow-hidden">
              <CardContent className="p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
                
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
                  Service Agreement
                </div>

                <div className="space-y-6">
                  <section>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                      1. Acceptance of Terms
                    </h2>
                    <p>
                      By accessing this website and joining the InfluLink waitlist, you agree to be bound by these Terms and Conditions and all applicable laws and regulations in <strong>Bulgaria and the European Union</strong>.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-4 text-gray-900">
                      2. Waitlist Registration
                    </h2>
                    <p>
                      When registering as a Creator or Brand, you must provide current, complete, and accurate information. <strong>INFLULINK LTD.</strong> reserves the right to terminate your access if any information provided is found to be false or misleading.
                    </p>
                  </section>

                  <section className="bg-amber-50 p-6 rounded-2xl border border-amber-100 border-l-4 border-l-amber-400">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-amber-900">
                      <AlertCircle className="w-5 h-5" />
                      3. Intellectual Property
                    </h2>
                    <p className="text-sm text-amber-800">
                      The logo, design, and original content of this website are the exclusive property of <strong>INFLULINK LTD.</strong> and are protected by international copyright, trademark, and other intellectual property laws.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">
                      4. Termination
                    </h2>
                    <p>
                      We may terminate or suspend your access to our waitlist immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">
                      5. Governing Law
                    </h2>
                    <p>
                      These terms shall be governed and construed in accordance with the laws of <strong>Bulgaria</strong>, without regard to its conflict of law provisions. Any disputes shall be settled in the competent courts of Bulgaria.
                    </p>
                  </section>
                </div>

                <div className="pt-8 text-center border-t border-gray-100">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest italic">
                    Contact: global@influ-link.com
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;