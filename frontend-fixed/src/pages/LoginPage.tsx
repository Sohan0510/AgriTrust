import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="flex items-center justify-center size-10 rounded-lg bg-emerald-500">
            <Shield className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-white text-xl">AgriTrust</h1>
            <p className="text-emerald-400 text-xs">Decentralized Trust Platform</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-white text-2xl">Welcome back</CardTitle>
              <p className="text-slate-400">Enter your credentials to access your account</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="size-4 text-red-400" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-5 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 size-5 text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="remember" className="text-sm text-slate-400">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-sm text-emerald-400 hover:text-emerald-300">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>

                <div className="text-center">
                  <p className="text-slate-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-emerald-400 hover:text-emerald-300">
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <Link to="/" className="text-slate-400 hover:text-white text-sm">
            ← Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
