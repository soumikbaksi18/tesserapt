import React, { useState, useMemo } from 'react';
import { 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Scissors, 
  RotateCcw, 
  TrendingUp, 
  DollarSign,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { useBlockchainHistory } from '@/hooks/useBlockchainHistory';
import { useAccount } from 'wagmi';

export default function BlockchainHistory() {
  const { address, isConnected } = useAccount();
  const { 
    history, 
    refreshHistory, 
    clearHistory, 
    convertToActivityLogs 
  } = useBlockchainHistory();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'transactions' | 'tokens' | 'events'>('transactions');

  // Convert blockchain data to activity logs
  const activityLogs = useMemo(() => {
    return convertToActivityLogs();
  }, [convertToActivityLogs]);

  // Filter logs based on search and filters
  const filteredLogs = useMemo(() => {
    let filtered = activityLogs;

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
  }, [activityLogs, selectedType, selectedStatus, searchTerm]);

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
        return <XCircle className="w-4 h-4" />;
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

  // Get block explorer URL
  const getBlockExplorerUrl = (txHash: string) => {
    return `https://testnet.snowtrace.io/tx/${txHash}`;
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Export data to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Hash', 'Type', 'Status', 'Title', 'Description', 'Block', 'Gas Used', 'Timestamp'],
      ...filteredLogs.map(log => [
        log.txHash || '',
        log.type,
        log.status,
        log.title,
        log.description,
        log.blockNumber?.toString() || '',
        log.gasUsed?.toString() || '',
        log.timestamp.toISOString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blockchain-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isConnected || !address) {
    return (
      <div className="glass p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl">
        <div className="text-center py-8 text-white/60">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Connect your wallet to view blockchain history</p>
          <p className="text-sm mt-1">Your transaction history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Blockchain History</h2>
          <p className="text-sm text-white/60">
            Real-time transaction history from {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          {history.lastUpdated && (
            <p className="text-xs text-white/40 mt-1">
              Last updated: {formatTimestamp(history.lastUpdated)}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportToCSV}
            className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={refreshHistory}
            disabled={history.isLoading}
            className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${history.isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-1 mb-6 p-1 bg-white/5 rounded-lg">
        <button
          onClick={() => setViewMode('transactions')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'transactions'
              ? 'bg-yellow-400 text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Transactions ({history.transactions.length})
        </button>
        <button
          onClick={() => setViewMode('tokens')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'tokens'
              ? 'bg-yellow-400 text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Token Transfers ({history.tokenTransfers.length})
        </button>
        <button
          onClick={() => setViewMode('events')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'events'
              ? 'bg-yellow-400 text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Contract Events ({history.contractEvents.length})
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search transactions, addresses, or hashes..."
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
            <option value="transaction">Transactions</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {history.isLoading && (
        <div className="text-center py-8 text-white/60">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin" />
          <p>Fetching blockchain history...</p>
        </div>
      )}

      {/* Error State */}
      {history.error && (
        <div className="text-center py-8 text-red-400">
          <XCircle className="w-8 h-8 mx-auto mb-3" />
          <p>Error: {history.error}</p>
          <button
            onClick={refreshHistory}
            className="mt-3 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Transaction List */}
      {!history.isLoading && !history.error && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No transactions found</p>
              <p className="text-sm mt-1">Try adjusting your filters or refresh the data</p>
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
                    {/* Left side - Transaction info */}
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Transaction type icon */}
                      <div className="p-2 bg-white/10 rounded-lg">
                        {getActivityIcon(log.type)}
                      </div>

                      {/* Transaction details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-white">{log.title}</h4>
                          <span className="px-2 py-1 bg-white/10 text-xs text-white/60 rounded">
                            {log.type}
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

                    {/* Right side - Status and actions */}
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      {/* Status */}
                      <div className={`flex items-center space-x-1 ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span className="text-xs font-medium capitalize">{log.status}</span>
                      </div>

                      {/* Time */}
                      <span className="text-xs text-white/50">{formatTimestamp(log.timestamp)}</span>

                      {/* Transaction hash */}
                      {log.txHash && (
                        <div className="flex items-center space-x-1">
                          <a
                            href={getBlockExplorerUrl(log.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                          >
                            <span>{log.txHash.slice(0, 6)}...{log.txHash.slice(-4)}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => copyToClipboard(log.txHash!)}
                            className="p-1 text-white/40 hover:text-white/60 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Block number */}
                      {log.blockNumber && (
                        <span className="text-xs text-white/40">
                          Block: {log.blockNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>Total Transactions: {history.transactions.length}</span>
          <span>Filtered: {filteredLogs.length}</span>
        </div>
      </div>
    </div>
  );
} 