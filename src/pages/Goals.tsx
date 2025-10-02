import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Plus, Trophy } from "lucide-react";
import { toast } from "sonner";

const Goals = () => {
  const [goalTitle, setGoalTitle] = useState("");

  const handleAddGoal = () => {
    if (!goalTitle.trim()) {
      toast.error("Please enter a goal");
      return;
    }
    // This will be saved to database
    toast.success("Goal added!");
    setGoalTitle("");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Set a New Goal
            </CardTitle>
            <CardDescription>
              Define your wellness objectives and track your progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="What do you want to achieve?"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddGoal()}
            />
            <Button onClick={handleAddGoal} className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="text-lg">Active Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground mt-2">
                Set your first goal to get started
              </p>
            </CardContent>
          </Card>
          <Card className="card-gradient">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Achievements</CardTitle>
              <Trophy className="w-6 h-6 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground mt-2">
                Complete goals to earn achievements
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for goals list */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Your Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No goals yet. Create your first wellness goal!
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Goals;
