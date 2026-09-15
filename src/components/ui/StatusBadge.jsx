import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();

  const getStatusStyles = () => {
    switch (normalized) {
      case 'accepted':
      case 'completed':
      case 'released':
      case 'successful':
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'revision_requested':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
      case 'payment_sent':
        return 'bg-purple-50 text-purple-700 border-purple-200 font-semibold';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDisplayText = () => {
    switch (normalized) {
      case 'revision_requested':
        return 'Revision Requested';
      case 'submitted':
        return 'Under Review';
      case 'payment_sent':
        return 'Payment Sent';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusStyles()}`}>
      {getDisplayText()}
    </span>
  );
};

export default StatusBadge;
