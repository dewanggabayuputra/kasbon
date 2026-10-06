export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);

  const diffMs = now.getTime() - targetDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'baru saja';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} menit lalu`;
  }

  if (diffHours < 24) {
    return `${diffHours} jam lalu`;
  }

  if (diffDays === 1) {
    return 'kemarin';
  }

  if (diffDays < 7) {
    return `${diffDays} hari lalu`;
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} minggu lalu`;
  }

  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} bulan lalu`;
  }

  return 'lebih dari setahun lalu';
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function getDateForInput(date: string | Date = new Date()): string {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}
