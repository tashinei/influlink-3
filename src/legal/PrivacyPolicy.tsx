import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const Privacy = () => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Memoize or define inside so translations update instantly on toggle
    const legalSections = [
        {
            icon: Lock,
            title: t('privacy.cards.controllerTitle'),
            content: t('privacy.cards.controllerContent'),
        },
        {
            icon: Eye,
            title: t('privacy.cards.dataTitle'),
            content: t('privacy.cards.dataContent'),
        },
        {
            icon: Shield,
            title: t('privacy.cards.securityTitle'),
            content: t('privacy.cards.securityContent'),
        },
    ];

    return (
        <div className="min-h-screen pt-20" style={{ position: "relative", top: "-80px" }}>
            <Helmet>
                <title>{t('privacy.heroTitle')} | InfluLink</title>
                <meta name="description" content={t('privacy.heroSubtitle')} />
                {/* Optional: Tell Google this is a legal doc */}
                <meta name="robots" content="index, follow" />
            </Helmet>
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-b from-primary via-secondary to-[#6EC5E9]">
                <div className="container mx-auto px-4 text-center text-white">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
                        {/* Split the title if you want different colors, or keep it simple */}
                        {t('privacy.heroTitle')}
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto opacity-90">
                        {t('privacy.heroSubtitle')}
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
                                    {t('privacy.disclosureTitle')}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-6 rounded-2xl border">
                                    <div>
                                        <p className="font-bold">{t('privacy.companyName')}:</p>
                                        <p>INFLULINK LTD.</p>
                                    </div>
                                    <div>
                                        <p className="font-bold">{t('privacy.registeredOffice')}:</p>
                                        <p>{t('privacy.officeLocation') || "Sofia, Bulgaria (EU)"}</p>
                                    </div>
                                    <div>
                                        <p className="font-bold">{t('privacy.email')}:</p>
                                        <p>global@influ-link.com</p>
                                    </div>
                                    <div>
                                        <p className="font-bold">{t('privacy.companyId')}:</p>
                                        <p>{t('privacy.availableSoon')}</p>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        {t('privacy.detailedPolicyTitle')}
                                    </h2>
                                    <p>{t('privacy.policyIntro')}</p>

                                    <h3 className="font-bold text-lg pt-4">{t('privacy.basisTitle')}</h3>
                                    <p>{t('privacy.basisIntro')}</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>{t('privacy.basisContract')}</li>
                                        <li>{t('privacy.basisLegal')}</li>
                                        <li>{t('privacy.basisInterest')}</li>
                                    </ul>

                                    <h3 className="font-bold text-lg pt-4">{t('privacy.sharingTitle')}</h3>
                                    <p>{t('privacy.sharingContent')}</p>

                                    <h3 className="font-bold text-lg pt-4">{t('privacy.transferTitle')}</h3>
                                    <p>{t('privacy.transferContent')}</p>

                                    <h3 className="font-bold text-lg pt-4">{t('privacy.rightsTitle')}</h3>
                                    <p>{t('privacy.rightsIntro')}</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>{t('privacy.right1')}</li>
                                        <li>{t('privacy.right2')}</li>
                                        <li>{t('privacy.right3')}</li>
                                        <li>{t('privacy.right4')}</li>
                                    </ul>
                                </div>

                                <div className="pt-8 text-center border-t border-gray-100">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                                        © 2026 INFLULINK LTD. • {t('privacy.officeLocation')}
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