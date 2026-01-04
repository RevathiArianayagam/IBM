# Book Management API - Usage Examples

## Base URL
`http://localhost:5000/api/books/simple`

## 1️⃣ Create (Insert) - Minimum 7 Books

### Seed Books (Recommended)
```bash
cd backend
npm run seed:books
```

This will insert 10 books into the database.

### Manual Create
```bash
POST /api/books/simple
Authorization: Bearer YOUR_TOKEN

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "category": "Fiction",
  "publishedYear": 1925,
  "availableCopies": 5
}
```

## 2️⃣ Read Operations

### Get All Books
```bash
GET /api/books/simple
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "...",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "category": "Fiction",
      "publishedYear": 1925,
      "availableCopies": 5,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### Get Books by Category
```bash
GET /api/books/simple/category/Fiction
```

**Response:**
```json
{
  "success": true,
  "count": 4,
  "category": "Fiction",
  "data": [...]
}
```

### Get Books After Year 2015
```bash
GET /api/books/simple/after-year/2015
```

Or:
```bash
GET /api/books/simple/after-year
```

**Response:**
```json
{
  "success": true,
  "count": 4,
  "year": 2015,
  "data": [
    {
      "title": "The Silent Patient",
      "publishedYear": 2019,
      ...
    },
    {
      "title": "Educated",
      "publishedYear": 2018,
      ...
    }
  ]
}
```

### Get Single Book
```bash
GET /api/books/simple/:id
```

## 3️⃣ Update Operations

### Update Book (Increase/Decrease Copies, Change Category)
```bash
PUT /api/books/simple/:id
Authorization: Bearer YOUR_TOKEN

{
  "availableCopies": 10
}
```

**Increase Copies:**
```json
{
  "availableCopies": 10
}
```

**Decrease Copies:**
```json
{
  "availableCopies": 2
}
```

**Change Category:**
```json
{
  "category": "Classic Fiction"
}
```

### Increase Copies (Alternative Method)
```bash
PATCH /api/books/simple/:id/increase
Authorization: Bearer YOUR_TOKEN

{
  "amount": 5
}
```

### Decrease Copies (Alternative Method)
```bash
PATCH /api/books/simple/:id/decrease
Authorization: Bearer YOUR_TOKEN

{
  "amount": 2
}
```

## 4️⃣ Delete Operation

### Delete Book (Only if copies = 0)
```bash
DELETE /api/books/simple/:id
Authorization: Bearer YOUR_TOKEN
```

**Success Response:**
```json
{
  "success": true,
  "message": "Book deleted successfully",
  "data": {}
}
```

**Error Response (if copies > 0):**
```json
{
  "success": false,
  "message": "Cannot delete book. There are 5 available copies. Books can only be deleted when available copies = 0."
}
```

## Error Handling Examples

### Book Not Found (404)
```json
{
  "success": false,
  "message": "Book not found"
}
```

### Negative Stock Prevention (400)
```json
{
  "success": false,
  "message": "Available copies cannot be negative"
}
```

### Invalid Update (400)
```json
{
  "success": false,
  "message": "Cannot decrease copies. Available copies (2) would become negative."
}
```

### Delete Error (400)
```json
{
  "success": false,
  "message": "Cannot delete book. There are 3 available copies. Books can only be deleted when available copies = 0."
}
```

### Validation Error (400)
```json
{
  "success": false,
  "message": "All fields are required: title, author, category, publishedYear, availableCopies"
}
```

## Testing with cURL

### Get All Books
```bash
curl http://localhost:5000/api/books/simple
```

### Get Books by Category
```bash
curl http://localhost:5000/api/books/simple/category/Fiction
```

### Get Books After 2015
```bash
curl http://localhost:5000/api/books/simple/after-year/2015
```

### Create Book
```bash
curl -X POST http://localhost:5000/api/books/simple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "New Book",
    "author": "Author Name",
    "category": "Fiction",
    "publishedYear": 2020,
    "availableCopies": 3
  }'
```

### Update Book
```bash
curl -X PUT http://localhost:5000/api/books/simple/BOOK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "availableCopies": 10
  }'
```

### Delete Book
```bash
curl -X DELETE http://localhost:5000/api/books/simple/BOOK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Summary

✅ **Schema**: title, author, category, publishedYear, availableCopies  
✅ **Create**: Insert minimum 7 books (10 books seeded)  
✅ **Read**: All books, by category, after year 2015  
✅ **Update**: Increase/decrease copies, change category  
✅ **Delete**: Only if copies = 0  
✅ **Error Handling**: Book not found, negative stock prevention, validation errors

