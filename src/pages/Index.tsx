import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, MessageSquare, BookOpen, Target, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const features = [
    {
      icon: MessageSquare,
      title: "AI-Powered Chat",
      description: "Get personalized wellness guidance 24/7",
    },
    {
      icon: Heart,
      title: "Mood Tracking",
      description: "Understand your emotional patterns",
    },
    {
      icon: BookOpen,
      title: "Digital Journaling",
      description: "Capture and reflect on your thoughts",
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Track progress toward wellness objectives",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <Sparkles className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold">
            Welcome to <span className="gradient-text">MindScape</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Your personal sanctuary for wellness, inspiration, and growth. 
            Powered by AI to support your mental health journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg px-8">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for <span className="gradient-text">Wellness</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              MindScape combines cutting-edge AI with proven wellness practices
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-gradient p-6 rounded-2xl hover:scale-105 smooth-transition"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 hero-gradient">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-4">
            <TrendingUp className="w-12 h-12 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Start Your Journey Today
            </h2>
          </div>
          <p className="text-lg text-muted-foreground">
            Join thousands improving their mental wellness with MindScape
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-12">
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-card">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 MindScape. Your wellness, our mission.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
