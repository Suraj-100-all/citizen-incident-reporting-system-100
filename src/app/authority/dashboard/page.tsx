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
  Zap
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-indigo-500/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">COMMAND CENTER</h1>
                <div className="flex items-center gap-2 text-[11px] text-indigo-300 font-medium uppercase tracking-wider">
                  <UserIcon className="h-3 w-3" />
                  <span>{auth.username} • {incidentCategories.find(c => c.id === auth.department)?.authority || "All Depts"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 hidden md:flex">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  होम
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-rose-500/50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                लॉगआउट
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "कुल रिपोर्ट", value: stats.total, icon: Zap, color: "text-slate-400", bg: "bg-slate-500/10" },
            { label: "लंबित", value: stats.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "कार्यवाही", value: stats.inProgress, icon: Loader2, color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "समाधान", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="bg-slate-900/40 border-slate-800/50 backdrop-blur-sm overflow-hidden group hover:border-indigo-500/50 transition-all duration-500">
              <CardContent className="p-6 relative">
                <stat.icon className={`h-12 w-12 absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`} />
                <p className={`text-sm font-bold uppercase tracking-widest mb-1 ${stat.color}`}>{stat.label}</p>
                <p className="text-4xl font-black text-white">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">इंसिडेंट रिपोर्ट्स / Incident Reports</h2>
            <p className="text-slate-400 text-sm">अपने विभाग की शिकायतों की निगरानी और प्रबंधन करें</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-500 px-3 uppercase tracking-wider">Status:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44 bg-slate-800 border-transparent text-white focus:ring-indigo-500 rounded-lg h-9">
                <SelectValue placeholder="फ़िल्टर" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">सभी / All</SelectItem>
                <SelectItem value="pending">लंबित / Pending</SelectItem>
                <SelectItem value="in-progress">कार्यवाही / In-Progress</SelectItem>
                <SelectItem value="resolved">समाधान / Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center">
            <div className="bg-slate-800/50 p-6 rounded-full mb-6">
              <Shield className="h-16 w-16 text-slate-700" />
            </div>
            <p className="text-2xl font-bold text-slate-500 mb-2">कोई डेटा उपलब्ध नहीं है</p>
            <p className="text-slate-600 max-w-xs mx-auto">इस श्रेणी में वर्तमान में कोई रिपोर्ट नहीं मिली है।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                showActions
                onStatusChange={handleStatusChange}
                onAssign={handleOpenAssign}
              />
            ))}
          </div>
        )}
      </main>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-400" />
              कार्य सौंपें / Assign Task
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              रिपोर्ट #{selectedReport?.id} के लिए अधिकारी चुनें
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">अधिकारी का चयन करें / Select Officer</label>
              <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-12">
                  <SelectValue placeholder="सूची से चुनें" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {officers.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">कोई अधिकारी नहीं मिला</div>
                  ) : (
                    officers.map(officer => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.fullName} ({officer.officerId})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">प्राथमिकता / Priority</label>
              <div className="grid grid-cols-2 gap-2">
                {['low', 'medium', 'high', 'critical'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${
                      priority === p 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {p === 'critical' ? 'गंभीर' : p === 'high' ? 'उच्च' : p === 'medium' ? 'मध्यम' : 'कम'}
                    <span className="block text-[10px] opacity-60">{p}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all duration-300"
              onClick={handleAssign}
              disabled={!selectedOfficer || isAssigning}
            >
              {isAssigning ? <Loader2 className="h-5 w-5 animate-spin" /> : "पुष्टि करें / Confirm Assignment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
