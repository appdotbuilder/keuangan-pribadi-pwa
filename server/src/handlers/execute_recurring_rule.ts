import { type Transaction } from '../schema';

export async function executeRecurringRule(userId: string, ruleId: string): Promise<Transaction> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is manually executing a recurring rule to create transaction.
    // Should validate rule ownership, create transaction from template, and update next_run.
    return Promise.resolve({
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: crypto.randomUUID(),
        category_id: crypto.randomUUID(),
        type: 'expense',
        amount: 0,
        currency: 'IDR',
        occurred_at: new Date(),
        note: null,
        tags: [],
        receipt_url: null,
        transfer_group_id: null,
        created_at: new Date(),
        deleted_at: null
    } as Transaction);
}