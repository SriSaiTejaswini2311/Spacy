'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Space {
  _id: string;
  name: string;
  description: string;
  address: string;
  capacity: number;
  amenities: string[];
  pricingRules: Array<{ rate: number }>;
  images: string[];
}

interface Reservation {
  _id: string;
  space: { name: string; _id: string };
  user: { name: string; email: string };
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
}

export default function DashboardPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'brand_owner') {
      fetchSpaces();
      fetchReservations();
    }
  }, [user]);

  const fetchSpaces = async () => {
    try {
      // Try owner-specific endpoint first, fallback to all spaces
      let response;
      try {
        response = await api.get('/spaces/my/spaces');
      } catch {
        response = await api.get('/spaces');
        // Filter by owner on frontend if backend filtering fails
        response.data = response.data.filter((space: any) => 
          space.owner?._id === (user as any)?._id || space.owner === (user as any)?._id
        );
      }
      setSpaces(response.data);
    } catch (error: any) {
      console.error('Error:', error);
      setError('Unable to load spaces');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations');
      setReservations(response.data);
    } catch (error: any) {
      console.error('Reservations error:', error);
      setReservations([]);
    }
  };

  const deleteSpace = async (spaceId: string) => {
    if (!confirm('Are you sure you want to delete this space?')) return;
    
    setDeleteLoading(spaceId);
    try {
      await api.delete(`/spaces/${spaceId}`);
      setSpaces(spaces.filter(s => s._id !== spaceId));
      setError('Space deleted successfully');
    } catch (error: any) {
      setError('Failed to delete space. Please try again.');
      console.error('Delete error:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <Link href="/login" className="bg-purple-600 text-white px-6 py-2 rounded-lg">Login</Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'brand_owner') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">Only brand owners can access this dashboard.</p>
          <Link href="/" className="bg-purple-600 text-white px-6 py-2 rounded-lg">Go Home</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Space Dashboard</h1>
              <p className="text-gray-300">Manage your spaces and bookings</p>
            </div>
            <Link 
              href="/dashboard/spaces/create" 
              className="bg-white text-purple-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              + Add New Space
            </Link>
          </div>
        </div>
      </div>

      <div className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          {error && (
            <div className={`border px-6 py-4 rounded-xl mb-8 ${
              error.includes('successfully') 
                ? 'bg-green-900/50 border-green-500 text-green-200'
                : 'bg-red-900/50 border-red-500 text-red-200'
            }`}>
              {error}
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Spaces</p>
                  <p className="text-3xl font-bold">{spaces.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold">{reservations.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold">₹{reservations.reduce((sum, r) => sum + r.totalAmount, 0)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Active Bookings</p>
                  <p className="text-3xl font-bold">{reservations.filter(r => r.status === 'confirmed').length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {spaces.length === 0 ? (
            <div className="bg-gray-800 rounded-2xl p-12 text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No Spaces Yet</h3>
              <p className="text-gray-400 mb-8">Create your first space to start accepting bookings.</p>
              <Link 
                href="/dashboard/spaces/create" 
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Create Your First Space
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Your Spaces ({spaces.length})</h2>
                <p className="text-gray-400">Manage your listed spaces</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {spaces.map((space) => (
                  <div key={space._id} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-colors">
                    <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 relative">
                      {space.images && space.images.length > 0 ? (
                        <img 
                          src={space.images[0]} 
                          alt={space.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <p className="text-white/80 text-sm">No Image</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-semibold">
                          ₹{space.pricingRules?.[0]?.rate || 100}/hr
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{space.name}</h3>
                      <p className="text-gray-400 mb-3 line-clamp-2">{space.description}</p>
                      
                      <div className="flex items-center text-gray-400 text-sm mb-2">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {space.address}
                      </div>
                      
                      <div className="flex items-center text-gray-400 text-sm mb-4">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {space.capacity} people
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                        <div className="flex space-x-2">
                          <Link 
                            href={`/space/${space._id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                          >
                            View
                          </Link>
                          <Link 
                            href={`/dashboard/spaces/${space._id}/edit`}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                        <button
                          onClick={() => deleteSpace(space._id)}
                          disabled={deleteLoading === space._id}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                        >
                          {deleteLoading === space._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Reservations */}
              {reservations.length > 0 && (
                <div className="mt-12">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Recent Reservations</h2>
                    <p className="text-gray-400">Latest bookings for your spaces</p>
                  </div>
                  
                  <div className="bg-gray-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-700">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Space</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Guest</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Date & Time</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Amount</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {reservations.slice(0, 5).map((reservation) => (
                            <tr key={reservation._id} className="hover:bg-gray-700/50">
                              <td className="px-6 py-4">
                                <div className="text-white font-medium">{reservation.space.name}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-white">{reservation.user.name}</div>
                                <div className="text-gray-400 text-sm">{reservation.user.email}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-white">{new Date(reservation.startTime).toLocaleDateString()}</div>
                                <div className="text-gray-400 text-sm">
                                  {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
                                  {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-white font-semibold">₹{reservation.totalAmount}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                  reservation.status === 'confirmed' ? 'bg-green-900/50 text-green-300' :
                                  reservation.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300' :
                                  reservation.status === 'cancelled' ? 'bg-red-900/50 text-red-300' :
                                  'bg-gray-700 text-gray-300'
                                }`}>
                                  {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {reservations.length > 5 && (
                      <div className="px-6 py-4 bg-gray-700/50 text-center">
                        <Link href="/reservations" className="text-purple-400 hover:text-purple-300 font-medium">
                          View All Reservations →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}