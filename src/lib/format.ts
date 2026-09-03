export function formatVnd(amount: number | null | undefined): string {
  const value = Math.round(amount ?? 0);
  return `${value.toLocaleString('vi-VN')}đ`;
}

export function formatPct(pct: number | null | undefined): string | null {
  if (pct === null || pct === undefined) return null;
  const rounded = Math.round(pct * 10) / 10;
  return `${rounded}%`;
}

const STATUS_LABELS: Record<number, string> = {
  1: 'Chờ xác nhận',
  2: 'Hoàn thành',
  3: 'Đã huỷ',
  4: 'Chưa thanh toán',
};

export function orderStatusLabel(status: number | null | undefined): string {
  if (status === null || status === undefined) return 'Không rõ';
  return STATUS_LABELS[status] ?? 'Không rõ';
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
