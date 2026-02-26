import { useState, useEffect } from 'react';
import { ChevronRight, Edit2, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

interface PendingRecord {
  id: string;
  channel: string;
  shift: string;
  date: string;
  statuses: string[];
  remarks: string[];
}

interface ChannelShiftSelectProps {
  onNext: (channel: string, shift: string, date: string) => void;
  pendingRecords: PendingRecord[];
  onEdit: (record: PendingRecord) => void;
  onDelete: (id: string) => void;
  onFinalSubmit: () => void;
}

// Machine names as per Image 80d9f0.jpg - 16 machines
const MACHINE_NAMES = [
  'NDT-OR',
  'NDT-IR',
  'MMA',
  'ABG',
  'XHF (Cone Ht.)',
  'MVR',
  'MISSING ROLLER',
  'IR Width',
  'OR Width',
  'Outer Diameter (MIB)',
  'Double Cage (HIT)',
  'Ball Missing (MYD)',
  'Rivet Missing (MYD)',
  'Break (MYD)',
  'Clearance (MGI)',
  'Shield Check',
];

export function ChannelShiftSelect({
  onNext,
  pendingRecords,
  onEdit,
  onDelete,
  onFinalSubmit,
}: ChannelShiftSelectProps) {
  const [channel, setChannel] = useState('');
  const [shift, setShift] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const channels = [
    'TRB T3',
    'TRB T4',
    'TRB T5',
    'TRB T6',
    'DGBB 2',
    'DGBB 3',
    'DGBB 4',
    'DGBB 5',
    'DGBB 8',
    'DGBB 12',
    'DGBB 13',
  ];
  const shifts = ['Shift 1', 'Shift 2', 'Shift 3'];

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  // Auto-populate shift and date from pending records if they exist
  useEffect(() => {
    if (pendingRecords.length > 0) {
      const firstRecord = pendingRecords[0];
      setShift(firstRecord.shift);
      setDate(firstRecord.date);
    }
  }, [pendingRecords]);

  const handleShiftChange = (newShift: string) => {
    // Check if there are any pending records AND if trying to change to a different shift
    if (pendingRecords.length > 0 && newShift !== shift) {
      // Block the change and show warning
      setWarningMessage('Please "Final Submit" the records for the current shift before switching to a new shift or date.');
      setShowWarning(true);
      return;
    }
    setShift(newShift);
  };

  const handleDateChange = (newDate: string) => {
    // Check if there are any pending records AND if trying to change to a different date
    if (pendingRecords.length > 0 && newDate !== date) {
      // Block the change and show warning
      setWarningMessage('Please "Final Submit" the records for the current shift before switching to a new shift or date.');
      setShowWarning(true);
      return;
    }
    setDate(newDate);
  };

  const handleSubmit = () => {
    setError('');

    if (!channel || !shift || !date) {
      setError('Please select channel, shift, and date');
      return;
    }

    // Check if this combination already exists
    const exists = pendingRecords.some(
      (record) => record.channel === channel && record.shift === shift && record.date === date
    );

    if (exists) {
      setError(`${channel} - ${shift} on ${date} already exists. Please edit it from the review table.`);
      return;
    }

    onNext(channel, shift, date);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'By Pass':
        return 'bg-red-100 text-red-800';
      case 'Not Set':
        return 'bg-red-100 text-red-800';
      case 'Setting':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusShortForm = (status: string) => {
    switch (status) {
      case 'By Pass':
        return 'BP';
      case 'Not Set':
        return 'NS';
      case 'Setting':
        return 'SET';
      default:
        return '-';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 p-2 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Cannot Change Selection</h3>
            </div>
            <p className="text-gray-600 mb-6">
              {warningMessage}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="btn-primary flex-1"
              >
                OK, I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container - Centered */}
      <div className="w-full max-w-6xl space-y-6">
        {/* Selection Form - Centered */}
        <div className="card-container w-full max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#005A9C' }}>
            Step 1: Select Channel, Shift, and Date
          </h2>
          <p className="text-gray-600 mb-8">
            Choose the production channel, shift, and date for this status report
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="channel" className="block text-sm font-medium text-gray-700 mb-2">
                  Channel No.
                </label>
                <select
                  id="channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select a channel</option>
                  {channels.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-2">
                  Shift
                </label>
                <select
                  id="shift"
                  value={shift}
                  onChange={(e) => handleShiftChange(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select a shift</option>
                  {shifts.map((sh) => (
                    <option key={sh} value={sh}>
                      {sh}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="btn-primary w-full flex items-center justify-center gap-2 group"
            >
              Next
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Review Table */}
        {pendingRecords.length > 0 && (
          <div className="card-container w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#005A9C' }}>
                Review Table - Pending Records
              </h3>
              <span className="text-sm text-gray-600 font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#D6E9F8' }}>
                {pendingRecords.length} Record{pendingRecords.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead style={{ backgroundColor: '#D6E9F8' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#005A9C' }}>
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#005A9C' }}>
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#005A9C' }}>
                      Channel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#005A9C' }}>
                      Shift
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#005A9C' }}>
                      Machine Status Summary
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#005A9C' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingRecords.map((record, index) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: '#005A9C' }}>
                        {record.channel}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                        {record.shift}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {record.statuses.map((status, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(
                                status
                              )}`}
                              title={MACHINE_NAMES[idx]}
                            >
                              {MACHINE_NAMES[idx].substring(0, 10)}: {getStatusShortForm(status)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-3">
                          <button
                            onClick={() => onEdit(record)}
                            className="transition-colors flex items-center gap-1"
                            style={{ color: '#005A9C' }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            title="Edit this entry"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span className="text-xs font-medium">Edit</span>
                          </button>
                          <button
                            onClick={() => onDelete(record.id)}
                            className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                            title="Delete this entry"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-xs font-medium">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={onFinalSubmit}
                className="btn-primary w-full flex items-center justify-center gap-2 group text-lg py-4"
              >
                FINAL SUBMIT ALL RECORDS ({pendingRecords.length})
                <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}