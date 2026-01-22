import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, Mail, Server, Scale, FileText } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Privacy = () => {
  const { t } = useTranslation();

  const legalSections = [
    {
      icon: Lock,
      title: "1. Data Controller",
      content: "INFLULINK LTD., a Bulgarian registered company. Our primary data storage is located on secure servers within the Republic of Bulgaria (EU).",
    },
    {
      icon: Eye,
      title: "2. Data We Collect",
      content: "We process identity data (Name), contact data (Email), and professional metrics (Social tags/Followers) provided via our waitlist forms.",
    },
    {
      icon: Server,
      title: "3. Storage & Security",
      content: "Data is retained until our official platform launch or until you request deletion. We use encryption to protect data during transmission.",
    },
  ];

  return (
    <div className="min-h-screen pt-20" style={{ position: "relative", top: "-80px" }}>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary via-secondary to-[#6EC5E9]">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in text-muted">
            Legal & <span className="text-white">Privacy</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            How we protect your data
          </p>
        </div>
      </section>

      {/* Quick Info Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {legalSections.map((section, index) => (
              <Card key={index} className="rounded-2xl border-border text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <section.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Policy Content */}
          <div className="max-w-3xl mx-auto">
            <Card className="rounded-3xl border-border overflow-hidden">
              <CardContent className="p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
                
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
                  Legal Disclosure (Impressum)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-6 rounded-2xl border">
                  <div>
                    <p className="font-bold">Company Name:</p>
                    <p>INFLULINK LTD.</p>
                  </div>
                  <div>
                    <p className="font-bold">Registered Office:</p>
                    <p>Bulgaria</p>
                  </div>
                  <div>
                    <p className="font-bold">Email:</p>
                    <p>global@influ-link.com</p>
                  </div>
                  <div>
                    <p className="font-bold">Responsible for Content:</p>
                    <p>Management of INFLULINK LTD.</p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    Detailed Privacy Policy
                  </h2>
                  <p>
                    This policy describes our practices regarding the collection and use of personal data 
                    for the InfluLink waitlist. We act as the <strong>Data Controller</strong> under GDPR.
                  </p>
                  
                  <h3 className="font-bold text-lg pt-4">Legal Basis for Processing</h3>
                  <p>
                    We process your data based on your <strong>explicit consent</strong> provided when 
                    checking the agreement box on our forms. You have the right to withdraw this consent 
                    at any time by emailing us.
                  </p>

                  <h3 className="font-bold text-lg pt-4">Third-Party Services</h3>
                  <p>
                    We utilize <strong>Google ReCAPTCHA</strong> for security and to prevent automated 
                    spam. This service may collect hardware and software information, such as device 
                    and application data, and send it to Google for analysis.
                  </p>

                  <h3 className="font-bold text-lg pt-4">Your Rights</h3>
                  <p>
                    Under the GDPR, you have the following rights:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Right to access your stored personal data.</li>
                    <li>Right to rectification of incorrect data.</li>
                    <li>Right to erasure ("Right to be forgotten").</li>
                    <li>Right to restrict processing.</li>
                  </ul>
                </div>

                <div className="pt-8 text-center border-t border-gray-100">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    © 2026 INFLULINK LTD. • Sofia, Bulgaria
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

export default Privacy;