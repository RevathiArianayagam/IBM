# Library Book Management - Simplified Schema

This document describes the simplified book schema and CRUD operations as per requirements.

## Database & Collection

- **Database**: `libraryDB` (or as configured in MONGODB_URI)
- **Collection**: `books`

## Schema

```javascript
{
  title: String (required),
  author: String (required),
  category: String (required),
  publishedYear: Number (required),
  availableCopies: Number (required, min: 0)
}
```

## CRUD Operations

### 1️⃣ Create (Insert)

**Endpoint**: `POST /api/books/simple`

**Minimum 7 books required** - Use seed script:
```bash
npm run seed:books
```

**Example Request**:
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "category": "Fiction",
  "publishedYear": 1925,
  "availableCopies": 5
}
```

### 2️⃣ Read

#### Get All Books
**Endpoint**: `GET /api/books/simple`

#### Get Books by Category
**Endpoint**: `GET /api/books/simple/category/:category`

Example: `GET /api/books/simple/category/Fiction`

#### Get Books After Year 2015
**Endpoint**: `GET /api/books/simple/after-year/2015`

Or: `GET /api/books/simple/after-year` (defaults to 2015)

#### Get Single Book
**Endpoint**: `GET /api/books/simple/:id`

### 3️⃣ Update

#### Update Book (Increase/Decrease Copies, Change Category)
**Endpoint**: `PUT /api/books/simple/:id`

**Example - Increase Copies**:
```json
{
  "availableCopies": 10
}
```

**Example - Change Category**:
```json
{
  "category": "Classic Fiction"
}
```

**Example - Decrease Copies**:
```json
{
  "availableCopies": 2
}
```

#### Increase Copies (Alternative)
**Endpoint**: `PATCH /api/books/simple/:id/increase`

```json
{
  "amount": 5
}
```

#### Decrease Copies (Alternative)
**Endpoint**: `PATCH /api/books/simple/:id/decrease`

```json
{
  "amount": 2
}
```

### 4️⃣ Delete

**Endpoint**: `DELETE /api/books/simple/:id`

**Condition**: Book can only be deleted if `availableCopies = 0`

## Error Handling

### Book Not Found
```json
{
  "success": false,
  "message": "Book not found"
}
```
**Status**: 404

### Invalid Update (Negative Stock)
```json
{
  "success": false,
  "message": "Available copies cannot be negative"
}
```
**Status**: 400

### Delete Error (Copies > 0)
```json
{
  "success": false,
  "message": "Cannot delete book. There are X available copies. Books can only be deleted when available copies = 0."
}
```
**Status**: 400

### Validation Errors
```json
{
  "success": false,
  "message": "All fields are required: title, author, category, publishedYear, availableCopies"
}
```
**Status**: 400

## Usage Examples

### Seed Books (Insert 7+ books)
```bash
cd backend
npm run seed:books
```

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

### Update Book (Increase Copies)
```bash
curl -X PUT http://localhost:5000/api/books/simple/BOOK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "availableCopies": 10
  }'
```

### Delete Book (Only if copies = 0)
```bash
curl -X DELETE http://localhost:5000/api/books/simple/BOOK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes

- All update/delete operations require authentication (Librarian/Admin)
- Read operations are public
- Negative stock prevention is enforced at both API and database level
- Books can only be deleted when `availableCopies = 0`

