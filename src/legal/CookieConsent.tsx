import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cookie, X, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(()=>{
    window.scrollTo(0,0);
  },[])

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500); // Slight delay for better UX
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    // Here you would initialize Google Analytics if it was blocked
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom-full duration-500">
      <Card className="max-w-4xl mx-auto border-2 shadow-2xl rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-4 p-5 bg-white">
          <div className="hidden md:flex w-12 h-12 bg-primary/10 rounded-full items-center justify-center shrink-0">
            <Cookie className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-sm font-bold flex items-center justify-center md:justify-start gap-2 mb-1">
              Cookie Settings <ShieldCheck className="w-4 h-4 text-secondary" />
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use cookies to enhance your experience, analyze site traffic (Google Analytics), and for security (ReCAPTCHA). 
              By clicking "Accept All", you consent to our use of cookies. Read our{" "}
              <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link> for more info.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDecline}
              className="text-xs order-2 sm:order-1"
            >
              Essential Only
            </Button>
            <Button 
              size="sm" 
              onClick={handleAccept}
              className="text-xs bg-gradient-to-r from-primary to-secondary hover:opacity-90 order-1 sm:order-2 px-6"
            >
              Accept All
            </Button>
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-black md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;