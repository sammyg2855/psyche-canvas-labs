import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, ExternalLink, Heart, Users, Shield, BookOpen } from "lucide-react";

const Resources = () => {
  const emergencyContacts = [
    {
      title: "National Suicide Prevention Lifeline",
      phone: "988",
      description: "Free, confidential support 24/7",
      icon: Phone,
    },
    {
      title: "Crisis Text Line",
      phone: "Text HOME to 741741",
      description: "Text-based crisis support",
      icon: MessageCircle,
    },
  ];

  const resources = [
    {
      title: "Mental Health America",
      description: "Tools, information, and resources for mental health",
      url: "https://www.mhanational.org",
      icon: Heart,
      gradient: "from-pink-500 to-rose-500",
    },
    {
      title: "NAMI (National Alliance on Mental Illness)",
      description: "Support groups and educational programs",
      url: "https://www.nami.org",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Anxiety and Depression Association",
      description: "Evidence-based resources and support",
      url: "https://adaa.org",
      icon: Shield,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Mental Health Resources",
      description: "Comprehensive guide to mental health support",
      url: "https://www.mentalhealth.gov",
      icon: BookOpen,
      gradient: "from-green-500 to-teal-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Mental Health <span className="gradient-text">Resources</span>
          </h1>
          <p className="text-muted-foreground">
            Important contacts and helpful resources for your wellbeing
          </p>
        </div>

        {/* Emergency Contacts */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Emergency Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact) => (
              <Card key={contact.phone} className="card-gradient border-2 border-destructive/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <contact.icon className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{contact.title}</CardTitle>
                      <CardDescription className="font-semibold text-foreground">
                        {contact.phone}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{contact.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Helpful Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource) => (
              <Card
                key={resource.url}
                className="card-gradient hover:scale-105 smooth-transition group"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${resource.gradient} flex items-center justify-center mb-4 group-hover:glow-effect smooth-transition`}
                  >
                    <resource.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => window.open(resource.url, "_blank")}
                  >
                    Visit Website
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Self-Care Tips */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Self-Care Reminder</CardTitle>
            <CardDescription>Remember to take care of yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">• Take breaks when you need them</p>
            <p className="text-sm">• Reach out to friends and family</p>
            <p className="text-sm">• Practice mindfulness and meditation</p>
            <p className="text-sm">• Exercise regularly, even light activity helps</p>
            <p className="text-sm">• Get enough sleep and maintain a routine</p>
            <p className="text-sm">• Seek professional help when needed</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Resources;
