import { type UpdateAccountInput, type Account } from '../schema';

export async function updateAccount(userId: string, input: UpdateAccountInput): Promise<Account> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is updating account information for the user.
    // Should validate user ownership and update only the provided fields.
    return Promise.resolve({
        id: input.id,
        user_id: userId,
        name: input.name || 'Account',
        type: input.type || 'cash',
        balance: input.balance || 0,
        currency: input.currency || 'IDR',
        created_at: new Date(),
        deleted_at: null
    } as Account);
}