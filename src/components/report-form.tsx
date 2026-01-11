"use client";

import { useState, useRef } from "react";
import { Camera as LucideCamera, Upload, MapPin, Phone, User, Send, AlertTriangle, Loader2, RefreshCcw, Info, FileText, Clock, Shield } from "lucide-react";
import exifr from "exifr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { incidentCategories, type IncidentCategory } from "@/lib/incident-data";

type ReportFormProps = {
  onSubmit: (data: {
    category: IncidentCategory;
    description: string;
    location: string;
    reporterName: string;
    reporterPhone: string;
    imageUrl: string;
  }) => void;
};

export function ReportForm({ onSubmit }: ReportFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingLocation, setIsExtractingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentLocation = (timeout = 8000): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.error("आपका ब्राउज़र लोकेशन सपोर्ट नहीं करता है।");
        resolve(null);
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: timeout,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.warn(`Geolocation High Accuracy failed. Trying low accuracy...`);
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
            },
            (err2) => {
              if (err2.code === 1) toast.error("लोकेशन परमिशन नहीं दी गई।");
              resolve(null);
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
          );
        },
        options
      );
    });
  };

  const fetchAndSetLocation = async (file?: File, silent = false) => {
    setIsExtractingLocation(true);
    try {
      let coords: { latitude: number; longitude: number } | null = null;
      if (file) {
        try {
          const exifData = await exifr.gps(file);
          if (exifData && exifData.latitude && exifData.longitude) {
            coords = { latitude: exifData.latitude, longitude: exifData.longitude };
          }
        } catch (e) {}
      }
      if (!coords) {
        coords = await getCurrentLocation();
      }
      if (coords) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=hi,en`,
          { headers: { "User-Agent": "CitizenIncidentReportingApp/1.0" } }
        );
        if (response.ok) {
          const result = await response.json();
          if (result && result.display_name) {
            setLocation(result.display_name);
            if (!silent) toast.success("लोकेशन अपडेट हो गई!");
          } else {
            setLocation(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
          }
        }
      } else if (!file && !silent) {
        toast.info("लोकेशन नहीं मिल सकी। कृपया मैन्युअली भरें।");
      }
    } catch (error) {
      if (!silent) toast.error("लोकेशन लोड करने में समस्या आई।");
    } finally {
      setIsExtractingLocation(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      await fetchAndSetLocation(file, true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !description || !location || !reporterName || !reporterPhone || !imagePreview) {
      toast.error("कृपया सभी फील्ड भरें / Please fill all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const category = incidentCategories.find((c) => c.id === selectedCategory);
      if (category) {
        await onSubmit({
          category,
          description,
          location,
          reporterName,
          reporterPhone,
          imageUrl: imagePreview,
        });
        setSelectedCategory("");
        setDescription("");
        setLocation("");
        setReporterName("");
        setReporterPhone("");
        setImagePreview(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryData = incidentCategories.find((c) => c.id === selectedCategory);

  return (
    <Card className="border-0 bg-white shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden">
      <CardHeader className="bg-[#003366] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-[#ff9933] p-2.5 rounded-xl shadow-lg shadow-[#ff9933]/20">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tight uppercase">नई शिकायत दर्ज करें</CardTitle>
            </div>
            <CardDescription className="text-white/60 font-bold text-lg">
              Submit New Incident Report - Bilingual Official Form
            </CardDescription>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#ff9933]" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest leading-tight">
              Secure &<br />Encrypted
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 md:p-12 space-y-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#ff9933] rounded-full" />
                घटना की श्रेणी / Category *
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full h-16 rounded-2xl border-slate-200 bg-slate-50 font-black text-slate-900 focus:ring-2 focus:ring-[#003366] transition-all">
                  <SelectValue placeholder="Select Category / श्रेणी चुनें" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 p-2">
                  {incidentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="py-4 font-bold rounded-xl focus:bg-slate-100">
                      {category.nameHindi} / {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategoryData && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex gap-4 animate-in fade-in slide-in-from-left-2">
                  <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    <Shield className="h-6 w-6 text-[#003366]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authority Department</p>
                    <p className="text-xs font-black text-[#003366] mt-0.5">{selectedCategoryData.authority}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#ff9933] rounded-full" />
                घटना का समय / Timing *
              </label>
              <div className="h-16 rounded-2xl border border-slate-200 bg-slate-50 flex items-center px-6 gap-4">
                <Clock className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-black text-slate-900">
                  Auto Captured: {new Date().toLocaleString('hi-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold italic pl-2">System will record current timestamp for authenticity.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#ff9933] rounded-full" />
              विजुअल प्रूफ / Visual Proof *
            </label>
            <div
              className={`relative border-3 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer transition-all duration-300 group ${
                imagePreview ? 'border-[#138808] bg-green-50/50' : 'border-slate-200 bg-slate-50 hover:border-[#003366] hover:bg-white'
              }`}
              onClick={() => {
                if (!imagePreview) fetchAndSetLocation();
                fileInputRef.current?.click();
              }}
            >
              {imagePreview ? (
                <div className="relative inline-block group">
                  <img src={imagePreview} alt="Preview" className="max-h-80 rounded-[2rem] shadow-2xl border-8 border-white transition-transform group-hover:scale-[1.02]" />
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#003366] text-white text-[10px] font-black px-6 py-2 rounded-full shadow-xl uppercase tracking-widest border-2 border-white">
                    Tap to Replace Photo
                  </div>
                </div>
              ) : (
                <div className="py-8 space-y-6">
                  <div className="h-24 w-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto border border-slate-100 transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <LucideCamera className="h-12 w-12 text-[#003366]" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 uppercase tracking-tight">फोटो कैप्चर करें</p>
                    <p className="text-sm font-bold text-slate-500 mt-2">Upload or capture incident photo with metadata</p>
                  </div>
                </div>
              )}
              {isExtractingLocation && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center rounded-[2.5rem] z-20">
                  <div className="h-16 w-16 border-4 border-[#003366]/10 border-t-[#003366] rounded-full animate-spin" />
                  <p className="mt-6 font-black text-[#003366] uppercase tracking-[0.3em] text-xs">Capturing Geo-Location...</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#ff9933] rounded-full" />
              घटना का विवरण / Description *
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="घटना के बारे में विस्तार से लिखें... / Describe the incident clearly for authorities..."
              className="min-h-40 rounded-3xl border-slate-200 bg-slate-50 p-8 font-bold text-slate-900 focus:ring-2 focus:ring-[#003366] placeholder:text-slate-400 text-lg transition-all"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#ff9933] rounded-full" />
                स्थान / Incident Location *
              </label>
              <button
                type="button"
                onClick={() => fetchAndSetLocation()}
                className="text-[#003366] hover:text-[#004d99] flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full border border-slate-200 transition-all"
              >
                <RefreshCcw className={`h-3 w-3 ${isExtractingLocation ? 'animate-spin' : ''}`} />
                Detect My Location
              </button>
            </div>
            <div className="relative group">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={isExtractingLocation ? "Fetching GPS data..." : "पूरा पता या लोकेशन (Complete Location Address)"}
                className="h-16 rounded-2xl border-slate-200 bg-slate-50 pl-16 font-black text-slate-900 focus:ring-2 focus:ring-[#003366] transition-all"
                disabled={isExtractingLocation}
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                <MapPin className="h-5 w-5 text-[#003366]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#ff9933] rounded-full" />
                नाम / Reporter Name *
              </label>
              <div className="relative">
                <Input
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Official Full Name"
                  className="h-16 rounded-2xl border-slate-200 bg-slate-50 pl-14 font-black text-slate-900 focus:ring-2 focus:ring-[#003366]"
                />
                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#ff9933] rounded-full" />
                संपर्क / Contact *
              </label>
              <div className="relative">
                <Input
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="10 Digit Mobile Number"
                  type="tel"
                  maxLength={10}
                  className="h-16 rounded-2xl border-slate-200 bg-slate-50 pl-14 font-black text-slate-900 focus:ring-2 focus:ring-[#003366]"
                />
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#003366]/5 border-2 border-dashed border-[#003366]/10 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-white border border-[#003366]/10 flex items-center justify-center shrink-0 shadow-sm">
              <Info className="h-7 w-7 text-[#003366]" />
            </div>
            <div className="space-y-1 text-center md:text-left">
              <p className="text-sm font-black text-[#003366] uppercase tracking-wide">घोषणा / Declaration</p>
              <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                मैं पुष्टि करता हूँ कि दी गई जानकारी सत्य है। असत्य सूचना देना कानूनी अपराध है।
                <br />
                <span className="italic opacity-70 italic font-medium">I solemnly affirm that the information provided is true to my knowledge. False reporting is a punishable offense.</span>
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isExtractingLocation}
            className="w-full h-24 rounded-[2rem] bg-[#003366] hover:bg-[#004d99] text-white font-black text-2xl shadow-2xl shadow-[#003366]/30 transition-all hover:scale-[1.01] active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {isSubmitting ? (
              <div className="flex items-center gap-4">
                <div className="h-6 w-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                Submitting to Server...
              </div>
            ) : (
              <div className="flex items-center gap-4">
                रिपोर्ट जमा करें | Submit Official Report
                <Send className="h-6 w-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
