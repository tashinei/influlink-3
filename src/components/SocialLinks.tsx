import { Instagram, Facebook, Linkedin, Globe } from "lucide-react";

const SocialIconLink = ({ platform, url }: { platform: string; url: string }) => {
  if (!url || url.trim() === '') return null; // Logic: Only show if value exists

  // Map the platform name to the correct icon
  const getIcon = () => {
    switch (platform) {
      case 'X': 
        return <i className="fa-brands fa-x-twitter text-[1.1rem]"></i>;
      case 'Instagram': 
        return <Instagram size={18} />;
      case 'Facebook': 
        return <Facebook size={18} />;
      case 'LinkedIn': 
        return <Linkedin size={18} />;
      default: 
        return <Globe size={18} />;
    }
  };

  // Ensure the URL is clickable (adds https:// if missing)
  const formattedUrl = url.startsWith('http') ? url : `https://${url}`;

  return (
    <a
      href={formattedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
      title={platform}
    >
      {getIcon()}
    </a>
  );
};