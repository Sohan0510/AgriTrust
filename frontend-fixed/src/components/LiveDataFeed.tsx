import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Thermometer, Droplets, Wind, Zap, CheckCircle2, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { api } from '../utils/api';

export function LiveDataFeed() {
  const [readings, setReadings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    ingestedPerSecond: 0,
    hashedPerSecond: 0,
    batchProgress: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [sensorDistribution, setSensorDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchLiveData, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchInitialData = async () => {
    try {
      const [statsRes, distributionRes] = await Promise.all([
        api.readings.getStats(),
        api.readings.getSensorDistribution(),
      ]);
      
      // Extract stats data and handle API response format
      setStats({
        totalToday: statsRes.data.readingsToday || 0,
        ingestedPerSecond: Math.floor((statsRes.data.totalReadings || 0) / 86400),
        hashedPerSecond: Math.floor((statsRes.data.totalReadings || 0) / 86400),
        batchProgress: 65,
      });
      
      // Extract sensor distribution data
      const distData = distributionRes.data.data || [];
      setSensorDistribution(distData.map((d: any, idx: number) => ({
        type: d.sensor,
        name: d.sensor,
        percentage: Math.round((d.count / (distributionRes.data.total || 1)) * 100),
      })));
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveData = async () => {
    try {
      const response = await api.readings.getLive(15);
      // Extract readings array from response
      const readingsArray = response.data.readings || [];
      setReadings(readingsArray.map((r: any) => ({
        id: r.id,
        sensorType: r.payload?.sensor || 'unknown',
        sensorName: r.payload?.sensor || 'Unknown Sensor',
        farmerId: r.farmerId,
        timestamp: r.timestamp,
        hash: r.leafHash,
        value: r.payload?.value || 0,
        unit: r.payload?.unit || '',
      })));
      
      // Update chart data
      setChartData(prev => {
        const newData = [...prev, { time: Date.now(), readings: readingsArray.length }];
        return newData.slice(-20);
      });
    } catch (error) {
      console.error('Failed to fetch live data:', error);
    }
  };

  const getSensorIcon = (sensorType: string) => {
    switch (sensorType?.toLowerCase()) {
      case 'temperature':
      case 'temp':
        return Thermometer;
      case 'humidity':
      case 'moisture':
        return Droplets;
      case 'wind':
        return Wind;
      default:
        return Activity;
    }
  };

  const getSensorColor = (sensorType: string) => {
    switch (sensorType?.toLowerCase()) {
      case 'temperature':
      case 'temp':
        return 'text-red-400';
      case 'humidity':
        return 'text-blue-400';
      case 'moisture':
        return 'text-emerald-400';
      case 'wind':
        return 'text-cyan-400';
      default:
        return 'text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="size-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading live feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Readings Today</p>
                  <p className="text-3xl text-white">{stats.totalToday.toLocaleString()}</p>
                </div>
                <Activity className="size-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Ingested/sec</p>
                  <p className="text-3xl text-blue-400">{stats.ingestedPerSecond}</p>
                </div>
                <Zap className="size-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Hashed/sec</p>
                  <p className="text-3xl text-purple-400">{stats.hashedPerSecond}</p>
                </div>
                <Hash className="size-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">Batch Progress</p>
                  <p className="text-white">{stats.batchProgress.toFixed(0)}%</p>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${stats.batchProgress}%` }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-blue-400"
                  />
                </div>
                <p className="text-slate-500 text-xs mt-2">
                  Next Merkle batch in {Math.floor((100 - stats.batchProgress) / 2)}m
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Feed */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Live IoT Data Stream</CardTitle>
                  <p className="text-slate-400 text-sm">Real-time sensor readings being ingested and hashed</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-400 text-sm">Live</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {readings.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="size-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No live readings available</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {readings.map((reading) => {
                    const Icon = getSensorIcon(reading.sensorType);
                    const color = getSensorColor(reading.sensorType);
                    
                    return (
                      <motion.div
                        key={reading.id}
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-2 rounded-lg bg-slate-700/50">
                            <Icon className={`size-5 ${color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white">{reading.sensorName || reading.sensorType}</p>
                              <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                                {reading.farmerId}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-slate-400">
                                {new Date(reading.timestamp).toLocaleTimeString()}
                              </span>
                              {reading.hash && (
                                <span className="text-slate-500 font-mono text-xs truncate max-w-[200px]">
                                  {reading.hash}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl ${color}`}>
                              {reading.value}
                              <span className="text-sm ml-1">{reading.unit}</span>
                            </p>
                          </div>
                          <CheckCircle2 className="size-5 text-emerald-400" />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Real-time Chart & Info */}
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Throughput</CardTitle>
              <p className="text-slate-400 text-sm">Readings per second</p>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={chartData}>
                    <Line 
                      type="monotone" 
                      dataKey="readings" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[150px] flex items-center justify-center text-slate-400 text-sm">
                  Waiting for data...
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Data Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-blue-500/10">
                    <div className="size-2 rounded-full bg-blue-400 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">1. Ingest JSON</p>
                    <p className="text-slate-500 text-xs">From IoT devices</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-purple-500/10">
                    <div className="size-2 rounded-full bg-purple-400 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">2. Hash SHA-256</p>
                    <p className="text-slate-500 text-xs">Cryptographic fingerprint</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-emerald-500/10">
                    <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">3. Store + Queue</p>
                    <p className="text-slate-500 text-xs">MongoDB + batch prep</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-amber-500/10">
                    <div className="size-2 rounded-full bg-amber-400 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">4. Merkle Build</p>
                    <p className="text-slate-500 text-xs">Hourly batches</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {sensorDistribution.length > 0 && (
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Sensor Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sensorDistribution.map((sensor) => {
                  const Icon = getSensorIcon(sensor.type);
                  const color = getSensorColor(sensor.type);
                  
                  return (
                    <div key={sensor.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`size-4 ${color}`} />
                          <span className="text-slate-400 text-sm">{sensor.name}</span>
                        </div>
                        <span className="text-white text-sm">{sensor.percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${sensor.percentage}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-emerald-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
