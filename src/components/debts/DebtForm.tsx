'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Debt, DebtType } from '@/types/debt';
import { getDateForInput } from '@/lib/utils/format';

interface DebtFormProps {
  debt?: Debt | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: DebtType;
    counterpart_name: string;
    amount: number;
    note?: string;
    due_date?: string;
  }) => Promise<void>;
}

export function DebtForm({ debt, isOpen, onClose, onSubmit }: DebtFormProps) {
  const [type, setType] = useState<DebtType>('owed_to_me');
  const [counterpart_name, setCounterpart_name] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [due_date, setDue_date] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (debt) {
      setType(debt.type);
      setCounterpart_name(debt.counterpart_name);
      setAmount(String(debt.amount));
      setNote(debt.note || '');
      setDue_date(debt.due_date || '');
    } else {
      setType('owed_to_me');
      setCounterpart_name('');
      setAmount('');
      setNote('');
      setDue_date(getDateForInput());
    }
    setErrors({});
  }, [debt, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await onSubmit({
        type,
        counterpart_name,
        amount: parseInt(amount),
        note: note || undefined,
        due_date: due_date || undefined,
      });

      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        try {
          const data = JSON.parse(error.message);
          setErrors(data.details || { form: error.message });
        } catch {
          setErrors({ form: error.message });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-md sm:rounded-lg rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {debt ? 'Edit Kasbon' : 'Catat Kasbon Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors.form && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{errors.form}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">Tipe</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="owed_to_me"
                  checked={type === 'owed_to_me'}
                  onChange={(e) => setType(e.target.value as DebtType)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Orang lain hutang ke saya</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="i_owe"
                  checked={type === 'i_owe'}
                  onChange={(e) => setType(e.target.value as DebtType)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Saya hutang</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
              Nama orang
            </label>
            <input
              id="name"
              type="text"
              value={counterpart_name}
              onChange={(e) => setCounterpart_name(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.counterpart_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nama orang"
            />
            {errors.counterpart_name && (
              <p className="mt-1 text-sm text-red-600">{errors.counterpart_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-900 mb-1">
              Jumlah (Rp)
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="1"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-900 mb-1">
              Tanggal (opsional)
            </label>
            <input
              id="due_date"
              type="date"
              value={due_date}
              onChange={(e) => setDue_date(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-900 mb-1">
              Catatan ({note.length}/200)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 200))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.note ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Tambah catatan (opsional)"
            />
            {errors.note && (
              <p className="mt-1 text-sm text-red-600">{errors.note}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition font-medium"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
