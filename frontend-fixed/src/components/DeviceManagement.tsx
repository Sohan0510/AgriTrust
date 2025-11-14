import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Loader, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { api } from '../utils/api';

interface Device {
  _id: string;
  deviceId: string;
  label?: string;
  meta?: any;
  createdAt?: string;
}

export function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ deviceId: '', label: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.devices.list();
      setDevices(response.data.devices || []);
    } catch (err: any) {
      console.error('Failed to fetch devices:', err);
      setError(err.response?.data?.error || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deviceId.trim()) {
      setError('Device ID is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await api.devices.create({
        deviceId: formData.deviceId,
        label: formData.label || undefined,
      });

      setDevices([...devices, response.data.device]);
      setFormData({ deviceId: '', label: '' });
      setShowAddForm(false);
      setSuccess('Device added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to add device:', err);
      setError(err.response?.data?.error || 'Failed to add device');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!window.confirm(`Are you sure you want to delete device ${deviceId}?`)) {
      return;
    }

    try {
      setDeletingId(deviceId);
      setError(null);
      
      await api.devices.delete(deviceId);
      setDevices(devices.filter(d => d._id !== deviceId && d.deviceId !== deviceId));
      setSuccess('Device deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to delete device:', err);
      setError(err.response?.data?.error || 'Failed to delete device');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="size-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Device Management</h2>
          <p className="text-slate-400 mt-1">Add and manage your IoT sensor devices</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="size-4 mr-2" />
          Add Device
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3"
        >
          <CheckCircle2 className="size-5 text-emerald-400" />
          <p className="text-emerald-300">{success}</p>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertCircle className="size-5 text-red-400" />
          <p className="text-red-300">{error}</p>
        </motion.div>
      )}

      {/* Add Device Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-slate-900/50 border-emerald-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Add New Device</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddDevice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Device ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SENSOR-001"
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Device Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Field A Sensor"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader className="size-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Device'
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ deviceId: '', label: '' });
                      setError(null);
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Devices List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Devices ({devices.length})
        </h3>

        {devices.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <p className="text-slate-400">No devices registered yet</p>
              <p className="text-slate-500 text-sm mt-2">
                Add your first IoT sensor device to start collecting data
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device, index) => (
              <motion.div
                key={device._id || device.deviceId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-slate-900/50 border-slate-700/50 hover:border-emerald-500/30 backdrop-blur-sm transition-colors">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Device ID */}
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Device ID
                        </p>
                        <p className="text-lg font-mono text-emerald-400 mt-1">
                          {device.deviceId}
                        </p>
                      </div>

                      {/* Label */}
                      {device.label && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Label
                          </p>
                          <p className="text-white mt-1">{device.label}</p>
                        </div>
                      )}

                      {/* Created Date */}
                      {device.createdAt && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Added
                          </p>
                          <p className="text-slate-400 text-sm mt-1">
                            {new Date(device.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {/* Meta Info */}
                      {device.meta && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                            Metadata
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(device.meta).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Delete Button */}
                      <div className="pt-4 border-t border-slate-700">
                        <Button
                          onClick={() => handleDeleteDevice(device.deviceId || device._id)}
                          disabled={deletingId === (device.deviceId || device._id)}
                          className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30"
                        >
                          {deletingId === (device.deviceId || device._id) ? (
                            <>
                              <Loader className="size-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="size-4 mr-2" />
                              Delete Device
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { CheckCircle2 } from 'lucide-react';
