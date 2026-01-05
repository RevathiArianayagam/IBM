import { useState } from 'react';
import { useQuery } from 'react-query';
import { transactionService } from '../services/transactionService';
import Loader from '../components/common/Loader';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading, refetch } = useQuery(
    ['transactions', page, status],
    () => transactionService.getTransactions({ page, limit: 10, status }),
    { keepPreviousData: true }
  );

  const transactions = data?.data || [];
  const totalPages = data?.pages || 1;

  const handleReturn = async (transactionId) => {
    if (window.confirm('Are you sure you want to return this book?')) {
      try {
        await transactionService.returnBook(transactionId, {});
        toast.success('Book returned successfully');
        refetch();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to return book');
      }
    }
  };

  const handleRenew = async (transactionId) => {
    try {
      await transactionService.renewBook(transactionId);
      toast.success('Book renewed successfully');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to renew book');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
      </div>

      <div className="mb-6">
        <select
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="issued">Issued</option>
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.bookId?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.userId?.firstName} {transaction.userId?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.issueDate
                          ? format(new Date(transaction.issueDate), 'MMM d, yyyy')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.dueDate
                          ? format(new Date(transaction.dueDate), 'MMM d, yyyy')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'returned'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {transaction.status === 'issued' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReturn(transaction._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Return
                            </button>
                            {transaction.renewalCount < 2 && (
                              <button
                                onClick={() => handleRenew(transaction._id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Renew
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Transactions;

