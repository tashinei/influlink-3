import { Card, CardContent } from "@/components/ui/card";
import { FileText, Scale, AlertCircle, Rocket, UserCheck, ShieldAlert, CreditCard, Handshake } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect } from "react";

const Terms = () => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    const termHighlights = [
        {
            icon: Handshake,
            title: "Platform Role",
            content: "InfluLink acts as an intermediary marketplace connecting Brands and Creators. We facilitate connections but are not a party to individual campaign contracts.",
        },
        {
            icon: UserCheck,
            title: "Account Integrity",
            content: "Users must maintain authentic social media metrics. The use of bots, fake followers, or deceptive engagement is strictly prohibited.",
        },
        {
            icon: CreditCard,
            title: "Payments & Fees",
            content: "Platform fees and payment processing terms apply to successful collaborations as outlined in your specific plan or campaign agreement.",
        },
    ];

    return (
        <div className="min-h-screen pt-20" style={{ position: "relative", top: "-80px" }}>
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-b from-primary via-secondary to-[#6EC5E9]">
                <div className="container mx-auto px-4 text-center text-white">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
                        Terms of <span className="text-white">Service</span>
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto opacity-90">
                        The legal framework for professional collaborations on InfluLink.
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
                                    User Agreement & Platform Rules
                                </div>

                                <div className="space-y-6">
                                    <section>
                                        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                                            1. The Service
                                        </h2>
                                        <p>
                                            InfluLink provides a platform for <b>Creators</b> to showcase their portfolio and for <b>Brands</b> to discover and manage influencer marketing campaigns. By creating an account, you agree to comply with these terms and the laws of the <b>Republic of Bulgaria</b> .
                                        </p>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4 text-gray-900">
                                            2. Content Ownership
                                        </h2>
                                        <p>
                                            Creators retain the rights to their original content. However, by participating in a campaign through InfluLink, Creators grant Brands a limited, non-exclusive license to use the campaign content as specified in the individual campaign brief.
                                        </p>
                                    </section>

                                    <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100 border-l-4 border-l-primary">
                                        <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-blue-900">
                                            <Scale className="w-5 h-5" />
                                            3. Professional Conduct
                                        </h2>
                                        <p className="text-sm text-blue-800">
                                            Users agree to act in good faith. Brands must provide clear briefs and timely feedback; Creators must meet deadlines and maintain transparency regarding sponsored content (using #ad or local equivalents).
                                        </p>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                            4. Limitation of Liability
                                        </h2>
                                        <p>
                                            <strong>INFLULINK LTD.</strong> is not responsible for the quality, legality, or safety of the services provided by Creators, nor the accuracy of campaign descriptions provided by Brands. We do not guarantee specific marketing results.
                                        </p>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                            5. Dispute Resolution
                                        </h2>
                                        <p>
                                            While we may offer mediation tools, any contractual disputes regarding payments or deliverables must be resolved directly between the Brand and the Creator. These terms are governed by Bulgarian law.
                                        </p>
                                    </section>
                                    <section>
                                        <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                            6. Copyright & DMCA (Notice and Takedown)
                                        </h2>
                                        <p className="mb-4">
                                            InfluLink respects intellectual property rights. In accordance with the EU Copyright Directive and the DMCA, we will respond to notices of alleged infringement.
                                        </p>
                                        <div className="bg-gray-50 p-4 rounded-xl border text-sm">
                                            <p className="font-semibold mb-2">To file a notice, please provide:</p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>Identification of the copyrighted work.</li>
                                                <li>The specific URL on InfluLink containing the material.</li>
                                                <li>Your contact email and a statement of good faith.</li>
                                            </ul>
                                            <p className="mt-2 text-primary font-medium">Send to: legal@influ-link.com</p>
                                        </div>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                            7. Payments & Commissions
                                        </h2>
                                        <p>
                                            InfluLink may charge service fees for successful collaborations. All financial transactions are processed through authorized third-party providers (e.g., Stripe). Users are responsible for their own tax obligations under Bulgarian law.
                                        </p>
                                    </section>
                                </div>

                                <div className="pt-8 text-center border-t border-gray-100">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest italic">
                                        Last Updated: January 2026 • global@influ-link.com
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