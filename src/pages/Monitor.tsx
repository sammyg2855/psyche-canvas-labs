import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, UserPlus, Check, X, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

interface MonitoredUser {
  id: string;
  display_name: string | null;
}

interface MentalHealthData {
  moods: any[];
  alerts: any[];
}

interface MoodChartData {
  date: string;
  score: number;
}

interface PendingRequest {
  id: string;
  monitor_id: string;
  monitored_user_id: string;
  relationship_type: string;
  monitor_profile: {
    display_name: string | null;
  };
}

const Monitor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [monitoredUsers, setMonitoredUsers] = useState<MonitoredUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [mentalHealthData, setMentalHealthData] = useState<MentalHealthData>({
    moods: [],
    alerts: []
  });
  const [moodChartData, setMoodChartData] = useState<MoodChartData[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [newMonitorEmail, setNewMonitorEmail] = useState("");
  const [relationshipType, setRelationshipType] = useState("parent");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        checkUserRole();
        loadMonitoredUsers();
        loadPendingRequests();
      }
    });
  }, [navigate]);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["parent", "guardian", "police"])
      .maybeSingle();

    setUserRole(data?.role || null);
    setIsLoadingRole(false);
  };

  const handleSetRole = async (role: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Delete existing monitoring role if any
    await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", user.id)
      .in("role", ["parent", "guardian", "police"]);

    // Insert new role
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: role as 'parent' | 'guardian' | 'police' });

    if (!error) {
      setUserRole(role);
      toast({
        title: "Success",
        description: `Role set to ${role}`,
      });
    } else {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
    const [moodsRes, alertsRes] = await Promise.all([
      supabase.from("moods").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
      supabase.from("alerts").select("*").eq("user_id", userId).eq("resolved", false).order("created_at", { ascending: false })
    ]);

    const moods = moodsRes.data || [];
    const alerts = alertsRes.data || [];

    // Convert moods to chart data
    const moodScoreMap: { [key: string]: number } = {
      'happy': 5,
      'good': 4,
      'okay': 3,
      'sad': 2,
      'anxious': 1,
      'angry': 1,
      'depressed': 1
    };

    const chartData = moods.map(mood => ({
      date: format(new Date(mood.created_at), "MMM d"),
      score: moodScoreMap[mood.mood.toLowerCase()] || 3
    })).reverse();

    setMentalHealthData({ moods, alerts });
    setMoodChartData(chartData);
  };

  const handleResolveAlert = async (alertId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("alerts")
      .update({ resolved: true, resolved_by: user.id, resolved_at: new Date().toISOString() })
      .eq("id", alertId);

    if (!error) {
      toast({
        title: "Success",
        description: "Alert marked as resolved",
      });
      if (selectedUserId) {
        loadMentalHealthData(selectedUserId);
      }
    }
  };

  const loadPendingRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("monitoring_relationships")
      .select(`
        id,
        monitor_id,
        monitored_user_id,
        relationship_type,
        monitor_profile:profiles!monitoring_relationships_monitor_id_fkey(display_name)
      `)
      .eq("monitored_user_id", user.id)
      .eq("approved", false);

    if (!error && data) {
      setPendingRequests(data as any);
    }
  };

  const handleRequestMonitoring = async () => {
    if (!newMonitorEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Look up user by email using edge function
    const { data: lookupData, error: lookupError } = await supabase.functions.invoke('lookup-user-by-email', {
      body: { email: newMonitorEmail.trim() }
    });

    if (lookupError || !lookupData?.user_id) {
      toast({
        title: "Error",
        description: "User not found with that email",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("monitoring_relationships")
      .insert({
        monitor_id: user.id,
        monitored_user_id: lookupData.user_id,
        relationship_type: relationshipType,
        approved: false,
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send monitoring request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Monitoring request sent",
      });
      setNewMonitorEmail("");
      loadMonitoredUsers();
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("monitoring_relationships")
      .update({ approved: true })
      .eq("id", requestId);

    if (!error) {
      toast({
        title: "Success",
        description: "Monitoring request approved",
      });
      loadPendingRequests();
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("monitoring_relationships")
      .delete()
      .eq("id", requestId);

    if (!error) {
      toast({
        title: "Success",
        description: "Monitoring request denied",
      });
      loadPendingRequests();
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    loadMentalHealthData(userId);
  };

  const selectedUser = monitoredUsers.find(u => u.id === selectedUserId);

  if (isLoadingRole) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
        {/* Role Selection */}
        {!userRole && (
          <Card className="card-gradient border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Select Your Monitoring Role
              </CardTitle>
              <CardDescription>
                To use the monitoring features, please select your role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleSetRole("parent")}
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                >
                  <span className="text-lg font-semibold">Parent</span>
                  <span className="text-xs text-muted-foreground">Monitor your children</span>
                </Button>
                <Button
                  onClick={() => handleSetRole("guardian")}
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                >
                  <span className="text-lg font-semibold">Guardian</span>
                  <span className="text-xs text-muted-foreground">Monitor people under your care</span>
                </Button>
                <Button
                  onClick={() => handleSetRole("police")}
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                >
                  <span className="text-lg font-semibold">Police</span>
                  <span className="text-xs text-muted-foreground">Official monitoring</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Request Monitoring Access */}
        {userRole && (
          <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-primary" />
              Request Monitoring Access
            </CardTitle>
            <CardDescription>
              Request permission to monitor someone's mental health data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Enter user's email"
                value={newMonitorEmail}
                onChange={(e) => setNewMonitorEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={relationshipType} onValueChange={setRelationshipType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                  <SelectItem value="police">Police</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRequestMonitoring}>
                Send Request
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Pending Requests */}
        {userRole && pendingRequests.length > 0 && (
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Pending Access Requests</CardTitle>
              <CardDescription>
                Users requesting to monitor your mental health data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">
                      {request.monitor_profile?.display_name || "Unknown User"}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {request.relationship_type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveRequest(request.id)}
                      variant="default"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDenyRequest(request.id)}
                      variant="destructive"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Deny
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Monitored Users */}
        {userRole && (
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
        )}

        {/* Critical Alerts */}
        {userRole && selectedUser && mentalHealthData.alerts.length > 0 && (
          <Card className="card-gradient border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-6 h-6" />
                Critical Alerts: {selectedUser.display_name || "User"}
              </CardTitle>
              <CardDescription>
                Suspicious content detected requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mentalHealthData.alerts.map((alert) => (
                <div key={alert.id} className="border border-destructive rounded-lg p-4 bg-destructive/10">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive">
                          {alert.content_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(alert.created_at), "MMM d, yyyy h:mm a")}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {alert.flagged_words.map((word: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-destructive border-destructive">
                            {word}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm mt-2 font-medium">"{alert.content_snippet}"</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleResolveAlert(alert.id)}
                      variant="outline"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Mood Graph */}
        {userRole && selectedUser && (
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Mood Trends: {selectedUser.display_name || "User"}</CardTitle>
              <CardDescription>
                Mood tracking over the last 30 entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {moodChartData.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No mood data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <Tooltip 
                      formatter={(value: number) => {
                        const moodLabels = ['', 'Low', 'Sad', 'Okay', 'Good', 'Happy'];
                        return moodLabels[value];
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {userRole && (
          <div className="text-sm text-muted-foreground text-center">
            Current role: <span className="font-semibold capitalize">{userRole}</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Monitor;
