/**
 * FINANCIAL IMPORT SCHEMA
 * Use this JSON structure to bulk import transactions and subscriptions.
 * 
 * Fields:
 * - amount (number): The currency amount.
 * - type (string): "income" or "expense".
 * - category (string): Category name (e.g., "Subscription", "Food", "Salary").
 * - description (string, optional): Details about the transaction.
 * - is_recurring (boolean, optional): Set to true for subscriptions.
 * - logged_at (string, optional): ISO date string. Defaults to current time.
 */

export const FinancialSchemaTemplate = [
  {
    "amount": 14.99,
    "type": "expense",
    "category": "Subscription",
    "description": "Netflix",
    "is_recurring": true,
    "logged_at": "2024-05-01T10:00:00Z"
  },
  {
    "amount": 2500.00,
    "type": "income",
    "category": "Salary",
    "description": "Monthly Salary",
    "is_recurring": false,
    "logged_at": "2024-05-01T09:00:00Z"
  }
];

export type FinancialLogEntry = {
  amount: number;
  type: "income" | "expense";
  category: string;
  description?: string;
  is_recurring?: boolean;
  logged_at?: string;
};
