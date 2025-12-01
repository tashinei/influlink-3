import { Heart, Eye, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PortfolioItem } from "@/types/profile";

interface PortfolioCardProps {
  item: PortfolioItem;
  onClick: () => void;
  onShare?: () => void;
}

export const PortfolioCard = ({ item, onClick, onShare }: PortfolioCardProps) => {
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.();
  };

  return (
    <Card 
      className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-card rounded-3xl cursor-pointer"
      onClick={onClick}
      role="article"
      aria-label={`${item.title} by ${item.brand}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardContent className="p-0 bg-[white] rounded-[40px] group-hover:scale-105 transition-transform duration-500">
        <div className="relative aspect-[9//16] overflow-hidden h-[45dvh]">
          <img 
            src={item.image} 
            alt={item.title}
            className="object-cover w-full h-full transform transition-transform duration-500 rounded-[40px]" 
            loading="lazy"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge className="bg-gradient-to-br from-primary to-secondary text-[white] hover:bg-background backdrop-blur-sm py-1">
              {item.type}
            </Badge>
          </div>
          <div 
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 text-background"
            aria-hidden="true"
          >
            <div className="flex items-center gap-1">
              <Heart className="w-5 h-5 fill-current" />
              <span className="font-semibold">{item.stats.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-5 h-5" />
              <span className="font-semibold">{item.stats.views}</span>
            </div>
          </div>
        </div>
        {/* <div className="p-6 flex justify-between items-start bg-[white] rounded-b-[40px] rounded-l-[40px] rounded-r-[40px]">
          <div>
            <h3 className="font-bold text-lg text-[black] group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-primary">{item.brand}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 -mr-2"
            onClick={handleShare}
            aria-label={`Share ${item.title}`}
          >
            <Share2 className="w-4 h-4 text-[white]" />
          </Button>
        </div> */}
      </CardContent>
    </Card>
  );
};
