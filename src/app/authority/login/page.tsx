"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, Mail, UserPlus } from "lucide-react";
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

export default function AuthorityLoginPage() {
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
      setError("कृपया सभी जानकारी भरें / Please fill all details");
      return;
    }

    setIsLoading(true);
    try {
      const officer = await getOfficerByEmail(email);

      if (!officer) {
        setError("अधिकारी नहीं मिला। कृपया पंजीकरण करें। / Officer not found. Please register.");
        setIsLoading(false);
        return;
      }

      if (officer.status !== "approved") {
        setError("आपका खाता अभी स्वीकृत नहीं हुआ है। / Your account is not yet approved.");
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
          setError("गलत पासवर्ड / Invalid password");
        }
    } catch (err) {
      console.error("Login error:", err);
      setError("लॉगिन में त्रुटि हुई। / Login error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-blue-500/30 bg-slate-800/80 backdrop-blur shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full w-fit mb-4">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">अधिकारी लॉगिन</CardTitle>
          <CardDescription className="text-slate-400">Authority Login Portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">विभाग / Department</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="अपना विभाग चुनें" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">सभी विभाग / All Departments</SelectItem>
                  {incidentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.authority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">
                <Mail className="inline h-4 w-4 mr-1" />
                ईमेल / Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@gov.in"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">
                <Lock className="inline h-4 w-4 mr-1" />
                पासवर्ड / Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="पासवर्ड दर्ज करें"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center font-medium bg-red-900/20 p-2 rounded border border-red-500/30">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 text-lg font-bold"
            >
              {isLoading ? "लॉगिन हो रहा है..." : "लॉगिन करें / Login"}
            </Button>

            <div className="flex flex-col gap-3 pt-4 border-t border-slate-700">
              <Link href="/authority/register">
                <Button variant="outline" className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                  <UserPlus className="h-4 w-4 mr-2" />
                  नया पंजीकरण / Register
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full text-slate-400 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  होम पेज पर जाएं
                </Button>
              </Link>
            </div>
            

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
