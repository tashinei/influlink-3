import { Card, CardContent } from "@/components/ui/card";
import { Scale, UserCheck, CreditCard, Handshake } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const Terms = () => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    const termHighlights = [
        {
            icon: Handshake,
            title: t('mvpTerms.roleTitle'),
            content: t('mvpTerms.roleContent'),
        },
        {
            icon: UserCheck,
            title: t('mvpTerms.integrityTitle'),
            content: t('mvpTerms.integrityContent'),
        },
        {
            icon: CreditCard,
            title: t('mvpTerms.paymentsTitle'),
            content: t('mvpTerms.paymentsContent'),
        },
    ];

    return (
        <div className="min-h-screen pt-20" style={{ position: "relative", top: "-80px" }}>
            <Helmet>
                <title>{t('mvpTerms.heroTitle')} | InfluLink</title>
                <meta name="robots" content="index, follow" />
            </Helmet>
            <section className="py-20 bg-gradient-to-b from-primary via-secondary to-[#6EC5E9]">
                <div className="container mx-auto px-4 text-center text-white">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
                        {t('mvpTerms.heroTitle')} <span className="text-white">{t('mvpTerms.heroTitleSpan')}</span>
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto opacity-90">
                        {t('mvpTerms.heroSubtitle')}
                    </p>
                </div>
            </section>

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

                    <div className="max-w-3xl mx-auto">
                        <Card className="rounded-3xl border-border overflow-hidden">
                            <CardContent className="p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
                                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
                                    {t('mvpTerms.userAgreementTitle')}
                                </div>

                                <div className="space-y-6">
                                    <section>
                                        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                                            {t('mvpTerms.s1Title')}
                                        </h2>
                                        <p>{t('mvpTerms.s1Content')}</p>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4 text-gray-900">
                                            {t('mvpTerms.s2Title')}
                                        </h2>
                                        <p>{t('mvpTerms.s2Content')}</p>
                                    </section>

                                    <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100 border-l-4 border-l-primary">
                                        <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-blue-900">
                                            <Scale className="w-5 h-5" />
                                            {t('mvpTerms.s3Title')}
                                        </h2>
                                        <p className="text-sm text-blue-800">{t('mvpTerms.s3Content')}</p>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                            {t('mvpTerms.s4Title')}
                                        </h2>
                                        <p><strong>INFLULINK LTD.</strong> {t('mvpTerms.s4Content')}</p>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                            {t('mvpTerms.s5Title')}
                                        </h2>
                                        <p>{t('mvpTerms.s5Content')}</p>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                            {t('mvpTerms.s6Title')}
                                        </h2>
                                        <p className="mb-4">{t('mvpTerms.s6Content')}</p>
                                        <div className="bg-gray-50 p-4 rounded-xl border text-sm">
                                            <p className="font-semibold mb-2">{t('mvpTerms.s6Notice')}</p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>{t('mvpTerms.s6List1')}</li>
                                                <li>{t('mvpTerms.s6List2')}</li>
                                                <li>{t('mvpTerms.s6List3')}</li>
                                            </ul>
                                            <p className="mt-2 text-primary font-medium">Send to: legal@influ-link.com</p>
                                        </div>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                            {t('mvpTerms.s7Title')}
                                        </h2>
                                        <p>{t('mvpTerms.s7Content')}</p>
                                    </section>
                                </div>

                                <div className="pt-8 text-center border-t border-gray-100">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest italic">
                                        {t('mvpTerms.lastUpdated')} • global@influ-link.com
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