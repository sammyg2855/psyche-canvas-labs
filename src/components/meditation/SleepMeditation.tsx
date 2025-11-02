import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { toast } from "sonner";

const soundOptions = [
  { value: "rain", label: "Rain", url: "https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3" },
  { value: "ocean", label: "Ocean Waves", url: "https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3" },
  { value: "white-noise", label: "White Noise", url: "https://assets.mixkit.co/active_storage/sfx/2395/2395-preview.mp3" },
];

export const SleepMeditation = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(900);
  const [selectedSound, setSelectedSound] = useState("rain");
  const [volume, setVolume] = useState([0.5]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0];
    }
  }, [volume]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleStop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(soundOptions.find(s => s.value === selectedSound)?.url);
      audioRef.current.loop = true;
      audioRef.current.volume = volume[0];
    }

    audioRef.current.play().catch(() => {
      toast.error("Could not play audio. Please try again.");
    });
    setIsPlaying(true);
    setTimeLeft(duration * 60);
  };

  const handleStop = () => {
    if (audioRef.current) {
      // Fade out
      const fadeOut = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0.05) {
          audioRef.current.volume -= 0.05;
        } else {
          clearInterval(fadeOut);
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
        }
      }, 100);
    }
    setIsPlaying(false);
  };

  const handleReset = () => {
    handleStop();
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>Sound Selection</Label>
            <Select value={selectedSound} onValueChange={setSelectedSound} disabled={isPlaying}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {soundOptions.map((sound) => (
                  <SelectItem key={sound.value} value={sound.value}>
                    {sound.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Duration (minutes)</Label>
            <Select
              value={duration.toString()}
              onValueChange={(val) => setDuration(Number(val))}
              disabled={isPlaying}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Volume
            </Label>
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={1}
              step={0.1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Timer Display */}
      <div className="text-center space-y-4">
        <div className="text-6xl font-bold">{formatTime(timeLeft)}</div>
        <p className="text-muted-foreground">
          {isPlaying ? "Playing calming sounds..." : "Ready to begin"}
        </p>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!isPlaying ? (
          <Button onClick={handlePlay} size="lg" className="w-32">
            <Play className="w-5 h-5 mr-2" />
            Start
          </Button>
        ) : (
          <Button onClick={handleStop} size="lg" variant="outline" className="w-32">
            <Pause className="w-5 h-5 mr-2" />
            Pause
          </Button>
        )}
        <Button onClick={handleReset} size="lg" variant="outline">
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};