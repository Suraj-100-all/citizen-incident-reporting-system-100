"use client";

import { useState, useEffect } from "react";
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
  User as UserIcon
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
  getReports,
  updateReportStatus,
  incidentCategories,
  type IncidentReport,
} from "@/lib/incident-data";

export default function AuthorityDashboardPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ isLoggedIn: boolean; department: string; username: string } | null>(null);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAuth = localStorage.getItem("authority_auth");
    if (savedAuth) {
      const parsedAuth = JSON.parse(savedAuth);
      if (parsedAuth.isLoggedIn) {
        setAuth(parsedAuth);
        setReports(getReports());
      } else {
        router.push("/authority/login");
      }
    } else {
      router.push("/authority/login");
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authority_auth");
    router.push("/authority/login");
  };

  const handleStatusChange = (id: string, status: IncidentReport["status"], action?: string) => {
    updateReportStatus(id, status, action);
    setReports([...getReports()]); // Trigger re-render
  };

  if (loading || !auth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const filteredReports = reports.filter((report) => {
    const matchesDepartment =
      auth.department === "all" ||
      report.category.id === auth.department ||
      incidentCategories.find((c) => c.id === auth.department)?.authority === report.category.authority;
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    return matchesDepartment && matchesStatus;
  });

  const stats = {
    total: filteredReports.length,
    pending: filteredReports.filter((r) => r.status === "pending").length,
    inProgress: filteredReports.filter((r) => r.status === "in-progress").length,
    resolved: filteredReports.filter((r) => r.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">अधिकारी डैशबोर्ड</h1>
                <div className="flex items-center gap-2 text-[10px] text-blue-400">
                  <UserIcon className="h-3 w-3" />
                  <span>{auth.username} ({incidentCategories.find(c => c.id === auth.department)?.authority || "सभी विभाग"})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="text-slate-300 hover:text-white hidden md:flex">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  होम पेज
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-500 text-red-400 hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                लॉगआउट
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="text-3xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-slate-400">कुल रिपोर्ट / Total</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/20 border-yellow-500/30">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto text-yellow-400 mb-2" />
              <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
              <p className="text-sm text-yellow-300">लंबित / Pending</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/20 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <Loader2 className="h-8 w-8 mx-auto text-blue-400 mb-2" />
              <p className="text-3xl font-bold text-blue-400">{stats.inProgress}</p>
              <p className="text-sm text-blue-300">कार्यवाही में / In Progress</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/20 border-green-500/30">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto text-green-400 mb-2" />
              <p className="text-3xl font-bold text-green-400">{stats.resolved}</p>
              <p className="text-sm text-green-300">समाधान / Resolved</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="text-xl font-bold text-white">रिपोर्ट्स की सूची</h2>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="स्थिति फ़िल्टर" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सभी / All</SelectItem>
              <SelectItem value="pending">लंबित / Pending</SelectItem>
              <SelectItem value="in-progress">कार्यवाही में / In Progress</SelectItem>
              <SelectItem value="resolved">समाधान / Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
            <Shield className="h-16 w-16 mx-auto text-blue-500/50 mb-4" />
            <p className="text-xl text-slate-400">कोई रिपोर्ट नहीं मिली</p>
            <p className="text-slate-500">No reports found for your department</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                showActions
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
