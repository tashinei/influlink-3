import { useEffect, useRef, useState } from "react";
import HeroSection from "@/components/home/HeroSection.";
import FeatureSection from "@/components/home/FeatureSection";
import { Search, MessageSquare, CreditCard, BarChart3 } from "lucide-react";
import CreatorSearchSection from "@/components/home/CreatorSearchSection";
import firstSection from "@/assets/firstSection3.png";
import secondSection from "@/assets/secondSectionImage2.png"
import thirdSection from "@/assets/fourthSectionImage.png"
import lastSection from "@/assets/lastSectionImage2.png"
import { useNavigate } from "react-router-dom";
import { FilterState } from "@/types/creator";
import { useUserStore } from "@/store/useUserStore";
import { CampaignData, CampaignFilterState } from "@/types/campaigns";
import CampaignSearchSection from "@/components/home/CampaignSearchSection";
import RegisterSelectionDialog from "@/components/RegisterSelectionDialog";
import { useTranslation } from "@/hooks/useTranslation";

const HomeMVP = () => {
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(false);
  const isBrand = useUserStore((state) => state.accountType) === "brand";
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const isRegistered = useUserStore((state) => state.isRegistered);
  const {t} = useTranslation();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/creators?search=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };
  const handleJoinClick = () => {
    setIsRegisterOpen(true);
  };

  const navigate = useNavigate();

  const handleCreatorSearch = (filters: FilterState & { query?: string }) => {
    navigate("/creators/search", {
      state: {
        query: filters.query ?? "",
        filters,
      },
    });

    console.log("Sent filters:", filters);
  };

  const handleCampaignSearch = (
    filters: CampaignFilterState & { query?: string }
  ) => {
    navigate("/campaigns/search", {
      state: {
        query: filters.query ?? "",
        filters,
      },
    });

    console.log("Sent campaign filters:", filters);
  };

  useEffect(() => {
    console.log("Brand account: ", isBrand);
  }, [isBrand])

  return (
    <main className="min-h-screen">
      <HeroSection
        onExploreClick={scrollToSearch}
        onJoinClick={handleJoinClick}
      />

      <div ref={searchSectionRef}>
        {isBrand ? (
          <CreatorSearchSection onSearch={handleCreatorSearch} onClickSearch={() => setIsRegisterOpen(true)} isRegistered={isRegistered} />
        ) : (
          <CampaignSearchSection onSearch={handleCampaignSearch} onClickSearch={() => setIsRegisterOpen(true)} isRegistered={isRegistered} />
        )}
      </div>

      <FeatureSection
        title={t("mvpFeaturesSection.firstTitle")}
        description={t("mvpFeaturesSection.firstSubtitle")}
        features={[
          t("mvpFeaturesSection.firstBenefit1"),
          t("mvpFeaturesSection.firstBenefit2"),
          t("mvpFeaturesSection.firstBenefit3"),
          t("mvpFeaturesSection.firstBenefit4"),
        ]}
        icon={Search}
        imagePosition="right"
        gradient="from-primary to-primary/60"
        imageSrc={firstSection}
      />

      <div className="bg-muted/30">
        <FeatureSection
          title={t("mvpFeaturesSection.secondTitle")}
        description={t("mvpFeaturesSection.secondSubtitle")}
        features={[
          t("mvpFeaturesSection.secondBenefit1"),
          t("mvpFeaturesSection.secondBenefit2"),
          t("mvpFeaturesSection.secondBenefit3"),
          t("mvpFeaturesSection.secondBenefit4"),
        ]}
          icon={MessageSquare}
          imagePosition="left"
          gradient="from-primary to-secondary/60"
          imageSrc={secondSection}
        />
      </div>

      <FeatureSection
        title={t("mvpFeaturesSection.thirdTitle")}
        description={t("mvpFeaturesSection.thirdSubtitle")}
        features={[
          t("mvpFeaturesSection.thirdBenefit1"),
          t("mvpFeaturesSection.thirdBenefit2"),
          t("mvpFeaturesSection.thirdBenefit3"),
          t("mvpFeaturesSection.thirdBenefit4"),
        ]}
        icon={CreditCard}
        imagePosition="right"
        gradient="from-primary to-secondary/60"
        imageSrc={thirdSection}
      />

      <div className="bg-muted/30">
        <FeatureSection
          title={t("mvpFeaturesSection.fourthTitle")}
        description={t("mvpFeaturesSection.fourthSubtitle")}
        features={[
          t("mvpFeaturesSection.fourthBenefit1"),
          t("mvpFeaturesSection.fourthBenefit2"),
          t("mvpFeaturesSection.fourthBenefit3"),
          t("mvpFeaturesSection.fourthBenefit4"),
        ]}
          icon={BarChart3}
          imagePosition="left"
          gradient="from-primary to-secondary/60"
          imageSrc={lastSection}
        />
      </div>

      <RegisterSelectionDialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen} />

      {/* Footer spacing */}
      <div className="h-20" />
    </main>
  );
};

export default HomeMVP;
