import { useRef, useState } from "react";
import HeroSection from "@/components/home/HeroSection.";
import FeatureSection from "@/components/home/FeatureSection";
import { Search, MessageSquare, CreditCard, BarChart3 } from "lucide-react";
import CreatorSearchSection from "@/components/home/CreatorSearchSection";
import firstSection from "@/assets/firstSection3.png"
import { useNavigate } from "react-router-dom";
import { FilterState } from "@/types/creator";

const HomeMVP = () => {
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/creators?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };
  const handleJoinClick = () => {
    // TODO: Open registration dialog
    console.log("Join clicked");
  };

  const navigate = useNavigate();

  const handleCreatorSearch = (filters: FilterState & { query?: string }) => {
    navigate("/search", {
      state: {
        query: filters.query ?? "",
        filters,
      },
    });

    console.log("Sent filters:", filters);
  };

  return (
    <main className="min-h-screen">
      <HeroSection
        onExploreClick={scrollToSearch}
        onJoinClick={handleJoinClick}
      />

      <div ref={searchSectionRef}>
        <CreatorSearchSection onSearch={handleCreatorSearch} />
      </div>

      <FeatureSection
        title="Easy Discovery & Matching"
        description="Find the perfect creators for your brand with our intelligent matching system."
        features={[
          "Advanced search filters to narrow down your ideal creators",
          "AI-powered matching based on audience demographics",
          "Verified creator profiles with authentic engagement metrics",
          "Save and analyze your favorite creators"
        ]}
        icon={Search}
        imagePosition="right"
        gradient="from-primary to-primary/60"
        imageSrc={firstSection}
      />

      <div className="bg-muted/30">
        <FeatureSection
          title="Global Reach. Local impact."
          description="Communicate and manage campaigns all in one place."
          features={[
            "Built-in messaging with file sharing capabilities",
            "Campaign briefs and content approval workflows",
            "Real-time collaboration on content drafts",
            "Calendar integration for scheduling posts"
          ]}
          icon={MessageSquare}
          imagePosition="left"
          gradient="from-primary to-secondary/60"
          imageSrc={firstSection}
        />
      </div>

      <FeatureSection
        title="Transparent Payments"
        description="Secure, hassle-free payments for both creators and brands."
        features={[
          "Protection for secure transactions",
          "Multiple payment methods supported",
          "Automatic invoicing and tax documentation",
          "Milestone-based payment releases"
        ]}
        icon={CreditCard}
        imagePosition="right"
        gradient="from-primary to-secondary/60"
      />

      <div className="bg-muted/30">
        <FeatureSection
          title="Analytics & Growth"
          description="Track performance and optimize your influencer marketing ROI."
          features={[
            "Real-time campaign performance dashboards",
            "Audience reach and engagement analytics",
            "ROI tracking and attribution modeling",
            "Exportable reports"
          ]}
          icon={BarChart3}
          imagePosition="left"
          gradient="from-primary to-secondary/60"
          imageSrc=""
        />
      </div>

      {/* Footer spacing */}
      <div className="h-20" />
    </main>
  );
};

export default HomeMVP;
