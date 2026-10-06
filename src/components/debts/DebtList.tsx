'use client';

import { Debt, DebtType, DebtStatus } from '@/types/debt';
import { formatRupiah, formatRelativeTime } from '@/lib/utils/format';
import { CheckCircle2, Circle, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface DebtListProps {
  debts: Debt[];
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => Promise<void>;
  onToggleSettle: (debt: Debt) => Promise<void>;
  statusFilter: DebtStatus;
  typeFilter: 'all' | DebtType;
}

export function DebtList({
  debts,
  onEdit,
  onDelete,
  onToggleSettle,
  statusFilter,
  typeFilter,
}: DebtListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const filteredDebts = debts.filter((debt) => {
    if (typeFilter !== 'all' && debt.type !== typeFilter) return false;
    if (statusFilter === 'settled' && !debt.settled_at) return false;
    if (statusFilter === 'unsettled' && debt.settled_at) return false;
    return true;
  });

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    const debt = debts.find((d) => d.id === deletingId);
    if (!debt) return;

    setIsDeletingLoading(true);
    try {
      await onDelete(debt);
    } finally {
      setIsDeletingLoading(false);
      setDeletingId(null);
    }
  };

  if (filteredDebts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tidak ada kasbon</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {filteredDebts.map((debt) => (
          <div
            key={debt.id}
            className={`border rounded-lg p-4 ${
              debt.settled_at
                ? 'bg-gray-50 border-gray-200'
                : 'bg-white border-gray-200 hover:border-gray-300'
            } transition`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => onToggleSettle(debt)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
                  >
                    {debt.settled_at ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div>
                    <h3 className="font-semibold text-gray-900">{debt.counterpart_name}</h3>
                    <p className={`text-sm ${
                      debt.type === 'owed_to_me' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {debt.type === 'owed_to_me' ? 'Mereka hutang ke saya' : 'Saya hutang'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    {formatRupiah(debt.amount)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    debt.settled_at
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {debt.settled_at ? 'Lunas' : 'Belum lunas'}
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  {formatRelativeTime(debt.created_at)}
                </p>

                {debt.note && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    &quot;{debt.note}&quot;
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => onEdit(debt)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setDeletingId(debt.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Hapus kasbon?"
        description="Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        isLoading={isDeletingLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
        isDangerous
      />
    </>
  );
}
