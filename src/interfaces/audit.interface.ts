export type AuditTargetType = 'all' | 'deals' | 'customers' | 'users' | 'quota';
export type AuditFieldName = 'discount' | 'quota' | 'owner' | 'role';

export interface IAuditLog {
  id: number | string;
  performed_by: string;
  user_name?: string;
  user_email?: string;
  target_type: string;
  target_id: string;
  field_name: AuditFieldName | string;
  old_value?: string | null;
  new_value?: string | null;
  created_at: string;
}

export interface IAuditLogFilterState {
  performedBy: string;
  targetType: AuditTargetType;
  startDate: string;
  endDate: string;
}

export interface IAuditLogPaginatedResponse {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  data: IAuditLog[];
}
