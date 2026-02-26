import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { ChannelShiftSelect } from './components/ChannelShiftSelect';
import { MachineStatusEntry } from './components/MachineStatusEntry';
import { SuccessMessage } from './components/SuccessMessage';
import { LogOut, Download } from 'lucide-react';

type AppStep = 'select' | 'entry' | 'success';

export interface PendingRecord {
  id: string;
  channel: string;
  shift: string;
  date: string;
  statuses: string[]; // Array of 16 machine statuses
  remarks: string[]; // Array of 16 machine remarks
}

function App() {
  const { user, loading, signOut, getUserFullName, getTokenNo } = useAuth();

  // State management - all at App level for proper state persistence
  const [step, setStep] = useState<AppStep>('select');
  const [channel, setChannel] = useState('');
  const [shift, setShift] = useState('');
  const [date, setDate] = useState('');
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<PendingRecord | null>(null);

  // Loading state - show centered loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EBF4FF' }}>
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: '#005A9C' }} viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <div className="text-gray-600 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!user) {
    return <Auth />;
  }

  // Navigate to machine entry form
  const handleNext = (selectedChannel: string, selectedShift: string, selectedDate: string) => {
    setChannel(selectedChannel);
    setShift(selectedShift);
    setDate(selectedDate);
    setStep('entry');
  };

  // Edit existing record
  const handleEdit = (record: PendingRecord) => {
    setEditingRecord(record);
    setChannel(record.channel);
    setShift(record.shift);
    setDate(record.date);
    setStep('entry');
  };

  // Delete record from pending list
  const handleDelete = (id: string) => {
    setPendingRecords(prev => prev.filter(record => record.id !== id));
  };

  // Submit machine details (create or update)
  const handleSubmitMachineDetails = (statuses: string[], remarks: string[]) => {
    if (editingRecord) {
      // Update existing record
      setPendingRecords(prev =>
        prev.map(record =>
          record.id === editingRecord.id
            ? { ...record, statuses, remarks }
            : record
        )
      );
      setEditingRecord(null);
    } else {
      // Add new record
      const newRecord: PendingRecord = {
        id: `${Date.now()}-${Math.random()}`,
        channel,
        shift,
        date,
        statuses,
        remarks,
      };
      setPendingRecords(prev => [...prev, newRecord]);
    }

    // Reset form fields and go back to selection
    setChannel('');
    setShift('');
    setDate('');
    setStep('select');
  };

  // Go back to selection screen
  const handleBackToSelect = () => {
    setEditingRecord(null);
    setChannel('');
    setShift('');
    setDate('');
    setStep('select');
  };

  // Final submit all records
  const handleFinalSubmit = () => {
    setStep('success');
  };

  // Reset everything and start over (called after successful save)
  const handleReset = () => {
    setPendingRecords([]);
    setChannel('');
    setShift('');
    setDate('');
    setEditingRecord(null);
    setStep('select');
  };

  // Go back from success screen to review (without clearing records)
  const handleBackToReview = () => {
    setStep('select');
  };

  // Download all data as CSV
  const handleDownloadAll = async () => {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      const response = await fetch(`${apiUrl}/logs/export`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `machine_logs_${today}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download data. Please try again.');
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut();
      // Reset all state after sign out
      setPendingRecords([]);
      setChannel('');
      setShift('');
      setDate('');
      setEditingRecord(null);
      setStep('select');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EBF4FF' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/image-removebg-preview.png" alt="SKF" className="h-6 w-auto" />
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#005A9C' }}>
                MACHINE MONITORING SYSTEM
              </h1>
              <p className="text-xs text-gray-600">
                {getUserFullName()} {getTokenNo() && `(${getTokenNo()})`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadAll}
              className="font-medium flex items-center gap-2 transition-colors px-3 py-2 rounded-lg"
              style={{ color: '#005A9C', backgroundColor: '#EBF4FF', border: '1px solid #005A9C' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#D6E9F8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EBF4FF')}
              title="Download all machine status logs as CSV"
            >
              <Download className="w-4 h-4" />
              Download All Data
            </button>
            <button
              onClick={handleSignOut}
              className="font-medium flex items-center gap-2 transition-colors"
              style={{ color: '#005A9C' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {step === 'select' && (
          <ChannelShiftSelect
            onNext={handleNext}
            pendingRecords={pendingRecords}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onFinalSubmit={handleFinalSubmit}
          />
        )}
        {step === 'entry' && (
          <MachineStatusEntry
            channel={channel}
            shift={shift}
            date={date}
            initialStatuses={editingRecord?.statuses}
            initialRemarks={editingRecord?.remarks}
            isEditing={!!editingRecord}
            onBack={handleBackToSelect}
            onSubmit={handleSubmitMachineDetails}
          />
        )}
        {step === 'success' && (
          <SuccessMessage
            onReset={handleReset}
            onBackToReview={handleBackToReview}
            recordCount={pendingRecords.length}
            pendingRecords={pendingRecords}
          />
        )}
      </main>
    </div>
  );
}

export default App;