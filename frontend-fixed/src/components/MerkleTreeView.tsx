import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Hash, GitBranch, Database, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { api } from '../utils/api';

export function MerkleTreeView() {
  const [tree, setTree] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerkleTree();
  }, []);

  const fetchMerkleTree = async () => {
    try {
      const response = await api.merkle.getTree();
      setTree(response.data);
    } catch (error) {
      console.error('Failed to fetch Merkle tree:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="size-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Merkle tree...</p>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <GitBranch className="size-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No Merkle tree data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <GitBranch className="size-6 text-purple-400" />
              Merkle Tree Visualization
            </CardTitle>
            <p className="text-slate-400 text-sm">
              Daily batch of IoT readings organized into a cryptographic hash tree
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Database className="size-4 text-blue-400" />
                <span className="text-slate-400 text-sm">{tree.leafCount || 0} Leaf Readings</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="size-4 text-purple-400" />
                <span className="text-slate-400 text-sm">{tree.totalNodes || 0} Total Nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span className="text-slate-400 text-sm">{tree.levels || 0} Tree Levels</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tree Visualization */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Root */}
              {tree.root && (
                <div className="flex justify-center mb-8">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedNode(tree.root)}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      selectedNode?.id === tree.root.id
                        ? 'bg-purple-500/20 border-purple-400'
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Badge variant="outline" className="border-purple-500/40 text-purple-400">
                        Merkle Root
                      </Badge>
                      <Hash className="size-8 text-purple-400" />
                      <p className="text-white font-mono text-sm">{tree.root.hash?.substring(0, 16)}...</p>
                    </div>
                  </motion.button>
                </div>
              )}

              {/* Tree Levels */}
              {tree.levels && tree.nodes && (
                <div className="space-y-6">
                  {Object.entries(tree.nodes).map(([level, nodes]: any) => (
                    <div key={level}>
                      <p className="text-slate-400 text-sm mb-3">Level {level}</p>
                      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${nodes.length}, 1fr)` }}>
                        {nodes.map((node: any, index: number) => (
                          <motion.button
                            key={node.id || index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setSelectedNode(node)}
                            className={`p-3 rounded-lg border transition-all ${
                              selectedNode?.id === node.id
                                ? 'bg-emerald-500/20 border-emerald-400'
                                : 'bg-slate-800 border-slate-700'
                            }`}
                          >
                            <Hash className="size-5 text-emerald-400 mx-auto mb-1" />
                            <p className="text-white font-mono text-xs truncate">
                              {node.hash?.substring(0, 12)}...
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Node Details */}
        <div>
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-white">Node Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Node ID</p>
                    <p className="text-white font-mono">{selectedNode.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Hash</p>
                    <p className="text-emerald-400 font-mono text-sm break-all">
                      {selectedNode.hash}
                    </p>
                  </div>

                  {selectedNode.data && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Data</p>
                      <pre className="text-white text-xs bg-slate-800 p-3 rounded overflow-auto">
                        {JSON.stringify(selectedNode.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div>
                    <p className="text-slate-400 text-sm mb-2">Type</p>
                    <Badge variant="outline" className="border-purple-500/40 text-purple-400">
                      {selectedNode.type || 'Node'}
                    </Badge>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <Hash className="size-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">
                    Click any node to view details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
