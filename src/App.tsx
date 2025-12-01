import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { useLocation } from "react-router-dom";
import CreatorAbout from "./pages/AboutPages/CreatorAbout";
import BrandAbout from "./pages/AboutPages/BrandAbout";
import Profile from "./pages/Profile";
import RegisterCreator from "./pages/RegisterCreator";
import RegisterBrand from "./pages/RegisterBrand";

const queryClient = new QueryClient();

const MainContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isRegisterPage = location.pathname === "/register/creator" || location.pathname === "/register/brand";
  return (
    <>
      {!isRegisterPage && <Navigation />}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/creator/about" element={<CreatorAbout />} />
        <Route path="/brand/about" element={<BrandAbout />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/profile/me" element={<Profile />} />
        <Route path="/profile/:identifier" element={<Profile />} />
        <Route path="/register/creator" element={<RegisterCreator />} />
        <Route path="/register/brand" element={<RegisterBrand />} />
      </Routes>
      
      {/* Conditionally render the Footer: Render ONLY if NOT on the home page */}
      {!isHomePage && !isRegisterPage && <Footer />}
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
