"use client";

import { Clock, MapPin, User, Phone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IncidentReport } from "@/lib/incident-data";

type ReportCardProps = {
  report: IncidentReport;
  showActions?: boolean;
  onStatusChange?: (id: string, status: IncidentReport["status"], action?: string) => void;
};

const statusConfig = {
  pending: {
    label: "लंबित / Pending",
    color: "bg-yellow-500",
    icon: AlertCircle,
  },
  "in-progress": {
    label: "कार्यवाही में / In Progress",
    color: "bg-blue-500",
    icon: Loader2,
  },
  resolved: {
    label: "समाधान / Resolved",
    color: "bg-green-500",
    icon: CheckCircle2,
  },
};

export function ReportCard({ report, showActions, onStatusChange }: ReportCardProps) {
  const status = statusConfig[report.status];
  const StatusIcon = status.icon;

  return (
    <Card className="overflow-hidden border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-amber-50">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">
                {report.category.nameHindi} / {report.category.name}
              </CardTitle>
              <p className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 w-fit px-1.5 py-0.5 rounded mt-1">
                REF: {report.id}
              </p>
            </div>
            <Badge className={`${status.color} text-white flex items-center gap-1`}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="h-3 w-3" />
          {new Date(report.createdAt).toLocaleString("hi-IN")}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="aspect-video relative rounded-lg overflow-hidden bg-slate-100">
          <img
            src={report.imageUrl}
            alt="Incident"
            className="w-full h-full object-cover"
          />
        </div>

        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
          {report.description}
        </p>

        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="h-4 w-4 text-amber-600" />
            <span>{report.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <User className="h-4 w-4 text-amber-600" />
            <span>{report.reporterName}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="h-4 w-4 text-amber-600" />
            <span>{report.reporterPhone}</span>
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
          <p className="text-xs font-semibold text-amber-800">
            संबंधित अधिकारी / Authority: {report.category.authority}
          </p>
          <p className="text-xs text-amber-700">
            {report.category.email} | {report.category.phone}
          </p>
        </div>

        {report.actionTaken && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-800">कार्यवाही / Action Taken:</p>
            <p className="text-sm text-green-700">{report.actionTaken}</p>
          </div>
        )}

        {showActions && report.status !== "resolved" && onStatusChange && (
          <div className="flex gap-2 pt-2">
            {report.status === "pending" && (
              <button
                onClick={() => onStatusChange(report.id, "in-progress")}
                className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                कार्यवाही शुरू करें
              </button>
            )}
            {report.status === "in-progress" && (
              <button
                onClick={() => {
                  const action = prompt("कार्यवाही का विवरण लिखें / Enter action taken:");
                  if (action) {
                    onStatusChange(report.id, "resolved", action);
                  }
                }}
                className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
              >
                समाधान करें / Resolve
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
