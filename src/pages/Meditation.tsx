import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Wind, Heart, Brain, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Meditation = () => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const exercises = [
    {
      id: "breathing",
      title: "Breathing Exercise",
      description: "4-7-8 breathing technique for relaxation",
      duration: 300,
      icon: Wind,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "mindfulness",
      title: "Mindfulness Meditation",
      description: "Focus on the present moment",
      duration: 600,
      icon: Brain,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: "gratitude",
      title: "Gratitude Practice",
      description: "Reflect on things you're grateful for",
      duration: 300,
      icon: Heart,
      gradient: "from-rose-500 to-orange-500",
    },
    {
      id: "sleep",
      title: "Sleep Meditation",
      description: "Calm your mind for restful sleep",
      duration: 900,
      icon: Moon,
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  const startExercise = (exerciseId: string, duration: number) => {
    setSelectedExercise(exerciseId);
    setTimeLeft(duration);
    setProgress(0);
    setIsPlaying(true);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsPlaying(false);
          toast({
            title: "Exercise Complete!",
            description: "Great job on completing this meditation.",
          });
          return 0;
        }
        const newTime = prev - 1;
        setProgress(((duration - newTime) / duration) * 100);
        return newTime;
      });
    }, 1000);
  };

  const pauseExercise = () => {
    setIsPlaying(false);
  };

  const resetExercise = () => {
    setSelectedExercise(null);
    setIsPlaying(false);
    setProgress(0);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
          <Card className="card-gradient">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {exercises.find((e) => e.id === selectedExercise)?.title}
              </CardTitle>
              <CardDescription>
                {exercises.find((e) => e.id === selectedExercise)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-4">{formatTime(timeLeft)}</div>
                <Progress value={progress} className="h-2 mb-4" />
              </div>
              <div className="flex justify-center gap-4">
                {isPlaying ? (
                  <Button onClick={pauseExercise} size="lg" variant="outline">
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      const exercise = exercises.find((e) => e.id === selectedExercise);
                      if (exercise) startExercise(exercise.id, exercise.duration);
                    }}
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {progress > 0 ? "Resume" : "Start"}
                  </Button>
                )}
                <Button onClick={resetExercise} size="lg" variant="ghost">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="card-gradient hover:scale-105 smooth-transition cursor-pointer group"
                onClick={() => startExercise(exercise.id, exercise.duration)}
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
                    <Play className="w-4 h-4 mr-2" />
                    Start {formatTime(exercise.duration)}
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
