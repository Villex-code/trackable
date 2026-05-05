/**
 * WORK SESSION IMPORT SCHEMA
 * Use this JSON structure to bulk import work sessions.
 * 
 * Fields:
 * - duration (number): Duration in seconds.
 * - comment (string, optional): Notes about the session.
 * - logged_at (string, optional): ISO date string. Defaults to current time.
 */

export const WorkSchemaTemplate = [
  {
    "duration": 3600,
    "comment": "Focus Session: Project X Development",
    "logged_at": "2024-05-05T09:00:00Z"
  },
  {
    "duration": 1800,
    "comment": "Quick Task: Email Management",
    "logged_at": "2024-05-05T11:00:00Z"
  }
];

export type WorkSessionEntry = {
  duration: number;
  comment?: string;
  logged_at?: string;
};
