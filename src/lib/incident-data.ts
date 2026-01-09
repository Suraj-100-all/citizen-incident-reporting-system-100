import { supabase } from "./supabase";

export type IncidentCategory = {
  id: string;
  name: string;
  nameHindi: string;
  authority: string;
  email: string;
  phone: string;
};

export const incidentCategories: IncidentCategory[] = [
  {
    id: "road-accident",
    name: "Road Accident",
    nameHindi: "सड़क दुर्घटना",
    authority: "Traffic Police",
    email: "traffic.police@gov.in",
    phone: "100",
  },
  {
    id: "fire",
    name: "Fire",
    nameHindi: "आग",
    authority: "Fire Department",
    email: "fire.dept@gov.in",
    phone: "101",
  },
  {
    id: "theft-crime",
    name: "Theft / Crime",
    nameHindi: "चोरी / अपराध",
    authority: "Police Station",
    email: "police.station@gov.in",
    phone: "100",
  },
  {
    id: "water-logging",
    name: "Water Logging / Flood",
    nameHindi: "जलभराव / बाढ़",
    authority: "Municipal Corporation",
    email: "municipal@gov.in",
    phone: "1800-123-4567",
  },
  {
    id: "electricity",
    name: "Electricity Issue",
    nameHindi: "बिजली की समस्या",
    authority: "Electricity Board",
    email: "electricity@gov.in",
    phone: "1912",
  },
  {
    id: "garbage",
    name: "Garbage / Sanitation",
    nameHindi: "कचरा / स्वच्छता",
    authority: "Sanitation Department",
    email: "sanitation@gov.in",
    phone: "1800-123-5678",
  },
    {
      id: "medical-emergency",
      name: "Medical Emergency",
      nameHindi: "चिकित्सा आपातकाल",
      authority: "Health Department",
      email: "health.dept@gov.in",
      phone: "102",
    },
    {
      id: "admin",
      name: "Admin / Demo",
      nameHindi: "एडमिन / डेमो",
      authority: "Admin Panel",
      email: "admin@portal.in",
      phone: "9999999999",
    },
    {
      id: "other",
      name: "Other",
      nameHindi: "अन्य",
      authority: "District Collector",
      email: "collector@gov.in",
      phone: "1800-180-1551",
    },
  ];


export type IncidentReport = {
  id: string;
  category: IncidentCategory;
  description: string;
  location: string;
  reporterName: string;
  reporterPhone: string;
  imageUrl: string;
  status: "pending" | "in-progress" | "resolved";
  createdAt: Date;
  actionTaken?: string;
};

export type Officer = {
  id: string;
  authId?: string;
  fullName: string;
  email: string;
  departmentId: string;
  officerId: string;
  proofUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
};

function mapRowToReport(row: any): IncidentReport {
  return {
    id: row.id,
    category: incidentCategories.find(c => c.id === row.category_id) || incidentCategories[incidentCategories.length - 1],
    description: row.description,
    location: row.location,
    reporterName: row.reporter_name,
    reporterPhone: row.reporter_phone,
    imageUrl: row.image_url || "",
    status: row.status,
    createdAt: new Date(row.created_at),
    actionTaken: row.action_taken,
  };
}

export async function addReport(report: Omit<IncidentReport, "id" | "createdAt" | "status" | "category"> & { category: IncidentCategory }): Promise<IncidentReport> {
  const referenceId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const id = `CAP-${referenceId}`;
  
  const { data, error } = await supabase
    .from('incidents')
    .insert([{
      id,
      category_id: report.category.id,
      description: report.description,
      location: report.location,
      reporter_name: report.reporterName,
      reporter_phone: report.reporterPhone,
      image_url: report.imageUrl,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) throw error;
  return mapRowToReport(data);
}

export async function getReports(): Promise<IncidentReport[]> {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(mapRowToReport);
}

export async function getReportById(id: string): Promise<IncidentReport | null> {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapRowToReport(data);
}

export async function registerOfficer(officer: Omit<Officer, "id" | "createdAt" | "status">): Promise<Officer> {
  const { data, error } = await supabase
    .from('officers')
    .insert([{
      full_name: officer.fullName,
      email: officer.email,
      department_id: officer.departmentId,
      officer_id: officer.officerId,
      proof_url: officer.proofUrl,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    departmentId: data.department_id,
    officerId: data.officer_id,
    proofUrl: data.proof_url,
    status: data.status,
    createdAt: new Date(data.created_at)
  };
}

export async function getOfficerByEmail(email: string): Promise<Officer | null> {
  const { data, error } = await supabase
    .from('officers')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    departmentId: data.department_id,
    officerId: data.officer_id,
    proofUrl: data.proof_url,
    status: data.status,
    createdAt: new Date(data.created_at)
  };
}

export async function updateReportStatus(
  id: string,
  status: IncidentReport["status"],
  actionTaken?: string
): Promise<IncidentReport | null> {
  const { data, error } = await supabase
    .from('incidents')
    .update({ 
      status, 
      action_taken: actionTaken 
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return null;
  return mapRowToReport(data);
}
