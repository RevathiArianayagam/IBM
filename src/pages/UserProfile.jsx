import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { userService } from '../services/userService';
import Loader from '../components/common/Loader';
import { format } from 'date-fns';

const UserProfile = () => {
  const { id } = useParams();

  const { data: userData, isLoading: userLoading } = useQuery(['user', id], () =>
    userService.getUser(id)
  );

  const { data: historyData, isLoading: historyLoading } = useQuery(
    ['borrowing-history', id],
    () => userService.getBorrowingHistory(id)
  );

  const user = userData?.data;
  const history = historyData?.data || [];

  if (userLoading) return <Loader />;
  if (!user) return <div>User not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {user.firstName} {user.lastName}
          </h1>
        </div>
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            {user.membershipId && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Membership ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.membershipId}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{user.role}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Membership Status</dt>
              <dd className="mt-1">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.membershipStatus === 'active'
                      ? 'bg-green-100 text-green-800'
                      : user.membershipStatus === 'suspended'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.membershipStatus || 'N/A'}
                </span>
              </dd>
            </div>
            {user.phoneNumber && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.phoneNumber}</dd>
              </div>
            )}
            {user.joinDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Join Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(user.joinDate), 'MMMM d, yyyy')}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Borrowing History</h2>
        </div>
        <div className="px-6 py-5">
          {historyLoading ? (
            <Loader />
          ) : history.length === 0 ? (
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
                      Return Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.bookId?.title || 'N/A'}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.returnDate
                          ? format(new Date(transaction.returnDate), 'MMM d, yyyy')
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

