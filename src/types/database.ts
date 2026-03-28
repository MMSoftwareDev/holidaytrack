export type EmployeeRole = "employee" | "manager" | "admin" | "super_admin";
export type ContractType = "full_time" | "part_time" | "zero_hours";
export type HolidayUnit = "days" | "hours";
export type LeaveType = "ordinary" | "additional";
export type RequestStatus = "pending" | "approved" | "declined" | "cancelled";
export type ApprovalActionType = "approved" | "declined";
export type BankHolidayRegion =
  | "england_wales"
  | "scotland"
  | "northern_ireland";

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  holiday_year_start_month: number;
  holiday_year_start_day: number;
  default_holiday_unit: HolidayUnit;
  bank_holiday_region: BankHolidayRegion;
  carry_forward_cap: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  org_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: EmployeeRole;
  contract_type: ContractType;
  holiday_unit: HolidayUnit;
  days_per_week: number;
  hours_per_week: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ManagerAssignment {
  id: string;
  manager_id: string;
  employee_id: string;
  is_primary: boolean;
  created_at: string;
}

export interface Entitlement {
  id: string;
  employee_id: string;
  org_id: string;
  year_start: string;
  year_end: string;
  total_ordinary: number;
  total_additional: number;
  used_ordinary: number;
  used_additional: number;
  pending_ordinary: number;
  pending_additional: number;
  carried_forward: number;
  created_at: string;
  updated_at: string;
}

export interface HolidayRequest {
  id: string;
  employee_id: string;
  org_id: string;
  start_date: string;
  end_date: string;
  amount: number;
  holiday_unit: HolidayUnit;
  leave_type: LeaveType;
  status: RequestStatus;
  employee_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  employee?: Pick<Employee, "first_name" | "last_name" | "email">;
}

export interface ApprovalAction {
  id: string;
  request_id: string;
  actioned_by: string;
  action: ApprovalActionType;
  reason: string | null;
  created_at: string;
}

export interface BankHoliday {
  id: string;
  date: string;
  name: string;
  region: BankHolidayRegion;
}

export interface AuditLogEntry {
  id: string;
  org_id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface EmailLogEntry {
  id: string;
  org_id: string | null;
  to_email: string;
  subject: string;
  template: string;
  status: string;
  error: string | null;
  created_at: string;
}

export interface Invitation {
  id: string;
  org_id: string;
  email: string;
  role: EmployeeRole;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}
