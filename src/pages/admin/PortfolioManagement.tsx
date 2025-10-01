import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Trash2, Eye, EyeOff, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: string;
  thumbnail_url: string | null;
  category: string | null;
  is_published: boolean;
}

const PortfolioManagement = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media_type: "image",
    category: "",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('display_order');
    
    if (data) setItems(data);
  };

  const handleFileUpload = async (file: File, type: 'media' | 'thumbnail') => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('portfolio-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (mediaUrl: string, thumbnailUrl?: string) => {
    try {
      const itemData = {
        title: formData.title,
        description: formData.description || null,
        media_url: mediaUrl,
        media_type: formData.media_type,
        thumbnail_url: thumbnailUrl || mediaUrl,
        category: formData.category || null,
        display_order: items.length,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('portfolio_items')
          .update(itemData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success("Item updated!");
      } else {
        const { error } = await supabase
          .from('portfolio_items')
          .insert([itemData]);
        if (error) throw error;
        toast.success("Item added!");
      }

      setFormData({ title: "", description: "", media_type: "image", category: "" });
      setEditingItem(null);
      fetchItems();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('portfolio_items')
      .update({ is_published: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      fetchItems();
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Item deleted");
      fetchItems();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold gradient-text">Portfolio Management</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary">
              <Upload className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Portfolio Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Item title"
                  className="glass bg-background/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Item description"
                  className="glass bg-background/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Media Type *</label>
                  <Select value={formData.media_type} onValueChange={(value) => setFormData({ ...formData, media_type: value })}>
                    <SelectTrigger className="glass bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Digital Art"
                    className="glass bg-background/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Media File *</label>
                <Input
                  type="file"
                  accept={formData.media_type === 'image' ? 'image/*' : formData.media_type === 'video' ? 'video/*' : 'audio/*'}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await handleFileUpload(file, 'media');
                      if (url) await handleSubmit(url);
                    }
                  }}
                  disabled={uploading || !formData.title}
                  className="glass bg-background/50"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={item.thumbnail_url || item.media_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs ${
                  item.is_published ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  {item.is_published ? 'Published' : 'Draft'}
                </div>
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs bg-primary/80">
                  {item.media_type}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                {item.category && (
                  <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                )}
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublished(item.id, item.is_published)}
                    className="flex-1"
                  >
                    {item.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 glass-card rounded-2xl">
          <p className="text-xl text-muted-foreground">No portfolio items yet. Add your first one!</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioManagement;
