"use client";

import { useState, useRef } from "react";
import { Camera as LucideCamera, Upload, MapPin, Phone, User, Send, AlertTriangle, Loader2, RefreshCcw } from "lucide-react";
import exifr from "exifr";
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

  const getCurrentLocation = (timeout = 10000): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn("Geolocation not supported");
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location obtained:", position.coords.latitude, position.coords.longitude);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error.code, error.message);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout, maximumAge: 0 }
      );
    });
  };

  const fetchAndSetLocation = async (file?: File) => {
    try {
      setIsExtractingLocation(true);
      
      // Try Browser Geolocation first
      let coords = await getCurrentLocation();
      
      // Fallback to EXIF if browser geolocation fails and we have a file
      if (!coords && file) {
        try {
          const exifData = await exifr.gps(file);
          if (exifData && exifData.latitude && exifData.longitude) {
            coords = { latitude: exifData.latitude, longitude: exifData.longitude };
          }
        } catch (exifError) {
          console.warn("EXIF extraction failed:", exifError);
        }
      }
      
      if (coords) {
        // Reverse geocoding using Nominatim
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=hi,en`
        );
        const result = await response.json();
        
        if (result && result.display_name) {
          setLocation(result.display_name);
        } else {
          setLocation(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
        }
      } else {
        console.warn("No coordinates found after all attempts");
      }
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setIsExtractingLocation(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Extract Location
      await fetchAndSetLocation(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !description || !location || !reporterName || !reporterPhone || !imagePreview) {
      alert("कृपया सभी फील्ड भरें / Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    const category = incidentCategories.find((c) => c.id === selectedCategory);
    if (category) {
      onSubmit({
        category,
        description,
        location,
        reporterName,
        reporterPhone,
        imageUrl: imagePreview,
      });
    }
    setIsSubmitting(false);
    setSelectedCategory("");
    setDescription("");
    setLocation("");
    setReporterName("");
    setReporterPhone("");
    setImagePreview(null);
  };

  const selectedCategoryData = incidentCategories.find((c) => c.id === selectedCategory);

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl">
      <CardHeader className="border-b border-amber-200 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-xl">
        <CardTitle className="flex items-center gap-2 text-xl">
          <AlertTriangle className="h-6 w-6" />
          घटना रिपोर्ट करें / Report Incident
        </CardTitle>
        <CardDescription className="text-amber-100">
          अपने शहर की किसी भी घटना की जानकारी दें / Report any incident in your city
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-amber-900">
              घटना का प्रकार / Incident Type *
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full border-amber-300 bg-white focus:ring-amber-500">
                <SelectValue placeholder="घटना का प्रकार चुनें / Select incident type" />
              </SelectTrigger>
              <SelectContent>
                {incidentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nameHindi} / {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategoryData && (
              <div className="mt-2 rounded-lg bg-amber-100 p-3 text-sm">
                <p className="font-medium text-amber-800">
                  संबंधित अधिकारी / Concerned Authority: {selectedCategoryData.authority}
                </p>
                <p className="text-amber-700">Email: {selectedCategoryData.email}</p>
                <p className="text-amber-700">Phone: {selectedCategoryData.phone}</p>
              </div>
            )}
          </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-900">
                <LucideCamera className="inline h-4 w-4 mr-1" />
                घटना की फोटो / Incident Photo *
              </label>
              <div
                className="relative border-2 border-dashed border-amber-300 rounded-xl p-4 text-center cursor-pointer hover:border-amber-500 transition-colors bg-white"
                onClick={() => {
                  fetchAndSetLocation(); // Start getting location immediately
                  fileInputRef.current?.click();
                }}
              >

                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg shadow-md"
                    />
                    <p className="mt-2 text-sm text-amber-600">फोटो बदलें / Change Photo</p>
                    {isExtractingLocation && (
                      <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center rounded-lg">
                        <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
                        <p className="text-xs font-bold text-amber-900 mt-2">लोकेशन निकाल रहे हैं...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8">
                    <LucideCamera className="h-12 w-12 mx-auto text-amber-500" />
                    <p className="mt-2 text-amber-700 font-bold">फोटो खींचें (Camera)</p>
                    <p className="text-sm text-amber-500">Click to capture photo with location</p>
                  </div>
                )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-[10px] text-amber-600 italic mt-1">
              * फोटो में GPS ऑन रखें ताकि लोकेशन ऑटोमैटिक मिल सके।
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-amber-900">
              घटना का विवरण / Description *
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="घटना के बारे में विस्तार से लिखें... / Describe the incident in detail..."
              className="min-h-24 border-amber-300 bg-white focus:ring-amber-500"
            />
          </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-900 flex justify-between">
                <span>
                  <MapPin className="inline h-4 w-4 mr-1" />
                  स्थान / Location *
                </span>
                <button
                  type="button"
                  onClick={() => fetchAndSetLocation()}
                  className="text-amber-600 hover:text-amber-800 flex items-center gap-1 text-xs"
                >
                  <RefreshCcw className={`h-3 w-3 ${isExtractingLocation ? 'animate-spin' : ''}`} />
                  रीफ्रेश करें / Refresh
                </button>
              </label>
              <div className="relative">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={isExtractingLocation ? "लोकेशन खोजी जा रही है..." : "पूरा पता लिखें / Enter full address"}
                  className={`border-amber-300 bg-white focus:ring-amber-500 pr-10 ${isExtractingLocation ? "opacity-50" : ""}`}
                  disabled={isExtractingLocation}
                />
                {!isExtractingLocation && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500">
                    <MapPin className="h-4 w-4" />
                  </div>
                )}
                {isExtractingLocation && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />
                  </div>
                )}
              </div>
            </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-900">
                <User className="inline h-4 w-4 mr-1" />
                आपका नाम / Your Name *
              </label>
              <Input
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="अपना नाम लिखें"
                className="border-amber-300 bg-white focus:ring-amber-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-900">
                <Phone className="inline h-4 w-4 mr-1" />
                मोबाइल नंबर / Mobile *
              </label>
              <Input
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                placeholder="10 digit mobile number"
                type="tel"
                maxLength={10}
                className="border-amber-300 bg-white focus:ring-amber-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isExtractingLocation}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-6 text-lg shadow-lg"
          >
            <Send className="h-5 w-5 mr-2" />
            {isSubmitting ? "भेज रहे हैं..." : "रिपोर्ट भेजें / Submit Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
