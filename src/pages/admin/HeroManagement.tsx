import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Trash2, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface HeroImage {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  is_active: boolean;
  display_order: number;
}

const HeroManagement = () => {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data } = await supabase
      .from('hero_images')
      .select('*')
      .order('display_order');
    
    if (data) setImages(data);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hero-images')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('hero_images')
        .insert([{
          image_url: publicUrl,
          title: formData.title || null,
          subtitle: formData.subtitle || null,
          display_order: images.length,
        }]);

      if (insertError) throw insertError;

      toast.success("Hero image uploaded successfully!");
      setFormData({ title: "", subtitle: "" });
      fetchImages();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('hero_images')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      fetchImages();
    }
  };

  const deleteImage = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('hero-images').remove([fileName]);
      }

      const { error } = await supabase
        .from('hero_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Image deleted");
      fetchImages();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold gradient-text">Hero Images</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary">
              <Upload className="w-4 h-4 mr-2" />
              Upload New
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>Upload Hero Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title (optional)</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Image title"
                  className="glass bg-background/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subtitle (optional)</label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Image subtitle"
                  className="glass bg-background/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image File</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  disabled={uploading}
                  className="glass bg-background/50"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={image.image_url}
                  alt={image.title || "Hero image"}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs ${
                  image.is_active ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  {image.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <CardContent className="p-4">
                {image.title && <h3 className="font-semibold mb-1">{image.title}</h3>}
                {image.subtitle && <p className="text-sm text-muted-foreground mb-4">{image.subtitle}</p>}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(image.id, image.is_active)}
                    className="flex-1"
                  >
                    {image.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteImage(image.id, image.image_url)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-20 glass-card rounded-2xl">
          <p className="text-xl text-muted-foreground">No hero images yet. Upload your first one!</p>
        </div>
      )}
    </div>
  );
};

export default HeroManagement;
