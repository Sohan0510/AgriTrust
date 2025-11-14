import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Server, CheckCircle2, Clock, Globe, Zap, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { api } from '../utils/api';

export function WitnessNetwork() {
  const [witnesses, setWitnesses] = useState<any[]>([]);
  const [selectedWitness, setSelectedWitness] = useState<any>(null);
  const [liveSignatures, setLiveSignatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWitnessData();
    const interval = setInterval(fetchLiveSignatures, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchWitnessData = async () => {
    try {
      const response = await api.witnesses.getAll();
      // Extract witnesses array from response
      const witnessesArray = response.data.witnesses || [];
      setWitnesses(witnessesArray);
      if (witnessesArray.length > 0) {
        setSelectedWitness(witnessesArray[0]);
      }
    } catch (error) {
      console.error('Failed to fetch witness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveSignatures = async () => {
    try {
      const response = await api.witnesses.getSignatures(10);
      // Extract signatures array from response
      const signaturesArray = response.data.signatures || [];
      setLiveSignatures(signaturesArray);
    } catch (error) {
      console.error('Failed to fetch live signatures:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="size-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading witness network...</p>
        </div>
      </div>
    );
  }

  const activeWitnesses = witnesses.filter(w => w.status === 'active').length;
  const avgLatency = witnesses.length > 0
    ? Math.round(witnesses.reduce((sum, w) => sum + (w.latency || 0), 0) / witnesses.length)
    : 0;
  const avgUptime = witnesses.length > 0
    ? (witnesses.reduce((sum, w) => sum + (w.uptime || 0), 0) / witnesses.length).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-900/50 border-emerald-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Witnesses</p>
                  <p className="text-3xl text-emerald-400">{activeWitnesses}/{witnesses.length}</p>
                </div>
                <Shield className="size-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-slate-900/50 border-blue-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Latency</p>
                  <p className="text-3xl text-blue-400">{avgLatency}ms</p>
                </div>
                <Zap className="size-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-slate-900/50 border-purple-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Network Uptime</p>
                  <p className="text-3xl text-purple-400">{avgUptime}%</p>
                </div>
                <Server className="size-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-slate-900/50 border-amber-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Signatures</p>
                  <p className="text-3xl text-amber-400">
                    {witnesses.reduce((sum, w) => sum + (w.signaturesCount || 0), 0).toLocaleString()}
                  </p>
                </div>
                <CheckCircle2 className="size-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Witness List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Witness Network Nodes</CardTitle>
              <p className="text-slate-400 text-sm">
                Geographically distributed, vendor-independent signature providers
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {witnesses.map((witness, index) => (
                <motion.button
                  key={witness.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedWitness(witness)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedWitness?.id === witness.id
                      ? 'bg-slate-800 border-emerald-500/40'
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`relative p-3 rounded-lg ${
                        witness.status === 'active' 
                          ? 'bg-emerald-500/10' 
                          : 'bg-amber-500/10'
                      }`}>
                        <Server className={`size-6 ${
                          witness.status === 'active' 
                            ? 'text-emerald-400' 
                            : 'text-amber-400'
                        }`} />
                        {witness.status === 'active' && (
                          <div className="absolute top-0 right-0 size-3 bg-emerald-400 rounded-full" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white">{witness.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={witness.status === 'active' 
                              ? 'border-emerald-500/40 text-emerald-400' 
                              : 'border-amber-500/40 text-amber-400'
                            }
                          >
                            {witness.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Globe className="size-3" />
                            {witness.location}
                          </span>
                          {witness.latency && (
                            <span className="flex items-center gap-1">
                              <Zap className="size-3" />
                              {witness.latency}ms
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm">{witness.signaturesCount?.toLocaleString() || 0}</p>
                      <p className="text-slate-400 text-xs">signatures</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </CardContent>
          </Card>

          {/* Live Signature Feed */}
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Live Signature Feed</CardTitle>
                  <p className="text-slate-400 text-sm">Real-time Merkle root signatures</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-400 text-sm">Live</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {liveSignatures.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="size-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No recent signatures</p>
                </div>
              ) : (
                liveSignatures.map((sig, index) => (
                  <motion.div
                    key={sig.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="size-4 text-emerald-400" />
                      <div>
                        <p className="text-white text-sm font-mono">{sig.merkleRoot || sig.hash}</p>
                        <p className="text-slate-400 text-xs">
                          {sig.witnessName} • {new Date(sig.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Witness Details */}
        <div>
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-white">Witness Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedWitness ? (
                <>
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Name</p>
                    <p className="text-white text-xl">{selectedWitness.name}</p>
                  </div>

                  {selectedWitness.provider && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Provider</p>
                      <p className="text-white">{selectedWitness.provider}</p>
                    </div>
                  )}

                  {selectedWitness.location && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Location</p>
                      <div className="flex items-center gap-2">
                        <Globe className="size-4 text-blue-400" />
                        <p className="text-white">{selectedWitness.location}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-slate-400 text-sm mb-2">Status</p>
                    <Badge 
                      variant="outline" 
                      className={selectedWitness.status === 'active' 
                        ? 'border-emerald-500/40 text-emerald-400' 
                        : 'border-amber-500/40 text-amber-400'
                      }
                    >
                      {selectedWitness.status?.toUpperCase()}
                    </Badge>
                  </div>

                  {selectedWitness.uptime !== undefined && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Uptime</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white">{selectedWitness.uptime}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedWitness.uptime}%` }}
                            className="h-full bg-emerald-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedWitness.latency && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Avg Latency</p>
                      <div className="flex items-center gap-2">
                        <Zap className="size-4 text-blue-400" />
                        <p className="text-white">{selectedWitness.latency}ms</p>
                      </div>
                    </div>
                  )}

                  {selectedWitness.signaturesCount !== undefined && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Total Signatures</p>
                      <p className="text-white text-2xl">{selectedWitness.signaturesCount.toLocaleString()}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Server className="size-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Select a witness to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
