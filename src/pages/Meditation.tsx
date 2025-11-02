import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Heart, Brain, Moon } from "lucide-react";
import { BreathingExercise } from "@/components/meditation/BreathingExercise";
import { SleepMeditation } from "@/components/meditation/SleepMeditation";
import { MindfulnessTechniques } from "@/components/meditation/MindfulnessTechniques";

const Meditation = () => {
  const navigate = useNavigate();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const exercises = [
    {
      id: "breathing",
      title: "Breathing Exercise",
      description: "Guided breathing with visual cues",
      icon: Wind,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "mindfulness",
      title: "Mindfulness Techniques",
      description: "Multiple meditation practices",
      icon: Brain,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: "gratitude",
      title: "Gratitude Journal",
      description: "Write what you're grateful for",
      icon: Heart,
      gradient: "from-rose-500 to-orange-500",
    },
    {
      id: "sleep",
      title: "Sleep Meditation",
      description: "Calming sounds for restful sleep",
      icon: Moon,
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  const handleExerciseSelect = (exerciseId: string) => {
    if (exerciseId === "gratitude") {
      // Redirect to journal page
      navigate("/journal");
      return;
    }
    setSelectedExercise(exerciseId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Meditation & <span className="gradient-text">Mindfulness</span>
          </h1>
          <p className="text-muted-foreground">
            Take a moment to center yourself with guided exercises
          </p>
        </div>

        {selectedExercise ? (
          <div>
            <Button
              variant="ghost"
              onClick={() => setSelectedExercise(null)}
              className="mb-4"
            >
              ← Back to exercises
            </Button>
            {selectedExercise === "breathing" && <BreathingExercise />}
            {selectedExercise === "sleep" && <SleepMeditation />}
            {selectedExercise === "mindfulness" && <MindfulnessTechniques />}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="card-gradient hover:scale-105 smooth-transition cursor-pointer group"
                onClick={() => handleExerciseSelect(exercise.id)}
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exercise.gradient} flex items-center justify-center mb-4 group-hover:glow-effect smooth-transition`}
                  >
                    <exercise.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>{exercise.title}</CardTitle>
                  <CardDescription>{exercise.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Start Practice →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Meditation;
