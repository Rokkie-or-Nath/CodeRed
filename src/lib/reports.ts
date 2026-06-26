import { supabase } from './supabase';

export type ReportType = 'wait_time' | 'overcrowded' | 'closed' | 'renovation' | 'other';

export interface HospitalReport {
  id: string;
  user_id: string;
  hospital_name: string;
  hospital_lon: number;
  hospital_lat: number;
  report_type: ReportType;
  description: string;
  created_at: string;
}

export interface SubmitReportInput {
  hospital_name: string;
  hospital_lon: number;
  hospital_lat: number;
  report_type: ReportType;
  description: string;
}

const REPORT_LABELS: Record<ReportType, { label: string; emoji: string; color: string }> = {
  wait_time: { label: 'Long Wait Time', emoji: '⏱️', color: 'text-yellow-400' },
  overcrowded: { label: 'Overcrowded', emoji: '🚨', color: 'text-orange-400' },
  closed: { label: 'Closed / Not Accepting', emoji: '🔴', color: 'text-red-400' },
  renovation: { label: 'Under Renovation', emoji: '🔧', color: 'text-blue-400' },
  other: { label: 'Other Issue', emoji: '📌', color: 'text-gray-400' },
};

export function getReportLabel(type: ReportType) {
  return REPORT_LABELS[type];
}

/**
 * Fetch all reports for a specific hospital (by coordinates).
 */
export async function fetchHospitalReports(lon: number, lat: number): Promise<HospitalReport[]> {
  const { data, error } = await supabase
    .from('hospital_reports')
    .select('*')
    .eq('hospital_lon', lon)
    .eq('hospital_lat', lat)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Submit a new report about a hospital.
 */
export async function submitReport(input: SubmitReportInput): Promise<HospitalReport> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('hospital_reports')
    .insert({
      user_id: user.id,
      hospital_name: input.hospital_name,
      hospital_lon: input.hospital_lon,
      hospital_lat: input.hospital_lat,
      report_type: input.report_type,
      description: input.description,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete a report (only the user who created it can delete).
 */
export async function deleteReport(reportId: string): Promise<void> {
  const { error } = await supabase
    .from('hospital_reports')
    .delete()
    .eq('id', reportId);

  if (error) throw new Error(error.message);
}

/**
 * Get a summary of reports for display (counts by type).
 */
export interface ReportSummary {
  total: number;
  wait_time: number;
  overcrowded: number;
  closed: number;
  renovation: number;
  other: number;
}

export function summarizeReports(reports: HospitalReport[]): ReportSummary {
  const summary: ReportSummary = { total: 0, wait_time: 0, overcrowded: 0, closed: 0, renovation: 0, other: 0 };
  for (const r of reports) {
    summary.total++;
    summary[r.report_type]++;
  }
  return summary;
}