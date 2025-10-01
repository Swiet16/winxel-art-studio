import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Briefcase, Newspaper, Mail } from "lucide-react";

const Overview = () => {
  const [stats, setStats] = useState({
    heroImages: 0,
    portfolioItems: 0,
    newsPosts: 0,
    messages: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [hero, portfolio, news, messages, unread] = await Promise.all([
      supabase.from('hero_images').select('*', { count: 'exact', head: true }),
      supabase.from('portfolio_items').select('*', { count: 'exact', head: true }),
      supabase.from('news_posts').select('*', { count: 'exact', head: true }),
      supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
      supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('is_read', false),
    ]);

    setStats({
      heroImages: hero.count || 0,
      portfolioItems: portfolio.count || 0,
      newsPosts: news.count || 0,
      messages: messages.count || 0,
      unreadMessages: unread.count || 0,
    });
  };

  const statCards = [
    {
      title: "Hero Images",
      value: stats.heroImages,
      icon: Image,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Portfolio Items",
      value: stats.portfolioItems,
      icon: Briefcase,
      color: "from-pink-500 to-cyan-500",
    },
    {
      title: "News Posts",
      value: stats.newsPosts,
      icon: Newspaper,
      color: "from-cyan-500 to-purple-500",
    },
    {
      title: "Messages",
      value: `${stats.unreadMessages}/${stats.messages}`,
      icon: Mail,
      color: "from-purple-500 to-cyan-500",
    },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 gradient-text">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card hover-glow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-12">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Welcome to your Winxel admin dashboard! Use the sidebar to manage your content.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/admin/hero"
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg hover:opacity-90 transition-opacity"
              >
                Manage Hero Images
              </a>
              <a
                href="/admin/portfolio"
                className="px-6 py-3 glass-card hover-glow rounded-lg transition-all"
              >
                Add Portfolio Item
              </a>
              <a
                href="/admin/news"
                className="px-6 py-3 glass-card hover-glow rounded-lg transition-all"
              >
                Create News Post
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
