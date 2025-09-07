import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Package, 
  Scissors, 
  RotateCcw, 
  TrendingUp, 
  DollarSign,
  Filter,
  Search,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { getContractAddress } from '@/lib/contracts/config';

export default function ActivityLogs() {
  const { 
    logs, 
    getFormattedLogs, 
    getLogsByType, 
    getLogsByStatus, 
    clearLogs 
  } = useActivityLogs();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const formattedLogs = getFormattedLogs();

  // Filter logs based on search and filters
  const filteredLogs = useMemo(() => {
    let filtered = formattedLogs;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(log => log.type === selectedType);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(log => log.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.txHash && log.txHash.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [formattedLogs, selectedType, selectedStatus, searchTerm]);

  // Get activity type icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'wrap':
        return <Package className="w-4 h-4" />;
      case 'split':
        return <Scissors className="w-4 h-4" />;
      case 'combine':
        return <RotateCcw className="w-4 h-4" />;
      case 'stake':
        return <TrendingUp className="w-4 h-4" />;
      case 'unstake':
        return <TrendingUp className="w-4 h-4" />;
      case 'swap':
        return <DollarSign className="w-4 h-4" />;
      case 'approval':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400' };
      case 'failed':
        return { icon: <XCircle className="w-4 h-4" />, color: 'text-red-400' };
      case 'pending':
        return { icon: <Clock className="w-4 h-4" />, color: 'text-yellow-400' };
      default:
        return { icon: <CheckCircle className="w-4 h-4" />, color: 'text-blue-400' };
    }
  };

  // Get activity type label
  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'wrap':
        return 'Token Wrap';
      case 'split':
        return 'PT/YT Split';
      case 'combine':
        return 'PT/YT Combine';
      case 'stake':
        return 'Staking';
      case 'unstake':
        return 'Unstaking';
      case 'swap':
        return 'Token Swap';
      case 'approval':
        return 'Token Approval';
      case 'error':
        return 'Error';
      default:
        return 'Transaction';
    }
  };

  // Get block explorer URL
  const getBlockExplorerUrl = (txHash: string) => {
    return `https://testnet.snowtrace.io/tx/${txHash}`;
  };

  return (
    <div className="glass p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Activity Logs</h2>
          <p className="text-sm text-white/60">Track your DeFi interactions</p>
        </div>
        <button
          onClick={clearLogs}
          className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Logs</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Search */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400/50"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400/50"
          >
            <option value="all">All Types</option>
            <option value="wrap">Wrapping</option>
            <option value="split">Splitting</option>
            <option value="combine">Combining</option>
            <option value="stake">Staking</option>
            <option value="unstake">Unstaking</option>
            <option value="swap">Swapping</option>
            <option value="approval">Approvals</option>
            <option value="error">Errors</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No activity logs found</p>
            <p className="text-sm mt-1">Your DeFi interactions will appear here</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const statusInfo = getStatusIcon(log.status);
            
            return (
              <div
                key={log.id}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  {/* Left side - Activity info */}
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Activity type icon */}
                    <div className="p-2 bg-white/10 rounded-lg">
                      {getActivityIcon(log.type)}
                    </div>

                    {/* Activity details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-white">{log.title}</h4>
                        <span className="px-2 py-1 bg-white/10 text-xs text-white/60 rounded">
                          {getActivityLabel(log.type)}
                        </span>
                      </div>
                      <p className="text-sm text-white/70 mb-2">{log.description}</p>
                      
                      {/* Metadata */}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(log.metadata).map(([key, value]) => (
                            <span key={key} className="px-2 py-1 bg-white/5 text-xs text-white/50 rounded">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Status and time */}
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    {/* Status */}
                    <div className={`flex items-center space-x-1 ${statusInfo.color}`}>
                      {statusInfo.icon}
                      <span className="text-xs font-medium capitalize">{log.status}</span>
                    </div>

                    {/* Time */}
                    <span className="text-xs text-white/50">{log.timeAgo}</span>

                    {/* Transaction hash */}
                    {log.txHash && (
                      <a
                        href={getBlockExplorerUrl(log.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        <span>{log.txHash.slice(0, 6)}...{log.txHash.slice(-4)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {/* Error message */}
                    {log.error && (
                      <div className="text-xs text-red-400 max-w-32 text-right">
                        {log.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>Total Activities: {logs.length}</span>
          <span>Filtered: {filteredLogs.length}</span>
        </div>
      </div>
    </div>
  );
} 