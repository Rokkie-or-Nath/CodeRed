import { useState, useEffect } from 'react';
import { X, AlertTriangle, Send, Trash2, Loader } from 'lucide-react';
import { fetchHospitalReports, submitReport, deleteReport, getReportLabel, type HospitalReport, type ReportType, type SubmitReportInput } from '../lib/reports';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  hospitalName: string;
  hospitalLon: number;
  hospitalLat: number;
  onClose: () => void;
}

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'wait_time', label: 'Long Wait Time' },
  { value: 'overcrowded', label: 'Overcrowded' },
  { value: 'closed', label: 'Closed / Not Accepting' },
  { value: 'renovation', label: 'Under Renovation' },
  { value: 'other', label: 'Other Issue' },
];

export default function HospitalReportModal({ hospitalName, hospitalLon, hospitalLat, onClose }: Props) {
  const { user } = useAuth();
  const [reports, setReports] = useState<HospitalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('other');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchHospitalReports(hospitalLon, hospitalLat);
      setReports(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReports(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    try {
      const input: SubmitReportInput = {
        hospital_name: hospitalName,
        hospital_lon: hospitalLon,
        hospital_lat: hospitalLat,
        report_type: reportType,
        description,
      };
      await submitReport(input);
      setSuccess('Report submitted!');
      setDescription('');
      setShowForm(false);
      loadReports();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      await deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[80vh] bg-dark-800 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Community Reports
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-dark-700 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-xs text-gray-500">
            <strong className="text-gray-300">{hospitalName}</strong>
          </p>

          {success && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400">
              {success}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Existing reports */}
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader className="w-5 h-5 text-gray-500 animate-spin" />
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                {reports.length} report{reports.length !== 1 ? 's' : ''}
              </p>
              {reports.map((report) => {
                const label = getReportLabel(report.report_type);
                const isOwner = user?.id === report.user_id;
                return (
                  <div key={report.id} className="p-3 rounded-xl bg-dark-700/50 border border-white/5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">{label.emoji}</span>
                        <div className="min-w-0">
                          <span className={`text-xs font-semibold ${label.color}`}>{label.label}</span>
                          <span className="text-[10px] text-gray-500 ml-2">{formatDate(report.created_at)}</span>
                        </div>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {report.description && (
                      <p className="text-xs text-gray-400 mt-1.5 ml-6">{report.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertTriangle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No reports yet for this hospital</p>
            </div>
          )}

          {/* Report form toggle */}
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold transition-all active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              Submit a Report
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-xl bg-dark-700/50 border border-white/5">
              <h4 className="text-xs font-semibold text-gray-300">New Report</h4>
              
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 font-medium">Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500/40 transition-all"
                >
                  {REPORT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-1 font-medium">Details (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. ER wait time was about 3 hours"
                  rows={2}
                  maxLength={500}
                  className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/40 transition-all resize-none"
                />
                <span className="text-[9px] text-gray-600">{description.length}/500</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-xs font-bold transition-all active:scale-[0.98]"
                >
                  {submitLoading ? (
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-lg bg-dark-800 border border-white/10 text-xs text-gray-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}