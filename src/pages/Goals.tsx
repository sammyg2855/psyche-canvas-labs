import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Trophy, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  completed: boolean;
  target_date: string | null;
}

const Goals = () => {
  const navigate = useNavigate();
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        loadGoals();
      }
    });
  }, [navigate]);

  const loadGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setGoals(data);
    }
  };

  const handleAddGoal = async () => {
    if (!goalTitle.trim()) {
      toast.error("Please enter a goal");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to add goals");
      return;
    }

    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      title: goalTitle,
      description: goalDescription || null,
      progress: 0,
      completed: false,
    });

    if (error) {
      toast.error("Failed to add goal");
      return;
    }

    toast.success("Goal added!");
    setGoalTitle("");
    setGoalDescription("");
    loadGoals();
  };

  const updateProgress = async (id: string, newProgress: number) => {
    const { error } = await supabase
      .from("goals")
      .update({ 
        progress: newProgress,
        completed: newProgress === 100
      })
      .eq("id", id);

    if (!error) {
      loadGoals();
      if (newProgress === 100) {
        toast.success("Goal completed! 🎉");
      }
    }
  };

  const toggleComplete = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("goals")
      .update({ 
        completed: !currentState,
        progress: !currentState ? 100 : 0
      })
      .eq("id", id);

    if (!error) {
      loadGoals();
      if (!currentState) {
        toast.success("Goal completed! 🎉");
      }
    }
  };

  const activeGoals = goals.filter(g => !g.completed).length;
  const completedGoals = goals.filter(g => g.completed).length;

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
              onKeyPress={(e) => e.key === "Enter" && !goalDescription && handleAddGoal()}
            />
            <Textarea
              placeholder="Add details about your goal (optional)"
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              className="min-h-[100px]"
            />
            <Button onClick={handleAddGoal} className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="text-lg">Active Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{activeGoals}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {activeGoals === 0 ? "Set your first goal to get started" : "Keep going!"}
              </p>
            </CardContent>
          </Card>
          <Card className="card-gradient">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Achievements</CardTitle>
              <Trophy className="w-6 h-6 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{completedGoals}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {completedGoals === 0 ? "Complete goals to earn achievements" : "Amazing progress!"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Goals List */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Your Goals</CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No goals yet. Create your first wellness goal!
              </p>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`border rounded-lg p-4 ${
                      goal.completed ? "bg-muted/50 border-green-500/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleComplete(goal.id, goal.completed)}
                        className="mt-1"
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold ${
                            goal.completed ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {goal.title}
                        </h3>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {goal.description}
                          </p>
                        )}
                        {!goal.completed && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateProgress(goal.id, Math.min(goal.progress + 10, 100))}
                              >
                                +10%
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateProgress(goal.id, Math.min(goal.progress + 25, 100))}
                              >
                                +25%
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateProgress(goal.id, 100)}
                              >
                                Complete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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

export default Goals;
