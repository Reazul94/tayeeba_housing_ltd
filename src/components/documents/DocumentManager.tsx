import React from 'react';
import { useERP } from '../../context/ERPContext';
import { FolderLock, FileText, Download, Upload } from 'lucide-react';

export const DocumentManager: React.FC = () => {
  const { customers, language, showToast } = useERP();
  const isBn = language === 'bn';

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <FolderLock className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "সুরক্ষিত ডকুমেন্ট ভল্ট" : "Secure Document Repository & Vault"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "কাস্টমার NID, অলটমেন্ট লেটার, ডিড ও রাজউক অনুমোদন ফাইলের ভল্ট" : "Store & link NID copies, allotment deeds, money receipts & land CS/RS Khatian documents."}
          </p>
        </div>

        <button onClick={() => showToast("Document upload modal ready. Choose NID/Deed file.", "info", "Document Vault")} className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow flex items-center space-x-1">
          <Upload className="w-4 h-4" />
          <span>+ Upload Document</span>
        </button>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-700">
              <th className="p-3">Document Title</th>
              <th className="p-3">Customer / Entity</th>
              <th className="p-3">Format</th>
              <th className="p-3">Upload Date</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {customers.flatMap(c => c.documents.map(d => ({ ...d, customerName: c.name }))).map((doc, idx) => (
              <tr key={idx} className="hover:bg-slate-700/40 text-slate-200">
                <td className="p-3 font-bold text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-tayeeba-400" />
                  <span>{doc.title}</span>
                </td>
                <td className="p-3 text-slate-300">{doc.customerName}</td>
                <td className="p-3 uppercase font-mono text-[10px] text-tayeeba-400 font-bold">{doc.fileType}</td>
                <td className="p-3 text-slate-400">{doc.uploadDate}</td>
                <td className="p-3 text-right">
                  <button onClick={() => showToast(`Downloading ${doc.title}...`, 'info', 'File Download')} className="bg-slate-700 hover:bg-slate-600 text-tayeeba-300 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ml-auto">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
