import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);

  const logoColors = isScrolled ? null : "white";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Начало", path: "/" },
    { name: "За нас", path: "/about" },
    { name: "Контакти", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const navClasses = `
    fixed top-0 w-full z-50 transition-all duration-300 
    ${
      isScrolled
        ? "bg-background/90 shadow-md border-b"
        : "bg-background/0 backdrop-blur-none border-b-transparent"
    }
  `;

  return (
    <nav
      className={navClasses}
      style={{ borderBottomLeftRadius: "30px", borderBottomRightRadius: "30px" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            to="/"
            className={`text-2xl font-bold text-primary ${!isScrolled ? "text-white" : null}`}
          >
            Influ<span className="text-3xl bg-gradient-to-r from-white to-white bg-clip-text"></span>Link
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full transition-all ${
                  isActive(link.path)
                    ? "bg-primary text-white hover:bg-secondary" : null
                } ${isScrolled && !isActive(link.path) ? "text-black  hover:bg-secondary hover:text-white" : "text-white hover:bg-secondary"}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div 
            className={`md:hidden py-4 space-y-2 border-t mt-2 ${isScrolled ? 'border-border' : 'border-border/0'}`}
          >
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-all ${
                  isActive(link.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted" 
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;