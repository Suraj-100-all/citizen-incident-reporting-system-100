"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, FileText, Shield, Menu, X, Search, CheckCircle2, Camera as LucideCamera, Info, Bell, PhoneCall, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReportForm } from "@/components/report-form";
import { ReportCard } from "@/components/report-card";
import { AuthorityLoginBox } from "@/components/authority-login-box";
import { toast } from "sonner";
import {
  addReport,
  getReports,
  getReportById,
  type IncidentCategory,
  type IncidentReport,
} from "@/lib/incident-data";
import { sendReportNotification } from "@/app/actions/notifications";

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
        const result = await sendReportNotification({
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

        if (result.success) {
          toast.success("सूचना ईमेल और SMS (Admin: 8181084451) के माध्यम से भेज दी गई है।");
        } else {
          toast.warning("रिपोर्ट सेव हो गई है, लेकिन नोटिफिकेशन भेजने में कुछ दिक्कत आई।");
        }

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
      toast.error("रिपोर्ट भेजने में त्रुटि हुई। / Error submitting report.");
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
        toast.error("इस संदर्भ संख्या के साथ कोई रिपोर्ट नहीं मिली। / No report found.");
      }
    } catch (error) {
      console.error("Error tracking report:", error);
      toast.error("ट्रैकिंग के दौरान एरर हुई। / Error while tracking.");
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Bar - Official Gov Info */}
      <header className="bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-[10px] md:text-xs text-slate-600 font-bold uppercase tracking-wide">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-4 w-auto grayscale" />
              भारत सरकार | Government of India
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 border-r border-slate-300 pr-4">
              <button className="hover:text-primary transition-colors">Skip to main content</button>
              <button className="hover:text-primary transition-colors font-black">A+</button>
              <button className="hover:text-primary transition-colors font-black">A</button>
              <button className="hover:text-primary transition-colors font-black">A-</button>
            </div>
            <div className="flex items-center gap-3">
              <button className="hover:text-primary transition-colors">English</button>
              <button className="hover:text-primary transition-colors font-black text-primary underline underline-offset-4 decoration-2">हिंदी</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Branding Header */}
      <div className="bg-white border-b-4 border-primary shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="h-16 w-auto" />
              <div className="h-12 w-[2px] bg-slate-200 hidden md:block" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-[#003366] leading-none tracking-tight">
                नागरिक सूचना पोर्टल
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                  Citizen Alert Portal
                </p>
                <div className="h-3 w-[1px] bg-slate-300" />
                <p className="text-[10px] md:text-xs font-bold text-primary uppercase">Digital India Initiative</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Digital_India_logo.svg/1200px-Digital_India_logo.svg.png" alt="Digital India" className="h-12 w-auto" />
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Swachh_Bharat_Mission_Logo.svg/1200px-Swachh_Bharat_Mission_Logo.svg.png" alt="Swachh Bharat" className="h-12 w-auto" />
          </div>

          <Button
            variant="ghost"
            className="lg:hidden text-slate-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="hidden lg:flex items-center gap-1 h-14">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("report")}
              className={`rounded-none h-full px-8 font-black uppercase text-xs tracking-widest transition-all ${activeTab === "report" ? "bg-white text-[#003366] shadow-inner" : "hover:bg-white/10"}`}
            >
              <FileText className="h-4 w-4 mr-2" />
              रिपोर्ट करें | Report
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("view")}
              className={`rounded-none h-full px-8 font-black uppercase text-xs tracking-widest transition-all ${activeTab === "view" ? "bg-white text-[#003366] shadow-inner" : "hover:bg-white/10"}`}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              सभी रिपोर्ट | View Reports
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("track")}
              className={`rounded-none h-full px-8 font-black uppercase text-xs tracking-widest transition-all ${activeTab === "track" ? "bg-white text-[#003366] shadow-inner" : "hover:bg-white/10"}`}
            >
              <Search className="h-4 w-4 mr-2" />
              स्टेटस चेक | Track Status
            </Button>
            <div className="ml-auto flex items-center gap-6 pr-4">
              <span className="text-[10px] font-bold text-white/60 flex items-center gap-2">
                <PhoneCall className="h-3 w-3 text-orange-400" />
                HELPLINE: 1800-111-222
              </span>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden pb-6 space-y-2 animate-in slide-in-from-top-4 duration-300">
              <Button
                variant={activeTab === "report" ? "default" : "ghost"}
                onClick={() => { setActiveTab("report"); setMobileMenuOpen(false); }}
                className={`w-full justify-start rounded-xl font-bold ${activeTab === "report" ? "bg-primary text-white" : "text-slate-600"}`}
              >
                <FileText className="h-4 w-4 mr-2" />
                रिपोर्ट करें (Submit Report)
              </Button>
              <Button
                variant={activeTab === "view" ? "default" : "ghost"}
                onClick={() => { setActiveTab("view"); setMobileMenuOpen(false); }}
                className={`w-full justify-start rounded-xl font-bold ${activeTab === "view" ? "bg-primary text-white" : "text-slate-600"}`}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                सभी रिपोर्ट (View All)
              </Button>
              <Button
                variant={activeTab === "track" ? "default" : "ghost"}
                onClick={() => { setActiveTab("track"); setMobileMenuOpen(false); }}
                className={`w-full justify-start rounded-xl font-bold ${activeTab === "track" ? "bg-primary text-white" : "text-slate-600"}`}
              >
                <Search className="h-4 w-4 mr-2" />
                स्टेटस चेक (Track Status)
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Banner / Info Strip */}
      <div className="bg-primary text-white py-4 overflow-hidden border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6">
          <div className="flex items-center gap-2 whitespace-nowrap bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Bell className="h-3 w-3 text-orange-400 animate-bounce" /> News
          </div>
          <div className="text-sm font-medium animate-marquee whitespace-nowrap opacity-90">
            नई रिपोर्टिंग प्रणाली अब सक्रिय है। कृपया किसी भी आपातकालीन स्थिति के लिए तुरंत रिपोर्ट करें। | New reporting system is now live. Please report incidents immediately for prompt action.
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-t-8 border-green-600 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">रिपोर्ट सफलतापूर्वक भेजी गई!</h3>
                <p className="text-slate-500 font-medium mt-1">Report submitted successfully!</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl w-full border border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2">संदर्भ संख्या / Reference Number</p>
                <p className="text-4xl font-mono font-black text-primary tracking-tighter">{showSuccess}</p>
              </div>
              <p className="text-xs text-slate-500 font-medium italic">
                कृपया इसे भविष्य के लिए सुरक्षित रखें। | Please save this for future reference.
              </p>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 font-bold text-lg"
                onClick={() => setShowSuccess(null)}
              >
                जारी रखें / Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-2 border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">
              <span className="w-8 h-[2px] bg-primary" /> Official Service
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              {activeTab === "report" ? "नया मामला रिपोर्ट करें" : activeTab === "view" ? "सार्वजनिक रिपोर्ट" : "स्थिति की जाँच करें"}
            </h2>
            <p className="text-slate-500 text-lg font-medium mt-2">
              {activeTab === "report" ? "Report a New Incident" : activeTab === "view" ? "Public Incident Reports" : "Track Report Status"}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Active Reports</span>
              <span className="text-2xl font-black text-primary">{reports.length}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-12 items-start">
          <div className="space-y-8">
            {activeTab === "report" && (
              <div className="max-w-3xl animate-in fade-in slide-in-from-left-4 duration-500">
                <ReportForm onSubmit={handleSubmit} />
              </div>
            )}

            {activeTab === "view" && (
              <div className="animate-in fade-in duration-500">
                {isLoading ? (
                  <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 font-bold text-slate-500">डेटा लोड हो रहा है... | Loading...</p>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <AlertTriangle className="h-20 w-20 mx-auto text-slate-200 mb-6" />
                    <p className="text-2xl font-black text-slate-900">कोई रिपोर्ट नहीं मिली</p>
                    <p className="text-slate-500 font-medium mt-1">No reports have been filed yet.</p>
                    <Button
                      onClick={() => setActiveTab("report")}
                      className="mt-8 bg-primary hover:bg-primary/90 rounded-xl px-8"
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
              <div className="max-w-3xl animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50">
                  <div className="mb-10">
                    <div className="bg-primary/10 p-4 rounded-2xl w-fit mb-6">
                      <Search className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 leading-tight">
                      अपनी रिपोर्ट की प्रगति देखें
                    </h3>
                    <p className="text-slate-500 font-medium text-lg mt-2">Track your report progress using reference number</p>
                  </div>

                  <form onSubmit={handleTrack} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        संदर्भ संख्या (Reference Number)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Input
                          value={searchId}
                          onChange={(e) => setSearchId(e.target.value)}
                          placeholder="उदा. CAP-XXXXXX"
                          className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-16 rounded-2xl text-xl font-mono px-6 focus:ring-primary focus:border-primary transition-all"
                        />
                        <Button type="submit" className="bg-primary hover:bg-primary/90 h-16 px-10 rounded-2xl font-black text-lg shadow-lg shadow-primary/20">
                          ट्रैक करें
                        </Button>
                      </div>
                    </div>
                  </form>

                  {trackedReport && (
                    <div className="mt-12 pt-12 border-t border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs mb-6">
                        <Info className="h-4 w-4" /> रिपोर्ट विवरण | Report Details
                      </div>
                      <ReportCard report={trackedReport} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="sticky top-24">
              <AuthorityLoginBox />
              
              <div className="mt-8 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" /> महत्वपूर्ण जानकारी
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                      <Bell className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">तुरंत सूचना</p>
                      <p className="text-xs text-slate-500">सभी रिपोर्ट संबंधित अधिकारियों को तुरंत भेजी जाती हैं।</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">सटीक लोकेशन</p>
                      <p className="text-xs text-slate-500">बेहतर सेवा के लिए फोटो खींचते समय GPS ऑन रखें।</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-24 bg-[#003366] text-white py-20 border-t-8 border-[#ff9933]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-14 w-auto brightness-0 invert" />
                <div>
                  <h5 className="text-2xl font-black tracking-tight uppercase">नागरिक सूचना पोर्टल</h5>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-1">Citizen Alert Portal | Government of India</p>
                </div>
              </div>
              <p className="text-white/70 max-w-md leading-relaxed text-sm font-medium">
                यह पोर्टल नागरिकों और अधिकारियों के बीच एक सुरक्षित और त्वरित संचार माध्यम है। GIGW मानकों के अनुसार विकसित, यह पोर्टल पारदर्शिता और त्वरित शिकायत निवारण सुनिश्चित करता है।
              </p>
              <div className="mt-8 flex gap-4">
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Digital_India_logo.svg/1200px-Digital_India_logo.svg.png" alt="Digital India" className="h-10 w-auto opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Swachh_Bharat_Mission_Logo.svg/1200px-Swachh_Bharat_Mission_Logo.svg.png" alt="Swachh Bharat" className="h-10 w-auto opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
              </div>
            </div>
            <div>
              <h6 className="font-black mb-8 uppercase tracking-[0.2em] text-[10px] text-white/40">महत्वपूर्ण लिंक / Quick Links</h6>
              <ul className="space-y-4 text-white/70 font-bold text-sm">
                <li><Link href="/" className="hover:text-white transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#ff9933] rounded-full" /> मुख्य पृष्ठ / Home</Link></li>
                <li><button onClick={() => setActiveTab("report")} className="hover:text-white transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#ff9933] rounded-full" /> रिपोर्ट करें / File Report</button></li>
                <li><button onClick={() => setActiveTab("track")} className="hover:text-white transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#ff9933] rounded-full" /> स्टेटस चेक / Track</button></li>
                <li><Link href="/authority/login" className="hover:text-white transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#ff9933] rounded-full" /> अधिकारी लॉगिन / Login</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="font-black mb-8 uppercase tracking-[0.2em] text-[10px] text-white/40">सहायता केंद्र / Helpdesk</h6>
              <ul className="space-y-4 text-white/70 font-bold text-sm">
                <li className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 italic">
                  <PhoneCall className="h-5 w-5 text-[#ff9933]" /> 
                  <div>
                    <span className="block text-[10px] opacity-60">Toll Free Helpline</span>
                    1800-111-222
                  </div>
                </li>
                <li className="flex items-center gap-3 p-1">
                  <MapPin className="h-4 w-4 text-[#ff9933]" />
                  नई दिल्ली, भारत / New Delhi, India
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                © 2024 नागरिक सूचना पोर्टल | भारत सरकार के लिए विकसित
              </p>
              <p className="text-white/20 text-[9px] font-bold mt-1">Website Content Managed by Citizen Alert Portal Team</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-white/40 text-[10px] font-black uppercase tracking-widest">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <Link href="#" className="hover:text-white transition-colors">Copyright Policy</Link>
            </div>
          </div>
        </div>
      </footer>
      
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
