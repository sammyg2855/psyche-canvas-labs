import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Smile, Meh, Frown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

const moodOptions = [
  { icon: Smile, label: "Great", color: "text-green-500", value: 5 },
  { icon: ThumbsUp, label: "Good", color: "text-blue-500", value: 4 },
  { icon: Meh, label: "Okay", color: "text-yellow-500", value: 3 },
  { icon: Frown, label: "Low", color: "text-orange-500", value: 2 },
  { icon: Heart, label: "Struggling", color: "text-red-500", value: 1 },
];

const Mood = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (selectedMood === null) {
      toast.error("Please select a mood");
      return;
    }
    // This will be saved to database
    toast.success("Mood logged successfully!");
    setSelectedMood(null);
    setNote("");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
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

            {/* Placeholder for mood history */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
              <p className="text-muted-foreground text-center py-8">
                No mood entries yet. Start tracking your emotional journey!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Mood;
