import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Store, ChevronDown, Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Helmet } from "react-helmet-async";
import contactImage from "@/assets/firstPlaceholder_v5.png";

const COUNTRY_CODES = [
  { code: "BG", dial: "+359" },
  { code: "GB", dial: "+44" },
  { code: "DE", dial: "+49" },
  { code: "FR", dial: "+33" },
  { code: "ES", dial: "+34" },
  { code: "IT", dial: "+39" },
  { code: "NL", dial: "+31" },
  { code: "RO", dial: "+40" },
  { code: "GR", dial: "+30" },
  { code: "PL", dial: "+48" },
  { code: "PT", dial: "+351" },
  { code: "AT", dial: "+43" },
  { code: "CH", dial: "+41" },
  { code: "BE", dial: "+32" },
  { code: "SE", dial: "+46" },
  { code: "TR", dial: "+90" },
];

const Contact = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    handle: "",
    email: "",
    phone: "",
    message: "",
  });
  const [role, setRole] = useState<"creator" | "brand">("creator");
  const [country, setCountry] = useState(COUNTRY_CODES[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    if (!API_BASE_URL) {
      toast({
        title: t("contacts.errorTitle"),
        description: t("contacts.errorDescription"),
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role,
          dialCode: country.dial,
        }),
      });

      if (!response.ok) throw new Error("Request failed");

      toast({
        title: t("contacts.successTitle"),
        description: t("contacts.successDescription"),
      });
      setFormData({ firstName: "", lastName: "", handle: "", email: "", phone: "", message: "" });
    } catch (err) {
      toast({
        title: t("contacts.errorTitle"),
        description: t("contacts.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const seoTitle = useMemo(() => `${t("contacts.title")} | InfluLink`, [t]);
  const seoDescription = useMemo(() => t("contacts.subtitle"), [t]);

  const roleCards = [
    {
      id: "creator" as const,
      icon: User,
      title: t("contacts.creatorTitle"),
      subtext: t("contacts.creatorSubtext"),
    },
    {
      id: "brand" as const,
      icon: Store,
      title: t("contacts.brandTitle"),
      subtext: t("contacts.brandSubtext"),
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-4">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={window.location.origin + "/contact"} />
      </Helmet>

      <div className="mx-auto max-w-7xl 2xl:max-w-[1600px] px-6 sm:px-10 lg:px-16 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-stretch">
          {/* Left Column — Form */}
          <div className="lg:col-span-2 flex items-center justify-center py-4 lg:py-8">
            <div className="w-full max-w-lg">
              {/* Header */}
              <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] bg-gradient-to-br from-tertiary via-secondary to-primary bg-clip-text text-transparent">
                  {t("contacts.title")}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  {t("contacts.subtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1 — First / Last name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                      {t("contacts.firstName")}
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="rounded-xl h-12"
                      placeholder={t("contacts.firstNamePlaceholder")}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                      {t("contacts.lastName")}
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="rounded-xl h-12"
                      placeholder={t("contacts.lastNamePlaceholder")}
                    />
                  </div>
                </div>

                {/* Row 2 — Job title / Social handle */}
                <div>
                  <label htmlFor="handle" className="block text-sm font-medium mb-2">
                    {t("contacts.handle")}
                  </label>
                  <Input
                    id="handle"
                    name="handle"
                    value={formData.handle}
                    onChange={handleChange}
                    className="rounded-xl h-12"
                    placeholder={t("contacts.handlePlaceholder")}
                  />
                </div>

                {/* Row 3 — Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    {t("contacts.email")}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="rounded-xl h-12"
                    placeholder={t("contacts.emailPlaceholder")}
                  />
                </div>

                {/* Row 5 — Message / Content */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    {t("contacts.message")}
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="rounded-xl min-h-[120px] p-3.5 text-base md:text-sm resize-y"
                    placeholder={t("contacts.messagePlaceholder")}
                  />
                </div>

                {/* Role selection cards */}
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {roleCards.map((card) => {
                      const isActive = role === card.id;
                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => setRole(card.id)}
                          aria-pressed={isActive}
                          className={`group relative text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
                            isActive
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/40 hover:bg-accent/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                                isActive
                                  ? "bg-gradient-to-br from-primary to-secondary text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <card.icon className="h-5 w-5" />
                            </div>
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                                isActive ? "border-primary bg-primary text-white" : "border-muted-foreground/30"
                              }`}
                            >
                              {isActive && <Check className="h-3 w-3" strokeWidth={3} />}
                            </span>
                          </div>
                          <h3 className="font-semibold text-base">{card.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground leading-snug">{card.subtext}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CTA */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full h-14 rounded-xl text-base font-semibold bg-gradient-to-br from-primary via-secondary to-tertiary text-white hover:opacity-90 hover:scale-[1.01] transition-transform disabled:opacity-60"
                >
                  {submitting ? t("contacts.sending") : t("contacts.button")}
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column — Social Proof Visual (rounded card) */}
          <div className="lg:col-span-3 relative overflow-hidden rounded-3xl shadow-xl min-h-[460px] lg:min-h-full">
            <img
              src={contactImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Bottom dark gradient overlay — lighter on mobile, stronger on desktop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent lg:from-black/65 lg:via-black/15" />

            {/* Testimonial */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
              <blockquote className="text-sm sm:text-lg lg:text-2xl font-medium leading-snug text-white">
                &ldquo;{t("contacts.testimonialQuote")}&rdquo;
              </blockquote>
              <div className="mt-3 sm:mt-5 lg:mt-6">
                <p className="text-base sm:text-lg font-semibold text-white">{t("contacts.testimonialAuthor")}</p>
                <p className="text-xs sm:text-sm text-white/70">{t("contacts.testimonialAuthorTitle")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;