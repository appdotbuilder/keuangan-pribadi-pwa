import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createProfileInputSchema,
  updateProfileInputSchema,
  createAccountInputSchema,
  updateAccountInputSchema,
  createCategoryInputSchema,
  updateCategoryInputSchema,
  createTransactionInputSchema,
  updateTransactionInputSchema,
  createTransferInputSchema,
  createBudgetInputSchema,
  updateBudgetInputSchema,
  createRecurringRuleInputSchema,
  updateRecurringRuleInputSchema,
  createGoalInputSchema,
  updateGoalInputSchema,
  getTransactionsInputSchema,
  getBudgetsInputSchema,
  getReportsInputSchema,
  categoryTypeEnum
} from './schema';

// Import handlers
import { createProfile } from './handlers/create_profile';
import { updateProfile } from './handlers/update_profile';
import { getProfile } from './handlers/get_profile';
import { createAccount } from './handlers/create_account';
import { updateAccount } from './handlers/update_account';
import { getAccounts } from './handlers/get_accounts';
import { deleteAccount } from './handlers/delete_account';
import { createCategory } from './handlers/create_category';
import { updateCategory } from './handlers/update_category';
import { getCategories } from './handlers/get_categories';
import { deleteCategory } from './handlers/delete_category';
import { createTransaction } from './handlers/create_transaction';
import { createTransfer } from './handlers/create_transfer';
import { getTransactions } from './handlers/get_transactions';
import { updateTransaction } from './handlers/update_transaction';
import { deleteTransaction } from './handlers/delete_transaction';
import { createBudget } from './handlers/create_budget';
import { getBudgets } from './handlers/get_budgets';
import { updateBudget } from './handlers/update_budget';
import { deleteBudget } from './handlers/delete_budget';
import { createRecurringRule } from './handlers/create_recurring_rule';
import { getRecurringRules } from './handlers/get_recurring_rules';
import { updateRecurringRule } from './handlers/update_recurring_rule';
import { executeRecurringRule } from './handlers/execute_recurring_rule';
import { deleteRecurringRule } from './handlers/delete_recurring_rule';
import { createGoal } from './handlers/create_goal';
import { getGoals } from './handlers/get_goals';
import { updateGoal } from './handlers/update_goal';
import { deleteGoal } from './handlers/delete_goal';
import { getDashboardSummary } from './handlers/get_dashboard_summary';
import { getReports } from './handlers/get_reports';
import { getAuditLogs } from './handlers/get_audit_logs';

// Define context type
interface Context {
  userId?: string | null;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

// Mock context - in real implementation, this would extract user from JWT
const createContext = (): Context => {
  // This is a placeholder! Real implementation should:
  // 1. Extract JWT token from Authorization header
  // 2. Verify token with Supabase
  // 3. Extract user ID from token
  // 4. Return context with authenticated user
  return {
    userId: 'mock-user-id' // Placeholder user ID
  };
};

const authenticatedProcedure = publicProcedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.userId) {
    throw new Error('Unauthorized');
  }
  return opts.next({
    ctx: {
      ...ctx,
      userId: ctx.userId
    }
  });
});

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Profile routes
  createProfile: authenticatedProcedure
    .input(createProfileInputSchema)
    .mutation(({ input, ctx }) => createProfile(input)),

  updateProfile: authenticatedProcedure
    .input(updateProfileInputSchema)
    .mutation(({ input, ctx }) => updateProfile(input)),

  getProfile: authenticatedProcedure
    .query(({ ctx }) => getProfile(ctx.userId)),

  // Account routes
  createAccount: authenticatedProcedure
    .input(createAccountInputSchema)
    .mutation(({ input, ctx }) => createAccount(ctx.userId, input)),

  updateAccount: authenticatedProcedure
    .input(updateAccountInputSchema)
    .mutation(({ input, ctx }) => updateAccount(ctx.userId, input)),

  getAccounts: authenticatedProcedure
    .input(z.object({ includeDeleted: z.boolean().optional() }).optional())
    .query(({ input, ctx }) => getAccounts(ctx.userId, input?.includeDeleted)),

  deleteAccount: authenticatedProcedure
    .input(z.object({ accountId: z.string().uuid() }))
    .mutation(({ input, ctx }) => deleteAccount(ctx.userId, input.accountId)),

  // Category routes
  createCategory: authenticatedProcedure
    .input(createCategoryInputSchema)
    .mutation(({ input, ctx }) => createCategory(ctx.userId, input)),

  updateCategory: authenticatedProcedure
    .input(updateCategoryInputSchema)
    .mutation(({ input, ctx }) => updateCategory(ctx.userId, input)),

  getCategories: authenticatedProcedure
    .input(z.object({ 
      type: categoryTypeEnum.optional(),
      includeDeleted: z.boolean().optional() 
    }).optional())
    .query(({ input, ctx }) => getCategories(ctx.userId, input?.type, input?.includeDeleted)),

  deleteCategory: authenticatedProcedure
    .input(z.object({ categoryId: z.string().uuid() }))
    .mutation(({ input, ctx }) => deleteCategory(ctx.userId, input.categoryId)),

  // Transaction routes
  createTransaction: authenticatedProcedure
    .input(createTransactionInputSchema)
    .mutation(({ input, ctx }) => createTransaction(ctx.userId, input)),

  createTransfer: authenticatedProcedure
    .input(createTransferInputSchema)
    .mutation(({ input, ctx }) => createTransfer(ctx.userId, input)),

  getTransactions: authenticatedProcedure
    .input(getTransactionsInputSchema.optional())
    .query(({ input, ctx }) => getTransactions(ctx.userId, input || {})),

  updateTransaction: authenticatedProcedure
    .input(updateTransactionInputSchema)
    .mutation(({ input, ctx }) => updateTransaction(ctx.userId, input)),

  deleteTransaction: authenticatedProcedure
    .input(z.object({ transactionId: z.string().uuid() }))
    .mutation(({ input, ctx }) => deleteTransaction(ctx.userId, input.transactionId)),

  // Budget routes
  createBudget: authenticatedProcedure
    .input(createBudgetInputSchema)
    .mutation(({ input, ctx }) => createBudget(ctx.userId, input)),

  getBudgets: authenticatedProcedure
    .input(getBudgetsInputSchema)
    .query(({ input, ctx }) => getBudgets(ctx.userId, input)),

  updateBudget: authenticatedProcedure
    .input(updateBudgetInputSchema)
    .mutation(({ input, ctx }) => updateBudget(ctx.userId, input)),

  deleteBudget: authenticatedProcedure
    .input(z.object({ budgetId: z.string().uuid() }))
    .mutation(({ input, ctx }) => deleteBudget(ctx.userId, input.budgetId)),

  // Recurring rules routes
  createRecurringRule: authenticatedProcedure
    .input(createRecurringRuleInputSchema)
    .mutation(({ input, ctx }) => createRecurringRule(ctx.userId, input)),

  getRecurringRules: authenticatedProcedure
    .input(z.object({ activeOnly: z.boolean().optional() }).optional())
    .query(({ input, ctx }) => getRecurringRules(ctx.userId, input?.activeOnly)),

  updateRecurringRule: authenticatedProcedure
    .input(updateRecurringRuleInputSchema)
    .mutation(({ input, ctx }) => updateRecurringRule(ctx.userId, input)),

  executeRecurringRule: authenticatedProcedure
    .input(z.object({ ruleId: z.string().uuid() }))
    .mutation(({ input, ctx }) => executeRecurringRule(ctx.userId, input.ruleId)),

  deleteRecurringRule: authenticatedProcedure
    .input(z.object({ ruleId: z.string().uuid() }))
    .mutation(({ input, ctx }) => deleteRecurringRule(ctx.userId, input.ruleId)),

  // Goals routes
  createGoal: authenticatedProcedure
    .input(createGoalInputSchema)
    .mutation(({ input, ctx }) => createGoal(ctx.userId, input)),

  getGoals: authenticatedProcedure
    .input(z.object({ includeDeleted: z.boolean().optional() }).optional())
    .query(({ input, ctx }) => getGoals(ctx.userId, input?.includeDeleted)),

  updateGoal: authenticatedProcedure
    .input(updateGoalInputSchema)
    .mutation(({ input, ctx }) => updateGoal(ctx.userId, input)),

  deleteGoal: authenticatedProcedure
    .input(z.object({ goalId: z.string().uuid() }))
    .mutation(({ input, ctx }) => deleteGoal(ctx.userId, input.goalId)),

  // Dashboard and reports
  getDashboardSummary: authenticatedProcedure
    .query(({ ctx }) => getDashboardSummary(ctx.userId)),

  getReports: authenticatedProcedure
    .input(getReportsInputSchema)
    .query(({ input, ctx }) => getReports(ctx.userId, input)),

  // Audit logs
  getAuditLogs: authenticatedProcedure
    .input(z.object({
      limit: z.number().int().positive().optional(),
      offset: z.number().int().nonnegative().optional(),
      table_name: z.string().optional(),
      action: z.enum(['create', 'update', 'delete', 'soft_delete', 'restore']).optional(),
      record_id: z.string().uuid().optional()
    }).optional())
    .query(({ input = {}, ctx }) => getAuditLogs(ctx.userId, input))
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors({
        origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3000'],
        credentials: true
      })(req, res, next);
    },
    router: appRouter,
    createContext
  });
  
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
  console.log('Available routes:');
  console.log('- Health check: /healthcheck');
  console.log('- Profile: createProfile, updateProfile, getProfile');
  console.log('- Accounts: createAccount, updateAccount, getAccounts, deleteAccount');
  console.log('- Categories: createCategory, updateCategory, getCategories, deleteCategory');
  console.log('- Transactions: createTransaction, createTransfer, getTransactions, updateTransaction, deleteTransaction');
  console.log('- Budgets: createBudget, getBudgets, updateBudget, deleteBudget');
  console.log('- Recurring: createRecurringRule, getRecurringRules, updateRecurringRule, executeRecurringRule, deleteRecurringRule');
  console.log('- Goals: createGoal, getGoals, updateGoal, deleteGoal');
  console.log('- Reports: getDashboardSummary, getReports');
  console.log('- Audit: getAuditLogs');
}

start();