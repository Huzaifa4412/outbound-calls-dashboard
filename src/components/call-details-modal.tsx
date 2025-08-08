import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Phone,
  Calendar,
  FileText,
  Headphones,
  ExternalLink,
} from "lucide-react";
import { CallData } from "@/types/call-data";

interface CallDetailsModalProps {
  call: CallData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CallDetailsModal({
  call,
  open,
  onOpenChange,
}: CallDetailsModalProps) {
  if (!call) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Call Details - {call["Saloon Name"] || "Unknown Business"}
          </DialogTitle>
          <DialogDescription>
            Call ID: {call.Call_ID || "N/A"} | Session:{" "}
            {call.Caller_agent_ID?.slice(-8) || "N/A"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Saloon Name:</strong> {call["Saloon Name"] || "N/A"}
                  </div>
                  <div>
                    <strong>Phone Number:</strong>{" "}
                    {call["Phone Number"] || "N/A"}
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <Badge className={`ml-2 ${getStatusColor(call.Status)}`}>
                      {call.Status || "Unknown"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Call Outcomes</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <strong>Appointment Booked:</strong>
                    <Badge
                      variant={
                        call["Appointment Booked (Yes/No)"] === true
                          ? "default"
                          : "secondary"
                      }
                    >
                      {call["Appointment Booked (Yes/No)"] === true
                        ? "Yes"
                        : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>Need AI Agent:</strong>
                    <Badge
                      variant={
                        call["Need AI-Agent ? (Yes/No)"] === true
                          ? "default"
                          : "secondary"
                      }
                    >
                      {call["Need AI-Agent ? (Yes/No)"] === true ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Call Summary */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Call Summary
              </h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">
                  {call["Call summary"] || "No summary available"}
                </p>
              </div>
            </div>

            {/* Call Transcript */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Call Transcript
              </h3>
              <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap font-mono">
                  {call["Call Transcript"] || "No transcript available"}
                </p>
              </div>
            </div>

            {/* Call Recording */}
            {call["Call Recording"] && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Headphones className="h-4 w-4" />
                  Call Recording
                </h3>
                <div className="space-y-2">
                  <audio controls className="w-full" preload="metadata">
                    <source src={call["Call Recording"]} type="audio/mpeg" />
                    <source src={call["Call Recording"]} type="audio/wav" />
                    <source src={call["Call Recording"]} type="audio/ogg" />
                    Your browser does not support the audio element.
                  </audio>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={call["Call Recording"]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in New Tab
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
