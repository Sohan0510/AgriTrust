import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, User, Phone, MapPin, Sprout, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer' as 'farmer' | 'admin',
    farmerId: '',
    phone: '',
    address: '',
    farmSize: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
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
              <CardTitle className="text-white text-2xl">Create an account</CardTitle>
              <p className="text-slate-400">Join AgriTrust and start securing your agricultural data</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="size-4 text-red-400" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Account Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'farmer' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.role === 'farmer'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-800/50'
                      }`}
                    >
                      <Sprout className={`size-6 mb-2 ${formData.role === 'farmer' ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <p className={formData.role === 'farmer' ? 'text-white' : 'text-slate-400'}>
                        Farmer
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'admin' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.role === 'admin'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-800/50'
                      }`}
                    >
                      <Shield className={`size-6 mb-2 ${formData.role === 'admin' ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <p className={formData.role === 'admin' ? 'text-white' : 'text-slate-400'}>
                        Admin
                      </p>
                    </button>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 size-5 text-slate-500" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">
                      Email *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 size-5 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">
                      Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 size-5 text-slate-500" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-300">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 size-5 text-slate-500" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Farmer-specific fields */}
                {formData.role === 'farmer' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="farmerId" className="text-slate-300">
                          Farmer ID
                        </Label>
                        <div className="relative">
                          <Sprout className="absolute left-3 top-3 size-5 text-slate-500" />
                          <Input
                            id="farmerId"
                            type="text"
                            placeholder="FARM_001"
                            value={formData.farmerId}
                            onChange={(e) =>
                              setFormData({ ...formData, farmerId: e.target.value })
                            }
                            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-300">
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 size-5 text-slate-500" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-slate-300">
                          Farm Address
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 size-5 text-slate-500" />
                          <Input
                            id="address"
                            type="text"
                            placeholder="Village, District"
                            value={formData.address}
                            onChange={(e) =>
                              setFormData({ ...formData, address: e.target.value })
                            }
                            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="farmSize" className="text-slate-300">
                          Farm Size (acres)
                        </Label>
                        <Input
                          id="farmSize"
                          type="text"
                          placeholder="10.5"
                          value={formData.farmSize}
                          onChange={(e) =>
                            setFormData({ ...formData, farmSize: e.target.value })
                          }
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-400">
                    I agree to the{' '}
                    <a href="#" className="text-emerald-400 hover:text-emerald-300">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-emerald-400 hover:text-emerald-300">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>

                <div className="text-center">
                  <p className="text-slate-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
                      Sign in
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
