import type { CreateDebtInput, UpdateDebtInput } from '@/types/debt';

export interface ValidationError {
  [key: string]: string;
}

export function validateDebtInput(input: CreateDebtInput): ValidationError {
  const errors: ValidationError = {};

  if (!input.counterpart_name?.trim()) {
    errors.counterpart_name = 'Nama orang harus diisi';
  }

  if (!input.amount || input.amount <= 0) {
    errors.amount = 'Jumlah harus lebih dari 0';
  }

  if (input.note && input.note.length > 200) {
    errors.note = 'Catatan maksimal 200 karakter';
  }

  if (input.due_date) {
    const dueDate = new Date(input.due_date);
    if (isNaN(dueDate.getTime())) {
      errors.due_date = 'Format tanggal tidak valid';
    }
  }

  return errors;
}
