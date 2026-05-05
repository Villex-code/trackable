/**
 * DIET IMPORT SCHEMA
 * Use this JSON structure to bulk import meals and activities.
 * 
 * Fields:
 * - amount (number): Calorie count.
 * - type (string): "input" for meals, "output" for activities/exercise.
 * - description (string): Name of the meal or activity.
 * - logged_at (string, optional): ISO date string. Defaults to current time.
 */

export const DietSchemaTemplate = [
  {
    "amount": 500,
    "type": "input",
    "description": "Lunch: Chicken and Rice",
    "logged_at": "2024-05-05T12:00:00Z"
  },
  {
    "amount": 300,
    "type": "output",
    "description": "30min Running",
    "logged_at": "2024-05-05T18:00:00Z"
  }
];

export type DietLogEntry = {
  amount: number;
  type: "input" | "output";
  description: string;
  logged_at?: string;
};
