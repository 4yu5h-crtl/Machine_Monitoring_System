import { useState, useEffect } from 'react';
import { ChevronLeft, Send } from 'lucide-react';

interface MachineStatusEntryProps {
  channel: string;
  shift: string;
  date: string;
  initialStatuses?: string[];
  initialRemarks?: string[];
  isEditing: boolean;
  onBack: () => void;
  onSubmit: (statuses: string[], remarks: string[]) => void;
}

type MachineStatus =
  | 'OK-Working'
  | 'By Pass'
  | 'Not Set'
  | 'Setting'
  | 'Not Applicable'
  | 'Tolerance not as per specification'
  | 'Add Remark'
  | '';

// ✅ 16 MACHINES
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

export function MachineStatusEntry({
  channel,
  shift,
  date,
  initialStatuses,
  initialRemarks,
  isEditing,
  onBack,
  onSubmit,
}: MachineStatusEntryProps) {

  // ✅ STATUS ARRAY LENGTH = 16
  const [statuses, setStatuses] = useState<MachineStatus[]>(Array(16).fill(''));
  const [remarks, setRemarks] = useState<string[]>(Array(16).fill(''));
  const [error, setError] = useState('');

  // Load initial statuses when editing
  useEffect(() => {
    if (initialStatuses && initialStatuses.length === 16) {
      setStatuses(initialStatuses as MachineStatus[]);
    }
    if (initialRemarks && initialRemarks.length === 16) {
      setRemarks(initialRemarks);
    }
  }, [initialStatuses, initialRemarks]);

  const statusOptions: MachineStatus[] = [
    'OK-Working',
    'By Pass',
    'Not Set',
    'Setting',
    'Not Applicable',
    'Tolerance not as per specification',
    'Add Remark',
  ];

  const handleStatusChange = (index: number, status: MachineStatus) => {
    const newStatuses = [...statuses];
    newStatuses[index] = status;
    setStatuses(newStatuses);
  };

  const handleRemarkChange = (index: number, value: string) => {
    const newRemarks = [...remarks];
    newRemarks[index] = value;
    setRemarks(newRemarks);
  };

  const handleSubmit = () => {
    setError('');

    if (statuses.some((status) => !status)) {
      setError('Please select a status for all machines');
      return;
    }

    onSubmit(statuses, remarks);
  };

  const getStatusColor = (status: MachineStatus) => {
    switch (status) {
      case 'OK-Working':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'By Pass':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'Not Set':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'Setting':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'Not Applicable':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'Tolerance not as per specification':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'Add Remark':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-white border-gray-300 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-8 px-4">
      <div className="card-container max-w-4xl w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: '#005A9C' }}>
              {isEditing ? 'Edit Machine Status' : 'Step 2: Machine Status Entry'}
            </h2>
            <p className="text-gray-600">
              {channel} • {shift} • {formatDate(date)}
            </p>
          </div>
          <button
            onClick={onBack}
            className="font-medium flex items-center gap-1 transition-colors"
            style={{ color: '#005A9C' }}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MACHINE_NAMES.map((machineName, i) => (
              <div key={i} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {machineName}
                </label>
                <select
                  value={statuses[i]}
                  onChange={(e) =>
                    handleStatusChange(i, e.target.value as MachineStatus)
                  }
                  className={`input-field ${getStatusColor(statuses[i])}`}
                  required
                >
                  <option value="">Select status</option>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {statuses[i] === 'Add Remark' && (
                  <input
                    type="text"
                    value={remarks[i]}
                    onChange={(e) => handleRemarkChange(i, e.target.value)}
                    placeholder="Enter remark here..."
                    className="input-field mt-2 text-sm"
                    autoFocus
                  />
                )}
              </div>
            ))}
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
            {isEditing ? 'UPDATE MACHINE DETAILS' : 'SUBMIT MACHINE DETAILS'}
            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
