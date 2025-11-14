import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import heroImage from 'figma:asset/1b14fcb718ad6a173a3a3e3ab0468146feac760a.png';

export function LandingPage() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Registered Farmers', value: '55+' },
    { label: 'Active IoT Devices', value: '102+' },
    { label: 'Data Integrity', value: '99.2%' },
    { label: 'Transparency', value: '100%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/30 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-500">
                <Shield className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-white">AgriTrust</h1>
                <p className="text-emerald-400 text-xs">Decentralized Trust Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-white hover:text-emerald-400"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
          >
            <span className="text-emerald-400 text-sm">WEB3 FOR AGRICULTURE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl mb-6"
          >
             <span className="text-emerald-400">Building Trust in Agriculture</span> 
            <br />
             <span className="text-emerald-400">with Decentralized Data</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-xl mb-8 max-w-3xl"
          >
            Ensure integrity, transparency, and traceability for farmers, suppliers, and consumers
            using cryptographic proofs and distributed validation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 mb-12"
          >
            <Button
              onClick={() => navigate('/register')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg"
            >
              Launch Demo
            </Button>
            <Button
              variant="outline"
              className="border-slate-600 text-black hover:bg-slate-800 px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </motion.div>

          
          
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
        >
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-slate-900/30 border-slate-800/50 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <p className="text-4xl text-white mb-2">{stat.value}</p>
                <p className="text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-slate-900/30 border-slate-800/50 backdrop-blur-sm h-full">
              <CardContent className="p-8">
                <div className="size-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <Shield className="size-6 text-emerald-400" />
                </div>
                <h3 className="text-white text-xl mb-3">Tamper-Proof Records</h3>
                <p className="text-slate-400">
                  Every IoT reading is cryptographically hashed and anchored through Merkle trees,
                  making tampering mathematically detectable.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-slate-900/30 border-slate-800/50 backdrop-blur-sm h-full">
              <CardContent className="p-8">
                <div className="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Search className="size-6 text-blue-400" />
                </div>
                <h3 className="text-white text-xl mb-3">Independent Verification</h3>
                <p className="text-slate-400">
                  Anyone can verify data authenticity without database access using distributed
                  witness signatures and Merkle proofs.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-slate-900/30 border-slate-800/50 backdrop-blur-sm h-full">
              <CardContent className="p-8">
                <div className="size-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Shield className="size-6 text-purple-400" />
                </div>
                <h3 className="text-white text-xl mb-3">No Blockchain Bloat</h3>
                <p className="text-slate-400">
                  98% space savings vs blockchain. Fast, cheap, and scalable without gas fees,
                  mining, or vendor lock-in.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950/50 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <p>© 2025 AgriTrust - Blockchain-Free Verification</p>
            <p>Powered by Merkle Trees + Witness Signatures</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
