import { Card, CardContent } from "@/components/ui/card";
import { Target, Heart, Zap } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Нашата мисия",
      description: "Да създадем най-добрата платформа за свързване на брандове и инфлуенсъри в България, като улесним процеса на колаборация и осигурим измерими резултати.",
    },
    {
      icon: Heart,
      title: "Нашите ценности",
      description: "Прозрачност, иновация и качество са в основата на всичко, което правим. Вярваме в истински връзки и дългосрочни партньорства.",
    },
    {
      icon: Zap,
      title: "Нашата визия",
      description: "Да бъдем водещата платформа за инфлуенсър маркетинг в България и да помогнем на бизнеса да расте чрез автентични връзки.",
    },
  ];

  return (
    <div className="min-h-screen pt-20" style={{position:"relative", top:"-80px"}}>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-gray to-secondary">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 animate-fade-in text-muted">
            За нас<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"></span>
          </h1>
          <p className="text-xl text-center text-white max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Първата платформа в България, която свързва брандове с инфлуенсъри за истински и измерим растеж
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="rounded-3xl border-border">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Нашата история
                </h2>
                <div className="space-y-4 text-lg text-muted-foreground">
                  <p>
                    InfluLink беше създадена с една ясна цел - да улесни връзката между брандове и инфлуенсъри в България. Видяхме нуждата от платформа, която да предлага прозрачност, ефективност и измерими резултати.
                  </p>
                  <p>
                    Днес сме единствената специализирана платформа в страната, която предлага пълен набор от инструменти за управление на инфлуенсър кампании - от намиране на подходящи партньори до проследяване на резултатите.
                  </p>
                  <p>
                    Нашият екип работи денонощно, за да осигури най-доброто изживяване както за брандовете, така и за инфлуенсърите, като създаваме мост между тях и им помагаме да постигат общи цели.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Какво ни движи
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="rounded-2xl border-border hover:border-primary transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 mb-6 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                500+
              </div>
              <p className="text-xl text-muted-foreground">Успешни кампании</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                1000+
              </div>
              <p className="text-xl text-muted-foreground">Активни инфлуенсъри</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                24/7
              </div>
              <p className="text-xl text-muted-foreground">Поддръжка</p>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default About;
