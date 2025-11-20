import { Card, CardContent } from "@/components/ui/card";
import { Target, Heart, Zap, Shield, Users, TrendingUp, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Benefits } from "@/components/Benefits";
import { DisplayCards } from "@/components/DisplayCards";
import waitlistHero from "@/assets/hero-gradient-portrait.jpg";
import firstPlaceholder from "@/assets/firstPlaceholder.jpg";
import cardPay from "@/assets/cardPay.jpg";
import support from "@/assets/support.jpg";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    CheckCircle2,
    Upload,
    TicketCheck,
    Gift,
    HeadphonesIcon,
} from "lucide-react";
import { DisplaySection } from "@/components/ui/display-section";
import { useIsMobile } from "@/hooks/use-mobile";

const creatorBenefits = [
    { icon: "TicketCheck", title: "Ранен достъп", description: "Използвайте платформата преди официалния старт", iconColor: "text-primary" },
    { icon: "Gift", title: "Специални условия", description: "Ексклузивни оферти за инфлуенсъри", iconColor: "text-secondary" },
    { icon: "HeadphonesIcon", title: "Приоритетна поддръжка", description: "Директен достъп до нашия екип", iconColor: "text-primary" },
    { icon: "Zap", title: "Бързо внедряване", description: "Стартирайте кампании за минути", iconColor: "text-secondary" },
    { icon: "Award", title: "VIP статус", description: "Специални привилегии за първите", iconColor: "text-primary" }
];

const brandBenefits = [
    { icon: "Target", title: "Персонализация", description: "Съдържание и кампании пригодени за вашия бизнес", iconColor: "text-secondary" },
    { icon: "Shield", title: "Гарантирана сигурност", description: "Вашите данни са защитени с най-висок стандарт", iconColor: "text-primary" },
    { icon: "Users", title: "Общност", description: "Свържете се с други брандове и партньори", iconColor: "text-secondary" },
    { icon: "TrendingUp", title: "Постоянни подобрения", description: "Получавайте нови функции първи", iconColor: "text-primary" },
    { icon: "Clock", title: "Спестете време", description: "Автоматизирайте рутинните задачи", iconColor: "text-secondary" }
];

const IconMap = {
    TicketCheck: TicketCheck,
    Gift: Gift,
    HeadphonesIcon: HeadphonesIcon,
    Zap: Zap,
    Shield: Shield,
    Users: Users,
    TrendingUp: TrendingUp,
    Award: Award,
    Clock: Clock,
    Target: Target,
};

const allBenefits = [...creatorBenefits, ...brandBenefits];
const scrollingBenefits = [...allBenefits, ...allBenefits];

const BenefitCard = ({ title, description, iconName, iconColor, color }) => {
    // Look up the actual Lucide component based on the string name
    const LucideIcon = IconMap[iconName];

    // Styling remains the same
    const bgColor = color === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-foreground text-background';
    const descColor = color === 'primary' ? 'opacity-90' : 'opacity-60';

    return (
        <div className={`p-6 rounded-2xl shadow-xl relative ${bgColor} min-h-[180px]`}>

            {/* 1. LUCIDE ICON RENDERING */}
            <div className={`text-4xl mb-3 ${iconColor}`}>
                {/* Render the component if found, default to a space if not */}
                {LucideIcon ? <LucideIcon size={40} strokeWidth={2.5} /> : <span className="w-10 h-10 inline-block"></span>}
            </div>

            <h4 className="text-xl font-bold leading-snug mb-2">
                {title}
            </h4>

            <p className={`text-sm ${descColor} leading-snug`}>
                {description}
            </p>
        </div>
    );
};

const CreatorAbout = () => {
    const { toast } = useToast();
    const [quizStep, setQuizStep] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const isMobile = useIsMobile();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        accountType: "",
        businessName: "",
        followers: "",
        niche: "",
    });

    const sendEmail = async () => {
        try {
            const response = await fetch(
                "http://localhost:8080/influlink/send-email.php",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            if (response.ok) {
                toast({
                    title: "Формата е изпратена успешно!",
                    description: "Ще получите потвърждение по имейл.",
                    className: "bg-green-600 text-white border-none",
                });
            } else {
                toast({
                    title: "Грешка при изпращане",
                    description: "Моля, опитайте отново по-късно.",
                    className: "bg-yellow-600 text-white border-none",
                });
            }
        } catch (err) {
            console.error(err);
            toast({
                title: "Възникна грешка",
                description: "Проверете интернет връзката си и опитайте пак.",
                className: "bg-red-600 text-white border-none",
            });
        }
    };

    const handleQuizSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (quizStep < 3) {
            setQuizStep(quizStep + 1);
        } else {
            toast({
                title: "Успешно се записахте!",
                description: "Ще се свържем с вас скоро.",
            });
            await sendEmail();
            setIsDialogOpen(false);
            setQuizStep(1);
            setFormData({
                name: "",
                email: "",
                accountType: "",
                businessName: "",
                followers: "",
                niche: "",
            });
        }
    };

    const faqs = [
        {
            question: "Какво е InfluLink?",
            answer:
                "Първата платформа в България, която свързва брандове с инфлуенсъри за автентични кампании.",
        },
        {
            question: "Кога ще стартира платформата?",
            answer:
                "Очаквайте старта в началото на 2026. Запишете се в чакащата листа за ранен достъп.",
        },
        {
            question: "Как работи специалният акаунт?",
            answer:
                "Публикувайте нашето видео в Instagram story и получете отстъпка при одобрение.",
        },
        {
            question: "Има ли такса за регистрация?",
            answer:
                "Регистрацията е безплатна. Таксите се прилагат само при активни кампании.",
        },
    ];

    const values = [
        {
            icon: Target,
            title: "Нашата мисия",
            description:
                "Да създадем най-добрата платформа за свързване на брандове и инфлуенсъри в България, като улесним процеса на колаборация и осигурим измерими резултати.",
        },
        {
            icon: Heart,
            title: "Нашите ценности",
            description:
                "Прозрачност, иновация и качество са в основата на всичко, което правим. Вярваме в истински връзки и дългосрочни партньорства.",
        },
        {
            icon: Zap,
            title: "Нашата визия",
            description:
                "Да бъдем водещата платформа за инфлуенсър маркетинг в България и да помогнем на бизнеса да расте чрез автентични връзки.",
        },
    ];

    return (
        <div
            className="min-h-screen pt-20"
            style={{ position: "relative", top: "-80px" }}
        >
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-b from-primary via-secondary to-[#6EC5E9]">
                <div className="container mx-auto px-4">
                    <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 animate-fade-in text-muted">
                        За бизнеси
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"></span>
                    </h1>
                    <p
                        className="text-xl text-center text-white max-w-3xl mx-auto animate-fade-in"
                        style={{ animationDelay: "0.2s" }}
                    >
                        Първата платформа в България, която свързва брандове с инфлуенсъри
                        за истински и измерим растеж
                    </p>
                </div>
            </section>

            {!isMobile ? (
                <DisplayCards />
            ) : (
                <DisplaySection accountType="brand" />
            )}

            {/* Waitlist Section */}
            <section className="flex py-20 bg-white">
                <div className="container mx-auto px-4">
                    {/* SECTION HEADER */}
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-4xl md:text-7xl font-bold mb-6">
                            Създадена за{" "}
                            <span className="custom-curved-underline2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                                Вашия бизнес
                            </span>
                        </h2>
                        <p className="text-xl text-text max-w-2xl mx-auto">
                            Станете част от бъдещето на сътрудничествата между бизнеси и създатели на съдържание.
                        </p>
                    </div>

                    {/* MAIN FEATURE GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

                        {/* LARGE DOMINANT CARD */}
                        <div className="transition duration-300 ease-in-out hover:scale-105 col-span-1 md:col-span-2 bg-gradient-to-t from-[#90d5f3ff] via-secondary to-primary text-white p-8 lg:p-12 rounded-3xl shadow-2xl min-h-[450px] flex flex-col justify-end relative overflow-hidden">
                            {/* Background placeholder image */}
                            <img
                                src={firstPlaceholder}
                                alt="Abstract background"
                                className="absolute inset-0 w-full h-full object-cover opacity-10 z-0" // z-0 ensures it’s behind text
                            />

                            {/* Text content */}
                            {/* <p className="font-bold text-base mb-3 z-10 relative opacity-100">СВЕТЪТ НА INFLULINK</p> */}
                            <h3 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight z-10 relative">
                                Развийте бизнеса <br />си и заключете нови партньорства
                            </h3>
                            <p className="mb-10 text-lg max-w-2xl z-10 relative">
                                Нашата платформа ще Ви свърже със създатели на съдържание,
                                гарантирайки максимална ефективност и полза за Вашия бизнес.
                            </p>
                        </div>


                        {/* STACKED SMALL CARDS */}
                        <div className="col-span-1 md:col-span-1 flex flex-col space-y-8">

                            {/* CARD 2: TECHNOLOGY */}
                            <div className="transition duration-300 ease-in-out hover:scale-105 bg-gradient-to-tr from-[#90d5f3ff] via-secondary to-primary text-white p-6 rounded-3xl shadow-xl flex-1 flex flex-col justify-end relative overflow-hidden">
                                {/* Background image */}
                                <img
                                    src={cardPay}
                                    alt="Tech"
                                    className="absolute inset-0 w-full h-full object-cover rounded-3xl opacity-30 z-0"
                                />

                                {/* Text content */}
                                <div className="relative z-10">
                                    <h4 className="text-2xl font-bold mb-3 leading-snug">
                                        Прозрачни плащания
                                    </h4>
                                    <p className="text-white font-bold text-lg mb-2">
                                        Изпращайте парите си сигурно
                                    </p>
                                </div>
                            </div>

                            {/* CARD 3: COMMUNITY */}
                            <div className="bg-gradient-to-br from-[#90d5f3ff] via-secondary to-primary text-text p-6 rounded-3xl shadow-xl flex-1 flex flex-col justify-end relative overflow-hidden border border-gray-200 transition duration-300 ease-in-out hover:scale-105">
                                {/* Background image */}
                                <img
                                    src={support}
                                    alt="Community"
                                    className="absolute inset-0 w-full h-full object-cover rounded-3xl opacity-20 z-0"
                                />

                                {/* Text content */}
                                <div className="relative z-10">
                                    <p className="text-white font-bold text-sm mb-2">ПОДДРЪЖКА</p>
                                    <h4 className="text-white text-2xl font-bold mb-3 leading-snug">
                                        24/7 Приоритет
                                    </h4>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </section>


            <section className="py-20 bg-[white]">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                Станете{" "}
                                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    VIP член
                                </span>
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Получете специални привилегии и отстъпки
                            </p>
                        </div>

                        <Card className="border-2 border-primary/20 rounded-3xl overflow-hidden">
                            <CardContent className="p-6 md:p-12">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold mb-4">
                                            Как да станете VIP?
                                        </h3>
                                        <ol className="space-y-4 text-muted-foreground">
                                            <li className="flex items-start gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                    1
                                                </span>
                                                <span>
                                                    Свалете нашето брандирано видео (ще го получите след
                                                    записване)
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                    2
                                                </span>
                                                <span>
                                                    Публикувайте го в Instagram и Facebook story с таг
                                                    @influlink.bg
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                    3
                                                </span>
                                                <span>Нашият екип ще прегледа и одобри акаунта ви</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                    4
                                                </span>
                                                <span>
                                                    Получете VIP статус с 30% отстъпка за първите 3 месеца
                                                </span>
                                            </li>
                                        </ol>
                                    </div>

                                    <div className="flex-1">
                                        <div className="relative group bg-gradient-to-br from-primary to-secondary p-9 rounded-2xl text-white w-full">
                                            <h4 className="text-xl font-bold mb-4">
                                                VIP Привилегии:
                                            </h4>
                                            <ul className="space-y-3">
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span>50% отстъпка за 3 месеца</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span>Приоритет при избор на кампании</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span>Ексклузивни партньорства</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span>Персонален акаунт мениджър</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span>VIP бадж на профила</span>
                                                </li>
                                            </ul>

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-foreground/55 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Button
                                                    onClick={() => setIsDialogOpen(true)}
                                                    size="lg"
                                                    variant="secondary"
                                                    className="text-lg font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out"
                                                >
                                                    Получи видео
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-gradient-to-t from-[#6EC5E9] via-secondary to-primary">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Готови да развиете бизнеса си?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Запишете се сега и бъдете част от революцията в инфлуенсър
                        маркетинга
                    </p>
                    <Button
                        size="lg"
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-primary text-muted text-lg px-12 py-8 rounded-full transition duration-300 ease-in-out hover:scale-105 "
                    >
                        Проверете статуса си
                    </Button>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
                            Често задавани въпроси
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"></span>
                        </h2>

                        <Accordion type="single" collapsible className="space-y-4">
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="border border-primary rounded-2xl px-6 data-[state=open]:border-secondary transition-all"
                                >
                                    <AccordionTrigger className="text-left hover:no-underline py-6">
                                        <span className="text-lg font-semibold pr-4">
                                            {faq.question}
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground pb-6 text-base">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12">
                        Какво ни движи
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <Card
                                key={index}
                                className="rounded-2xl border-border hover:border-primary transition-all duration-300 hover:shadow-lg"
                            >
                                <CardContent className="p-8">
                                    <div className="w-16 h-16 mb-6 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                                        <value.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                                    <p className="text-muted-foreground text-lg leading-relaxed">
                                        {value.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            {/* <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                500+
              </div>
              <p className="text-xl text-muted-foreground">Успешни кампании</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                1000+
              </div>
              <p className="text-xl text-muted-foreground">Активни инфлуенсъри</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                24/7
              </div>
              <p className="text-xl text-muted-foreground">Поддръжка</p>
            </div>
          </div>
        </div>
      </section> */}
        </div>
    );
};

export default CreatorAbout;
