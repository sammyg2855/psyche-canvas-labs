import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Eye, Anchor, Heart as HeartIcon } from "lucide-react";

const techniques = [
  {
    id: "body-scan",
    title: "Body Scan",
    icon: Brain,
    description: "Progressive relaxation through body awareness",
    steps: [
      "Find a comfortable position, either sitting or lying down",
      "Close your eyes and take three deep breaths",
      "Bring attention to your toes - notice any sensations",
      "Slowly move your awareness up through your feet, ankles, calves",
      "Continue scanning upward through legs, hips, torso, arms",
      "Notice your chest, shoulders, neck, and head",
      "Observe sensations without judgment",
      "Return to full body awareness when complete",
    ],
  },
  {
    id: "focused-attention",
    title: "Focused Attention",
    icon: Eye,
    description: "Train your mind with single-point focus",
    steps: [
      "Sit comfortably with your spine straight",
      "Choose a focus point (breath, sound, or object)",
      "Gently direct your attention to this point",
      "When your mind wanders, notice without judgment",
      "Gently return your focus to the chosen point",
      "Continue for your desired duration",
      "Notice how your focus improves over time",
    ],
  },
  {
    id: "grounding",
    title: "5-4-3-2-1 Grounding",
    icon: Anchor,
    description: "Connect with the present using your senses",
    steps: [
      "Acknowledge 5 things you can see around you",
      "Acknowledge 4 things you can touch",
      "Acknowledge 3 things you can hear",
      "Acknowledge 2 things you can smell",
      "Acknowledge 1 thing you can taste",
      "Take a deep breath and notice how you feel",
      "This technique helps anchor you in the present moment",
    ],
  },
  {
    id: "loving-kindness",
    title: "Loving-Kindness",
    icon: HeartIcon,
    description: "Cultivate compassion for yourself and others",
    steps: [
      "Sit comfortably and close your eyes",
      "Think of someone you love and send them well-wishes",
      "Repeat: 'May you be happy, may you be healthy, may you be safe'",
      "Now direct these wishes toward yourself",
      "Extend to someone neutral (acquaintance)",
      "Extend to someone difficult in your life",
      "Finally, extend to all beings everywhere",
      "Notice the warmth in your heart",
    ],
  },
];

export const MindfulnessTechniques = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);

  const currentTechnique = techniques.find((t) => t.id === selectedTechnique);

  if (selectedTechnique && currentTechnique) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedTechnique(null)}
        >
          ← Back to techniques
        </Button>

        <Card className="card-gradient">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <currentTechnique.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{currentTechnique.title}</CardTitle>
                <CardDescription>{currentTechnique.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {currentTechnique.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {techniques.map((technique) => (
        <Card
          key={technique.id}
          className="card-gradient hover:scale-105 smooth-transition cursor-pointer group"
          onClick={() => setSelectedTechnique(technique.id)}
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 group-hover:glow-effect smooth-transition">
              <technique.icon className="w-6 h-6 text-white" />
            </div>
            <CardTitle>{technique.title}</CardTitle>
            <CardDescription>{technique.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full">
              Start Practice →
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};