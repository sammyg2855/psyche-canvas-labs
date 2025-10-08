import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Heart, BookOpen, Target, TrendingUp, Award, Shield, Lock, Image, Wind, LifeBuoy } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    moodCount: 0,
    journalCount: 0,
    goalsProgress: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch mood check-ins count
      const { count: moodCount } = await supabase
        .from("moods")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      // Fetch journal entries count
      const { count: journalCount } = await supabase
        .from("journals")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      // Fetch goals and calculate progress
      const { data: goals } = await supabase
        .from("goals")
        .select("progress, completed")
        .eq("user_id", session.user.id);

      const goalsProgress = goals && goals.length > 0
        ? Math.round(goals.reduce((acc, goal) => acc + (goal.progress || 0), 0) / goals.length)
        : 0;

      setStats({
        moodCount: moodCount || 0,
        journalCount: journalCount || 0,
        goalsProgress,
      });
    };

    loadStats();
  }, [navigate]);

  const features = [
    {
      icon: MessageSquare,
      title: "AI Assistant",
      description: "Chat with your personal wellness companion",
      path: "/chat",
      gradient: "from-purple-500 to-blue-500",
    },
    {
      icon: Heart,
      title: "Mood Tracker",
      description: "Track and understand your emotional journey",
      path: "/mood",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: BookOpen,
      title: "Journal",
      description: "Capture your thoughts and reflections",
      path: "/journal",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Target,
      title: "Goals",
      description: "Set and achieve your wellness objectives",
      path: "/goals",
      gradient: "from-green-500 to-teal-500",
    },
    {
      icon: Image,
      title: "Inspiration",
      description: "Create visual boards for motivation",
      path: "/inspiration",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Wind,
      title: "Meditation",
      description: "Guided exercises for mindfulness and calm",
      path: "/meditation",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: LifeBuoy,
      title: "Resources",
      description: "Emergency contacts and mental health resources",
      path: "/resources",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Shield,
      title: "Monitor",
      description: "View mental health data of those under your care",
      path: "/monitor",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: Lock,
      title: "Privacy",
      description: "Manage who can access your mental health data",
      path: "/privacy",
      gradient: "from-red-500 to-pink-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="hero-gradient rounded-2xl p-8 md:p-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to <span className="gradient-text">MindScape</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your personal space for wellness, growth, and self-discovery. Let's make today count.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-gradient">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mood Check-ins</CardTitle>
              <Heart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.moodCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.moodCount === 0 ? "Start tracking today" : "Total check-ins"}
              </p>
            </CardContent>
          </Card>
          <Card className="card-gradient">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.journalCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.journalCount === 0 ? "Begin your journey" : "Total entries"}
              </p>
            </CardContent>
          </Card>
          <Card className="card-gradient">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.goalsProgress}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.goalsProgress === 0 ? "Set your first goal" : "Average progress"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.path}
              className="card-gradient hover:scale-105 smooth-transition cursor-pointer group"
              onClick={() => navigate(feature.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:glow-effect smooth-transition`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Get Started →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
