"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft, User, Mail, Building2, IdCard, FileCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { incidentCategories, registerOfficer } from "@/lib/incident-data";

export default function AuthorityRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    departmentId: "",
    officerId: "",
    proof: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.fullName || !formData.email || !formData.departmentId || !formData.officerId || !formData.proof) {
      setError("कृपया सभी जानकारी भरें / Please fill all details");
      return;
    }

    setIsLoading(true);
    try {
      await registerOfficer({
        fullName: formData.fullName,
        email: formData.email,
        departmentId: formData.departmentId,
        officerId: formData.officerId,
        proofUrl: formData.proof // Using the proof field as proofUrl for simplicity
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "पंजीकरण में त्रुटि हुई। / Error during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-emerald-500/30 bg-slate-800/80 backdrop-blur text-center p-8">
          <div className="mx-auto bg-emerald-500/20 p-4 rounded-full w-fit mb-6">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl text-white mb-2">पंजीकरण सफल!</CardTitle>
          <CardDescription className="text-emerald-200 text-lg mb-6">
            Registration Successful!
          </CardDescription>
          <p className="text-slate-300 mb-8">
            आपका आवेदन समीक्षा के लिए भेज दिया गया है। एडमिन द्वारा स्वीकृत होने के बाद आप लॉगिन कर पाएंगे।
            <br />
            <span className="text-sm opacity-70 italic">Your application is under review. You can login after admin approval.</span>
          </p>
          <Link href="/">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              होम पेज पर जाएं / Go to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-lg border-blue-500/30 bg-slate-800/80 backdrop-blur shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full w-fit mb-4">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">अधिकारी पंजीकरण</CardTitle>
          <CardDescription className="text-slate-400">Authority Registration Portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  <User className="h-4 w-4" /> पूरा नाम / Full Name
                </label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> ईमेल / Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="officer@gov.in"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> विभाग / Department
                </label>
                <Select 
                  value={formData.departmentId} 
                  onValueChange={(val) => setFormData({ ...formData, departmentId: val })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="विभाग चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.authority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  <IdCard className="h-4 w-4" /> ऑफिसर आईडी / Officer ID
                </label>
                <Input
                  value={formData.officerId}
                  onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
                  placeholder="ID-12345"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <FileCheck className="h-4 w-4" /> प्रमाण (आईडी/दस्तावेज़ का विवरण) / Proof
              </label>
              <Textarea
                value={formData.proof}
                onChange={(e) => setFormData({ ...formData, proof: e.target.value })}
                placeholder="कृपया अपनी आईडी का विवरण या कोई प्रमाण लिंक यहाँ दें..."
                className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
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
              {isLoading ? "पंजीकरण हो रहा है..." : "पंजीकरण के लिए भेजें / Register"}
            </Button>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <Link href="/">
                <Button variant="ghost" className="text-slate-400 hover:text-white px-0">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  होम पेज
                </Button>
              </Link>
              <p className="text-slate-400 text-sm">
                पहले से पंजीकृत हैं? <Link href="/authority/login" className="text-blue-400 hover:underline">लॉगिन करें</Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
