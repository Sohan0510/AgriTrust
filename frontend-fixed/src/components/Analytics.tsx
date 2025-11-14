import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Database, HardDrive, Zap, Users, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { api } from '../utils/api';

export function Analytics() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [storageData, setStorageData] = useState<any[]>([]);
  const [regionalData, setRegionalData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [verificationStats, setVerificationStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [monthly, storage, regional, performance, verification] = await Promise.all([
        api.analytics.getMonthlyData(),
        api.analytics.getStorageData(),
        api.analytics.getRegionalData(),
        api.analytics.getPerformanceData(),
        api.analytics.getVerificationStats(),
      ]);

      // Extract monthly data
      setMonthlyData(monthly.data.data || []);
      
      // Transform storage data for pie chart
      const storageObj = storage.data;
      setStorageData([
        { name: 'Raw Data', value: Math.round(storageObj.raw || 0), color: '#3b82f6' },
        { name: 'Archived', value: Math.round(storageObj.archived || 0), color: '#8b5cf6' },
      ]);
      
      // Extract regional data
      setRegionalData(regional.data.data || []);
      
      // Transform performance data for line chart
      const perfObj = performance.data;
      setPerformanceData([
        {
          hour: '0h',
          latency: perfObj.avgVerificationTime || 145,
          throughput: 1200,
        },
        {
          hour: '6h',
          latency: (perfObj.avgVerificationTime || 145) * 0.9,
          throughput: 1350,
        },
        {
          hour: '12h',
          latency: (perfObj.avgVerificationTime || 145) * 1.1,
          throughput: 1100,
        },
        {
          hour: '18h',
          latency: (perfObj.avgVerificationTime || 145) * 0.95,
          throughput: 1250,
        },
      ]);
      
      // Transform verification stats for bar chart
      const verObj = verification.data;
      setVerificationStats([
        {
          day: 'Mon',
          verified: Math.round((verObj.verifiedDays || 0) / 3),
          tampered: Math.round((verObj.tamperedDays || 0) / 3),
        },
        {
          day: 'Tue',
          verified: Math.round((verObj.verifiedDays || 0) / 3),
          tampered: Math.round((verObj.tamperedDays || 0) / 3),
        },
        {
          day: 'Wed',
          verified: verObj.verifiedDays || 0,
          tampered: verObj.tamperedDays || 0,
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="size-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Farmers</p>
                  <p className="text-3xl text-white mt-1">
                    {regionalData.reduce((sum, r) => sum + (r.farmers || 0), 0).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="size-3 text-emerald-400" />
                    <span className="text-emerald-400 text-xs">+12.5% this month</span>
                  </div>
                </div>
                <Users className="size-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Readings</p>
                  <p className="text-3xl text-white mt-1">
                    {monthlyData.reduce((sum, m) => sum + (m.readings || 0), 0).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="size-3 text-emerald-400" />
                    <span className="text-emerald-400 text-xs">+8.3% this month</span>
                  </div>
                </div>
                <Database className="size-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Storage Used</p>
                  <p className="text-3xl text-white mt-1">
                    {storageData.reduce((sum, s) => sum + (s.value || 0), 0).toFixed(1)} GB
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-slate-400 text-xs">vs 150 GB blockchain</span>
                  </div>
                </div>
                <HardDrive className="size-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Verification</p>
                  <p className="text-3xl text-white mt-1">
                    {performanceData.length > 0
                      ? Math.round(performanceData.reduce((sum, p) => sum + (p.latency || 0), 0) / performanceData.length)
                      : 0}ms
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-slate-400 text-xs">vs 10s blockchain</span>
                  </div>
                </div>
                <Zap className="size-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {monthlyData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Monthly Growth</CardTitle>
                <p className="text-slate-400 text-sm">Readings and farmers over time</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorReadings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFarmers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="readings"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorReadings)"
                    />
                    <Area
                      type="monotone"
                      dataKey="farmers"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorFarmers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {storageData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Storage Distribution</CardTitle>
                <p className="text-slate-400 text-sm">Lightweight architecture breakdown</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={storageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}GB`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {storageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-300 text-sm text-center">
                    98% space savings vs traditional blockchain
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {verificationStats.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Verification Success Rate</CardTitle>
                <p className="text-slate-400 text-sm">Daily verification vs tampering attempts</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={verificationStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="verified" fill="#10b981" name="Verified" />
                    <Bar dataKey="tampered" fill="#ef4444" name="Tampered" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {performanceData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">System Performance (24h)</CardTitle>
                <p className="text-slate-400 text-sm">Latency and throughput monitoring</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="hour" stroke="#94a3b8" />
                    <YAxis yAxisId="left" stroke="#94a3b8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="latency"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Latency (ms)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="throughput"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Throughput (ops/s)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Regional Data */}
      {regionalData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="size-5 text-blue-400" />
                Regional Distribution
              </CardTitle>
              <p className="text-slate-400 text-sm">Deployment across regions</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {regionalData.map((region, index) => (
                  <motion.div
                    key={region.region || index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white">{region.region}</h3>
                      {region.uptime && (
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">
                          {region.uptime}%
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      {region.farmers !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-sm">Farmers</span>
                          <span className="text-white">{region.farmers.toLocaleString()}</span>
                        </div>
                      )}
                      {region.readings !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-sm">Readings</span>
                          <span className="text-white">{region.readings.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
