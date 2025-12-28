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

const queryClient = new QueryClient();

const MainContent = () => {
  const location = useLocation();
  const isRegisterPage = location.pathname.startsWith("/register/");
  
  return (
    <>
      {!isRegisterPage && <Navigation />}

      <Routes>
        <Route path="/" element={<HomeMVP/>} />
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
      </Routes>
      
      {!isRegisterPage && <Footer />}
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