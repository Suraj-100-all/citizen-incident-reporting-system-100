"use client";

import { Clock, MapPin, User, Phone, CheckCircle2, AlertCircle, Loader2, UserPlus, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IncidentReport } from "@/lib/incident-data";

type ReportCardProps = {
  report: IncidentReport;
  showActions?: boolean;
  onStatusChange?: (id: string, status: IncidentReport["status"], action?: string) => void;
  onAssign?: (report: IncidentReport) => void;
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

const priorityConfig = {
  low: { label: "कम / Low", color: "bg-blue-100 text-blue-700 border-blue-200" },
  medium: { label: "मध्यम / Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  high: { label: "उच्च / High", color: "bg-orange-100 text-orange-700 border-orange-200" },
  critical: { label: "गंभीर / Critical", color: "bg-red-100 text-red-700 border-red-200" },
};

export function ReportCard({ report, showActions, onStatusChange, onAssign }: ReportCardProps) {
  const status = statusConfig[report.status];
  const StatusIcon = status.icon;

  return (
    <Card className={`overflow-hidden border-l-4 shadow-lg hover:shadow-xl transition-shadow ${
      report.priority === 'critical' ? 'border-l-red-600' : 'border-l-amber-500'
    }`}>
        <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-amber-50">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">
                {report.category.nameHindi} / {report.category.name}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-1">
                <p className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 w-fit px-1.5 py-0.5 rounded">
                  REF: {report.id}
                </p>
                {report.priority && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityConfig[report.priority].color}`}>
                    {priorityConfig[report.priority].label}
                  </span>
                )}
              </div>
            </div>
            <Badge className={`${status.color} text-white flex items-center gap-1 shrink-0`}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
          <Clock className="h-3 w-3" />
          {new Date(report.createdAt).toLocaleString("hi-IN")}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="aspect-video relative rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
          <img
            src={report.imageUrl}
            alt="Incident"
            className="w-full h-full object-cover"
          />
        </div>

        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
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

        {report.assignedToName ? (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold text-blue-800">नियुक्त अधिकारी / Assigned To:</p>
            </div>
            <p className="text-sm text-blue-700 font-medium">{report.assignedToName}</p>
          </div>
        ) : (
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <p className="text-xs font-semibold text-amber-800">
              संबंधित विभाग / Authority: {report.category.authority}
            </p>
            <p className="text-xs text-amber-700">
              {report.category.email} | {report.category.phone}
            </p>
          </div>
        )}

        {report.actionTaken && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-800">कार्यवाही / Action Taken:</p>
            <p className="text-sm text-green-700 italic">"{report.actionTaken}"</p>
          </div>
        )}

        {showActions && report.status !== "resolved" && (
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              {onAssign && (
                <button
                  onClick={() => onAssign(report)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  {report.assignedToName ? "पुन: असाइन / Re-assign" : "काम सौंपें / Assign"}
                </button>
              )}
              
              {onStatusChange && report.status === "in-progress" && (
                <button
                  onClick={() => {
                    const action = prompt("कार्यवाही का विवरण लिखें / Enter action taken:");
                    if (action) {
                      onStatusChange(report.id, "resolved", action);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  समाधान / Resolve
                </button>
              )}
            </div>

            {onStatusChange && report.status === "pending" && !report.assignedToName && (
              <button
                onClick={() => onStatusChange(report.id, "in-progress")}
                className="w-full px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
              >
                सीधे कार्यवाही शुरू करें
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
