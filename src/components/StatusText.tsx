import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import type { VerificationLevel } from '../types/artifact';

interface StatusTextProps {
  status: 'thieu_du_lieu' | 'cho_xac_minh' | 'hoan_thien' | VerificationLevel;
  className?: string;
}

export function StatusText({ status, className = '' }: StatusTextProps) {
  if (status === 'hoan_thien' || status === 'da_xac_minh') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium text-[#14532D] ${className}`}
      >
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{status === 'hoan_thien' ? 'Đã hoàn thiện' : 'Đã xác minh'}</span>
      </span>
    );
  }

  if (status === 'cho_xac_minh') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium text-[#92400E] ${className}`}
      >
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Chờ xác minh</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-[#57534E] ${className}`}
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>Còn thiếu dữ liệu</span>
    </span>
  );
}
