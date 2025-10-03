import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Image as ImageIcon, Plus, Search } from "lucide-react";
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
  const [items, setItems] = useState<InspirationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

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

  const handleAddItem = async () => {
    if (!newImageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to add inspiration");
      return;
    }

    const { error } = await supabase.from("inspiration_items").insert({
      user_id: user.id,
      image_url: newImageUrl,
      title: newTitle || null,
      board_id: null,
    });

    if (error) {
      toast.error("Failed to add item");
      return;
    }

    toast.success("Inspiration added!");
    setNewImageUrl("");
    setNewTitle("");
    setDialogOpen(false);
    loadItems();
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
                      Add an image URL to your inspiration board
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
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
                    <Button onClick={handleAddItem} className="w-full">
                      Add to Board
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
                    className="group relative aspect-square rounded-lg overflow-hidden bg-muted hover-scale"
                  >
                    <img
                      src={item.image_url}
                      alt={item.title || "Inspiration"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        {item.title && (
                          <p className="text-white text-sm font-medium truncate">
                            {item.title}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleFavorite(item.id, item.is_favorite)}
                        className="absolute top-2 right-2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            item.is_favorite ? "fill-red-500 text-red-500" : "text-white"
                          }`}
                        />
                      </button>
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
