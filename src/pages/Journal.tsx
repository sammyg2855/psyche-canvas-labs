import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  sentiment: string | null;
  created_at: string;
}

const Journal = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        loadEntries();
      }
    });
  }, [navigate]);

  const loadEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("journals")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to save entries");
      return;
    }

    const { error } = await supabase.from("journals").insert({
      user_id: user.id,
      title,
      content,
      sentiment: null,
    });

    if (error) {
      toast.error("Failed to save entry");
      return;
    }

    toast.success("Journal entry saved!");
    setTitle("");
    setContent("");
    loadEntries();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("journals")
      .delete()
      .eq("id", id);

    if (!error) {
      toast.success("Entry deleted");
      loadEntries();
    } else {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              New Journal Entry
            </CardTitle>
            <CardDescription>
              Capture your thoughts, feelings, and experiences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Entry title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Write your thoughts here... What's on your mind today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px]"
            />
            <Button onClick={handleSave} className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Save Entry
            </Button>
          </CardContent>
        </Card>

        {/* Journal Entries List */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No journal entries yet. Start writing your first entry!
              </p>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{entry.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entry.created_at), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div
                      className={`text-sm ${
                        expandedEntry === entry.id ? "" : "line-clamp-3"
                      }`}
                    >
                      {entry.content}
                    </div>
                    {entry.content.length > 200 && (
                      <Button
                        variant="link"
                        className="px-0 mt-2"
                        onClick={() =>
                          setExpandedEntry(
                            expandedEntry === entry.id ? null : entry.id
                          )
                        }
                      >
                        {expandedEntry === entry.id ? "Show less" : "Read more"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Journal;
