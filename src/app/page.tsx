"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, FileText, Shield, Menu, X, Search, CheckCircle2, Camera as LucideCamera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReportForm } from "@/components/report-form";
import { ReportCard } from "@/components/report-card";
import { AuthorityLoginBox } from "@/components/authority-login-box";
import {
  addReport,
  getReports,
  getReportById,
  type IncidentCategory,
  type IncidentReport,
} from "@/lib/incident-data";
import { sendReportNotification } from "@/lib/actions";

export default function Home() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [activeTab, setActiveTab] = useState<"report" | "view" | "track">("report");
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [trackedReport, setTrackedReport] = useState<IncidentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await getReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: {
    category: IncidentCategory;
    description: string;
    location: string;
    reporterName: string;
    reporterPhone: string;
    imageUrl: string;
  }) => {
    try {
      const newReport = await addReport(data);
      if (newReport && newReport.id) {
        // Send email notification to authority and admin
        await sendReportNotification({
          id: newReport.id,
          category: { 
            name: newReport.category.name, 
            email: newReport.category.email 
          },
          description: newReport.description,
          location: newReport.location,
          reporterName: newReport.reporterName,
          reporterPhone: newReport.reporterPhone,
        });

        await fetchReports();
        setShowSuccess(newReport.id);
        setTimeout(() => {
          setShowSuccess(null);
          setActiveTab("view");
        }, 5000);
      } else {
        throw new Error("Invalid report response");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("रिपोर्ट भेजने में त्रुटि हुई। कृपया पुन: प्रयास करें। / Error submitting report. Please try again.");
    }
  };

  const [isTracking, setIsTracking] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    
    setIsTracking(true);
    setTrackedReport(null);
    try {
      const report = await getReportById(searchId.trim().toUpperCase());
      setTrackedReport(report || null);
      if (!report) {
        alert("इस संदर्भ संख्या के साथ कोई रिपोर्ट नहीं मिली। / No report found with this reference number.");
      }
    } catch (error) {
      console.error("Error tracking report:", error);
      alert("ट्रैकिंग के दौरान एरर हुई। / Error while tracking.");
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900">
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-amber-500/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">नागरिक सूचना पोर्टल</h1>
                <p className="text-xs text-amber-400">Citizen Alert Portal</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={activeTab === "report" ? "default" : "ghost"}
                onClick={() => setActiveTab("report")}
                className={activeTab === "report" ? "bg-amber-600 hover:bg-amber-700" : "text-amber-100 hover:bg-amber-500/20"}
              >
                <FileText className="h-4 w-4 mr-2" />
                रिपोर्ट करें
              </Button>
              <Button
                variant={activeTab === "view" ? "default" : "ghost"}
                onClick={() => setActiveTab("view")}
                className={activeTab === "view" ? "bg-amber-600 hover:bg-amber-700" : "text-amber-100 hover:bg-amber-500/20"}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                सभी रिपोर्ट ({reports.length})
              </Button>
              <Button
                variant={activeTab === "track" ? "default" : "ghost"}
                onClick={() => setActiveTab("track")}
                className={activeTab === "track" ? "bg-amber-600 hover:bg-amber-700" : "text-amber-100 hover:bg-amber-500/20"}
              >
                <Search className="h-4 w-4 mr-2" />
                स्टेटस चेक करें
              </Button>
            </div>

            <Button
              variant="ghost"
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Button
                variant={activeTab === "report" ? "default" : "ghost"}
                onClick={() => { setActiveTab("report"); setMobileMenuOpen(false); }}
                className={`w-full justify-start ${activeTab === "report" ? "bg-amber-600" : "text-amber-100"}`}
              >
                <FileText className="h-4 w-4 mr-2" />
                रिपोर्ट करें
              </Button>
              <Button
                variant={activeTab === "view" ? "default" : "ghost"}
                onClick={() => { setActiveTab("view"); setMobileMenuOpen(false); }}
                className={`w-full justify-start ${activeTab === "view" ? "bg-amber-600" : "text-amber-100"}`}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                सभी रिपोर्ट ({reports.length})
              </Button>
              <Button
                variant={activeTab === "track" ? "default" : "ghost"}
                onClick={() => { setActiveTab("track"); setMobileMenuOpen(false); }}
                className={`w-full justify-start ${activeTab === "track" ? "bg-amber-600" : "text-amber-100"}`}
              >
                <Search className="h-4 w-4 mr-2" />
                स्टेटस चेक करें
              </Button>
            </div>
          )}
        </div>
      </nav>

      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-8 py-6 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-xl animate-in fade-in zoom-in slide-in-from-top-10 duration-500 max-w-md w-full mx-4">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">रिपोर्ट सफलतापूर्वक भेजी गई!</h3>
              <p className="text-green-100 text-sm mt-1">Report submitted successfully!</p>
            </div>
            <div className="bg-black/20 p-4 rounded-xl w-full border border-white/10">
              <p className="text-xs text-green-200 uppercase tracking-widest font-bold mb-1">आपकी संदर्भ संख्या / Your Reference Number</p>
              <p className="text-3xl font-mono font-bold tracking-wider">{showSuccess}</p>
            </div>
            <p className="text-xs text-green-100 opacity-80 italic">
              कृपया इसे भविष्य के लिए सुरक्षित रखें। / Please save this for future reference.
            </p>
            <Button 
              variant="outline" 
              className="w-full border-white/40 hover:bg-white/10 text-white"
              onClick={() => setShowSuccess(null)}
            >
              ठीक है / OK
            </Button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            अपने शहर को सुरक्षित बनाएं
          </h2>
          <p className="text-amber-300 text-lg">
            Make your city safer - Report incidents instantly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-8 items-start">
          <div className="space-y-8">
            {activeTab === "report" && (
              <div className="max-w-2xl">
                <ReportForm onSubmit={handleSubmit} />
              </div>
            )}

            {activeTab === "view" && (
              <div>
                {isLoading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="mt-4 text-slate-400">रिपोर्ट लोड हो रही हैं...</p>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-16 bg-slate-800/50 rounded-2xl">
                    <AlertTriangle className="h-16 w-16 mx-auto text-amber-500/50 mb-4" />
                    <p className="text-xl text-slate-400">कोई रिपोर्ट नहीं</p>
                    <p className="text-slate-500">No reports yet</p>
                    <Button
                      onClick={() => setActiveTab("report")}
                      className="mt-4 bg-amber-600 hover:bg-amber-700"
                    >
                      पहली रिपोर्ट करें
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.map((report) => (
                      <ReportCard key={report.id} report={report} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "track" && (
              <div className="max-w-2xl bg-slate-800/50 backdrop-blur-xl border border-amber-500/20 p-8 rounded-2xl shadow-xl">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Search className="h-6 w-6 text-amber-500" />
                    अपनी रिपोर्ट ट्रैक करें
                  </h3>
                  <p className="text-slate-400">Track your report status</p>
                </div>

                <form onSubmit={handleTrack} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-amber-400">
                      संदर्भ संख्या (Reference Number)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        placeholder="उदा. CAP-XXXXXX"
                        className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 h-12"
                      />
                      <Button type="submit" className="bg-amber-600 hover:bg-amber-700 h-12 px-8">
                        खोजें / Search
                      </Button>
                    </div>
                  </div>
                </form>

                {trackedReport && (
                  <div className="mt-8 pt-8 border-t border-slate-700">
                    <h4 className="text-lg font-bold text-white mb-4">रिपोर्ट की जानकारी:</h4>
                    <ReportCard report={trackedReport} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:block scale-95 origin-top">
            <AuthorityLoginBox />
          </div>
        </div>

        <div className="lg:hidden mt-8">
          <AuthorityLoginBox />
        </div>

        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-amber-500/20">
            <div className="bg-amber-500/20 p-3 rounded-lg w-fit mb-4">
              <LucideCamera className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">फोटो खींचें</h3>
            <p className="text-slate-400">घटना की फोटो खींचें (लोकेशन के साथ)</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-amber-500/20">
            <div className="bg-amber-500/20 p-3 rounded-lg w-fit mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">विवरण लिखें</h3>
            <p className="text-slate-400">घटना के बारे में जानकारी दें</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-amber-500/20">
            <div className="bg-amber-500/20 p-3 rounded-lg w-fit mb-4">
              <Shield className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">अधिकारी को सूचना</h3>
            <p className="text-slate-400">संबंधित अधिकारी को तुरंत सूचना मिलेगी</p>
          </div>
        </section>
      </main>

      <footer className="mt-16 bg-slate-900 border-t border-amber-500/20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400">
            नागरिक सूचना पोर्टल | Citizen Alert Portal
          </p>
          <p className="text-sm text-slate-500 mt-2">
            आपकी सुरक्षा, हमारी प्राथमिकता | Your safety is our priority
          </p>
        </div>
      </footer>
    </div>
  );
}
