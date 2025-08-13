import { z } from 'zod';

// Enums
export const accountTypeEnum = z.enum(['cash', 'bank', 'ewallet']);
export const categoryTypeEnum = z.enum(['income', 'expense']);
export const transactionTypeEnum = z.enum(['income', 'expense', 'transfer_in', 'transfer_out']);
export const auditActionEnum = z.enum(['create', 'update', 'delete', 'soft_delete', 'restore']);

// Profile schemas
export const profileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable(),
  photo_url: z.string().nullable(),
  locale: z.string().default('id-ID'),
  currency: z.string().default('IDR'),
  timezone: z.string().default('Asia/Jakarta'),
  created_at: z.coerce.date()
});

export type Profile = z.infer<typeof profileSchema>;

export const createProfileInputSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  locale: z.string().default('id-ID'),
  currency: z.string().default('IDR'),
  timezone: z.string().default('Asia/Jakarta')
});

export type CreateProfileInput = z.infer<typeof createProfileInputSchema>;

export const updateProfileInputSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  locale: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional()
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

// Account schemas
export const accountSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  type: accountTypeEnum,
  balance: z.number(),
  currency: z.string(),
  created_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullable()
});

export type Account = z.infer<typeof accountSchema>;

export const createAccountInputSchema = z.object({
  name: z.string().min(1),
  type: accountTypeEnum,
  balance: z.number().default(0),
  currency: z.string().default('IDR')
});

export type CreateAccountInput = z.infer<typeof createAccountInputSchema>;

export const updateAccountInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  type: accountTypeEnum.optional(),
  balance: z.number().optional(),
  currency: z.string().optional()
});

export type UpdateAccountInput = z.infer<typeof updateAccountInputSchema>;

// Category schemas
export const categorySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  type: categoryTypeEnum,
  color: z.string(),
  created_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullable()
});

export type Category = z.infer<typeof categorySchema>;

export const createCategoryInputSchema = z.object({
  name: z.string().min(1),
  type: categoryTypeEnum,
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color')
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

export const updateCategoryInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  type: categoryTypeEnum.optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional()
});

export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;

// Transaction schemas
export const transactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  account_id: z.string().uuid(),
  category_id: z.string().uuid(),
  type: transactionTypeEnum,
  amount: z.number().nonnegative(),
  currency: z.string(),
  occurred_at: z.coerce.date(),
  note: z.string().nullable(),
  tags: z.array(z.string()),
  receipt_url: z.string().nullable(),
  transfer_group_id: z.string().uuid().nullable(),
  created_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullable()
});

export type Transaction = z.infer<typeof transactionSchema>;

export const createTransactionInputSchema = z.object({
  account_id: z.string().uuid(),
  category_id: z.string().uuid(),
  type: transactionTypeEnum,
  amount: z.number().positive(),
  currency: z.string().default('IDR'),
  occurred_at: z.coerce.date(),
  note: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  receipt_url: z.string().nullable().optional(),
  transfer_group_id: z.string().uuid().nullable().optional()
});

export type CreateTransactionInput = z.infer<typeof createTransactionInputSchema>;

export const updateTransactionInputSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  type: transactionTypeEnum.optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  occurred_at: z.coerce.date().optional(),
  note: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  receipt_url: z.string().nullable().optional(),
  transfer_group_id: z.string().uuid().nullable().optional()
});

export type UpdateTransactionInput = z.infer<typeof updateTransactionInputSchema>;

// Transfer transaction schema
export const createTransferInputSchema = z.object({
  from_account_id: z.string().uuid(),
  to_account_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('IDR'),
  occurred_at: z.coerce.date(),
  note: z.string().nullable().optional()
});

export type CreateTransferInput = z.infer<typeof createTransferInputSchema>;

// Budget schemas
export const budgetSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  category_id: z.string().uuid(),
  month: z.coerce.date(),
  amount: z.number().nonnegative(),
  rollover: z.boolean(),
  created_at: z.coerce.date()
});

export type Budget = z.infer<typeof budgetSchema>;

export const createBudgetInputSchema = z.object({
  category_id: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}-01$/, 'Month must be in YYYY-MM-01 format'),
  amount: z.number().nonnegative(),
  rollover: z.boolean().default(false)
});

export type CreateBudgetInput = z.infer<typeof createBudgetInputSchema>;

export const updateBudgetInputSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().nonnegative().optional(),
  rollover: z.boolean().optional()
});

export type UpdateBudgetInput = z.infer<typeof updateBudgetInputSchema>;

// Recurring rules schemas
export const recurringRuleSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  template: z.record(z.any()), // JSONB field for transaction template
  schedule: z.string(), // RRULE format
  next_run: z.coerce.date(),
  active: z.boolean(),
  created_at: z.coerce.date()
});

export type RecurringRule = z.infer<typeof recurringRuleSchema>;

export const createRecurringRuleInputSchema = z.object({
  template: z.record(z.any()),
  schedule: z.string().min(1),
  next_run: z.coerce.date(),
  active: z.boolean().default(true)
});

export type CreateRecurringRuleInput = z.infer<typeof createRecurringRuleInputSchema>;

export const updateRecurringRuleInputSchema = z.object({
  id: z.string().uuid(),
  template: z.record(z.any()).optional(),
  schedule: z.string().min(1).optional(),
  next_run: z.coerce.date().optional(),
  active: z.boolean().optional()
});

export type UpdateRecurringRuleInput = z.infer<typeof updateRecurringRuleInputSchema>;

// Goals schemas
export const goalSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  target_amount: z.number().positive(),
  current_amount: z.number().nonnegative(),
  deadline: z.coerce.date(),
  created_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullable()
});

export type Goal = z.infer<typeof goalSchema>;

export const createGoalInputSchema = z.object({
  name: z.string().min(1),
  target_amount: z.number().positive(),
  current_amount: z.number().nonnegative().default(0),
  deadline: z.coerce.date()
});

export type CreateGoalInput = z.infer<typeof createGoalInputSchema>;

export const updateGoalInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  target_amount: z.number().positive().optional(),
  current_amount: z.number().nonnegative().optional(),
  deadline: z.coerce.date().optional()
});

export type UpdateGoalInput = z.infer<typeof updateGoalInputSchema>;

// Audit log schemas
export const auditLogSchema = z.object({
  id: z.number().int(),
  user_id: z.string().uuid(),
  action: auditActionEnum,
  table_name: z.string(),
  record_id: z.string().uuid(),
  meta: z.record(z.any()),
  created_at: z.coerce.date()
});

export type AuditLog = z.infer<typeof auditLogSchema>;

// Query schemas
export const getTransactionsInputSchema = z.object({
  limit: z.number().int().positive().optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  type: transactionTypeEnum.optional(),
  tags: z.array(z.string()).optional()
});

export type GetTransactionsInput = z.infer<typeof getTransactionsInputSchema>;

export const getBudgetsInputSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
});

export type GetBudgetsInput = z.infer<typeof getBudgetsInputSchema>;

export const getReportsInputSchema = z.object({
  date_from: z.coerce.date(),
  date_to: z.coerce.date(),
  type: z.enum(['cashflow', 'category_distribution', 'monthly_trend']).optional()
});

export type GetReportsInput = z.infer<typeof getReportsInputSchema>;

// Common response schemas
export const paginatedResponseSchema = z.object({
  data: z.array(z.any()),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative()
});

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  limit: number;
  offset: number;
};

export const dashboardSummarySchema = z.object({
  total_balance: z.number(),
  monthly_income: z.number(),
  monthly_expense: z.number(),
  net_cashflow: z.number(),
  top_categories: z.array(z.object({
    category_name: z.string(),
    amount: z.number(),
    percentage: z.number()
  })),
  budget_progress: z.array(z.object({
    category_name: z.string(),
    budgeted: z.number(),
    spent: z.number(),
    remaining: z.number(),
    percentage: z.number()
  })),
  goals_progress: z.array(z.object({
    goal_name: z.string(),
    target_amount: z.number(),
    current_amount: z.number(),
    percentage: z.number(),
    deadline: z.coerce.date()
  }))
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;