import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-secondary to-primary bg-card border-border mt-0">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-[30px] md:gap-[15%] justify-center">
          <div>
            <h3 className="text-white text-xl font-bold bg-clip-text text-transparent mb-4">
              InfluLink
            </h3>
            <p className="text-muted">
              Глобален обхват. Локално въздействие.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-muted text-lg">Навигация</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted hover:text-primary transition-colors">Начало</Link></li>
              <li><Link to="/about" className="text-muted hover:text-primary transition-colors">За нас</Link></li>
              <li><Link to="/contact" className="text-muted hover:text-primary transition-colors">Контакти</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-muted text-lg">Контакти</h4>
            <ul className="space-y-2 text-muted">
              <li>influlink@gmail.com</li>
              <li>Поддръжка 24/7</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-muted">
          <p>&copy; 2025 InfluLink. Всички права запазени.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
