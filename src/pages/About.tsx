import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Twitter, Youtube, Music2 } from "lucide-react";

const About = () => {
  const [artistName, setArtistName] = useState("Winxel ( Yna )");
  const [aboutText, setAboutText] = useState("Artist, Creator, Dreamer");
  const [socials, setSocials] = useState({
    instagram: "",
    twitter: "",
    youtube: "",
    spotify: "",
  });

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["artist_name", "about_text", "social_instagram", "social_twitter", "social_youtube", "social_spotify"]);

    if (data) {
      const settings: any = {};
      data.forEach(item => {
        settings[item.key] = item.value || "";
      });
      
      if (settings.artist_name) setArtistName(settings.artist_name);
      if (settings.about_text) setAboutText(settings.about_text);
      setSocials({
        instagram: settings.social_instagram || "",
        twitter: settings.social_twitter || "",
        youtube: settings.social_youtube || "",
        spotify: settings.social_spotify || "",
      });
    }
  };

  const socialLinks = [
    { icon: Instagram, url: socials.instagram, label: "Instagram", color: "from-pink-500 to-purple-500" },
    { icon: Twitter, url: socials.twitter, label: "Twitter", color: "from-blue-400 to-blue-600" },
    { icon: Youtube, url: socials.youtube, label: "YouTube", color: "from-red-500 to-red-700" },
    { icon: Music2, url: socials.spotify, label: "Spotify", color: "from-green-400 to-green-600" },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-7xl md:text-8xl font-bold mb-6 gradient-text">
            {artistName}
          </h1>
          <p className="text-2xl text-muted-foreground">
            {aboutText}
          </p>
        </motion.div>

        {/* Bio Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-12 rounded-3xl mb-12"
        >
          <h2 className="text-4xl font-bold mb-6 gradient-text">About</h2>
          <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
            <p>
              Welcome to my creative space. I'm a passionate artist dedicated to pushing the boundaries
              of creativity and expression through various mediums.
            </p>
            <p>
              My work explores the intersection of art, technology, and human emotion, creating
              experiences that resonate and inspire.
            </p>
            <p>
              Every piece I create is a journey of discovery, blending traditional techniques with
              modern innovation to craft something truly unique.
            </p>
          </div>
        </motion.div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-12 rounded-3xl"
          >
            <h2 className="text-4xl font-bold mb-8 gradient-text text-center">Connect</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl p-8 glass hover-glow transition-all duration-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                  <div className="relative flex items-center gap-4">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${link.color}`}>
                      <link.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-2xl font-semibold">{link.label}</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default About;
