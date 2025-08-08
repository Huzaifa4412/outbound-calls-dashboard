"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Tooltip,
} from "recharts";
import { CallData } from "@/types/call-data";

interface DashboardChartsProps {
  data: CallData[];
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  // Return empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i: number) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">
                No data available for charts
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Call Outcomes Analysis (PIE CHART)
  const outcomeData = [
    {
      name: "AI Interest + Appointment",
      value: data.filter(
        (call) =>
          call["Need AI-Agent ? (Yes/No)"] === true &&
          call["Appointment Booked (Yes/No)"] === true
      ).length,
      fill: "#22c55e",
    },
    {
      name: "AI Interest Only",
      value: data.filter(
        (call) =>
          call["Need AI-Agent ? (Yes/No)"] === true &&
          call["Appointment Booked (Yes/No)"] === false
      ).length,
      fill: "#3b82f6",
    },
    {
      name: "Appointment Only",
      value: data.filter(
        (call) =>
          call["Need AI-Agent ? (Yes/No)"] === false &&
          call["Appointment Booked (Yes/No)"] === true
      ).length,
      fill: "#f59e0b",
    },
    {
      name: "No Interest",
      value: data.filter(
        (call) =>
          call["Need AI-Agent ? (Yes/No)"] === false &&
          call["Appointment Booked (Yes/No)"] === false
      ).length,
      fill: "#ef4444",
    },
  ].filter((item) => item.value > 0);

  // Call Sessions Performance
  const sessionDataMap = data.reduce((acc, call) => {
    const sessionId = call.Caller_agent_ID || "unknown_session";
    const shortId = sessionId.slice(-8);

    if (!acc[sessionId]) {
      acc[sessionId] = {
        sessionId: shortId,
        fullSessionId: sessionId,
        totalCalls: 0,
        appointments: 0,
        aiInterest: 0,
      };
    }

    acc[sessionId].totalCalls++;
    if (call["Appointment Booked (Yes/No)"] === true)
      acc[sessionId].appointments++;
    if (call["Need AI-Agent ? (Yes/No)"] === true) acc[sessionId].aiInterest++;

    return acc;
  }, {});

  const callSessionsData = Object.values(sessionDataMap).map((session) => ({
    ...session,
    successRate:
      session.totalCalls > 0
        ? Math.round(
            ((session.appointments + session.aiInterest) / session.totalCalls) *
              100
          )
        : 0,
  }));

  // Call Engagement Analysis
  const engagementData = data.map((call) => {
    const summaryLength = (call["Call summary"] || "").length;
    const transcriptLength = (call["Call Transcript"] || "").length;

    let engagementLevel = "Low";
    if (summaryLength > 200 && transcriptLength > 500) {
      engagementLevel = "High";
    } else if (summaryLength > 100 || transcriptLength > 300) {
      engagementLevel = "Medium";
    }

    return {
      engagementLevel,
      hasAppointment: call["Appointment Booked (Yes/No)"] === true,
      hasAIInterest: call["Need AI-Agent ? (Yes/No)"] === true,
      saloonName: call["Saloon Name"] || "N/A",
    };
  });

  const engagementStatsMap = engagementData.reduce((acc, item) => {
    if (!acc[item.engagementLevel]) {
      acc[item.engagementLevel] = {
        level: item.engagementLevel,
        totalCalls: 0,
        appointments: 0,
        aiInterest: 0,
      };
    }

    acc[item.engagementLevel].totalCalls++;
    if (item.hasAppointment) acc[item.engagementLevel].appointments++;
    if (item.hasAIInterest) acc[item.engagementLevel].aiInterest++;

    return acc;
  }, {});

  const callEngagementData = Object.values(engagementStatsMap);

  // Interest vs Booking Correlation
  const correlationData = [
    {
      x: 0,
      y: 0,
      name: "No Interest, No Appointment",
      size: data.filter(
        (c) =>
          c["Need AI-Agent ? (Yes/No)"] === false &&
          c["Appointment Booked (Yes/No)"] === false
      ).length,
    },
    {
      x: 1,
      y: 0,
      name: "AI Interest, No Appointment",
      size: data.filter(
        (c) =>
          c["Need AI-Agent ? (Yes/No)"] === true &&
          c["Appointment Booked (Yes/No)"] === false
      ).length,
    },
    {
      x: 0,
      y: 1,
      name: "No AI Interest, Has Appointment",
      size: data.filter(
        (c) =>
          c["Need AI-Agent ? (Yes/No)"] === false &&
          c["Appointment Booked (Yes/No)"] === true
      ).length,
    },
    {
      x: 1,
      y: 1,
      name: "AI Interest + Appointment",
      size: data.filter(
        (c) =>
          c["Need AI-Agent ? (Yes/No)"] === true &&
          c["Appointment Booked (Yes/No)"] === true
      ).length,
    },
  ].filter((item) => item.size > 0);

  const totalOutcomes = outcomeData.reduce((sum, item) => sum + item.value, 0);
  const totalCorrelation = correlationData.reduce(
    (sum, item) => sum + item.size,
    0
  );

  // Chart configs
  const pieChartConfig = {
    value: {
      label: "Calls",
    },
  };

  const barChartConfig = {
    totalCalls: {
      label: "Total Calls",
      color: "hsl(var(--chart-1))",
    },
    appointments: {
      label: "Appointments",
      color: "hsl(var(--chart-2))",
    },
    aiInterest: {
      label: "AI Interest",
      color: "hsl(var(--chart-3))",
    },
  };

  const scatterChartConfig = {
    size: {
      label: "Number of Calls",
      color: "hsl(var(--chart-1))",
    },
  };

  // Custom tooltip render functions
  const renderPieTooltip = (value, name, props) => {
    const percentage =
      totalOutcomes > 0 ? ((value / totalOutcomes) * 100).toFixed(1) : "0";
    return [
      <div key="tooltip">
        <div>
          {name}: {value} calls
        </div>
        <div className="text-muted-foreground">({percentage}%)</div>
      </div>,
    ];
  };

  const renderSessionTooltip = (value, name, props) => {
    if (name === "totalCalls") {
      return [
        <div key="tooltip">
          <div>Session: {props.payload.sessionId}</div>
          <div>Total Calls: {props.payload.totalCalls}</div>
          <div>Appointments: {props.payload.appointments}</div>
          <div>AI Interest: {props.payload.aiInterest}</div>
          <div className="text-muted-foreground">
            Success Rate: {props.payload.successRate}%
          </div>
        </div>,
      ];
    }
    return [`${name}: ${value}`];
  };

  const renderEngagementTooltip = (value, name, props) => {
    if (name === "totalCalls") {
      const successRate =
        props.payload.totalCalls > 0
          ? Math.round(
              ((props.payload.appointments + props.payload.aiInterest) /
                props.payload.totalCalls) *
                100
            )
          : 0;
      return [
        <div key="tooltip">
          <div>{props.payload.level} Engagement</div>
          <div>Total Calls: {props.payload.totalCalls}</div>
          <div>Appointments: {props.payload.appointments}</div>
          <div>AI Interest: {props.payload.aiInterest}</div>
          <div className="text-muted-foreground">
            Success Rate: {successRate}%
          </div>
        </div>,
      ];
    }
    return [`${name}: ${value}`];
  };

  const renderScatterTooltip = (label, payload, active) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage =
        totalCorrelation > 0
          ? ((data.size / totalCorrelation) * 100).toFixed(1)
          : "0";
      return (
        <div className="bg-background p-2 border rounded shadow">
          <div className="font-medium">{data.name}</div>
          <div>Calls: {data.size}</div>
          <div className="text-muted-foreground">({percentage}%)</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {/* Call Outcomes Distribution - PIE CHART */}
      <Card>
        <CardHeader>
          <CardTitle>Call Outcomes Distribution</CardTitle>
          <CardDescription>
            Breakdown of all call results and interest levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pieChartConfig} className="h-[300px]">
            <PieChart>
              <Pie
                data={outcomeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => (value > 0 ? `${value}` : "")}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {outcomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent formatter={renderPieTooltip} />}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Call Sessions Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Call Sessions Performance</CardTitle>
          <CardDescription>
            Performance metrics by calling session/batch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig} className="h-[300px]">
            <BarChart data={callSessionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="sessionId"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent formatter={renderSessionTooltip} />
                }
              />
              <Bar
                dataKey="totalCalls"
                fill="var(--color-totalCalls)"
                name="totalCalls"
              />
              <Bar
                dataKey="appointments"
                fill="var(--color-appointments)"
                name="appointments"
              />
              <Bar
                dataKey="aiInterest"
                fill="var(--color-aiInterest)"
                name="aiInterest"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Call Engagement Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Call Engagement Analysis</CardTitle>
          <CardDescription>
            Success rates based on call engagement levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig} className="h-[300px]">
            <BarChart data={callEngagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent formatter={renderEngagementTooltip} />
                }
              />
              <Bar
                dataKey="totalCalls"
                fill="var(--color-totalCalls)"
                name="totalCalls"
              />
              <Bar
                dataKey="appointments"
                fill="var(--color-appointments)"
                name="appointments"
              />
              <Bar
                dataKey="aiInterest"
                fill="var(--color-aiInterest)"
                name="aiInterest"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Interest vs Booking Correlation */}
      <Card>
        <CardHeader>
          <CardTitle>Interest vs Booking Correlation</CardTitle>
          <CardDescription>
            Relationship between AI interest and appointment booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={scatterChartConfig} className="h-[300px]">
            <ScatterChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[-0.5, 1.5]}
                tickFormatter={(value) =>
                  value === 0 ? "No AI Interest" : "AI Interest"
                }
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[-0.5, 1.5]}
                tickFormatter={(value) =>
                  value === 0 ? "No Appointment" : "Appointment"
                }
              />
              <Tooltip content={renderScatterTooltip} />
              <Scatter dataKey="size" fill="var(--color-size)" />
            </ScatterChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
