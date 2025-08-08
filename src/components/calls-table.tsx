import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Search, Filter } from "lucide-react";
import { CallData } from "@/types/call-data";
import { CallDetailsModal } from "./call-details-modal";

interface CallsTableProps {
  data: CallData[];
}

export function CallsTable({ data }: CallsTableProps) {
  const [selectedCall, setSelectedCall] = useState<CallData | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredData: CallData[] = data.filter((call: CallData) => {
    const matchesSearch =
      (call["Saloon Name"] || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (call["Phone Number"] || "").includes(searchTerm) ||
      (call.Call_ID || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || (call.Status && call.Status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string | undefined): string => {
    switch (status?.toLowerCase()) {
      case "called":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (call: CallData): void => {
    setSelectedCall(call);
    setModalOpen(true);
  };

  const uniqueStatuses: string[] = Array.from(
    new Set(data.map((call) => call.Status).filter(Boolean) as string[])
  );

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Call Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No call records available.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Call Records ({data.length} total)</span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search calls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            {uniqueStatuses.length > 0 && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Saloon Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Call ID</TableHead>
                <TableHead>Appointment</TableHead>
                <TableHead>AI Interest</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((call: CallData) => (
                <TableRow key={call.Call_ID}>
                  <TableCell className="font-medium">
                    {call["Saloon Name"] || "N/A"}
                  </TableCell>
                  <TableCell>{call["Phone Number"] || "N/A"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(call.Status)}>
                      {call.Status || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {call.Call_ID || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        call["Appointment Booked (Yes/No)"] === true
                          ? "default"
                          : "secondary"
                      }
                    >
                      {call["Appointment Booked (Yes/No)"] === true
                        ? "Booked"
                        : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        call["Need AI-Agent ? (Yes/No)"] === true
                          ? "default"
                          : "secondary"
                      }
                    >
                      {call["Need AI-Agent ? (Yes/No)"] === true ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(call)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredData.length === 0 && data.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No calls found matching your search criteria.
          </div>
        )}
      </CardContent>

      <CallDetailsModal
        call={selectedCall}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </Card>
  );
}
