import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [tokenNo, setTokenNo] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const validateInputs = () => {
    const cleanTokenNo = tokenNo.trim();
    const cleanPassword = password.trim();

    if (!cleanTokenNo) {
      setError('Please enter your Token No. / Emp ID');
      return false;
    }

    if (!/^[a-zA-Z0-9]+$/.test(cleanTokenNo)) {
      setError('Token No. should contain only letters and numbers');
      return false;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (!isLogin) {
      if (!firstName.trim() || !lastName.trim()) {
        setError('Please enter both Name and Surname');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    // 🔒 HARD BLOCK — prevents multiple calls
    if (loading) return;

    setError('');

    if (!validateInputs()) return;

    setLoading(true);

    try {
      if (isLogin) {
        await signIn(tokenNo.trim(), password);
      } else {
        await signUp(
          tokenNo.trim(),
          password,
          firstName.trim(),
          lastName.trim()
        );
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      // ⏱️ Small delay prevents rapid retry spam
      setTimeout(() => setLoading(false), 1500);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#EBF4FF' }}
    >
      <div className="card-container max-w-md w-full">
        <div className="mb-8">
          <img src="/image-removebg-preview.png" alt="SKF" className="h-10 w-auto" />
        </div>

        <h1
          className="text-3xl font-bold text-center mb-10 tracking-wide"
          style={{ color: '#005A9C' }}
        >
          MACHINE MONITORING SYSTEM
        </h1>

        <div className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Surname</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input-field"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Token No. / Emp ID
            </label>
            <input
              type="text"
              value={tokenNo}
              onChange={(e) => setTokenNo(e.target.value)}
              className="input-field"
              placeholder="EMP001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">Error</p>
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Processing...' : isLogin ? 'LOG IN' : 'SIGN UP'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm font-medium"
            style={{ color: '#005A9C' }}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
