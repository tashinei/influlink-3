import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { useLocation } from "react-router-dom";
import CreatorAbout from "./pages/AboutPages/CreatorAbout";
import BrandAbout from "./pages/AboutPages/BrandAbout";
import Privacy from "./legal/PrivacyPolicy";
import Terms from "./legal/TermsConditions";
import CookieConsent from "./legal/CookieConsent";
import MVPStatus from "./pages/MvpStatus";
import AboutPage from "./pages/AboutPages/AboutPage";

const queryClient = new QueryClient();

const MainContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/creator/about" element={<CreatorAbout />} />
        <Route path="/brand/about" element={<BrandAbout />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<AboutPage />} />
        {/* <Route path="/mvp" element={<MVPStatus />} /> */}
        {/* <Route path="/profile" element={<Profile />} /> */}
      </Routes>
      
      {/* Conditionally render the Footer: Render ONLY if NOT on the home page */}
      {!isHomePage && <Footer />}
      <CookieConsent />
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
