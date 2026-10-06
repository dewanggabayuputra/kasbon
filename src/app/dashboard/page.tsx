'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Debt, DebtStatus, DebtType } from '@/types/debt';
import { DebtForm } from '@/components/debts/DebtForm';
import { DebtList } from '@/components/debts/DebtList';
import { SummaryCards } from '@/components/debts/SummaryCards';
import { LogOut, Plus, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DebtStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | DebtType>('all');
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
      }
    };

    checkAuth();
    fetchDebts();

    // Subscribe to changes
    const channel = supabase
      .channel('debts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'debts',
        },
        () => {
          fetchDebts();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchDebts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(`/api/debts?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Gagal mengambil data');
      }

      const data = await response.json();
      setDebts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [statusFilter, typeFilter]);

  const handleCreateDebt = async (data: {
    type: DebtType;
    counterpart_name: string;
    amount: number;
    note?: string;
    due_date?: string;
  }) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      await fetchDebts();
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateDebt = async (data: {
    type: DebtType;
    counterpart_name: string;
    amount: number;
    note?: string;
    due_date?: string;
  }) => {
    if (!selectedDebt) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/debts/${selectedDebt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      await fetchDebts();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDebt = async (debt: Debt) => {
    try {
      const response = await fetch(`/api/debts/${debt.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus kasbon');
      }

      await fetchDebts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleToggleSettle = async (debt: Debt) => {
    try {
      const response = await fetch(`/api/debts/${debt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settled_at: debt.settled_at ? null : new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengubah status');
      }

      await fetchDebts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Kasbon</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition text-gray-700"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-xs text-red-600 hover:underline mt-1"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          {/* Summary */}
          {!isLoading && (
            <div className="mb-8">
              <SummaryCards debts={debts} />
            </div>
          )}

          {/* Filters & Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as DebtStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua</option>
                  <option value="unsettled">Belum Lunas</option>
                  <option value="settled">Lunas</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'all' | DebtType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua</option>
                  <option value="owed_to_me">Orang lain hutang</option>
                  <option value="i_owe">Saya hutang</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedDebt(null);
                    setIsFormOpen(true);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                >
                  <Plus className="w-5 h-5" />
                  <span>Catat Baru</span>
                </button>
              </div>
            </div>
          </div>

          {/* Debt List */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Memuat data...</p>
              </div>
            ) : (
              <DebtList
                debts={debts}
                onEdit={(debt) => {
                  setSelectedDebt(debt);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeleteDebt}
                onToggleSettle={handleToggleSettle}
                statusFilter={statusFilter}
                typeFilter={typeFilter}
              />
            )}
          </div>
        </div>
      </main>

      {/* Form Modal */}
      <DebtForm
        debt={selectedDebt}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedDebt(null);
        }}
        onSubmit={selectedDebt ? handleUpdateDebt : handleCreateDebt}
      />
    </div>
  );
}
