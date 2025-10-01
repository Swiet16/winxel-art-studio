import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save } from "lucide-react";

const Settings = () => {
  const [settings, setSettings] = useState({
    artist_name: "",
    about_text: "",
    social_instagram: "",
    social_twitter: "",
    social_youtube: "",
    social_spotify: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value');
    
    if (data) {
      const settingsObj: any = {};
      data.forEach(item => {
        settingsObj[item.key] = item.value || "";
      });
      setSettings(settingsObj);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'key' });
        
        if (error) throw error;
      }

      toast.success("Settings saved successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 gradient-text">Site Settings</h1>

      <div className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Artist Name</label>
              <Input
                value={settings.artist_name}
                onChange={(e) => setSettings({ ...settings, artist_name: e.target.value })}
                placeholder="Winxel ( Yna )*"
                className="glass bg-background/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">About Text</label>
              <Input
                value={settings.about_text}
                onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
                placeholder="Artist, Creator, Dreamer"
                className="glass bg-background/50"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <Input
                value={settings.social_instagram}
                onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                placeholder="https://instagram.com/..."
                className="glass bg-background/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Twitter/X</label>
              <Input
                value={settings.social_twitter}
                onChange={(e) => setSettings({ ...settings, social_twitter: e.target.value })}
                placeholder="https://twitter.com/..."
                className="glass bg-background/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">YouTube</label>
              <Input
                value={settings.social_youtube}
                onChange={(e) => setSettings({ ...settings, social_youtube: e.target.value })}
                placeholder="https://youtube.com/..."
                className="glass bg-background/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Spotify</label>
              <Input
                value={settings.social_spotify}
                onChange={(e) => setSettings({ ...settings, social_spotify: e.target.value })}
                placeholder="https://spotify.com/..."
                className="glass bg-background/50"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-secondary py-6 text-lg"
        >
          <Save className="w-5 h-5 mr-2" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
