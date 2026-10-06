'use client';

import { Debt } from '@/types/debt';
import { formatRupiah } from '@/lib/utils/format';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface SummaryCardsProps {
  debts: Debt[];
}

export function SummaryCards({ debts }: SummaryCardsProps) {
  const settledDebts = debts.filter((d) => d.settled_at);

  const owed_to_me = settledDebts
    .filter((d) => d.type === 'owed_to_me')
    .reduce((sum, d) => sum + d.amount, 0);

  const i_owe = settledDebts
    .filter((d) => d.type === 'i_owe')
    .reduce((sum, d) => sum + d.amount, 0);

  const net = owed_to_me - i_owe;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-700 mb-1">Dihutang ke saya</p>
            <p className="text-2xl font-bold text-green-900">{formatRupiah(owed_to_me)}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-700 mb-1">Saya hutang</p>
            <p className="text-2xl font-bold text-red-900">{formatRupiah(i_owe)}</p>
          </div>
          <TrendingDown className="w-8 h-8 text-red-600 opacity-50" />
        </div>
      </div>

      <div
        className={`border rounded-lg p-5 ${
          net >= 0
            ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
            : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium mb-1 ${
              net >= 0 ? 'text-blue-700' : 'text-orange-700'
            }`}>
              Net
            </p>
            <p className={`text-2xl font-bold ${
              net >= 0 ? 'text-blue-900' : 'text-orange-900'
            }`}>
              {formatRupiah(Math.abs(net))}
            </p>
          </div>
          <Minus className={`w-8 h-8 opacity-50 ${
            net >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`} />
        </div>
      </div>
    </div>
  );
}
