import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  Server, Database, Wifi, WifiOff, ShieldCheck, 
  RefreshCw, Download, CheckCircle2, AlertTriangle, Cpu, HardDrive 
} from 'lucide-react';

export const ServerMonitor: React.FC = () => {
  const { language, showToast } = useERP();
  const isBn = language === 'bn';

  const [lanServerHost, setLanServerHost] = useState<string>(
    localStorage.getItem('thl_lan_server_host') || 'http://localhost:5000'
  );
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const fetchServerStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${lanServerHost}/api/server-status`);
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch (err) {
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
  }, [lanServerHost]);

  const handleSaveHost = () => {
    localStorage.setItem('thl_lan_server_host', lanServerHost);
    fetchServerStatus();
    showToast(`LAN Server Endpoint updated to: ${lanServerHost}`, 'success', 'Server Configuration');
  };

  const handleTriggerBackup = async () => {
    try {
      const res = await fetch(`${lanServerHost}/api/backups/trigger`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast("Automated Database Backup snapshot created successfully!", 'success', 'Backup Created');
        fetchServerStatus();
      }
    } catch (err: any) {
      showToast(`Backup error: ${err.message}`, 'error', 'Backup Failed');
    }
  };

  const handleVerifyRestore = async (filename: string) => {
    try {
      const res = await fetch(`${lanServerHost}/api/backups/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      const data = await res.json();
      setVerificationResult(`[${filename}] ${data.message}`);
    } catch (err: any) {
      setVerificationResult(`Restore verification failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <Server className="w-5 h-5 text-tayeeba-400" />
              <span>{isBn ? "সেন্ট্রাল ল্যান সার্ভার ও ডেটাবেস মনিটর" : "On-Premise LAN Server & Central Database Monitor"}</span>
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1 ${
              isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'LAN SERVER ONLINE' : 'LAN OFFLINE'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isBn ? "অফিস নেটওয়ার্কের কেন্দ্রীয় সার্ভার স্ট্যাটাস, ডেটাবেস সাইজ ও ব্যাকআপ রেস্টোর ভেরিফায়ার" : "Centralized relational SQLite database server operating over office local area network (LAN)."}
          </p>
        </div>

        <button
          onClick={fetchServerStatus}
          className="bg-slate-700 hover:bg-slate-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Server Status</span>
        </button>
      </div>

      {/* LAN Server IP Configuration Box */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3">
        <h3 className="text-sm font-extrabold text-white">LAN Application Server Address Configuration</h3>
        <p className="text-xs text-slate-400">
          Specify the private office LAN IP address or host name of the central Tayeeba Housing ERP server.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={lanServerHost}
            onChange={(e) => setLanServerHost(e.target.value)}
            placeholder="e.g. http://192.168.1.100:5000 or http://ERP-SERVER:5000"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
          />
          <button
            onClick={handleSaveHost}
            className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow"
          >
            Save & Reconnect
          </button>
        </div>
      </div>

      {/* Server Health Metrics Grid */}
      {serverStatus && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Database File Size</span>
              <strong className="text-emerald-400 text-base font-extrabold">{serverStatus.databaseSizeMB} MB</strong>
            </div>
            <Database className="w-6 h-6 text-emerald-400" />
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Active LAN Connections</span>
              <strong className="text-white text-base font-extrabold">{serverStatus.activeConnections} Office PCs</strong>
            </div>
            <Cpu className="w-6 h-6 text-tayeeba-400" />
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Server Port</span>
              <strong className="text-gold-400 text-base font-extrabold">:{serverStatus.port}</strong>
            </div>
            <HardDrive className="w-6 h-6 text-gold-400" />
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Server LAN IPs</span>
              <strong className="text-slate-200 text-xs font-mono">{serverStatus.lanIps.join(', ')}</strong>
            </div>
            <ShieldCheck className="w-6 h-6 text-tayeeba-400" />
          </div>
        </div>
      )}

      {/* Backup & Restore Verification Center */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-white">Central Database Backup & Restore Verifier</h3>
            <p className="text-xs text-slate-400">Automated daily backup history & 100% integrity restore test engine</p>
          </div>
          <button
            onClick={handleTriggerBackup}
            className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>+ Create Backup Now</span>
          </button>
        </div>

        {verificationResult && (
          <div className="p-3 bg-tayeeba-950 border border-tayeeba-500 text-tayeeba-300 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-tayeeba-400" />
            <span>{verificationResult}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-700">
                <th className="p-3">Backup Filename</th>
                <th className="p-3">Created At</th>
                <th className="p-3">Size</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Integrity Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {serverStatus?.backupHistory?.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-700/40 text-slate-200">
                  <td className="p-3 font-mono text-tayeeba-400 font-bold">{b.filename}</td>
                  <td className="p-3 text-slate-400">{b.created_at}</td>
                  <td className="p-3 font-semibold text-white">{(b.file_size_bytes / 1024).toFixed(1)} KB</td>
                  <td className="p-3">{b.backup_type}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleVerifyRestore(b.filename)}
                      className="bg-slate-700 hover:bg-slate-600 text-tayeeba-300 px-2.5 py-1 rounded-lg text-xs font-bold transition inline-flex items-center space-x-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Test Restore Integrity</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
