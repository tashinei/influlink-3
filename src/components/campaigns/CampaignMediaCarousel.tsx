import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ImageIcon } from "lucide-react";

interface CampaignMediaCarouselProps {
  images: string[];
}

export const CampaignMediaCarousel = ({ images }: CampaignMediaCarouselProps) => {
  if (images.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30">
        <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No reference images uploaded</p>
        <p className="text-xs text-muted-foreground/70">Edit campaign to add images</p>
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              <img
                src={image}
                alt={`Reference image ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-2 right-2 rounded bg-background/80 px-2 py-1 text-xs text-foreground">
                {index + 1} of {images.length}
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 && (
        <>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </>
      )}
    </Carousel>
  );
};
