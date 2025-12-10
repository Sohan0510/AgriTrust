import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, CheckCircle2, XCircle, Shield, Hash, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { api } from '../utils/api';

export function VerificationPortal() {
  const [readingId, setReadingId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!readingId.trim()) {
      setError('Please enter a reading ID');
      return;
    }

    setIsVerifying(true);
    setError('');
    
    try {
      const response = await api.verification.verifyReading(readingId);
      setVerificationResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Search Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="size-6 text-emerald-400" />
              Verify Data Integrity
            </CardTitle>
            <p className="text-slate-400 text-sm">
              Enter a reading ID to cryptographically verify its authenticity without database access
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Enter reading ID (e.g., reading_1234567890)"
                value={readingId}
                onChange={(e) => setReadingId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button
                onClick={handleVerify}
                disabled={isVerifying}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Shield className="size-4" />
                    </motion.div>
                    Verifying...
                  </span>
                ) : (
                  'Verify'
                )}
              </Button>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <XCircle className="size-5 text-red-400 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-blue-400 mt-0.5"></div>
              <p className="text-blue-300 text-sm">
                This verification is completely trustless - it recomputes the hash, validates the Merkle proof path, 
                and confirms witness signatures without querying the farmer's database.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Verification Result */}
      <AnimatePresence mode="wait">
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Status Banner */}
            <Card className={`border-2 ${
              verificationResult.consistent 
                ? 'bg-emerald-500/10 border-emerald-500/40' 
                : 'bg-red-500/10 border-red-500/40'
            } backdrop-blur-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {verificationResult.consistent ? (
                      <div className="relative">
                        <CheckCircle2 className="size-12 text-emerald-400" />
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-emerald-400/30 rounded-full blur-xl"
                        />
                      </div>
                    ) : (
                      <XCircle className="size-12 text-red-400" />
                    )}
                    <div>
                      <h3 className={`text-2xl ${
                        verificationResult.consistent ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {verificationResult.consistent ? 'Data Verified ✓' : 'Tampered Data Detected!'}
                      </h3>
                      {verificationResult.verificationTime && (
                        <p className="text-slate-400">
                          Verified in {verificationResult.verificationTime}ms
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={verificationResult.consistent 
                      ? 'border-emerald-500/40 text-emerald-400 text-lg px-4 py-2' 
                      : 'border-red-500/40 text-red-400 text-lg px-4 py-2'}
                  >
                    {verificationResult.validSigs}/{verificationResult.needed} Witnesses
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Reading Data */}
            {verificationResult.readingData && (
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Reading Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(verificationResult.readingData).map(([key, value]: any) => (
                      <div key={key} className="space-y-1">
                        <p className="text-slate-400 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-white font-mono text-sm break-all">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Merkle Proof */}
            {verificationResult.merkleProof && (
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Hash className="size-5 text-purple-400" />
                    Merkle Proof Path
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {verificationResult.merkleProof.map((proof: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                      >
                        <Badge variant="outline" className="border-purple-500/40 text-purple-400">
                          Level {index + 1}
                        </Badge>
                        <Badge variant="outline" className="border-slate-600 text-slate-400">
                          {proof.position}
                        </Badge>
                        <p className="text-white font-mono text-xs flex-1 truncate">{proof.hash}</p>
                      </motion.div>
                    ))}
                    {verificationResult.merkleRoot && (
                      <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <p className="text-slate-400 text-sm mb-2">Merkle Root</p>
                        <p className="text-purple-400 font-mono text-sm break-all">{verificationResult.merkleRoot}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Witness Signatures */}
            {verificationResult.witnesses && (
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="size-5 text-amber-400" />
                    Witness Signatures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {verificationResult.witnesses.map((witness: any, index: number) => (
                      <motion.div
                        key={witness.id || index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                      >
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <Shield className="size-5 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white">{witness.name}</p>
                          {witness.timestamp && (
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="size-3 text-slate-400" />
                              <p className="text-slate-400 text-xs">
                                {new Date(witness.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          )}
                        </div>
                        <CheckCircle2 className="size-5 text-emerald-400" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
