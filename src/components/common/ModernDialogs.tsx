import React from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  CheckCircle2, AlertCircle, AlertTriangle, Info, X, 
  KeyRound, Trash2, ArrowRight, ShieldCheck
} from 'lucide-react';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  durationMs?: number;
}

export interface ConfirmDialogConfig {
  isOpen: boolean;
  title: string;
  message: string;
  subtext?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  onConfirm: () => void;
  onCancel?: () => void;
}

// -------------------------------------------------------------
// 1. GLOBAL CONFIRMATION / ALERT MODAL
// -------------------------------------------------------------
export const ConfirmDialogModal: React.FC = () => {
  const { confirmDialog, closeConfirmDialog } = useERP();

  if (!confirmDialog || !confirmDialog.isOpen) return null;

  const {
    title,
    message,
    subtext,
    confirmText = 'Confirm Action',
    cancelText = 'Cancel',
    type = 'warning',
    onConfirm,
    onCancel
  } = confirmDialog;

  const handleConfirm = () => {
    onConfirm();
    closeConfirmDialog();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeConfirmDialog();
  };

  const getThemeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <Trash2 className="w-7 h-7 text-rose-400" />,
          badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
          btnBg: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50',
          border: 'border-rose-500/40'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-7 h-7 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
          btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50',
          border: 'border-emerald-500/40'
        };
      case 'info':
        return {
          icon: <Info className="w-7 h-7 text-cyan-400" />,
          badgeBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
          btnBg: 'bg-tayeeba-600 hover:bg-tayeeba-500 text-white shadow-tayeeba-950/50',
          border: 'border-cyan-500/40'
        };
      case 'warning':
      default:
        return {
          icon: <AlertTriangle className="w-7 h-7 text-amber-400" />,
          badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
          btnBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50',
          border: 'border-amber-500/40'
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className={`bg-slate-900 border ${theme.border} rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 text-center text-xs relative transform transition-all animate-scaleUp`}>
        {/* Close Icon on Top Right */}
        <button 
          onClick={handleCancel}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className={`w-14 h-14 rounded-2xl ${theme.badgeBg} border flex items-center justify-center mx-auto shadow-lg`}>
          {theme.icon}
        </div>

        <div className="space-y-1.5">
          <h3 className="font-extrabold text-white text-base tracking-tight">{title}</h3>
          <p className="text-slate-300 text-xs leading-relaxed px-2 font-medium">
            {message}
          </p>
          {subtext && (
            <p className="text-[11px] text-slate-400 italic pt-1">
              {subtext}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-3 pt-3">
          {cancelText && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold border border-slate-700 transition"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className={`px-6 py-2.5 ${theme.btnBg} font-extrabold rounded-xl shadow-lg transition transform active:scale-95 flex items-center space-x-1.5`}
          >
            <span>{confirmText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. GLOBAL TOAST NOTIFICATION STACK
// -------------------------------------------------------------
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useERP();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[110] flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none select-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        const borderClass = isSuccess 
          ? 'border-emerald-500/50 bg-slate-900/95 text-emerald-300 shadow-emerald-950/50'
          : isError
          ? 'border-rose-500/50 bg-slate-900/95 text-rose-300 shadow-rose-950/50'
          : isWarning
          ? 'border-amber-500/50 bg-slate-900/95 text-amber-300 shadow-amber-950/50'
          : 'border-cyan-500/50 bg-slate-900/95 text-cyan-300 shadow-cyan-950/50';

        const icon = isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        ) : isError ? (
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
        ) : isWarning ? (
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
        ) : (
          <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />
        );

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto border rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-start space-x-3 transition-all transform animate-slideInRight ${borderClass}`}
          >
            <div className="mt-0.5">{icon}</div>

            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="font-extrabold text-white text-xs tracking-tight mb-0.5">
                  {toast.title}
                </h4>
              )}
              <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition -mr-1 -mt-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
