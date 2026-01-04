import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import Loader from '../components/common/Loader';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user: currentUser } = useAuth();

  const { data: userData, isLoading } = useQuery(
    'current-user-profile',
    () => userService.getCurrentUserProfile(),
    { enabled: !!currentUser }
  );

  const { data: historyData } = useQuery(
    ['borrowing-history', currentUser?.id],
    () => userService.getBorrowingHistory(currentUser?.id),
    { enabled: !!currentUser }
  );

  const user = userData?.data || currentUser;
  const history = historyData?.data || [];

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        </div>
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user?.firstName} {user?.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
            </div>
            {user?.membershipId && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Membership ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.membershipId}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Membership Status</dt>
              <dd className="mt-1">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user?.membershipStatus === 'active'
                      ? 'bg-green-100 text-green-800'
                      : user?.membershipStatus === 'suspended'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user?.membershipStatus || 'N/A'}
                </span>
              </dd>
            </div>
            {user?.joinDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(user.joinDate), 'MMMM d, yyyy')}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {user?.role === 'member' && (
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold">My Borrowing History</h2>
          </div>
          <div className="px-6 py-5">
            {history.length === 0 ? (
              <p className="text-gray-500">No borrowing history</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book
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
                    {history.slice(0, 10).map((transaction) => (
                      <tr key={transaction._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link
                            to={`/books/${transaction.bookId?._id}`}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            {transaction.bookId?.title || 'N/A'}
                          </Link>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.status === 'issued' && (
                            <span className="text-xs text-gray-400">
                              Return to library
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

