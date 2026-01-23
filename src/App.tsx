import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
// import Home from "./pages/Home";
import About from "./pages/About"; // (Assuming this is a general about page, though not explicitly used below)
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import CreatorAbout from "./pages/AboutPages/CreatorAbout";
import BrandAbout from "./pages/AboutPages/BrandAbout";
import Profile from "./pages/Profile";
import RegisterCreator from "./pages/RegisterCreator";
import RegisterBrand from "./pages/RegisterBrand";
import HomeMVP from "./pages/HomeMVP";
import SearchResults from "./pages/SearchResult";
import SearchCampaigns from "./components/campaigns/SearchCampaigns";
import { CookieConsent } from "./legal/CookieConsent";
import Privacy from "./legal/PrivacyPolicy";
import Terms from "./legal/TermsConditions";
import Cookies from "./legal/Cookies";

const queryClient = new QueryClient();

const MainContent = () => {
  const location = useLocation();
  const isRegisterPage = location.pathname.startsWith("/register/");

  const saveConsentToDb = async (preferences: boolean[]) => {
    const userEmail = localStorage.getItem("user_email"); // Or from your Auth context
    if (!userEmail) return;

    try {
      const response = await fetch('/api/consent/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          analytics: preferences[1],
          marketing: preferences[2],
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log("Consent recorded in database");
      }
    } catch (err) {
      console.error("Failed to sync consent:", err);
    }
  };

  return (
    <>
      {!isRegisterPage && <Navigation />}

      <Routes>
        <Route path="/" element={<HomeMVP />} />
        <Route path="/creator/about" element={<CreatorAbout />} />
        <Route path="/brand/about" element={<BrandAbout />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/profile/me" element={<Profile />} />
        <Route path="/profile/:identifier" element={<Profile />} />

        <Route path="/:username" element={<Profile />} />

        <Route path="/register/creator" element={<RegisterCreator />} />
        <Route path="/register/brand" element={<RegisterBrand />} />
        <Route path="/creators/search" element={<SearchResults />} />
        <Route path="/campaigns/search" element={<SearchCampaigns />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
      </Routes>

      {!isRegisterPage && <Footer />}
      <CookieConsent categories={[
        { id: "essential", isEssential: true },
        { id: "analytics" },
        { id: "marketing" }
      ]} onAccept={saveConsentToDb} onDecline={() => saveConsentToDb([true, false, false])} />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <MainContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;