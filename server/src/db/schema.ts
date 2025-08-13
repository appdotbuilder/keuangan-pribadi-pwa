import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  numeric, 
  boolean, 
  jsonb, 
  pgEnum,
  serial,
  date,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const accountTypeEnum = pgEnum('account_type', ['cash', 'bank', 'ewallet']);
export const categoryTypeEnum = pgEnum('category_type', ['income', 'expense']);
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense', 'transfer_in', 'transfer_out']);
export const auditActionEnum = pgEnum('audit_action', ['create', 'update', 'delete', 'soft_delete', 'restore']);

// Profiles table
export const profilesTable = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  full_name: text('full_name'),
  photo_url: text('photo_url'),
  locale: text('locale').notNull().default('id-ID'),
  currency: text('currency').notNull().default('IDR'),
  timezone: text('timezone').notNull().default('Asia/Jakarta'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Accounts table
export const accountsTable = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  name: text('name').notNull(),
  type: accountTypeEnum('type').notNull(),
  balance: numeric('balance', { precision: 15, scale: 2 }).notNull().default('0'),
  currency: text('currency').notNull().default('IDR'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at')
}, (table) => ({
  userIdIdx: index('accounts_user_id_idx').on(table.user_id)
}));

// Categories table
export const categoriesTable = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  name: text('name').notNull(),
  type: categoryTypeEnum('type').notNull(),
  color: text('color').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at')
}, (table) => ({
  userIdIdx: index('categories_user_id_idx').on(table.user_id)
}));

// Transactions table
export const transactionsTable = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  account_id: uuid('account_id').notNull(),
  category_id: uuid('category_id').notNull(),
  type: transactionTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('IDR'),
  occurred_at: date('occurred_at').notNull(),
  note: text('note'),
  tags: text('tags').array(),
  receipt_url: text('receipt_url'),
  transfer_group_id: uuid('transfer_group_id'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at')
}, (table) => ({
  userIdOccurredAtIdx: index('transactions_user_id_occurred_at_idx').on(table.user_id, table.occurred_at),
  accountIdIdx: index('transactions_account_id_idx').on(table.account_id),
  categoryIdIdx: index('transactions_category_id_idx').on(table.category_id),
  transferGroupIdx: index('transactions_transfer_group_idx').on(table.transfer_group_id)
}));

// Budgets table
export const budgetsTable = pgTable('budgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  category_id: uuid('category_id').notNull(),
  month: date('month').notNull(), // YYYY-MM-01 format
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  rollover: boolean('rollover').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  userIdMonthIdx: index('budgets_user_id_month_idx').on(table.user_id, table.month),
  uniqueUserCategoryMonth: index('budgets_unique_user_category_month').on(table.user_id, table.category_id, table.month)
}));

// Recurring rules table
export const recurringRulesTable = pgTable('recurring_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  template: jsonb('template').notNull(),
  schedule: text('schedule').notNull(), // RRULE format
  next_run: date('next_run').notNull(),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('recurring_rules_user_id_idx').on(table.user_id),
  nextRunIdx: index('recurring_rules_next_run_idx').on(table.next_run)
}));

// Goals table
export const goalsTable = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  name: text('name').notNull(),
  target_amount: numeric('target_amount', { precision: 15, scale: 2 }).notNull(),
  current_amount: numeric('current_amount', { precision: 15, scale: 2 }).notNull().default('0'),
  deadline: date('deadline').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at')
}, (table) => ({
  userIdIdx: index('goals_user_id_idx').on(table.user_id)
}));

// Audit logs table
export const auditLogsTable = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  user_id: uuid('user_id').notNull(),
  action: auditActionEnum('action').notNull(),
  table_name: text('table_name').notNull(),
  record_id: uuid('record_id').notNull(),
  meta: jsonb('meta').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('audit_logs_user_id_idx').on(table.user_id),
  tableRecordIdx: index('audit_logs_table_record_idx').on(table.table_name, table.record_id)
}));

// Relations
export const profilesRelations = relations(profilesTable, ({ many }) => ({
  accounts: many(accountsTable),
  categories: many(categoriesTable),
  transactions: many(transactionsTable),
  budgets: many(budgetsTable),
  recurringRules: many(recurringRulesTable),
  goals: many(goalsTable),
  auditLogs: many(auditLogsTable)
}));

export const accountsRelations = relations(accountsTable, ({ one, many }) => ({
  user: one(profilesTable, {
    fields: [accountsTable.user_id],
    references: [profilesTable.id]
  }),
  transactions: many(transactionsTable)
}));

export const categoriesRelations = relations(categoriesTable, ({ one, many }) => ({
  user: one(profilesTable, {
    fields: [categoriesTable.user_id],
    references: [profilesTable.id]
  }),
  transactions: many(transactionsTable),
  budgets: many(budgetsTable)
}));

export const transactionsRelations = relations(transactionsTable, ({ one }) => ({
  user: one(profilesTable, {
    fields: [transactionsTable.user_id],
    references: [profilesTable.id]
  }),
  account: one(accountsTable, {
    fields: [transactionsTable.account_id],
    references: [accountsTable.id]
  }),
  category: one(categoriesTable, {
    fields: [transactionsTable.category_id],
    references: [categoriesTable.id]
  })
}));

export const budgetsRelations = relations(budgetsTable, ({ one }) => ({
  user: one(profilesTable, {
    fields: [budgetsTable.user_id],
    references: [profilesTable.id]
  }),
  category: one(categoriesTable, {
    fields: [budgetsTable.category_id],
    references: [categoriesTable.id]
  })
}));

export const recurringRulesRelations = relations(recurringRulesTable, ({ one }) => ({
  user: one(profilesTable, {
    fields: [recurringRulesTable.user_id],
    references: [profilesTable.id]
  })
}));

export const goalsRelations = relations(goalsTable, ({ one }) => ({
  user: one(profilesTable, {
    fields: [goalsTable.user_id],
    references: [profilesTable.id]
  })
}));

export const auditLogsRelations = relations(auditLogsTable, ({ one }) => ({
  user: one(profilesTable, {
    fields: [auditLogsTable.user_id],
    references: [profilesTable.id]
  })
}));

// Export all tables for proper query building
export const tables = {
  profiles: profilesTable,
  accounts: accountsTable,
  categories: categoriesTable,
  transactions: transactionsTable,
  budgets: budgetsTable,
  recurringRules: recurringRulesTable,
  goals: goalsTable,
  auditLogs: auditLogsTable
};

// TypeScript types for table schemas
export type Profile = typeof profilesTable.$inferSelect;
export type NewProfile = typeof profilesTable.$inferInsert;

export type Account = typeof accountsTable.$inferSelect;
export type NewAccount = typeof accountsTable.$inferInsert;

export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;

export type Transaction = typeof transactionsTable.$inferSelect;
export type NewTransaction = typeof transactionsTable.$inferInsert;

export type Budget = typeof budgetsTable.$inferSelect;
export type NewBudget = typeof budgetsTable.$inferInsert;

export type RecurringRule = typeof recurringRulesTable.$inferSelect;
export type NewRecurringRule = typeof recurringRulesTable.$inferInsert;

export type Goal = typeof goalsTable.$inferSelect;
export type NewGoal = typeof goalsTable.$inferInsert;

export type AuditLog = typeof auditLogsTable.$inferSelect;
export type NewAuditLog = typeof auditLogsTable.$inferInsert;