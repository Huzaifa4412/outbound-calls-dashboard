"use client";

import { useState, useEffect } from "react";
import { DashboardStats } from "@/components/dashboard-stats";
import { CallsTable } from "@/components/calls-table";
import { DashboardCharts } from "@/components/dashboard-charts";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CallData } from "@/types/call-data";

const API_URL: string =
  "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjb4mCBNxs6UhuHaYIl4eK3Dy3YyfTsgz8nGWCClATNBN0xx8l-1du6uap5FGTheYUOeLVarK4vQ0z6i8fP8p5kCyUpLVNZ75hWsJqtH4fsLJaobOp0RUmfpnG4jguM9yb1bVstGfSg1gonZP_hg1fvVAtTEHBHn58-yaaS4191j0_2vgnpBqh6XX5mATg6txFugIF2V1hDJMRWHvDjsXPPFvzIzAZ-u3aORV7Q3KLl9q9CZU74pUbxy6bXAd486YwFFX0_47UQJzEwOgGNd2CvEiTnEQ&lib=MvBeqelYj74JwcUTN_2isIb5Sp24iYjk_";

export default function Dashboard() {
  const [callData, setCallData] = useState<CallData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response: Response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: any = await response.json();

      // Handle different response formats: assume it's either an array or an object with a 'data' property that is an array
      const calls: CallData[] = Array.isArray(data)
        ? data
        : data.data && Array.isArray(data.data)
        ? data.data
        : [];

      setCallData(calls);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setCallData([]); // Set empty array on error to prevent rendering issues
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Call Center Dashboard</h1>
                {lastUpdated && (
                  <p className="text-sm text-muted-foreground">
                    Last updated: {lastUpdated.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <Button onClick={fetchData} disabled={loading} variant="outline">
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading data: {error}. Please check your API connection.
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Loading call data...</span>
              </div>
            </div>
          ) : callData.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Call Data Available
                </h3>
                <p className="text-muted-foreground">
                  No calls found. Try refreshing or check your API connection.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <DashboardStats data={callData} />

              {/* Charts Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Analytics & Insights
                </h2>
                <DashboardCharts data={callData} />
              </div>

              {/* Calls Table */}
              <CallsTable data={callData} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
