import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const iconMap = {
  error: { Icon: AlertCircle, iconClass: 'bg-red-100 text-red-600', buttonClass: 'bg-red-600 hover:bg-red-700' },
  success: { Icon: CheckCircle2, iconClass: 'bg-green-100 text-green-600', buttonClass: 'bg-blue-600 hover:bg-blue-700' },
  info: { Icon: Info, iconClass: 'bg-blue-100 text-blue-600', buttonClass: 'bg-blue-600 hover:bg-blue-700' },
};

const FeedbackModal = ({ open, onClose, title = 'Notice', message, variant = 'info', children }) => {
  if (!open) return null;
  const { Icon, iconClass, buttonClass } = iconMap[variant] || iconMap.info;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Close dialog">
            <X className="h-5 w-5" />
          </button>
        </div>
        <h2 id="feedback-modal-title" className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
        {message && <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>}
        {children}
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${buttonClass}`}>
            {children ? 'Cancel' : 'Okay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
