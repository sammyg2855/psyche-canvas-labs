import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Image as ImageIcon, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface InspirationItem {
  id: string;
  image_url: string;
  title: string | null;
  notes: string | null;
  is_favorite: boolean;
}

const Inspiration = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InspirationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        loadItems();
      }
    });
  }, [navigate]);

  const loadItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("inspiration_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      setUploadingFile(file);
    }
  };

  const handleAddItem = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to add inspiration");
      return;
    }

    setIsUploading(true);
    let imageUrl = newImageUrl;

    try {
      // Upload file if selected
      if (uploadingFile) {
        const fileExt = uploadingFile.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('inspiration-images')
          .upload(fileName, uploadingFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('inspiration-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      if (!imageUrl.trim()) {
        toast.error("Please upload an image or enter an image URL");
        setIsUploading(false);
        return;
      }

      const { error } = await supabase.from("inspiration_items").insert({
        user_id: user.id,
        image_url: imageUrl,
        title: newTitle || null,
        board_id: null,
      });

      if (error) throw error;

      toast.success("Inspiration added!");
      setNewImageUrl("");
      setNewTitle("");
      setUploadingFile(null);
      setDialogOpen(false);
      loadItems();
    } catch (error) {
      toast.error("Failed to add item");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (id: string, imageUrl: string) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from("inspiration_items")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // Delete from storage if it's a storage URL
      if (imageUrl.includes('inspiration-images')) {
        const path = imageUrl.split('inspiration-images/')[1];
        await supabase.storage.from('inspiration-images').remove([path]);
      }

      setItems(items.filter(item => item.id !== id));
      toast.success("Image deleted");
    } catch (error) {
      toast.error("Failed to delete item");
      console.error(error);
    }
  };

  const toggleFavorite = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("inspiration_items")
      .update({ is_favorite: !currentState })
      .eq("id", id);

    if (!error) {
      setItems(items.map(item => 
        item.id === id ? { ...item, is_favorite: !currentState } : item
      ));
    }
  };

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-primary" />
              Inspiration Board
            </CardTitle>
            <CardDescription>
              Collect and organize images that inspire you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your inspiration..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Inspiration</DialogTitle>
                    <DialogDescription>
                      Upload an image or add an image URL
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Upload Image</label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {uploadingFile ? uploadingFile.name : "Click to upload or drag and drop"}
                          </p>
                        </label>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Image URL</label>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Title (Optional)</label>
                      <Input
                        placeholder="Beautiful sunset..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleAddItem} 
                      className="w-full"
                      disabled={isUploading}
                    >
                      {isUploading ? "Uploading..." : "Add to Board"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No inspiration items yet. Add your first one!
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-card shadow-md hover:shadow-xl smooth-transition"
                  >
                    <img
                      src={item.image_url}
                      alt={item.title || "Inspiration"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {item.title && (
                          <p className="text-white text-sm font-medium truncate mb-2">
                            {item.title}
                          </p>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => toggleFavorite(item.id, item.is_favorite)}
                          className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              item.is_favorite ? "fill-red-500 text-red-500" : "text-white"
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.image_url)}
                          className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-red-500/80 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Inspiration;
