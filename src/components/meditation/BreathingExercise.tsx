import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Play, Pause, RotateCcw } from "lucide-react";

interface BreathingPhase {
  name: string;
  duration: number;
  instruction: string;
}

export const BreathingExercise = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(4);
  const [sessionDuration, setSessionDuration] = useState(5);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(false);

  const [phases, setPhases] = useState<BreathingPhase[]>([
    { name: "Inhale", duration: 4, instruction: "Breathe in slowly..." },
    { name: "Hold", duration: 4, instruction: "Hold your breath..." },
    { name: "Exhale", duration: 6, instruction: "Breathe out slowly..." },
    { name: "Hold", duration: 2, instruction: "Hold..." },
  ]);

  const currentPhase = phases[currentPhaseIndex];
  const totalSessionSeconds = sessionDuration * 60;
  const progress = (totalElapsed / totalSessionSeconds) * 100;
  const circleScale = currentPhase.name === "Inhale" ? 1.5 : currentPhase.name === "Exhale" ? 0.7 : 1;

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const nextIndex = (currentPhaseIndex + 1) % phases.length;
          setCurrentPhaseIndex(nextIndex);
          
          if (voiceEnabled) {
            const utterance = new SpeechSynthesisUtterance(phases[nextIndex].instruction);
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
          }
          
          if (vibrationEnabled && 'vibrate' in navigator) {
            navigator.vibrate(200);
          }
          
          return phases[nextIndex].duration;
        }
        return prev - 1;
      });

      setTotalElapsed((prev) => {
        const newElapsed = prev + 1;
        if (newElapsed >= totalSessionSeconds) {
          setIsPlaying(false);
          return 0;
        }
        return newElapsed;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentPhaseIndex, phases, totalSessionSeconds, voiceEnabled, vibrationEnabled]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentPhaseIndex(0);
    setTimeLeft(phases[0].duration);
    setTotalElapsed(0);
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Session Duration</Label>
              <Select
                value={sessionDuration.toString()}
                onValueChange={(val) => setSessionDuration(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="voice">Voice Guidance</Label>
            <Switch
              id="voice"
              checked={voiceEnabled}
              onCheckedChange={setVoiceEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="vibration">Vibration Cues</Label>
            <Switch
              id="vibration"
              checked={vibrationEnabled}
              onCheckedChange={setVibrationEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Breathing Circle */}
      <div className="relative h-96 flex items-center justify-center">
        <div
          className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 transition-transform duration-[4000ms] ease-in-out"
          style={{
            transform: `scale(${isPlaying ? circleScale : 1})`,
          }}
        />
        <div className="absolute flex flex-col items-center gap-4 z-10">
          <h3 className="text-3xl font-bold">{currentPhase.name}</h3>
          <p className="text-xl text-muted-foreground">{currentPhase.instruction}</p>
          <div className="text-6xl font-bold">{timeLeft}s</div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Session Progress</span>
          <span>{Math.floor(totalElapsed / 60)}:{(totalElapsed % 60).toString().padStart(2, '0')} / {sessionDuration}:00</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => setIsPlaying(!isPlaying)}
          size="lg"
          className="w-32"
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start
            </>
          )}
        </Button>
        <Button onClick={handleReset} size="lg" variant="outline">
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};