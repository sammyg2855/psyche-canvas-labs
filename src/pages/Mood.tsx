import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Smile, Meh, Frown, ThumbsUp, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const moodOptions = [
  { icon: Smile, label: "Great", color: "text-green-500", value: "Great" },
  { icon: ThumbsUp, label: "Good", color: "text-blue-500", value: "Good" },
  { icon: Meh, label: "Okay", color: "text-yellow-500", value: "Okay" },
  { icon: Frown, label: "Low", color: "text-orange-500", value: "Low" },
  { icon: Heart, label: "Struggling", color: "text-red-500", value: "Struggling" },
];

interface MoodEntry {
  id: string;
  mood: string;
  note: string | null;
  created_at: string;
}

const Mood = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        loadMoodHistory();
      }
    });
  }, [navigate]);

  useEffect(() => {
    // Set up realtime subscription
    const channel = supabase
      .channel('mood-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'moods'
        },
        (payload) => {
          console.log('Mood change detected:', payload);
          loadMoodHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMoodHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Only load moods for the current user
    const { data, error } = await supabase
      .from("moods")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setMoodHistory(data);
    }
  };

  const handleSave = async () => {
    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to save your mood");
      return;
    }

    const { error } = await supabase.from("moods").insert({
      user_id: user.id,
      mood: selectedMood,
      note: note || null,
    });

    if (error) {
      toast.error("Failed to save mood");
      return;
    }

    toast.success("Mood logged successfully!");
    setSelectedMood(null);
    setNote("");
    loadMoodHistory();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              Mood Tracker
            </CardTitle>
            <CardDescription>
              How are you feeling today? Track your emotional well-being
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Your Mood</h3>
              <div className="grid grid-cols-5 gap-4">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 smooth-transition ${
                      selectedMood === mood.value
                        ? "border-primary bg-primary/5 scale-105"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <mood.icon className={`w-8 h-8 ${mood.color}`} />
                    <span className="text-sm font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Add a Note (Optional)</h3>
              <Textarea
                placeholder="What's on your mind? How are you feeling?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <Button onClick={handleSave} className="w-full" size="lg">
              Save Mood Entry
            </Button>
          </CardContent>
        </Card>

        {/* Mood History */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Moods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moodHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No mood entries yet. Log your first mood above!
                </p>
              ) : (
                moodHistory.map((entry) => {
                  const moodIcon = moodOptions.find((m) => m.value === entry.mood);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      {moodIcon && (
                        <moodIcon.icon className={`w-8 h-8 ${moodIcon.color}`} />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{entry.mood}</span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(entry.created_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Mood;
