import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Explore Sri Lanka", href: "#explore" },
    { label: "Tours", href: "#tours" },
    { label: "Accommodation", href: "#accommodation" },
    { label: "Getting Around", href: "#getting-around" },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-elegant"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#home" className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src="/favicon.ico"
                  alt="Lanka Vacations Logo"
                  className="w-12 h-12 lg:w-14 lg:h-14 object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-2xl lg:text-3xl font-serif font-bold transition-colors duration-300 ${
                    isScrolled ? "text-foreground" : "text-primary-foreground"
                  }`}
                >
                  Lanka Vacations
                </span>
                <span
                  className={`text-xs font-medium tracking-widest uppercase ${
                    isScrolled ? "text-accent" : "text-accent"
                  }`}
                >
                  Luxury Travel Since 2024
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                    isScrolled ? "text-foreground" : "text-primary-foreground/90"
                  } hover:text-accent hover:bg-accent/10`}
                >
                  {item.label}
                </a>
              ))}

              {/* Theme Toggle */}
              <ThemeToggle
                isScrolled={isScrolled}
                className={`ml-2 transition-colors duration-300 ${
                  isScrolled ? "text-foreground hover:text-accent" : "text-primary-foreground/90 hover:text-accent"
                }`}
              />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden gap-2">
              <ThemeToggle
                isScrolled={isScrolled}
                className={`transition-colors duration-300 ${
                  isScrolled ? "text-foreground hover:text-accent" : "text-primary-foreground/90 hover:text-accent"
                }`}
              />
              <Button
                variant="ghost"
                size="icon"
                className={`transition-colors duration-300 ${
                  isScrolled ? "text-foreground hover:text-accent" : "text-primary-foreground/90 hover:text-accent"
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-50 bg-gradient-to-b from-background via-background to-secondary/50 transition-transform duration-500 lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Fixed Header */}
          <div className="flex justify-between items-center p-6 border-b border-border/50 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <img src="/favicon.ico" alt="Lanka Vacations Logo" className="w-10 h-10 object-contain" />
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-bold text-foreground">Lanka Vacations</span>
                <span className="text-xs text-accent font-medium tracking-wider">Luxury Travel</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent/10 hover:text-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              <X size={24} />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <nav className="p-6 space-y-1">
              {navItems.map((item, idx) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="flex items-center justify-between text-xl font-serif text-foreground py-4 px-4 rounded-xl hover:bg-accent/10 hover:text-accent transition-all duration-300 animate-fade-up group cursor-pointer"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <span>{item.label}</span>
                  <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a>
              ))}
            </nav>

            {/* Company Info Section */}
            <div className="px-6 py-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50">
                <h3 className="text-lg font-bold text-foreground mb-3">Lanka Vacations (Pvt) Ltd.</h3>
                <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                  Established in 1984, Lanka Vacations acts as a Destination Management company to meet every client need. We offer day excursions, cultural, nature & wildlife tours, as well as tailor-made itineraries.
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+94777325515"
                    className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50 hover:bg-accent/10 transition-colors"
                  >
                    <Phone size={18} className="text-accent" />
                    <span className="text-sm font-medium text-foreground">+94 777 325 515</span>
                  </a>
                  <a
                    href="mailto:clientservice@lanka-vacations.com"
                    className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50 hover:bg-accent/10 transition-colors"
                  >
                    <Mail size={18} className="text-accent" />
                    <span className="text-sm font-medium text-foreground">clientservice@lanka-vacations.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="px-6 py-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Access</p>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="#company-info"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-3 rounded-xl bg-secondary/50 hover:bg-accent/10 transition-colors text-center"
                >
                  <span className="text-sm font-medium text-foreground">Company Info</span>
                </a>
                <a
                  href="#tours"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-3 rounded-xl bg-secondary/50 hover:bg-accent/10 transition-colors text-center"
                >
                  <span className="text-sm font-medium text-foreground">View Tours</span>
                </a>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="p-6 border-t border-border/50 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-6">
              <a
                href="tel:+94777325515"
                className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors text-sm"
              >
                <Phone size={16} />
                <span>Call Us</span>
              </a>
              <span className="text-border">|</span>
              <a
                href="mailto:clientservice@lanka-vacations.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors text-sm"
              >
                <Mail size={16} />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
