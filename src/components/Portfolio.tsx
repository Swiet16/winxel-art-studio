import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Play, Music } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: string;
  thumbnail_url: string | null;
  category: string | null;
}

export const Portfolio = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchPortfolio();

    const channel = supabase
      .channel('portfolio-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio_items' },
        () => fetchPortfolio()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPortfolio = async () => {
    const { data } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('is_published', true)
      .order('display_order');
    
    if (data) setItems(data);
  };

  const categories = ["all", ...new Set(items.map(item => item.category).filter(Boolean))];
  const filteredItems = filter === "all" 
    ? items 
    : items.filter(item => item.category === filter);

  return (
    <section id="portfolio" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">Portfolio</h2>
          <p className="text-xl text-muted-foreground">Explore my creative work</p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-3 justify-center mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                filter === category
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(280_80%_65%/0.5)]"
                  : "glass-card hover-glow"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group glass-card overflow-hidden hover-glow cursor-pointer"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={item.thumbnail_url || item.media_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Media Type Indicator */}
                <div className="absolute top-4 right-4 glass-card p-2 rounded-full">
                  {item.media_type === 'video' && <Play className="w-5 h-5" />}
                  {item.media_type === 'music' && <Music className="w-5 h-5" />}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-muted-foreground line-clamp-2">{item.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No items found</p>
          </div>
        )}
      </div>
    </section>
  );
};
