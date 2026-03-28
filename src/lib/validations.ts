import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  orgName: z.string().min(1, "Organisation name is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const holidayRequestSchema = z.object({
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  leave_type: z.enum(["ordinary", "additional"]),
  employee_notes: z.string().optional(),
});

export const employeeSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["employee", "manager", "admin", "super_admin"]),
  contract_type: z.enum(["full_time", "part_time", "zero_hours"]),
  holiday_unit: z.enum(["days", "hours"]),
  days_per_week: z.number().min(0).max(7),
  hours_per_week: z.number().min(0),
  start_date: z.string().min(1, "Start date is required"),
});

export const entitlementSchema = z.object({
  total_ordinary: z.number().min(0),
  total_additional: z.number().min(0),
  carried_forward: z.number().min(0),
});

export const orgSettingsSchema = z.object({
  name: z.string().min(1, "Organisation name is required"),
  holiday_year_start_month: z.number().min(1).max(12),
  holiday_year_start_day: z.number().min(1).max(31),
  default_holiday_unit: z.enum(["days", "hours"]),
  bank_holiday_region: z.enum(["england_wales", "scotland", "northern_ireland"]),
  carry_forward_cap: z.number().min(0),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type HolidayRequestInput = z.infer<typeof holidayRequestSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type EntitlementInput = z.infer<typeof entitlementSchema>;
export type OrgSettingsInput = z.infer<typeof orgSettingsSchema>;
