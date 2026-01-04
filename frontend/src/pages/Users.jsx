import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const Users = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { isAdmin } = useAuth();

  const { data, isLoading } = useQuery(
    ['users', page, search],
    () => userService.getUsers({ page, limit: 10, search }),
    { keepPreviousData: true }
  );

  const users = data?.data || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user._id}>
                  <Link
                    to={`/users/${user._id}`}
                    className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.membershipId && (
                            <div className="text-xs text-gray-400">
                              ID: {user.membershipId}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'librarian'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.role}
                        </span>
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
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
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

export default Users;

