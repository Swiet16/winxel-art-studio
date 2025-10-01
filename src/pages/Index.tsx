import { Hero } from "@/components/Hero";
import { Portfolio } from "@/components/Portfolio";
import { News } from "@/components/News";
import { Contact } from "@/components/Contact";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings, Image, User } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <motion.h2
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold gradient-text"
            >
              Winxel
            </motion.h2>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/gallery">
              <Button variant="ghost" className="hover-glow">
                <Image className="w-4 h-4 mr-2" />
                Gallery
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" className="hover-glow">
                <User className="w-4 h-4 mr-2" />
                About
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="ghost" size="icon" className="hover-glow">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      <div className="pt-20">
        <Hero />
        <Portfolio />
        <News />
        <Contact />
      </div>

      {/* Enhanced Footer */}
      <footer className="relative py-16 px-4 border-t border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold gradient-text mb-4">Winxel</h3>
              <p className="text-muted-foreground">Artist, Creator, Dreamer</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/gallery" className="block text-muted-foreground hover:text-primary transition-colors">
                  Gallery
                </Link>
                <Link to="/about" className="block text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
                <a href="#contact" className="block text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <p className="text-muted-foreground text-sm">
                Follow the journey and stay updated with the latest creations.
              </p>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-border/50">
            <p className="text-muted-foreground">
              © 2025 Winxel. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
