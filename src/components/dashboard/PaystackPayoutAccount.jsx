import { useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, ChevronDown, Loader2, Pencil, Plus, ShieldCheck, X } from 'lucide-react';
import { payoutService } from '../../services/api';

const PaystackPayoutAccount = () => {
  const [account, setAccount] = useState(null);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ bankCode: '', accountNumber: '' });

  const selectedBank = useMemo(
    () => banks.find((bank) => bank.code === form.bankCode),
    [banks, form.bankCode]
  );

  const loadAccount = async () => {
    setLoading(true);
    try {
      setAccount(await payoutService.getAccount());
    } catch (err) {
      setError(err?.message || 'Unable to load your payout account.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAccount(); }, []);

  const openForm = async () => {
    setError('');
    setOpen(true);
    if (banks.length) return;
    try {
      const bankList = await payoutService.getBanks();
      setBanks(bankList.filter((bank) => bank.active !== false));
    } catch (err) {
      setError(err?.message || 'Unable to load the list of banks. Please try again.');
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.bankCode || !/^\d{10}$/.test(form.accountNumber)) {
      setError('Choose your bank and enter a valid 10-digit Nigerian account number.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const savedAccount = await payoutService.saveAccount(form);
      setAccount(savedAccount);
      setOpen(false);
      setForm({ bankCode: '', accountNumber: '' });
    } catch (err) {
      setError(err?.message || 'We could not verify those account details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Paystack payout account</h2>
          <p className="text-xs text-slate-500 mt-0.5">Your verified Nigerian bank account is used only to receive earnings.</p>
        </div>
        <button type="button" onClick={openForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700">
          {account ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {account ? 'Change account' : 'Add bank account'}
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center gap-3 py-4 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin text-blue-600" />Loading payout account…</div>
        ) : account ? (
          <div className="rounded-2xl border border-green-200 bg-green-50/50 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-green-200 bg-white text-green-700"><Building2 className="h-6 w-6" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-900">{account.bankName}</p><span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700"><CheckCircle2 className="h-3 w-3" />Verified</span></div>
                <p className="mt-1 text-sm font-medium text-slate-700">{account.accountName}</p>
                <p className="mt-0.5 text-xs text-slate-500">Account ending in •••• {account.accountNumberLast4}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
            <Building2 className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-800">No payout account yet</p>
            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">Add a Nigerian bank account to receive funds after your client approves completed work.</p>
          </div>
        )}
        <div className="mt-5 flex gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-900"><ShieldCheck className="h-5 w-5 flex-shrink-0 text-blue-600" /><p>Account details are verified by Paystack. FreelanceX shows clients only your public work profile—not your account number or bank details.</p></div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4" role="dialog" aria-modal="true" aria-labelledby="payout-account-title">
          <form onSubmit={handleSave} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><h3 id="payout-account-title" className="text-lg font-bold text-slate-900">Add a payout account</h3><p className="mt-1 text-sm leading-5 text-slate-500">Paystack will verify the account holder name before saving it.</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close"><X className="h-5 w-5" /></button></div>
            {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div className="mt-5 space-y-4">
              <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-800">Bank</span><div className="relative"><select value={form.bankCode} onChange={(e) => setForm((current) => ({ ...current, bankCode: e.target.value }))} required disabled={!banks.length} className="block w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"><option value="">{banks.length ? 'Select your bank' : 'Loading banks…'}</option>{banks.map((bank) => <option key={bank.id || bank.code} value={bank.code}>{bank.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" /></div></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-800">Account number</span><input inputMode="numeric" maxLength="10" value={form.accountNumber} onChange={(e) => setForm((current) => ({ ...current, accountNumber: e.target.value.replace(/\D/g, '') }))} placeholder="0123456789" required className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              {selectedBank && <p className="text-xs text-slate-500">Selected bank: <span className="font-semibold text-slate-700">{selectedBank.name}</span></p>}
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving || !banks.length} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? 'Verifying…' : 'Verify & save'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PaystackPayoutAccount;
