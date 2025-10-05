import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface MonitoringRequest {
  id: string;
  monitor_id: string;
  relationship_type: string;
  approved: boolean;
  created_at: string;
  monitor_profile?: {
    display_name: string | null;
  };
}

const Privacy = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MonitoringRequest[]>([]);
  const [approvedMonitors, setApprovedMonitors] = useState<MonitoringRequest[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        loadMonitoringRequests();
      }
    });
  }, [navigate]);

  const loadMonitoringRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("monitoring_relationships")
      .select("*")
      .eq("monitored_user_id", user.id);

    if (!error && data) {
      const enrichedData = await Promise.all(
        data.map(async (rel: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", rel.monitor_id)
            .single();
          
          return {
            ...rel,
            monitor_profile: profile
          };
        })
      );

      setRequests(enrichedData.filter((r: any) => !r.approved));
      setApprovedMonitors(enrichedData.filter((r: any) => r.approved));
    }
  };

  const handleApprove = async (requestId: string) => {
    const { error } = await supabase
      .from("monitoring_relationships")
      .update({ approved: true })
      .eq("id", requestId);

    if (!error) {
      toast.success("Monitoring request approved");
      loadMonitoringRequests();
    } else {
      toast.error("Failed to approve request");
    }
  };

  const handleDeny = async (requestId: string) => {
    const { error } = await supabase
      .from("monitoring_relationships")
      .delete()
      .eq("id", requestId);

    if (!error) {
      toast.success("Monitoring request denied");
      loadMonitoringRequests();
    } else {
      toast.error("Failed to deny request");
    }
  };

  const handleRevoke = async (requestId: string) => {
    const { error } = await supabase
      .from("monitoring_relationships")
      .delete()
      .eq("id", requestId);

    if (!error) {
      toast.success("Monitoring access revoked");
      loadMonitoringRequests();
    } else {
      toast.error("Failed to revoke access");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              Privacy & Monitoring
            </CardTitle>
            <CardDescription>
              Manage who can view your mental health data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Pending Requests</h3>
              {requests.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No pending monitoring requests
                </p>
              ) : (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {request.monitor_profile?.display_name || "Unknown User"}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {request.relationship_type} • Requested {format(new Date(request.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(request.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeny(request.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Approved Monitors</h3>
              {approvedMonitors.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No one is currently monitoring your data
                </p>
              ) : (
                <div className="space-y-3">
                  {approvedMonitors.map((monitor) => (
                    <div key={monitor.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {monitor.monitor_profile?.display_name || "Unknown User"}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {monitor.relationship_type} • Approved {format(new Date(monitor.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevoke(monitor.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Revoke Access
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Privacy;