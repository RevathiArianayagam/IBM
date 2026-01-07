import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { bookService } from '../services/bookService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLibrarian } = useAuth();

  const { data, isLoading } = useQuery(['book', id], () => bookService.getBook(id));
  const book = data?.data;

  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    isbn: '',
    publisher: '',
    publicationDate: '',
    edition: '',
    language: 'English',
    genre: '',
    description: '',
    totalCopies: 1,
    shelfLocation: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        authors: book.authors?.join(', ') || '',
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        publicationDate: book.publicationDate
          ? new Date(book.publicationDate).toISOString().split('T')[0]
          : '',
        edition: book.edition || '',
        language: book.language || 'English',
        genre: book.genre?.join(', ') || '',
        description: book.description || '',
        totalCopies: book.totalCopies || 1,
        shelfLocation: book.shelfLocation || '',
      });
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'totalCopies' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLibrarian) {
      toast.error('You do not have permission to edit books');
      return;
    }

    setLoading(true);

    try {
      // Convert authors string to array
      const authorsArray = formData.authors
        .split(',')
        .map((author) => author.trim())
        .filter((author) => author.length > 0);

      // Convert genre string to array
      const genreArray = formData.genre
        .split(',')
        .map((g) => g.trim())
        .filter((g) => g.length > 0);

      const bookData = {
        ...formData,
        authors: authorsArray,
        genre: genreArray,
        publicationDate: formData.publicationDate || undefined,
      };

      await bookService.updateBook(id, bookData);
      toast.success('Book updated successfully!');
      queryClient.invalidateQueries('books');
      queryClient.invalidateQueries(['book', id]);
      navigate(`/books/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update book');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <Loader />;
  if (!book) return <div>Book not found</div>;

  if (!isLibrarian) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">You do not have permission to edit books.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Book</h1>
        <p className="mt-2 text-sm text-gray-600">Update the book details below</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="authors" className="block text-sm font-medium text-gray-700">
              Authors <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="authors"
              name="authors"
              required
              placeholder="Separate multiple authors with commas"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.authors}
              onChange={handleChange}
            />
            <p className="mt-1 text-sm text-gray-500">e.g., John Doe, Jane Smith</p>
          </div>

          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
              ISBN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.isbn}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">
              Publisher
            </label>
            <input
              type="text"
              id="publisher"
              name="publisher"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.publisher}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="publicationDate" className="block text-sm font-medium text-gray-700">
              Publication Date
            </label>
            <input
              type="date"
              id="publicationDate"
              name="publicationDate"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.publicationDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="edition" className="block text-sm font-medium text-gray-700">
              Edition
            </label>
            <input
              type="text"
              id="edition"
              name="edition"
              placeholder="e.g., 1st, 2nd, Revised"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.edition}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <input
              type="text"
              id="language"
              name="language"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.language}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
              Genre
            </label>
            <input
              type="text"
              id="genre"
              name="genre"
              placeholder="Separate multiple genres with commas"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.genre}
              onChange={handleChange}
            />
            <p className="mt-1 text-sm text-gray-500">e.g., Fiction, Science, History</p>
          </div>

          <div>
            <label htmlFor="totalCopies" className="block text-sm font-medium text-gray-700">
              Total Copies <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="totalCopies"
              name="totalCopies"
              required
              min="1"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.totalCopies}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="shelfLocation" className="block text-sm font-medium text-gray-700">
              Shelf Location
            </label>
            <input
              type="text"
              id="shelfLocation"
              name="shelfLocation"
              placeholder="e.g., A-12, B-5"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.shelfLocation}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate(`/books/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? <Loader size="sm" /> : 'Update Book'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBook;

