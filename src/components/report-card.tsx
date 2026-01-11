"use client";

import { useState } from "react";
import { Clock, MapPin, User, Phone, CheckCircle2, AlertCircle, Loader2, UserPlus, ShieldAlert, Trash2, X, Check, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IncidentReport } from "@/lib/incident-data";

type ReportCardProps = {
  report: IncidentReport;
  showActions?: boolean;
  onStatusChange?: (id: string, status: IncidentReport["status"], action?: string) => void;
  onAssign?: (report: IncidentReport) => void;
  onDelete?: (id: string) => void;
};

const statusConfig = {
  pending: {
    label: "लंबित / Pending",
    color: "bg-orange-500",
    icon: AlertCircle,
  },
  "in-progress": {
    label: "कार्यवाही में / In Progress",
    color: "bg-blue-600",
    icon: Loader2,
  },
  resolved: {
    label: "समाधान / Resolved",
    color: "bg-green-600",
    icon: CheckCircle2,
  },
};

const priorityConfig = {
  low: { label: "कम / Low", color: "bg-blue-100 text-blue-700 border-blue-200" },
  medium: { label: "मध्यम / Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  high: { label: "उच्च / High", color: "bg-orange-100 text-orange-700 border-orange-200" },
  critical: { label: "गंभीर / Critical", color: "bg-red-100 text-red-700 border-red-200" },
};

export function ReportCard({ report, showActions, onStatusChange, onAssign, onDelete }: ReportCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showResolveInput, setShowResolveInput] = useState(false);
  const [resolveAction, setResolveAction] = useState("");
  const status = statusConfig[report.status];
  const StatusIcon = status.icon;

  const handleResolve = () => {
    if (onStatusChange && resolveAction.trim()) {
      onStatusChange(report.id, "resolved", resolveAction);
      setShowResolveInput(false);
      setResolveAction("");
    }
  };

  return (
    <Card className={`overflow-hidden border-0 bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-500 group border-t-8 ${
      report.priority === 'critical' ? 'border-red-600' : 'border-[#003366]'
    }`}>
      <CardHeader className="p-8 pb-4 bg-slate-50/50 border-b border-slate-100 relative">
        {showActions && onDelete && (
          <div className="absolute top-6 right-6 z-30">
            {!showConfirmDelete ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmDelete(true);
                }}
                className="p-3 text-slate-400 hover:text-red-600 bg-white shadow-lg hover:bg-red-50 rounded-2xl transition-all border border-slate-200 group/del"
                title="Delete Report"
              >
                <Trash2 className="h-5 w-5 transition-transform group-hover/del:scale-110" />
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-2xl border border-red-200 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-[10px] font-black text-red-600 px-3 uppercase tracking-wider">Confirm Delete?</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(report.id);
                    setShowConfirmDelete(false);
                  }}
                  className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirmDelete(false);
                  }}
                  className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between pr-12">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={`${status.color} text-white hover:bg-opacity-90 rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200`}>
                  <StatusIcon className={`h-3 w-3 mr-2 ${report.status === 'in-progress' ? 'animate-spin' : ''}`} />
                  {status.label}
                </Badge>
                {report.priority && (
                  <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border shadow-sm uppercase tracking-widest ${priorityConfig[report.priority].color}`}>
                    {priorityConfig[report.priority].label}
                  </span>
                )}
              </div>
              <CardTitle className="text-2xl font-black text-[#003366] leading-tight pt-2 uppercase tracking-tight">
                {report.category.nameHindi}
                <span className="block text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{report.category.name}</span>
              </CardTitle>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-[11px] font-black font-mono text-[#003366] bg-[#003366]/5 border border-[#003366]/10 px-4 py-2 rounded-xl shadow-inner">
              REF ID: {report.id}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <Clock className="h-4 w-4 text-[#ff9933]" />
              {new Date(report.createdAt).toLocaleDateString("hi-IN", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        <div className="group relative aspect-video rounded-[1.5rem] overflow-hidden bg-slate-100 border-4 border-white shadow-2xl">
          <img
            src={report.imageUrl}
            alt="Incident Proof"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/40 via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
             <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-xl border border-white/20">
                <MapPin className="h-4 w-4 text-[#003366]" />
                <span className="text-[10px] font-black text-[#003366] uppercase tracking-widest">Geotagged Content</span>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 border-l-4 border-[#ff9933] p-6 rounded-2xl relative shadow-inner">
            <div className="absolute -top-3 left-6 bg-white border border-slate-100 px-3 py-1 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">विवरण / Description</div>
            <p className="text-sm text-slate-700 leading-relaxed font-bold italic">
              "{report.description}"
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-[#003366]/20 transition-all shadow-sm">
              <div className="bg-[#003366]/5 p-3 rounded-xl border border-[#003366]/10">
                <MapPin className="h-5 w-5 text-[#003366]" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Location</p>
                <span className="text-xs font-black text-slate-700 leading-relaxed">{report.location}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporter</p>
                  <span className="text-xs font-black text-slate-900 truncate block max-w-[100px]">{report.reporterName}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</p>
                  <span className="text-xs font-black text-slate-600">{report.reporterPhone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100 w-full" />

          {report.assignedToName ? (
            <div className="bg-[#003366] p-6 rounded-[1.5rem] flex items-center gap-5 shadow-xl shadow-[#003366]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                <Shield className="h-7 w-7 text-[#ff9933]" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Assigned Officer</p>
                <p className="text-lg font-black text-white tracking-tight">{report.assignedToName}</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                <ShieldAlert className="h-7 w-7 text-slate-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Assignment</p>
                </div>
                <p className="text-sm font-black text-slate-900">{report.category.authority}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{report.category.email}</p>
              </div>
            </div>
          )}

          {report.actionTaken && (
            <div className="bg-green-50 p-6 rounded-[1.5rem] border-2 border-dashed border-green-200 flex gap-5 animate-in slide-in-from-bottom-2">
              <div className="h-14 w-14 rounded-2xl bg-green-600 flex items-center justify-center shrink-0 shadow-xl shadow-green-200">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em]">Resolution Details</p>
                <p className="text-sm text-slate-700 font-bold italic mt-1 leading-relaxed">"{report.actionTaken}"</p>
              </div>
            </div>
          )}

          {showActions && report.status !== "resolved" && (
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {onAssign && (
                  <button
                    onClick={() => onAssign(report)}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95"
                  >
                    <UserPlus className="h-5 w-5" />
                    Assign Officer
                  </button>
                )}
                
                {onStatusChange && report.status === "in-progress" && (
                  <div className="flex flex-col gap-4 flex-1">
                    {!showResolveInput ? (
                      <button
                        onClick={() => setShowResolveInput(true)}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#138808] text-white text-sm font-black rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-95"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        Complete Resolution
                      </button>
                    ) : (
                      <div className="flex flex-col gap-4 p-6 bg-green-50 rounded-[2rem] border-2 border-green-200 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="h-4 w-4 text-green-600" />
                          <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Official Action Log</p>
                        </div>
                        <textarea
                          placeholder="Provide step-by-step details of the action taken..."
                          className="w-full p-5 text-sm bg-white border border-green-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-slate-800 font-bold min-h-32 shadow-inner"
                          value={resolveAction}
                          onChange={(e) => setResolveAction(e.target.value)}
                        />
                        <div className="flex gap-4">
                          <button
                            onClick={handleResolve}
                            disabled={!resolveAction.trim()}
                            className="flex-[2] py-4 bg-[#138808] text-white text-xs font-black rounded-2xl hover:bg-green-700 disabled:opacity-50 shadow-xl shadow-green-200 flex items-center justify-center gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Confirm & Resolve Case
                          </button>
                          <button
                            onClick={() => {
                              setShowResolveInput(false);
                              setResolveAction("");
                            }}
                            className="flex-1 py-4 bg-white text-slate-500 text-xs font-black rounded-2xl border border-slate-200 hover:bg-slate-50"
                          >
                            Discard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {onStatusChange && report.status === "pending" && !report.assignedToName && (
                <button
                  onClick={() => onStatusChange(report.id, "in-progress")}
                  className="w-full px-6 py-4 bg-[#003366] text-white text-sm font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                >
                  <Shield className="h-5 w-5 text-[#ff9933]" />
                  Take Immediate Action
                </button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>

  );
}
