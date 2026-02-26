import { useState } from 'react';
import { CheckCircle, Home, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface PendingRecord {
  id: string;
  channel: string;
  shift: string;
  date: string;
  statuses: string[];
  remarks: string[];
}

interface SuccessMessageProps {
  onReset: () => void;
  onBackToReview: () => void;
  recordCount: number;
  pendingRecords: PendingRecord[];
}

export function SuccessMessage({
  onReset,
  onBackToReview,
  recordCount,
  pendingRecords,
}: SuccessMessageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSaveToDatabase = async () => {
    setLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('User not authenticated. Please log in again.');
      }

      if (!pendingRecords || pendingRecords.length === 0) {
        throw new Error('No records to save.');
      }

      // ✅ PREPARE RECORDS — 16 MACHINES
      const records = pendingRecords.map((record) => {
        if (!record.statuses || record.statuses.length !== 16) {
          throw new Error(`Invalid machine status data for ${record.channel}`);
        }

        return {
          channel_no: record.channel,
          shift: record.shift,
          date: record.date,

          // Map array indices to specific database columns
          ndt_or_status: record.statuses[0],
          ndt_ir_status: record.statuses[1],
          mma_status: record.statuses[2],
          abg_status: record.statuses[3],
          xhf_cone_ht_status: record.statuses[4],
          mvr_status: record.statuses[5],
          missing_roller_status: record.statuses[6],
          ir_width_status: record.statuses[7],
          or_width_status: record.statuses[8],
          outer_diameter_mib_status: record.statuses[9],
          double_cage_hit_status: record.statuses[10],
          ball_missing_myd_status: record.statuses[11],
          rivet_missing_myd_status: record.statuses[12],
          break_myd_status: record.statuses[13],
          clearance_mgi_status: record.statuses[14],
          shield_check_status: record.statuses[15],

          ndt_or_remark: record.remarks ? record.remarks[0] : '',
          ndt_ir_remark: record.remarks ? record.remarks[1] : '',
          mma_remark: record.remarks ? record.remarks[2] : '',
          abg_remark: record.remarks ? record.remarks[3] : '',
          xhf_cone_ht_remark: record.remarks ? record.remarks[4] : '',
          mvr_remark: record.remarks ? record.remarks[5] : '',
          missing_roller_remark: record.remarks ? record.remarks[6] : '',
          ir_width_remark: record.remarks ? record.remarks[7] : '',
          or_width_remark: record.remarks ? record.remarks[8] : '',
          outer_diameter_mib_remark: record.remarks ? record.remarks[9] : '',
          double_cage_hit_remark: record.remarks ? record.remarks[10] : '',
          ball_missing_myd_remark: record.remarks ? record.remarks[11] : '',
          rivet_missing_myd_remark: record.remarks ? record.remarks[12] : '',
          break_myd_remark: record.remarks ? record.remarks[13] : '',
          clearance_mgi_remark: record.remarks ? record.remarks[14] : '',
          shield_check_remark: record.remarks ? record.remarks[15] : '',
        };
      });

      const token = localStorage.getItem('token');
      await api.post('/logs', records, token);

      setSaved(true);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'An error occurred while saving to database');
    } finally {
      setLoading(false);
    }
  };

  if (!saved) {
    return (
      <div className="flex items-center justify-center min-h-screen py-8 px-4">
        <div className="card-container max-w-3xl w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full" style={{ backgroundColor: '#D6E9F8' }}>
              <CheckCircle className="w-16 h-16" style={{ color: '#005A9C' }} />
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-3" style={{ color: '#005A9C' }}>
            Ready to Save!
          </h2>

          <p className="text-gray-600 mb-2">
            You have reviewed{' '}
            <span className="font-bold" style={{ color: '#005A9C' }}>
              {recordCount}
            </span>{' '}
            record{recordCount !== 1 ? 's' : ''}.
          </p>

          <p className="text-gray-600 mb-8">
            Click below to save all records to the database.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5" />
                <strong>Error Saving Data</strong>
              </div>
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSaveToDatabase}
              disabled={loading}
              className="btn-primary"
            >
              {loading
                ? 'Saving...'
                : `SAVE ${recordCount} RECORD${recordCount !== 1 ? 'S' : ''}`}
            </button>

            <button
              onClick={onBackToReview}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700"
            >
              Back to Review
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-8 px-4">
      <div className="card-container max-w-2xl w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-3" style={{ color: '#005A9C' }}>
          Data Saved Successfully!
        </h2>

        <p className="text-gray-600 mb-8">
          <span className="font-bold text-green-600">{recordCount}</span> record
          {recordCount !== 1 ? 's have' : ' has'} been saved to the database.
        </p>

        <button onClick={onReset} className="btn-primary inline-flex items-center gap-2">
          <Home className="w-5 h-5" />
          LOG ANOTHER ENTRY
        </button>
      </div>
    </div>
  );
}
