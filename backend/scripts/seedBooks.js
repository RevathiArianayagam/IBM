import dotenv from 'dotenv';
import mongoose from 'mongoose';
import BookSimple from '../models/BookSimple.js';

// Load env vars
dotenv.config();

const seedBooks = async () => {
  try {
    // Connect to database
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library_db');
    console.log(`MongoDB Connected: ${conn.connection.host}\n`);

    // Clear existing books (optional - comment out if you want to keep existing)
    // await Book.deleteMany({});
    // console.log('Cleared existing books\n');

    // Check if books already exist
    const existingBooks = await BookSimple.countDocuments();
    if (existingBooks >= 7) {
      console.log(`✅ ${existingBooks} books already exist in the database.`);
      console.log('To reseed, delete existing books first.\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Sample books data
    const books = [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'Fiction',
        publishedYear: 1925,
        availableCopies: 5
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        category: 'Fiction',
        publishedYear: 1960,
        availableCopies: 3
      },
      {
        title: '1984',
        author: 'George Orwell',
        category: 'Fiction',
        publishedYear: 1949,
        availableCopies: 4
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        category: 'Science',
        publishedYear: 1988,
        availableCopies: 2
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        category: 'History',
        publishedYear: 2011,
        availableCopies: 6
      },
      {
        title: 'The Lean Startup',
        author: 'Eric Ries',
        category: 'Business',
        publishedYear: 2011,
        availableCopies: 4
      },
      {
        title: 'The Silent Patient',
        author: 'Alex Michaelides',
        category: 'Mystery',
        publishedYear: 2019,
        availableCopies: 3
      },
      {
        title: 'Educated',
        author: 'Tara Westover',
        category: 'Biography',
        publishedYear: 2018,
        availableCopies: 5
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        category: 'Self-Help',
        publishedYear: 2018,
        availableCopies: 7
      },
      {
        title: 'The Seven Husbands of Evelyn Hugo',
        author: 'Taylor Jenkins Reid',
        category: 'Fiction',
        publishedYear: 2017,
        availableCopies: 4
      }
    ];

    // Insert books
    const insertedBooks = await BookSimple.insertMany(books);

    console.log(`✅ Successfully seeded ${insertedBooks.length} books!\n`);
    console.log('Books added:');
    insertedBooks.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} by ${book.author} (${book.category}, ${book.publishedYear}) - ${book.availableCopies} copies`);
    });

    console.log('\n📊 Summary:');
    const byCategory = await BookSimple.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('Books by category:');
    byCategory.forEach(cat => {
      console.log(`  - ${cat._id}: ${cat.count} books`);
    });

    const after2015 = await BookSimple.countDocuments({ publishedYear: { $gt: 2015 } });
    console.log(`\nBooks published after 2015: ${after2015}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding books:');
    console.error(error.message);
    if (error.code === 11000) {
      console.error('\nSome books may already exist. Check your database.');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedBooks();

