import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ShieldAlert, Mail, CheckCircle2, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";

const DataDeletion = () => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const deletionSteps = useMemo(() => [
        {
            icon: ShieldAlert,
            title: t('mvpDataDeletion.step1Title'),
            content: t('mvpDataDeletion.step1Content'),
        },
        {
            icon: Trash2,
            title: t('mvpDataDeletion.step2Title'),
            content: t('mvpDataDeletion.step2Content'),
        },
        {
            icon: Mail,
            title: t('mvpDataDeletion.step3Title'),
            content: t('mvpDataDeletion.step3Content'),
        },
    ], [t]);

    const instructionSteps = useMemo(() => [
        t('mvpDataDeletion.instructionStep1'),
        t('mvpDataDeletion.instructionStep2'),
        t('mvpDataDeletion.instructionStep3'),
        t('mvpDataDeletion.instructionStep4'),
    ], [t]);

    return (
        <div className="min-h-screen pt-20" style={{ position: "relative", top: "-80px" }}>
            <Helmet>
                <title>{t('mvpDataDeletion.heroTitle')} | InfluLink</title>
                <meta name="description" content={t('mvpDataDeletion.heroSubtitle')} />
            </Helmet>

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-secondary via-tertiary to-primary relative overflow-hidden">
                <div className="container mx-auto px-4 text-center text-white relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight animate-fade-in">
                        {t('mvpDataDeletion.heroTitle')}
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 font-medium leading-relaxed">
                        {t('mvpDataDeletion.heroSubtitle')}
                    </p>
                </div>
            </section>

            {/* Steps Grid */}
            <section className="py-16 -mt-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {deletionSteps.map((step, index) => (
                            <Card key={index} className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-md hover:-translate-y-1 transition-all duration-300">
                                <CardContent className="p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
                                        <step.icon className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="font-bold text-xl mb-3 text-slate-900">{step.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{step.content}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Technical Instructions */}
                    <div className="max-w-4xl mx-auto">
                        <Card className="rounded-[2.5rem] border-slate-100 overflow-hidden shadow-2xl shadow-blue-900/5">
                            <CardContent className="p-8 md:p-16 space-y-10">
                                
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-slate-900">{t('mvpDataDeletion.cardHeaderTitle')}</h2>
                                        <p className="text-slate-500 text-sm italic">{t('mvpDataDeletion.cardHeaderSubtitle')}</p>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100 w-fit">
                                        <ShieldCheck className="w-4 h-4 text-green-600" />
                                        <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                                            {t('mvpDataDeletion.verifiedBadge')}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-slate-600 leading-relaxed">
                                        {t('mvpDataDeletion.instructionIntro')}
                                    </p>
                                    
                                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-6 relative">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-primary" />
                                            {t('mvpDataDeletion.instructionTitle')}
                                        </h3>
                                        <ol className="space-y-4 text-sm md:text-base">
                                            {instructionSteps.map((stepText, i) => (
                                                <li key={i} className="flex gap-4 items-start">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-slate-700">{stepText}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 items-center pt-6">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg text-slate-900">{t('mvpDataDeletion.manualTitle')}</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {t('mvpDataDeletion.manualContent')}
                                        </p>
                                        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                                            <span className="text-primary font-bold text-sm">global@influ-link.com</span>
                                            <Mail className="w-4 h-4 text-slate-300" />
                                        </div>
                                    </div>
                                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                        <h3 className="font-bold text-sm text-blue-900 mb-2 uppercase tracking-wide">
                                            {t('mvpDataDeletion.retentionTitle')}
                                        </h3>
                                        <p className="text-xs text-blue-800/80 leading-relaxed">
                                            {t('mvpDataDeletion.retentionContent')}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-8 text-center border-t border-slate-100">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-semibold">
                                        {t('mvpDataDeletion.complianceFooter')}
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

export default DataDeletion;