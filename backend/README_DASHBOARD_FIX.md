# Dashboard Books Fix

## Issue
Books were not showing in the admin dashboard because the dashboard was using the original `Book` model, while the simplified books are stored in the `books_simple` collection using the `BookSimple` model.

## Solution
Updated `backend/controllers/dashboardController.js` to include books from both:
1. Original `Book` model (if any exist)
2. Simplified `BookSimple` model (the new schema)

The dashboard now aggregates counts from both collections.

## If you want to use ONLY BookSimple

If you want the dashboard to show only the simplified books, you can modify the controller to use only `BookSimple`:

```javascript
// In dashboardController.js, replace the book stats section with:
const totalBooks = await BookSimple.countDocuments({});
const availableBooks = await BookSimple.aggregate([
  { $group: { _id: null, total: { $sum: '$availableCopies' } } }
]);
const available = availableBooks[0]?.total || 0;

const stats = {
  books: {
    total: totalBooks,
    available: available,
    borrowed: 0 // Simplified schema doesn't track borrowed separately
  },
  // ... rest of stats
};
```

## Current Implementation

The current implementation combines both models, so you'll see:
- Total Books = Original books + Simplified books
- Available Books = Sum of available copies from both collections
- Borrowed Books = Only from original model (simplified doesn't track this)

