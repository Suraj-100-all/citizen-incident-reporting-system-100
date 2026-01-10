"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, User, UserPlus } from "lucide-react";
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
      setError("सभी जानकारी भरें");
      return;
    }

    setIsLoading(true);
    try {
      // In this system, we use email for login and check status in officers table
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

      // For demo, we still use password check (real apps use Supabase Auth)
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
        setError("गलत पासवर्ड");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("लॉगिन में त्रुटि हुई।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-amber-500/30 bg-slate-800/80 backdrop-blur sticky top-24 shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl text-white">अधिकारी लॉगिन</CardTitle>
            <CardDescription className="text-slate-400 text-xs">Authority Login</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">विभाग / Department</label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-9 text-sm">
                <SelectValue placeholder="विभाग चुनें" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">सभी विभाग</SelectItem>
                {incidentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.authority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">
              ईमेल / Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@gov.in"
              className="bg-slate-700 border-slate-600 text-white h-9 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">
              पासवर्ड / Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-slate-700 border-slate-600 text-white h-9 text-sm"
            />
          </div>

          {error && (
            <p className="text-red-400 text-[10px] text-center font-medium bg-red-900/20 p-1 rounded border border-red-500/30">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-sm font-bold shadow-lg shadow-blue-900/20"
          >
            {isLoading ? "लॉगिन हो रहा है..." : "लॉगिन करें"}
          </Button>
          
          <div className="flex flex-col gap-2">
            <Link href="/authority/register" className="w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 h-9 text-xs"
              >
                <UserPlus className="h-3 w-3 mr-2" />
                नया पंजीकरण / Register
              </Button>
            </Link>
          </div>
          

        </form>
      </CardContent>
    </Card>
  );
}
