import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { bookService } from '../services/bookService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import { format } from 'date-fns';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLibrarian } = useAuth();

  const { data, isLoading } = useQuery(['book', id], () => bookService.getBook(id));

  const book = data?.data;

  if (isLoading) return <Loader />;
  if (!book) return <div>Book not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>
          <div className="md:w-2/3 p-8">
            <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
            <div className="space-y-4">
              <div>
                <span className="font-semibold">Authors: </span>
                <span>{book.authors?.join(', ') || 'Unknown'}</span>
              </div>
              <div>
                <span className="font-semibold">ISBN: </span>
                <span>{book.isbn}</span>
              </div>
              {book.publisher && (
                <div>
                  <span className="font-semibold">Publisher: </span>
                  <span>{book.publisher}</span>
                </div>
              )}
              {book.publicationDate && (
                <div>
                  <span className="font-semibold">Publication Date: </span>
                  <span>{format(new Date(book.publicationDate), 'MMMM d, yyyy')}</span>
                </div>
              )}
              <div>
                <span className="font-semibold">Language: </span>
                <span>{book.language}</span>
              </div>
              <div>
                <span className="font-semibold">Genres: </span>
                <span>{book.genre?.join(', ') || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Availability: </span>
                <span>
                  {book.availableCopies} of {book.totalCopies} copies available
                </span>
              </div>
              {book.shelfLocation && (
                <div>
                  <span className="font-semibold">Shelf Location: </span>
                  <span>{book.shelfLocation}</span>
                </div>
              )}
            </div>
            {book.description && (
              <div className="mt-6">
                <h2 className="font-semibold text-xl mb-2">Description</h2>
                <p className="text-gray-700">{book.description}</p>
              </div>
            )}
            <div className="mt-6 flex gap-4">
              {isLibrarian && (
                <button
                  onClick={() => navigate(`/books/${id}/edit`)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Edit Book
                </button>
              )}
              <button
                onClick={() => navigate('/books')}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Back to Books
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;

