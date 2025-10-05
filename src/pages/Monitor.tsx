import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface MonitoredUser {
  id: string;
  display_name: string | null;
}

interface MentalHealthData {
  moods: any[];
  journals: any[];
  goals: any[];
}

const Monitor = () => {
  const navigate = useNavigate();
  const [monitoredUsers, setMonitoredUsers] = useState<MonitoredUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [mentalHealthData, setMentalHealthData] = useState<MentalHealthData>({
    moods: [],
    journals: [],
    goals: []
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        loadMonitoredUsers();
      }
    });
  }, [navigate]);

  const loadMonitoredUsers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("monitoring_relationships")
      .select("monitored_user_id")
      .eq("monitor_id", user.id)
      .eq("approved", true);

    if (!error && data) {
      const userProfiles = await Promise.all(
        data.map(async (rel: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_id, display_name")
            .eq("user_id", rel.monitored_user_id)
            .single();
          
          return profile ? {
            id: profile.user_id,
            display_name: profile.display_name
          } : null;
        })
      );
      setMonitoredUsers(userProfiles.filter(Boolean) as MonitoredUser[]);
    }
  };

  const loadMentalHealthData = async (userId: string) => {
    const [moodsRes, journalsRes, goalsRes] = await Promise.all([
      supabase.from("moods").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("journals").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
      supabase.from("goals").select("*").eq("user_id", userId).order("created_at", { ascending: false })
    ]);

    setMentalHealthData({
      moods: moodsRes.data || [],
      journals: journalsRes.data || [],
      goals: goalsRes.data || []
    });
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    loadMentalHealthData(userId);
  };

  const selectedUser = monitoredUsers.find(u => u.id === selectedUserId);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Mental Health Monitoring
            </CardTitle>
            <CardDescription>
              View mental health data for users under your care
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {monitoredUsers.length === 0 ? (
                <p className="text-muted-foreground col-span-full text-center py-8">
                  No approved monitoring relationships yet
                </p>
              ) : (
                monitoredUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant={selectedUserId === user.id ? "default" : "outline"}
                    onClick={() => handleSelectUser(user.id)}
                    className="justify-start"
                  >
                    {user.display_name || "User"}
                  </Button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {selectedUser && (
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Mental Health Overview: {selectedUser.display_name || "User"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="moods">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="moods">Moods ({mentalHealthData.moods.length})</TabsTrigger>
                  <TabsTrigger value="journals">Journals ({mentalHealthData.journals.length})</TabsTrigger>
                  <TabsTrigger value="goals">Goals ({mentalHealthData.goals.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="moods" className="space-y-4">
                  {mentalHealthData.moods.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No mood entries</p>
                  ) : (
                    mentalHealthData.moods.map((mood) => (
                      <div key={mood.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold capitalize">{mood.mood}</h4>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(mood.created_at), "MMM d, yyyy h:mm a")}
                          </span>
                        </div>
                        {mood.note && <p className="text-sm">{mood.note}</p>}
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="journals" className="space-y-4">
                  {mentalHealthData.journals.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No journal entries</p>
                  ) : (
                    mentalHealthData.journals.map((journal) => (
                      <div key={journal.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{journal.title}</h4>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(journal.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-3">{journal.content}</p>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="goals" className="space-y-4">
                  {mentalHealthData.goals.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No goals set</p>
                  ) : (
                    mentalHealthData.goals.map((goal) => (
                      <div key={goal.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{goal.title}</h4>
                          <span className={`text-sm ${goal.completed ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {goal.completed ? 'Completed' : `${goal.progress}%`}
                          </span>
                        </div>
                        {goal.description && <p className="text-sm">{goal.description}</p>}
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Monitor;
