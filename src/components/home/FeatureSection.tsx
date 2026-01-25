import { LucideIcon } from "lucide-react";

interface FeatureSectionProps {
  title: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  imagePosition: "left" | "right";
  gradient: string;
  imageSrc?: string;
  imageAlt?: string;
}

const FeatureSection = ({
  title,
  description,
  features,
  icon: Icon,
  imagePosition,
  gradient,
  imageSrc,
  imageAlt = "Feature image",
}: FeatureSectionProps) => {
  
  const content = (
    <div
      className={`flex-1 space-y-6 w-full ${
        imagePosition === "left" ? "lg:text-right lg:pl-6" : "lg:text-left lg:pl-6"
      } text-left mt-8 lg:mt-0`}
    >
      <h3 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h3>
      <p className="text-lg text-muted-foreground">{description}</p>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className={`flex items-start gap-3 text-lg ${
        imagePosition === "left" ? "justify-end" : "justify-start"
      }`}>
            <div className={`mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r ${gradient} flex-shrink-0`} />
            <span className="text-foreground/80">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const image = imageSrc && (
    <div
      className={`w-full lg:flex-1 flex justify-center ${
        imagePosition === "left" ? "lg:-ml-24" : "lg:-mr-24"
      } -mx-6 sm:mx-0`}
    >
      <div className="relative w-screen sm:w-full">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-auto min-h-[250px] object-cover sm:rounded-3xl"
        />
      </div>
    </div>
  );

  return (
    <section className="py-12 md:py-24 overflow-x-clip">
      <div className={`container mx-auto px-6 flex flex-col items-center gap-10 lg:gap-20 ${
        imagePosition === "right" ? "lg:flex-row-reverse" : "lg:flex-row"
      }`}>
        {image}
        {content}
      </div>
    </section>
  );
};
export default FeatureSection;
