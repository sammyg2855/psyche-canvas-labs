import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, Heart, Users } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("user");

  const roles = [
    {
      value: "user",
      label: "Regular User",
      description: "Track your mental wellness journey",
      icon: User,
    },
    {
      value: "parent",
      label: "Parent",
      description: "Monitor your child's mental health",
      icon: Heart,
    },
    {
      value: "guardian",
      label: "Guardian",
      description: "Care for someone's wellbeing",
      icon: Users,
    },
    {
      value: "police",
      label: "Law Enforcement",
      description: "Professional monitoring access",
      icon: Shield,
    },
  ];

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          display_name: displayName,
        });

      if (profileError) throw profileError;

      // Insert role (only admin can do this in production, but for onboarding we allow self-assignment)
      // In production, you'd need a special edge function or admin approval
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert([{
          user_id: user.id,
          role: selectedRole as any,
        }]);

      if (roleError && !roleError.message.includes("duplicate")) {
        throw roleError;
      }

      toast({
        title: "Welcome to MindScape!",
        description: "Your profile has been set up successfully.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-gradient">
      <Card className="w-full max-w-2xl card-gradient">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">
            Welcome to <span className="gradient-text">MindScape</span>
          </CardTitle>
          <CardDescription>
            Let's set up your profile in just {step === 1 ? "two" : "one more"} step{step === 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="How should we call you?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <Button
                onClick={() => setStep(2)}
                className="w-full"
                disabled={!displayName.trim()}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-4">
                <Label>Select Your Role</Label>
                <RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roles.map((role) => (
                      <label
                        key={role.value}
                        className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer smooth-transition ${
                          selectedRole === role.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={role.value} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <role.icon className="w-4 h-4" />
                            <span className="font-semibold">{role.label}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleComplete} className="flex-1">
                  Complete Setup
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
