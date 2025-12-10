import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, AlertTriangle, CheckCircle2, TrendingUp, Eye, Shield, Zap, Lock, FileText, X, Calendar, Hash, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { api } from '../utils/api';

interface Farmer {
  _id: string;
  name: string;
  email: string;
  trustScore: number;
  tamperedCount: number;
  lastTamperDate?: string;
  lastTamperType?: string;
  readingsCount: number;
  devicesCount: number;
  lastActive?: string;
}

interface AdminStats {
  totalFarmers: number;
  totalReadings: number;
  totalDevices: number;
  totalAnchors: number;
  verifiedDays: number;
  tamperedDays: number;
  farmersWithTamper: number;
  dataIntegrity: number;
}

interface VerificationResult {
  farmerId: string;
  deviceId?: string;
  verified: boolean;
  tampered: boolean;
  status: string;
  reason?: string;
  details?: any;
}

export function AdminDashboard() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'tampered' | 'clean'>('all');
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, VerificationResult>>({});
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [fullReportData, setFullReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('[AdminDashboard] Fetching farmers data...');
      const farmersRes = await api.dashboard.getFarmers();
      console.log('[AdminDashboard] Farmers response:', farmersRes);
      
      console.log('[AdminDashboard] Fetching admin stats...');
      const statsRes = await api.dashboard.getAdminStats();
      console.log('[AdminDashboard] Stats response:', statsRes);

      setFarmers(farmersRes.data.farmers || []);
      setStats(statsRes.data || {});
      console.log('[AdminDashboard] Data loaded successfully');
    } catch (error: any) {
      console.error('[AdminDashboard] Failed to fetch admin data:', error);
      console.error('[AdminDashboard] Error response:', error.response?.data);
      console.error('[AdminDashboard] Error status:', error.response?.status);
      setFarmers([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyFarmerData = async (farmer: any) => {
    if (!farmer) return;
    try {
      setVerifying(farmer._id);
      console.log(`[AdminDashboard] Verifying data for farmer: ${farmer.name}`);
      const response = await api.verification.verifyFarmerWindow(farmer._id, 21);
      console.log('[AdminDashboard] Verification response:', response.data);
      
      setVerificationResults(prev => ({
        ...prev,
        [farmer._id]: {
          farmerId: farmer._id,
          verified: response.data.summary.tamperedDays === 0,
          tampered: response.data.summary.tamperedDays > 0,
          status: response.data.summary.tamperedDays > 0 ? 'TAMPERED' : 'VERIFIED',
          details: response.data
        }
      }));
    } catch (error: any) {
      console.error('Verification failed:', error);
      setVerificationResults(prev => ({
        ...prev,
        [farmer._id]: {
          farmerId: farmer._id,
          verified: false,
          tampered: true,
          status: 'ERROR',
          reason: error.response?.data?.error || 'Verification failed'
        }
      }));
    } finally {
      setVerifying(null);
    }
  };

  const viewFullReport = async (farmer: Farmer) => {
    try {
      setLoadingReport(true);
      setShowFullReport(true);
      
      // Fetch detailed farmer data
      const response = await api.dashboard.getFarmerDetails(farmer._id);
      console.log('[AdminDashboard] Full report data:', response.data);
      
      // Also get verification result if not already done
      let verifyData = verificationResults[farmer._id]?.details;
      if (!verifyData) {
        try {
          const verifyResponse = await api.verification.verifyFarmerWindow(farmer._id, 21);
          verifyData = verifyResponse.data;
        } catch (e) {
          console.error('Could not fetch verification data:', e);
        }
      }
      
      setFullReportData({
        farmer: response.data.farmer,
        trustScore: response.data.trustScore,
        auditRecords: response.data.auditRecords || [],
        recentReadings: response.data.recentReadings || [],
        devices: response.data.devices || [],
        anchorsCount: response.data.anchorsCount || 0,
        readingsCount: response.data.readingsCount || 0,
        verification: verifyData
      });
    } catch (error: any) {
      console.error('Failed to fetch full report:', error);
      setFullReportData({ error: 'Failed to load report data' });
    } finally {
      setLoadingReport(false);
    }
  };

  const filteredFarmers = farmers.filter(f => {
    if (filter === 'tampered') return f.tamperedCount > 0;
    if (filter === 'clean') return f.tamperedCount === 0;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="size-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading farmer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-slate-900/50 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Farmers</p>
                    <p className="text-3xl text-blue-400">{stats.totalFarmers}</p>
                  </div>
                  <Users className="size-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-slate-900/50 border-emerald-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Readings</p>
                    <p className="text-3xl text-emerald-400">{stats.totalReadings.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="size-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-slate-900/50 border-amber-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Farmers with Issues</p>
                    <p className="text-3xl text-amber-400">{stats.farmersWithTamper}</p>
                  </div>
                  <AlertTriangle className="size-8 text-amber-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Data Integrity</p>
                    <p className="text-3xl text-purple-400">{stats.dataIntegrity}%</p>
                  </div>
                  <Shield className="size-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}
        >
          All Farmers ({farmers.length})
        </Button>
        <Button
          onClick={() => setFilter('clean')}
          className={filter === 'clean' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}
        >
          Clean ({farmers.filter(f => f.tamperedCount === 0).length})
        </Button>
        <Button
          onClick={() => setFilter('tampered')}
          className={filter === 'tampered' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}
        >
          Issues ({farmers.filter(f => f.tamperedCount > 0).length})
        </Button>
      </div>

      {/* Farmers List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="size-6 text-emerald-400" />
              Registered Farmers
            </CardTitle>
            <p className="text-slate-400 text-sm">
              Monitor all farmers' data integrity and performance
            </p>
          </CardHeader>
          <CardContent>
            {filteredFarmers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No farmers found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFarmers.map((farmer) => (
                  <motion.div
                    key={farmer._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-medium">{farmer.name}</h3>
                          <span className="text-slate-500 text-sm">{farmer.email}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-400">
                            Trust Score: <span className="text-emerald-400 font-semibold">{farmer.trustScore}%</span>
                          </span>
                          <span className="text-slate-400">
                            Readings: <span className="text-blue-400 font-semibold">{farmer.readingsCount}</span>
                          </span>
                          <span className="text-slate-400">
                            Devices: <span className="text-purple-400 font-semibold">{farmer.devicesCount}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {farmer.tamperedCount > 0 && (
                          <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                            {farmer.tamperedCount} Issues
                          </Badge>
                        )}
                        {farmer.tamperedCount === 0 && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            Clean
                          </Badge>
                        )}
                        <Button
                          onClick={() => verifyFarmerData(farmer)}
                          disabled={verifying === farmer._id}
                          size="sm"
                          className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                        >
                          {verifying === farmer._id ? (
                            <>
                              <Zap className="size-4 mr-1 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Lock className="size-4 mr-1" />
                              Verify
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => setSelectedFarmer(farmer)}
                          size="sm"
                          className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                        >
                          <Eye className="size-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Farmer Details Modal */}
      {selectedFarmer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedFarmer(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-white">{selectedFarmer.name} - Details</CardTitle>
                <button
                  onClick={() => setSelectedFarmer(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Email</p>
                    <p className="text-white font-medium">{selectedFarmer.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Trust Score</p>
                    <p className="text-emerald-400 font-medium text-lg">{selectedFarmer.trustScore}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Readings</p>
                    <p className="text-blue-400 font-medium">{selectedFarmer.readingsCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">IoT Devices</p>
                    <p className="text-purple-400 font-medium">{selectedFarmer.devicesCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Issues Found</p>
                    <p className="text-amber-400 font-medium">{selectedFarmer.tamperedCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Last Active</p>
                    <p className="text-slate-300 font-medium">
                      {selectedFarmer.lastActive
                        ? new Date(selectedFarmer.lastActive).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>

                {selectedFarmer.tamperedCount > 0 && (
                  <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 font-medium mb-2">Tampering Alerts</p>
                    <p className="text-red-300 text-sm">
                      {selectedFarmer.tamperedCount} day(s) detected with data inconsistencies
                      {selectedFarmer.lastTamperDate && (
                        <> - Last occurrence: {selectedFarmer.lastTamperDate}</>
                      )}
                    </p>
                  </div>
                )}

                {verificationResults[selectedFarmer._id] && (
                  <div className={`mt-4 p-4 rounded-lg border ${
                    verificationResults[selectedFarmer._id].verified 
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      {verificationResults[selectedFarmer._id].verified ? (
                        <>
                          <CheckCircle2 className="size-5 text-emerald-400" />
                          <p className="text-emerald-400 font-medium">Data Verified - No Tampering Detected</p>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="size-5 text-red-400" />
                          <p className="text-red-400 font-medium">Data Tampering Detected</p>
                        </>
                      )}
                    </div>
                    {verificationResults[selectedFarmer._id].details && (
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-800/50 p-2 rounded">
                            <p className="text-slate-400 text-xs">Verified Days</p>
                            <p className="text-emerald-400 font-semibold">{verificationResults[selectedFarmer._id].details.summary.verifiedDays}</p>
                          </div>
                          <div className="bg-slate-800/50 p-2 rounded">
                            <p className="text-slate-400 text-xs">Tampered Days</p>
                            <p className="text-red-400 font-semibold">{verificationResults[selectedFarmer._id].details.summary.tamperedDays}</p>
                          </div>
                          <div className="bg-slate-800/50 p-2 rounded col-span-2">
                            <p className="text-slate-400 text-xs">Integrity Score</p>
                            <p className="text-blue-400 font-semibold">{verificationResults[selectedFarmer._id].details.summary.integrityPercentage}%</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-700 flex gap-2">
                  <Button
                    onClick={() => setSelectedFarmer(null)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => viewFullReport(selectedFarmer)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <FileText className="size-4 mr-2" />
                    View Full Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Full Report Modal */}
      {showFullReport && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setShowFullReport(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-slate-900 z-10 border-b border-slate-700">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="size-5 text-emerald-400" />
                  Full Integrity Report
                  {fullReportData?.farmer && (
                    <Badge variant="outline" className="ml-2 border-slate-600 text-slate-300">
                      {fullReportData.farmer.name}
                    </Badge>
                  )}
                </CardTitle>
                <button
                  onClick={() => setShowFullReport(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  title="Close report"
                  aria-label="Close report"
                >
                  <X className="size-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {loadingReport ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="size-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-slate-400">Loading report data...</p>
                    </div>
                  </div>
                ) : fullReportData?.error ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="size-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400">{fullReportData.error}</p>
                  </div>
                ) : fullReportData ? (
                  <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <p className="text-slate-400 text-xs mb-1">Trust Score</p>
                        <p className={`text-2xl font-bold ${fullReportData.trustScore > 80 ? 'text-emerald-400' : fullReportData.trustScore > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                          {fullReportData.trustScore?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <p className="text-slate-400 text-xs mb-1">Total Readings</p>
                        <p className="text-2xl font-bold text-blue-400">{fullReportData.readingsCount}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <p className="text-slate-400 text-xs mb-1">Verified Anchors</p>
                        <p className="text-2xl font-bold text-purple-400">{fullReportData.anchorsCount}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <p className="text-slate-400 text-xs mb-1">IoT Devices</p>
                        <p className="text-2xl font-bold text-cyan-400">{fullReportData.devices?.length || 0}</p>
                      </div>
                    </div>

                    {/* Verification Summary */}
                    {fullReportData.verification && (
                      <div className={`rounded-lg p-4 border ${
                        fullReportData.verification.summary?.tamperedDays === 0
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-red-500/10 border-red-500/30'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          {fullReportData.verification.summary?.tamperedDays === 0 ? (
                            <CheckCircle2 className="size-6 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="size-6 text-red-400" />
                          )}
                          <h3 className={`text-lg font-semibold ${
                            fullReportData.verification.summary?.tamperedDays === 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {fullReportData.verification.summary?.tamperedDays === 0 
                              ? '21-Day Integrity Check Passed' 
                              : 'Data Integrity Issues Detected'}
                          </h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-slate-400 text-xs">Verified Days</p>
                            <p className="text-emerald-400 text-xl font-bold">
                              {fullReportData.verification.summary?.verifiedDays || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Tampered Days</p>
                            <p className="text-red-400 text-xl font-bold">
                              {fullReportData.verification.summary?.tamperedDays || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Integrity Score</p>
                            <p className="text-blue-400 text-xl font-bold">
                              {fullReportData.verification.summary?.integrityPercentage || 0}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Daily Audit Records */}
                    {fullReportData.auditRecords && fullReportData.auditRecords.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Calendar className="size-4 text-purple-400" />
                          Daily Audit Records (Last 30 Days)
                        </h3>
                        <div className="bg-slate-800/30 rounded-lg border border-slate-700 overflow-hidden">
                          <div className="max-h-60 overflow-y-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-slate-800 sticky top-0">
                                <tr>
                                  <th className="text-left text-slate-400 p-3">Date</th>
                                  <th className="text-left text-slate-400 p-3">Status</th>
                                  <th className="text-left text-slate-400 p-3">Readings</th>
                                  <th className="text-left text-slate-400 p-3">Merkle Root</th>
                                </tr>
                              </thead>
                              <tbody>
                                {fullReportData.auditRecords.map((record: any, idx: number) => (
                                  <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-800/50">
                                    <td className="p-3 text-white">{record.dayKey}</td>
                                    <td className="p-3">
                                      <Badge 
                                        variant="outline" 
                                        className={
                                          record.status === 'kept_verified' 
                                            ? 'border-emerald-500/40 text-emerald-400'
                                            : record.status === 'kept_tampered' || record.status === 'global_tamper'
                                            ? 'border-red-500/40 text-red-400'
                                            : 'border-slate-500/40 text-slate-400'
                                        }
                                      >
                                        {record.status?.replace(/_/g, ' ') || 'unknown'}
                                      </Badge>
                                    </td>
                                    <td className="p-3 text-blue-400">{record.readingCount || 0}</td>
                                    <td className="p-3 font-mono text-xs text-slate-500 truncate max-w-[200px]">
                                      {record.computedRoot || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recent Readings */}
                    {fullReportData.recentReadings && fullReportData.recentReadings.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Activity className="size-4 text-blue-400" />
                          Recent Sensor Readings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {fullReportData.recentReadings.slice(0, 6).map((reading: any, idx: number) => (
                            <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                              <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="border-blue-500/40 text-blue-400">
                                  {reading.payload?.sensor || 'sensor'}
                                </Badge>
                                <span className="text-slate-500 text-xs">
                                  {new Date(reading.ts).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-white text-lg font-semibold">
                                {reading.payload?.value} {reading.payload?.unit || ''}
                              </p>
                              <p className="text-slate-500 text-xs mt-1 font-mono truncate">
                                Day: {reading.dayKey}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Devices */}
                    {fullReportData.devices && fullReportData.devices.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Shield className="size-4 text-cyan-400" />
                          Registered IoT Devices
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {fullReportData.devices.map((device: any, idx: number) => (
                            <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-cyan-500/10">
                                <Hash className="size-5 text-cyan-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{device.name || device.deviceId}</p>
                                <p className="text-slate-500 text-xs font-mono">{device.deviceId}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}

                <div className="pt-4 border-t border-slate-700">
                  <Button
                    onClick={() => setShowFullReport(false)}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Close Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
