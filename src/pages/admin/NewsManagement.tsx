import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  is_published: boolean;
  published_at: string;
}

const NewsManagement = () => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    image_url: "",
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('news_posts')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (data) setPosts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || null,
        image_url: formData.image_url || null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('news_posts')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
        toast.success("Post updated!");
      } else {
        const { error } = await supabase
          .from('news_posts')
          .insert([postData]);
        if (error) throw error;
        toast.success("Post created!");
      }

      setFormData({ title: "", content: "", excerpt: "", image_url: "" });
      setEditingPost(null);
      setIsDialogOpen(false);
      fetchPosts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('news_posts')
      .update({ is_published: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      fetchPosts();
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const { error } = await supabase
      .from('news_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Post deleted");
      fetchPosts();
    }
  };

  const startEdit = (post: NewsPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      image_url: post.image_url || "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold gradient-text">News Management</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-primary to-secondary"
              onClick={() => {
                setEditingPost(null);
                setFormData({ title: "", content: "", excerpt: "", image_url: "" });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit' : 'Create'} News Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Post title"
                  className="glass bg-background/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Excerpt</label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short summary (optional)"
                  className="glass bg-background/50"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content *</label>
                <Textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Post content"
                  className="glass bg-background/50"
                  rows={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image URL (optional)</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="glass bg-background/50"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-secondary">
                  {editingPost ? 'Update' : 'Create'} Post
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card overflow-hidden">
              {post.image_url && (
                <div className="relative h-48">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs ${
                    post.is_published ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    {post.is_published ? 'Published' : 'Draft'}
                  </div>
                </div>
              )}
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-2">
                  {format(new Date(post.published_at), 'MMM dd, yyyy')}
                </p>
                <h3 className="font-semibold mb-2 text-lg">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {post.excerpt || post.content}
                </p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(post)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublished(post.id, post.is_published)}
                  >
                    {post.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletePost(post.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-20 glass-card rounded-2xl">
          <p className="text-xl text-muted-foreground">No news posts yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;
