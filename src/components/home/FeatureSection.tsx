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
      className={`flex-1 space-y-6 ${imagePosition === "left" ? "text-right lg:pr-6" : "text-left lg:pl-6"
        }`}
    >
      <h3 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h3>
      <p className="text-lg text-muted-foreground">{description}</p>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li
            key={index}
            className={`flex items-start gap-3 text-lg ${imagePosition === "left" ? "justify-end" : ""
              }`}
          >
            <div
              className={`mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r ${gradient} flex-shrink-0`}
            />
            <span className="text-foreground/80">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const image = imageSrc && (
    <div
      className={`flex-2 lg:flex-none lg:w-[50%] ${imagePosition === "left" ? "-ml-16 lg:-ml-32" : ""
        }`}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className="rounded-xl object-cover"
        style={{ maxWidth: "120%" }}
      />
    </div>
  );

  return (
    <section className="py-20">
      <div className="container mx-auto max-w-[9xl] flex flex-col lg:flex-row items-center gap-12 lg:gap-32">
        {imagePosition === "left" ? image : content}
        {imagePosition === "left" ? content : image}
      </div>
    </section>
  );
};

export default FeatureSection;
