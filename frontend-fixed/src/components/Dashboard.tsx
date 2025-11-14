import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, AlertTriangle, CheckCircle2, Database, Hash, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { api } from '../utils/api';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalReadings: 0,
    verifiedDays: 0,
    activeWitnesses: 0,
    dataIntegrity: 0,
  });
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [recentAnchors, setRecentAnchors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, timelineRes, anchorsRes] = await Promise.all([
        api.dashboard.getStats(30),
        api.dashboard.getIntegrityTimeline(30),
        api.dashboard.getRecentAnchors(5),
      ]);

      setStats(statsRes.data);
      setTimelineData(timelineRes.data);
      setRecentAnchors(anchorsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Readings (30d)',
      value: stats.totalReadings.toLocaleString(),
      icon: Database,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Verified Days',
      value: `${stats.verifiedDays}/30`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Active Witnesses',
      value: stats.activeWitnesses,
      icon: Shield,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Data Integrity',
      value: `${stats.dataIntegrity.toFixed(1)}%`,
      icon: FileCheck,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="size-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-slate-900/50 border ${stat.borderColor} backdrop-blur-sm`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-slate-400 text-sm">{stat.title}</p>
                      <p className={`text-3xl ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`size-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Chart */}
      {timelineData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">30-Day Integrity Timeline</CardTitle>
              <p className="text-slate-400 text-sm">Daily verification status and reading volume</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorReadings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="readings"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorReadings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Daily Status Grid */}
      {timelineData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Daily Verification Status</CardTitle>
              <p className="text-slate-400 text-sm">Click any day for detailed verification report</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-2">
                {timelineData.map((day, index) => (
                  <motion.button
                    key={day.date}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ scale: 1.1 }}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 transition-all ${
                      day.verified
                        ? 'bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-red-500/20 border border-red-500/40 hover:bg-red-500/30'
                    }`}
                    title={`${day.date}: ${day.verified ? 'Verified' : 'Tampered'}`}
                  >
                    {day.verified ? (
                      <CheckCircle2 className="size-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="size-4 text-red-400" />
                    )}
                    <span className="text-xs text-slate-400 mt-1">
                      {new Date(day.date).getDate()}
                    </span>
                  </motion.button>
                ))}
              </div>
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded bg-emerald-500/20 border border-emerald-500/40" />
                  <span className="text-slate-400 text-sm">Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded bg-red-500/20 border border-red-500/40" />
                  <span className="text-slate-400 text-sm">Tampered</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Activity */}
      {recentAnchors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Recent Merkle Anchors</CardTitle>
              <p className="text-slate-400 text-sm">Latest daily roots signed by witness network</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAnchors.map((anchor, index) => (
                  <motion.div
                    key={anchor.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${anchor.verified ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        <Hash className={`size-5 ${anchor.verified ? 'text-emerald-400' : 'text-red-400'}`} />
                      </div>
                      <div>
                        <p className="text-white">{anchor.date}</p>
                        <p className="text-slate-400 text-sm">{anchor.readings} readings • {anchor.witnessCount} witnesses</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={anchor.verified ? 'border-emerald-500/40 text-emerald-400' : 'border-red-500/40 text-red-400'}
                      >
                        {anchor.verified ? 'Verified' : 'Tampered'}
                      </Badge>
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
