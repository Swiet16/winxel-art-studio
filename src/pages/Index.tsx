import { Hero } from "@/components/Hero";
import { Portfolio } from "@/components/Portfolio";
import { News } from "@/components/News";
import { Contact } from "@/components/Contact";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Admin Access Button */}
      <Link to="/auth">
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50 glass-card hover-glow"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </Link>

      <Hero />
      <Portfolio />
      <News />
      <Contact />

      {/* Footer */}
      <footer className="py-12 px-4 text-center border-t border-border/50">
        <p className="text-muted-foreground">
          © 2025 Winxel. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
