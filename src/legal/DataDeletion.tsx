import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ShieldAlert, Mail, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DataDeletion = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const deletionSteps = [
        {
            icon: ShieldAlert,
            title: "Platform Revocation",
            content: "You can remove InfluLink's access to your Instagram data directly via your Instagram settings under 'Apps and Websites'.",
        },
        {
            icon: Trash2,
            title: "Data Purge",
            content: "Once access is revoked or account deletion is requested, we purge all cached media and insights from our database within 24 hours.",
        },
        {
            icon: Mail,
            title: "Manual Request",
            content: "Users may request a full data export or immediate deletion by contacting our privacy officer at global@influ-link.com.",
        },
    ];

    return (
        <div className="min-h-screen pt-20" style={{ position: "relative", top: "-80px" }}>
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-secondary via-tertiary to-primary">
                <div className="container mx-auto px-4 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 animate-fade-in tracking-tight">
                        User data deletion
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-95 font-medium">
                        Control your footprint. We provide clear paths to remove your connected Instagram data in compliance with Meta Platform Policies.
                    </p>
                </div>
            </section>

            {/* Steps Grid */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {deletionSteps.map((step, index) => (
                            <Card key={index} className="rounded-2xl border-border text-center hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-8">
                                    <div className="w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-primary via-secondary to-tertiary rounded-2xl flex items-center justify-center">
                                        <step.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-3">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{step.content}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Technical Instructions */}
                    <div className="max-w-3xl mx-auto">
                        <Card className="rounded-3xl border-border overflow-hidden shadow-sm">
                            <CardContent className="p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
                                
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-slate-900">Facebook/Instagram Data Deletion Instructions</h2>
                                    <p className="text-slate-600">
                                        InfluLink uses the Instagram Graph API to provide insights. According to Meta policy, we provide the following instructions for the Data Deletion Callback:
                                    </p>
                                    
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                        <h3 className="font-bold text-primary">How to remove InfluLink from your Facebook Activities:</h3>
                                        <ol className="list-decimal pl-5 space-y-3 text-sm">
                                            <li>Go to your Facebook Account’s <strong>"Settings & Privacy"</strong>.</li>
                                            <li>Click on <strong>"Settings"</strong> and then find <strong>"Apps and Websites"</strong>.</li>
                                            <li>Search for <strong>"InfluLink"</strong> in the search bar.</li>
                                            <li>Click the <strong>"Remove"</strong> button next to the app name.</li>
                                            <li>Congratulations, you have successfully removed your app activities and requested data deletion.</li>
                                        </ol>
                                    </div>

                                    <h3 className="font-bold text-lg pt-4">Our Commitment</h3>
                                    <p className="text-sm">
                                        Upon receiving a deletion request (either through the automated callback or via email), InfluLink will remove all user-identifiable data, including Instagram handles, profile pictures, and all historical interaction metrics from our active servers within 24 hours.
                                    </p>
                                </div>

                                <div className="pt-8 text-center border-t border-gray-100">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                                        Compliance Reference: Meta Platform Terms 4.f
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