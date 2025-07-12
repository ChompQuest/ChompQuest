# Nutrition Goals Data Flow & API Requirements

## Overview

To ensure the frontend can always display and update a user's nutrition goals (for the tracker and the update form), the backend must provide reliable endpoints and session/token-based access to user-specific data.

---

## 1. Fetching Nutrition Goals on Login

- **On successful login**, the backend should return the user's nutrition goals along with their profile data (or provide an endpoint to fetch them by user ID/token).
- **Recommended:**
  - Include nutrition goals in the login response, or
  - Provide a `/api/goals` endpoint that returns the current user's goals based on their session/token.

### Example Login Response

```json
{
  "user": {
    "id": "abc123",
    "username": "johndoe",
    ...
  },
  "nutritionGoals": {
    "calories": 2000,
    "protein": 150,
    "carbs": 250,
    "fats": 60
  },
  "token": "jwt-or-session-token"
}
```

---

## 2. API Endpoints Needed

- `GET /api/goals` — Returns the current user's nutrition goals (using session/JWT for auth).
- `PUT /api/goals` — Updates the current user's nutrition goals.
- (Optional) `GET /api/user` — Returns user profile info.

**All endpoints should use authentication (session or JWT) to identify the user.**

---

## 3. Data Flow for Pre-Populating Forms

- When the frontend navigates to the Update Nutrition Goals page, it should fetch the user's current goals from `/api/goals` (or use cached data from login).
- The backend should ensure this endpoint is fast and always returns the latest data for the authenticated user.

---

## 4. Best Practices

- **Always use authentication** to ensure users only access their own data.
- **Return nutrition goals in login response** for fast initial load, but also provide a dedicated endpoint for later fetches/refreshes.
- **Keep nutrition goals in a separate field or subdocument** in the user schema for easy access and updates.
- **Support both GET and PUT/PATCH** for nutrition goals.

---

## 5. Example Mongoose Schema (User)

```js
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  nutritionGoals: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
  },
  // ...other fields
});
```

---

## 6. Example Express Route (GET Goals)

```js
// Assumes req.user is set by auth middleware
router.get("/api/goals", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  res.json(req.user.nutritionGoals);
});
```

---

## 7. Summary

- On login, return or make available the user's nutrition goals.
- Provide secure endpoints for fetching and updating goals.
- Ensure frontend can always get the latest goals for display and form pre-population.
