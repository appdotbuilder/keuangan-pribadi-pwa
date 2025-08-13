import { type Category } from '../schema';

export async function getCategories(userId: string, type?: 'income' | 'expense', includeDeleted = false): Promise<Category[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is fetching categories for the user from the database.
    // Optionally filter by type (income/expense) and by default excludes soft-deleted categories.
    return Promise.resolve([]);
}