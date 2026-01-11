"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Shield, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  LogOut,
  User as UserIcon,
  UserPlus,
  Zap,
  LayoutDashboard,
  Bell,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReportCard } from "@/components/report-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getReports,
  updateReportStatus,
  deleteReport,
  assignReport,
  getOfficersByDepartment,
  incidentCategories,
  type IncidentReport,
  type Officer,
} from "@/lib/incident-data";
import { toast } from "sonner";

export default function AuthorityDashboardPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ isLoggedIn: boolean; department: string; username: string; id: string } | null>(null);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<string>("");
  const [priority, setPriority] = useState<string>("medium");
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchData = useCallback(async (deptId: string) => {
    try {
      const fetchedReports = await getReports();
      setReports(Array.isArray(fetchedReports) ? fetchedReports : []);
      
      const fetchedOfficers = await getOfficersByDepartment(deptId);
      setOfficers(fetchedOfficers);
    } catch (error) {
      console.error("Error fetching data:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedAuth = localStorage.getItem("authority_auth");
    if (savedAuth) {
      const parsedAuth = JSON.parse(savedAuth);
      if (parsedAuth.isLoggedIn) {
        setAuth(parsedAuth);
        fetchData(parsedAuth.department);
      } else {
        router.push("/authority/login");
      }
    } else {
      router.push("/authority/login");
    }
  }, [router, fetchData]);

  const handleLogout = () => {
    localStorage.removeItem("authority_auth");
    router.push("/authority/login");
  };

  const handleStatusChange = async (id: string, status: IncidentReport["status"], action?: string) => {
    try {
      await updateReportStatus(id, status, action);
      const updatedReports = await getReports();
      setReports(Array.isArray(updatedReports) ? updatedReports : []);
      toast.success("स्थिति अपडेट की गई / Status Updated");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("अपडेट विफल रहा / Update Failed");
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success("रिपोर्ट हटाई गई / Report Deleted");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("त्रुटि हुई / Error occurred");
    }
  };

  const handleOpenAssign = (report: IncidentReport) => {
    setSelectedReport(report);
    setIsAssignDialogOpen(true);
    setSelectedOfficer(report.assignedTo || "");
    setPriority(report.priority || "medium");
  };

  const handleAssign = async () => {
    if (!selectedReport || !selectedOfficer || !auth) return;

    setIsAssigning(true);
    try {
      const officer = officers.find(o => o.id === selectedOfficer);
      if (!officer) return;

      await assignReport(
        selectedReport.id,
        officer.id,
        officer.fullName,
        auth.id,
        priority
      );
      
      const updatedReports = await getReports();
      setReports(Array.isArray(updatedReports) ? updatedReports : []);
      setIsAssignDialogOpen(false);
      toast.success(`कार्य ${officer.fullName} को सौंपा गया`);
    } catch (error) {
      console.error("Error assigning report:", error);
      toast.error("असाइनमेंट विफल रहा");
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading || !auth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  const filteredReports = Array.isArray(reports) ? reports.filter((report) => {
    const matchesDepartment =
      auth.department === "all" ||
      report.category.id === auth.department ||
      incidentCategories.find((c) => c.id === auth.department)?.authority === report.category.authority;
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    return matchesDepartment && matchesStatus;
  }) : [];

  const stats = {
    total: filteredReports.length,
    pending: filteredReports.filter((r) => r.status === "pending").length,
    inProgress: filteredReports.filter((r) => r.status === "in-progress").length,
    resolved: filteredReports.filter((r) => r.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Bar - Tricolor Strip */}
      <div className="h-1 bg-gradient-to-r from-[#ff9933] via-[#ffffff] to-[#138808] w-full" />

      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-2.5 rounded-xl shadow-inner">
                <LayoutDashboard className="h-7 w-7 text-white" />
              </div>
              <div className="border-l border-slate-200 pl-4">
                <h1 className="text-xl font-black text-primary tracking-tight leading-tight uppercase">
                  Command Center
                </h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Shield className="h-3 w-3" />
                  {incidentCategories.find(c => c.id === auth.department)?.authority || "Full Access Admin"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end border-r border-slate-200 pr-6">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Signed in as</span>
                <span className="text-sm font-black text-slate-900">{auth.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/">
                  <Button variant="ghost" className="text-slate-500 hover:text-primary hover:bg-slate-50 font-bold hidden sm:flex rounded-xl">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Portal Home
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  className="bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl border border-red-200 shadow-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">
              <span className="w-8 h-[2px] bg-primary" /> Management Dashboard
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              रिपोर्ट प्रबंधन कक्ष
            </h2>
            <p className="text-slate-500 font-medium mt-1">Manage and resolve citizen incident reports</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex items-center shadow-sm">
              <div className="pl-4 pr-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter:</div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 border-none bg-slate-50 text-slate-900 h-10 rounded-xl font-bold focus:ring-0">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="all" className="font-bold">सभी / All</SelectItem>
                  <SelectItem value="pending" className="font-bold">लंबित / Pending</SelectItem>
                  <SelectItem value="in-progress" className="font-bold">कार्यवाही / In-Progress</SelectItem>
                  <SelectItem value="resolved" className="font-bold">समाधान / Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Cases", value: stats.total, icon: Zap, color: "text-slate-900", bg: "bg-slate-100", border: "border-slate-200" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
            { label: "In Action", value: stats.inProgress, icon: Loader2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
            { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
          ].map((stat, i) => (
            <Card key={i} className={`bg-white ${stat.border} rounded-[2rem] shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300`}>
              <CardContent className="p-8 relative">
                <stat.icon className={`h-12 w-12 absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity ${stat.color} ${stat.label === 'In Action' ? 'animate-spin' : ''}`} />
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${stat.color}`}>{stat.label}</p>
                <p className="text-4xl font-black text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
            <div className="bg-slate-50 p-8 rounded-full mb-8 border border-slate-100">
              <Shield className="h-20 w-20 text-slate-200" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-2">कोई रिपोर्ट नहीं मिली</p>
            <p className="text-slate-400 font-medium max-w-xs mx-auto">इस श्रेणी में वर्तमान में कोई सक्रिय रिपोर्ट नहीं है।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                showActions
                onStatusChange={handleStatusChange}
                onAssign={handleOpenAssign}
                onDelete={handleDeleteReport}
              />
            ))}
          </div>
        )}
      </main>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="bg-white border-slate-200 rounded-[2.5rem] p-10 max-w-md shadow-2xl">
          <DialogHeader className="mb-6">
            <div className="bg-primary/10 p-4 rounded-2xl w-fit mb-4">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">
              कार्य असाइन करें
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-lg">
              Assign Case #{selectedReport?.id} to an Officer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">अधिकारी का चयन करें / Select Officer</label>
              <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-2xl font-bold">
                  <SelectValue placeholder="सूची से चुनें" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200">
                  {officers.length === 0 ? (
                    <div className="p-4 text-center text-sm font-bold text-slate-400 tracking-tight">कोई अधिकारी नहीं मिला</div>
                  ) : (
                    officers.map(officer => (
                      <SelectItem key={officer.id} value={officer.id} className="py-3 font-bold">
                        {officer.fullName} <span className="text-slate-400 text-[10px] ml-2">({officer.officerId})</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">प्राथमिकता / Priority Level</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'low', label: 'कम', color: 'hover:bg-blue-50 text-blue-600 border-blue-100 active:bg-blue-600 active:text-white' },
                  { id: 'medium', label: 'मध्यम', color: 'hover:bg-yellow-50 text-yellow-600 border-yellow-100 active:bg-yellow-600 active:text-white' },
                  { id: 'high', label: 'उच्च', color: 'hover:bg-orange-50 text-orange-600 border-orange-100 active:bg-orange-600 active:text-white' },
                  { id: 'critical', label: 'गंभीर', color: 'hover:bg-red-50 text-red-600 border-red-100 active:bg-red-600 active:text-white' }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPriority(p.id)}
                    className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                      priority === p.id 
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                        : `bg-white border-slate-100 text-slate-400 ${p.color}`
                    }`}
                  >
                    {p.label} / {p.id}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white h-20 rounded-3xl font-black text-xl shadow-2xl shadow-primary/20 transition-all active:scale-95 mt-4"
              onClick={handleAssign}
              disabled={!selectedOfficer || isAssigning}
            >
              {isAssigning ? <Loader2 className="h-6 w-6 animate-spin" /> : "पुष्टि करें / Confirm Assignment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
