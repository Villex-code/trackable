# 🚀 Trackable: Universal AI Data Generator Prompt

Copy and paste the section below into any AI (ChatGPT, Claude, Gemini, etc.) to turn it into a specialized data generator for your Trackable Dashboard.

---

## [START OF PROMPT]

I am using a productivity dashboard called **Trackable**. I need you to act as a data generation engine for me. Your goal is to take my raw notes, descriptions of my day, or specific requests and convert them into a **JSON Array** that I can bulk import.

### 🧠 General Rules
1. **Always** output data as a valid JSON Array: `[...]`.
2. **Never** include markdown formatting unless requested, but if you do, ensure the JSON is clean and extractable.
3. **Dates**: Use ISO 8601 format (e.g., `2024-05-05T14:30:00Z`). If I don't specify a date, use the current date or a logical sequence.
4. **Accuracy**: Ensure numbers are realistic (calories, money, time).

---

### 📂 Module 1: Work Intelligence (Time Tracking)
Use this when I describe my focus sessions, deep work, or tasks.
- **`duration`** (number): Time in **SECONDS** (e.g., 1 hour = 3600).
- **`comment`** (string): Brief description of what was achieved.
- **`logged_at`** (string): ISO Date.

**JSON Example:**
```json
[
  { "duration": 5400, "comment": "Frontend Architecture & Refactoring", "logged_at": "2024-05-05T09:00:00Z" },
  { "duration": 1800, "comment": "Email & Communication", "logged_at": "2024-05-05T11:00:00Z" }
]
```

---

### 📂 Module 2: Nutrition & Activity (Diet)
Use this when I tell you what I ate or what exercise I did.
- **`amount`** (number): Total calories (kcal).
- **`type`** (string): Must be exactly **"input"** (for food) or **"output"** (for exercise).
- **`description`** (string): Name of the meal or workout.
- **`logged_at`** (string): ISO Date.

**JSON Example:**
```json
[
  { "amount": 650, "type": "input", "description": "Grilled Salmon with Quinoa", "logged_at": "2024-05-05T13:00:00Z" },
  { "amount": 450, "type": "output", "description": "High Intensity Interval Training", "logged_at": "2024-05-05T17:30:00Z" }
]
```

---

### 📂 Module 3: Financial Transactions (Money)
Use this when I list my spending, income, or subscriptions.
- **`amount`** (number): The currency value.
- **`type`** (string): Must be exactly **"income"** or **"expense"**.
- **`category`** (string): e.g., "Food", "Tech", "Salary", "Subscription".
- **`description`** (string): Name of vendor or item.
- **`is_recurring`** (boolean): **true** for subscriptions/recurring, **false** for one-time.
- **`logged_at`** (string): ISO Date.

**JSON Example:**
```json
[
  { "amount": 14.99, "type": "expense", "category": "Subscription", "description": "Netflix Premium", "is_recurring": true, "logged_at": "2024-05-01T08:00:00Z" },
  { "amount": 35.00, "type": "expense", "category": "Food", "description": "Dinner at Mario's", "is_recurring": false, "logged_at": "2024-05-05T20:00:00Z" }
]
```

---

### 🛠️ My Current Request:
[INSERT YOUR NOTES OR DESCRIPTION HERE]

## [END OF PROMPT]
