import { useQuery } from 'react-query';
import { dashboardService } from '../services/dashboardService';
import Loader from '../components/common/Loader';
import {
  BookOpenIcon,
  UsersIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { data: statsData, isLoading } = useQuery('dashboard-stats', () =>
    dashboardService.getStats()
  );

  const stats = statsData?.data;

  if (isLoading) return <Loader />;

  const statCards = [
    {
      name: 'Total Books',
      value: stats?.books?.total || 0,
      icon: BookOpenIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Available Books',
      value: stats?.books?.available || 0,
      icon: BookOpenIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Members',
      value: stats?.members?.total || 0,
      icon: UsersIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Active Members',
      value: stats?.members?.active || 0,
      icon: UsersIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Overdue Books',
      value: stats?.transactions?.overdue || 0,
      icon: ClockIcon,
      color: 'bg-red-500',
    },
    {
      name: 'Pending Fines',
      value: `$${stats?.fines?.pending || 0}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-md`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats?.recentTransactions && stats.recentTransactions.length > 0 && (
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentTransactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.bookId?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.userId?.firstName} {transaction.userId?.lastName}
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
                        {transaction.dueDate
                          ? new Date(transaction.dueDate).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

