"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, User, UserPlus, Info, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { incidentCategories, getOfficerByEmail } from "@/lib/incident-data";

export function AuthorityLoginBox() {
  const router = useRouter();
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!department || !email || !password) {
      setError("कृपया सभी जानकारी भरें");
      return;
    }

    setIsLoading(true);
    try {
      const officer = await getOfficerByEmail(email);

      if (!officer) {
        setError("अधिकारी नहीं मिला। कृपया पंजीकरण करें।");
        setIsLoading(false);
        return;
      }

      if (officer.status !== "approved") {
        setError("आपका खाता अभी स्वीकृत नहीं हुआ है।");
        setIsLoading(false);
        return;
      }

      if (password === "admin123") {
        localStorage.setItem("authority_auth", JSON.stringify({
          isLoggedIn: true,
          department,
          email,
          username: officer.fullName,
          id: officer.id
        }));
        router.push("/authority/dashboard");
      } else {
        setError("गलत पासवर्ड। कृपया पुनः प्रयास करें।");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("लॉगिन में तकनीकी समस्या आई।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 bg-white shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden">
      <CardHeader className="p-8 pb-4 bg-[#003366] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-[#ff9933] p-3 rounded-2xl shadow-lg shadow-[#ff9933]/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-black uppercase tracking-tight">अधिकारी लॉगिन</CardTitle>
            <CardDescription className="text-white/60 font-bold text-[10px] uppercase tracking-[0.2em] mt-0.5">
              Authorized Authority Access
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1 h-1 bg-[#ff9933] rounded-full" />
              विभाग / Department
            </label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-xl font-black focus:ring-2 focus:ring-[#003366] transition-all">
                <SelectValue placeholder="विभाग चुनें (Select Dept)" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="all" className="font-black">सभी विभाग (All Departments)</SelectItem>
                {incidentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="font-bold">
                    {category.authority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1 h-1 bg-[#ff9933] rounded-full" />
              ईमेल / Official Email
            </label>
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@gov.in"
                className="bg-slate-50 border-slate-200 text-slate-900 h-14 pl-12 rounded-xl font-black focus:ring-2 focus:ring-[#003366] transition-all"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1 h-1 bg-[#ff9933] rounded-full" />
              पासवर्ड / Password
            </label>
            <div className="relative">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-50 border-slate-200 text-slate-900 h-14 pl-12 rounded-xl font-black focus:ring-2 focus:ring-[#003366] transition-all"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <Info className="h-5 w-5 text-red-600 shrink-0" />
              <p className="text-[11px] font-black text-red-700 leading-tight">
                {error}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#003366] hover:bg-[#004d99] h-16 rounded-xl text-lg font-black shadow-2xl shadow-[#003366]/20 transition-all hover:scale-[1.01] active:scale-95"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                लॉगिन हो रहा है...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                लॉगिन करें (Secure Login)
                <LogIn className="h-5 w-5" />
              </div>
            )}
          </Button>
          
          <div className="pt-8 border-t border-slate-100">
            <Link href="/authority/register" className="w-full group">
              <Button
                type="button"
                variant="outline"
                className="w-full border-2 border-slate-200 text-slate-500 hover:bg-slate-50 h-14 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:border-[#003366]/30 hover:text-[#003366]"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                नया पंजीकरण / Register
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
