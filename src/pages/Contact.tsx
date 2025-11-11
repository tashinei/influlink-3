import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Съобщението е изпратено!",
      description: "Ще се свържем с вас възможно най-скоро.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Имейл",
      content: "influlink@gmail.com",
    },
    {
      icon: MapPin,
      title: "Локация",
      content: "България",
    },
    {
      icon: Clock,
      title: "Работно време",
      content: "Поддръжка 24/7",
    },
  ];

  return (
    <div className="min-h-screen pt-20" style={{position:"relative", top:"-80px"}}>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary via-secondary to-[#6EC5E9]">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in text-muted">
            Свържете се с нас<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"></span>
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Имате въпроси? Нашият екип е на разположение 24/7, за да ви помогне
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <Card key={index} className="rounded-2xl border-border text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <info.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{info.title}</h3>
                  <p className="text-muted-foreground">{info.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <Card className="rounded-3xl border-border">
              <CardHeader>
                <CardTitle className="text-3xl text-center">Изпратете ни съобщение</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Име
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="rounded-xl"
                      placeholder="Вашето име"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Имейл
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="rounded-xl"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Тема
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="rounded-xl"
                      placeholder="Относно какво е вашето съобщение?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Съобщение
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="rounded-xl min-h-[150px]"
                      placeholder="Вашето съобщение..."
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full rounded-full text-lg">
                    Изпрати съобщение
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
