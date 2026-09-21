import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Tabs from '../../components/ui/Tabs';
import StatusBadge from '../../components/ui/StatusBadge';
import { 
  ArrowUpRight, Loader2, AlertCircle, CreditCard, Landmark, 
  ShieldCheck, FileText, Download, MessageSquare, CheckCircle, X, Printer 
} from 'lucide-react';
import { paymentService, contractService } from '../../services/api';

const ClientPayments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('history');
  const [payments, setPayments] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const [contractToFund, setContractToFund] = useState(null);
  const [verifiedReceipt, setVerifiedReceipt] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [historyData, contractsData] = await Promise.all([
        paymentService.getPaymentHistory().catch(() => []),
        contractService.getMyContracts().catch(() => []),
      ]);
      const fetchedPayments = Array.isArray(historyData) ? historyData : [];
      const fetchedContracts = Array.isArray(contractsData) ? contractsData : [];
      setPayments(fetchedPayments);
      setContracts(fetchedContracts);

      // Auto-open payment modal if ?contractId= is passed
      const targetContractId = searchParams.get('contractId');
      if (targetContractId && searchParams.get('pay')) {
        const matched = fetchedContracts.find((c) => (c._id || c.id) === targetContractId);
        if (matched) {
          setContractToFund(matched);
        }
      }
    } catch (err) {
      console.error('Fetch client payments error:', err);
      setError(err?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [verifyingId, setVerifyingId] = useState(null);

  // Handle Paystack payment verification return callback
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('paymentReference') || searchParams.get('trxref');
    if (!reference) return;

    paymentService.verifyPaystackPayment(reference)
      .then((res) => {
        loadData();
        const payData = res?.data || res;
        setVerifiedReceipt({
          reference: reference,
          amount: payData.amount || 0,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          contractTitle: payData.contractId?.title || 'Contract Settlement',
          freelancer: payData.freelancerId,
          freelancerId: typeof payData.freelancerId === 'string' ? payData.freelancerId : (payData.freelancerId?._id || payData.freelancerId?.id || ''),
          contractId: typeof payData.contractId === 'string' ? payData.contractId : (payData.contractId?._id || payData.contractId?.id || ''),
        });
      })
      .catch((err) => setError(err?.message || 'We could not verify the Paystack payment yet.'))
      .finally(() => setSearchParams({}, { replace: true }));
  }, [loadData, searchParams, setSearchParams]);

  const verifyPaymentRecord = async (trx) => {
    const ref = trx.transactionReference || trx._id || trx.id;
    setVerifyingId(ref);
    setError('');
    try {
      const res = await paymentService.verifyPaystackPayment(ref);
      loadData();
      const payData = res?.data || res;
      setVerifiedReceipt({
        reference: ref,
        amount: payData.amount || trx.amount || 0,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contractTitle: payData.contractId?.title || trx.contractId?.title || 'Contract Settlement',
        freelancer: payData.freelancerId || trx.freelancerId,
        freelancerId: extractId(payData.freelancerId || trx.freelancerId),
        contractId: extractId(payData.contractId || trx.contractId),
      });
    } catch (err) {
      setError(err?.message || 'Could not verify payment status with Paystack.');
    } finally {
      setVerifyingId(null);
    }
  };

  const startPayment = async () => {
    if (!contractToFund) return;
    setIsStartingPayment(true);
    setError('');
    try {
      const res = await paymentService.initializePaystackPayment(contractToFund._id || contractToFund.id);
      const authorizationUrl = res?.authorizationUrl || res;
      if (authorizationUrl) {
        window.location.assign(authorizationUrl);
      } else {
        throw new Error('Authorization URL missing from Paystack response');
      }
    } catch (err) {
      setError(err?.message || 'Unable to start Paystack checkout');
      setIsStartingPayment(false);
      setContractToFund(null);
    }
  };

  const pendingApproval = contracts.filter((c) => c.status === 'completed' && c.paymentStatus === 'unpaid');
  const releasedPayments = payments.filter((p) => p.status === 'released' || p.status === 'successful');

  const tabs = [
    { id: 'history', label: 'Payment History', count: payments.length },
    { id: 'pending', label: 'Pending Payment', count: pendingApproval.length },
    { id: 'completed', label: 'Completed Payments', count: releasedPayments.length },
  ];

  const extractId = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val._id || val.id || '';
    return String(val);
  };

  const handleRedirectToChat = (receipt) => {
    const fid = extractId(receipt?.freelancerId) || extractId(receipt?.freelancer);
    const cid = extractId(receipt?.contractId);
    const ref = receipt?.reference || '';
    const amt = receipt?.amount || '';
    const title = receipt?.contractTitle || '';

    if (!fid) {
      setError('Could not identify freelancer ID for messaging');
      return;
    }

    navigate(`/client/messages?recipient=${fid}&contractId=${cid}&receiptRef=${ref}&amount=${amt}&title=${encodeURIComponent(title)}&attachReceipt=true`);
  };

  const openReceiptForPayment = (trx) => {
    const contract = trx.contractId || {};
    const freelancer = trx.freelancerId || contract.freelancerId || {};
    const fid = extractId(freelancer);
    const cid = extractId(contract);

    setVerifiedReceipt({
      reference: trx.transactionReference || trx._id || 'N/A',
      amount: trx.amount || 0,
      date: trx.paidAt ? new Date(trx.paidAt).toLocaleDateString() : (trx.createdAt ? new Date(trx.createdAt).toLocaleDateString() : new Date().toLocaleDateString()),
      time: trx.paidAt ? new Date(trx.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (trx.createdAt ? new Date(trx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
      contractTitle: contract.title || trx.jobId?.title || 'Contract Settlement',
      freelancer: freelancer,
      freelancerId: fid,
      contractId: cid,
      status: trx.status === 'successful' ? 'Payment Verified' : (trx.status || 'Successful')
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments & Invoices</h1>
          <p className="text-slate-500 mt-1">Manage project funding, view transaction receipts, and track payment history.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 md:p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <ShieldCheck className="h-6 w-6 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm md:text-base font-bold text-slate-900 leading-snug">Secure Paystack checkout</p>
              <p className="mt-1 text-xs md:text-sm leading-5 md:leading-6 text-slate-600">When a payment is due, click Pay with Paystack. Paystack securely collects your payment details—FreelanceX never stores them.</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <Landmark className="h-6 w-6 flex-shrink-0 text-slate-700" />
            <div>
              <p className="text-sm md:text-base font-bold text-slate-900 leading-snug">Choose a method at checkout</p>
              <p className="mt-1 text-xs md:text-sm leading-5 md:leading-6 text-slate-600">Use card, bank transfer, USSD, or another option presented by Paystack. Generated receipts can be sent in project chat.</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Verified Receipt Modal */}
      {verifiedReceipt && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setVerifiedReceipt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 no-print"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 no-print">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="text-center mb-6 no-print">
              <h2 className="text-xl font-bold text-slate-900">Payment Confirmed!</h2>
              <p className="text-xs text-slate-500 mt-1">Your payment was successfully processed via Paystack.</p>
            </div>

            {/* Clean Printable Receipt Card */}
            <div id="printable-receipt" className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 font-sans text-sm shadow-sm">
              {/* Receipt Header (Branding & Logo) */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">FreelanceX</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Official Payment Receipt</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-200">
                    Paystack Verified
                  </span>
                </div>
              </div>

              {/* Receipt Reference & Transaction Details */}
              <div className="space-y-3 text-xs pt-1">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Receipt Reference</span>
                  <span className="font-mono text-xs font-bold text-slate-900">{verifiedReceipt.reference}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Contract Title</span>
                  <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">{verifiedReceipt.contractTitle}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Amount Paid</span>
                  <span className="font-extrabold text-slate-900 text-base">₦{Number(verifiedReceipt.amount || 0).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Date & Time</span>
                  <span className="text-slate-700 font-medium">{verifiedReceipt.date} at {verifiedReceipt.time}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Payment Channel</span>
                  <span className="text-slate-900 font-semibold">Paystack Direct Gateway</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 font-medium">Status</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider">
                    {verifiedReceipt.status || 'Payment Sent — Verified'}
                  </span>
                </div>
              </div>

              {/* Printable Receipt Footer */}
              <div className="pt-4 border-t border-slate-200 text-center space-y-1">
                <p className="text-[11px] text-slate-600 font-semibold">Thank you for using FreelanceX!</p>
                <p className="text-[10px] text-slate-400">This document serves as official electronic proof of payment.</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center my-6 no-print">
              You can download this receipt as a PDF or proceed to the Message Chat to share it with the freelancer.
            </p>

            <div className="space-y-3 no-print">
              <button
                onClick={() => handleRedirectToChat(verifiedReceipt)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Go to Message Chat to Share Receipt
              </button>
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                Print / Save Receipt PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-6 border-b border-slate-200 bg-slate-50">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Loading payments...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'pending' && (
              pendingApproval.length === 0 ? (
                <div className="p-16 text-center text-slate-500">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-700 font-bold text-sm">No Pending Payments</p>
                  <p className="text-xs text-slate-400 mt-0.5">Approved deliverables awaiting payment will appear here.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Contract & Freelancer</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Amount Due</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingApproval.map((p) => {
                      const freelancer = p.freelancerId || {};
                      const freelancerName = `${freelancer.firstname || 'Freelancer'} ${freelancer.lastname || ''}`.trim();
                      return (
                        <tr key={p._id || p.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{p.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-xs text-slate-500">{freelancerName}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4"><StatusBadge status="Payment Pending" /></td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900">₦{Number(p.agreedAmount || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              disabled={isStartingPayment}
                              onClick={() => setContractToFund(p)}
                              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
                            >
                              Pay with Paystack
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}

            {activeTab === 'completed' && (
              releasedPayments.length === 0 ? (
                <div className="p-16 text-center text-slate-500">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-700 font-bold text-sm">No Completed Payments Yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">Payments made to freelancers will be logged here.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Job & Freelancer</th>
                      <th className="px-6 py-4">Date Paid</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Amount Paid</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {releasedPayments.map((p) => {
                      const freelancer = p.freelancerId || {};
                      const freelancerName = `${freelancer.firstname || 'Freelancer'} ${freelancer.lastname || ''}`.trim();
                      const dateStr = p.paidAt || p.createdAt ? new Date(p.paidAt || p.createdAt).toLocaleDateString() : 'Recent';
                      return (
                        <tr key={p._id || p.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{p.jobId?.title || 'Contract Settlement'}</p>
                            <p className="text-xs text-slate-500">{freelancerName}</p>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">{dateStr}</td>
                          <td className="px-6 py-4"><StatusBadge status="Successful" /></td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900">₦{Number(p.amount || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => openReceiptForPayment(p)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}

            {activeTab === 'history' && (
              payments.length === 0 ? (
                <div className="p-16 text-center text-slate-500">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-700 font-bold text-sm">No Billing Transactions Yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">All payments and transaction receipts are recorded here.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Transaction / Reference</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((trx) => {
                      const dateStr = trx.createdAt ? new Date(trx.createdAt).toLocaleDateString() : 'Recent';
                      return (
                        <tr key={trx._id || trx.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <ArrowUpRight className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">Paystack Contract Payment</p>
                              <p className="text-xs font-mono text-slate-400">{trx.transactionReference || trx._id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">{dateStr}</td>
                          <td className="px-6 py-4"><StatusBadge status={trx.status} /></td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900">
                            -₦{Number(trx.amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {trx.status === 'pending' ? (
                              <button
                                disabled={verifyingId === (trx.transactionReference || trx._id || trx.id)}
                                onClick={() => verifyPaymentRecord(trx)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors disabled:opacity-60"
                              >
                                {verifyingId === (trx.transactionReference || trx._id || trx.id) ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                                Verify Status
                              </button>
                            ) : (
                              <button
                                onClick={() => openReceiptForPayment(trx)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                View Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}
          </div>
        )}
      </div>

      {contractToFund && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4" role="dialog" aria-modal="true" aria-labelledby="paystack-confirmation-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><ShieldCheck className="h-5 w-5" /></div>
            <h2 id="paystack-confirmation-title" className="mt-4 text-lg font-bold text-slate-900">Continue to Paystack?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">You are paying for <span className="font-semibold text-slate-800">{contractToFund.title}</span>. Paystack will show the secure payment methods available to you.</p>
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Amount due</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">₦{Number(contractToFund.agreedAmount || 0).toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-500">After payment, a receipt will be generated for you to send in the message chat.</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setContractToFund(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={startPayment} disabled={isStartingPayment} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {isStartingPayment && <Loader2 className="h-4 w-4 animate-spin" />}
                {isStartingPayment ? 'Opening checkout…' : 'Pay with Paystack'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPayments;
