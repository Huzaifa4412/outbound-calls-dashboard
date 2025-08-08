import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, CheckCircle, Calendar, Users } from "lucide-react";
import { CallData } from "@/types/call-data";

interface DashboardStatsProps {
  data: CallData[];
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const totalCalls: number = data.length;
  const appointmentsBooked: number = data.filter(
    (call) => call["Appointment Booked (Yes/No)"] === true
  ).length;
  const needAIAgent: number = data.filter(
    (call) => call["Need AI-Agent ? (Yes/No)"] === true
  ).length;
  // Ensure Caller_agent_ID is not null/undefined before mapping
  const uniqueCallerIds: number = new Set(
    data.map((call) => call.Caller_agent_ID).filter(Boolean)
  ).size;

  const stats = [
    {
      title: "Total Calls Made",
      value: totalCalls,
      icon: Phone,
      description: "All outbound calls completed",
      color: "text-blue-600",
    },
    {
      title: "Appointments Booked",
      value: appointmentsBooked,
      icon: Calendar,
      description: "Successful bookings secured",
      color: "text-green-600",
    },
    {
      title: "AI Interest Generated",
      value: needAIAgent,
      icon: Users,
      description: "Prospects interested in AI",
      color: "text-purple-600",
    },
    {
      title: "Call Sessions",
      value: uniqueCallerIds,
      icon: CheckCircle,
      description: "Unique calling sessions",
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
