'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Reservation {
  _id: string;
  space: any;
  user: any;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export default function StaffDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not staff
    if (!user || user.role !== 'staff') {
      router.push('/');
      return;
    }

    const fetchReservations = async () => {
      try {
        const response = await api.get('/reservations/today');
        setReservations(response.data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch reservations');
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user, router]);

  // Show loading or redirect if not authorized
  if (!user || user.role !== 'staff') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const handleCheckIn = async (reservationId: string) => {
    try {
      await api.patch(`/reservations/${reservationId}/checkin`);
      setReservations(reservations.map(res => 
        res._id === reservationId ? { ...res, status: 'checked_in', checkInTime: new Date().toISOString() } : res
      ));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to check in');
      console.error('Error checking in:', error);
    }
  };

  const handleCheckOut = async (reservationId: string) => {
    try {
      await api.patch(`/reservations/${reservationId}/checkout`);
      setReservations(reservations.map(res => 
        res._id === reservationId ? { ...res, status: 'checked_out', checkOutTime: new Date().toISOString() } : res
      ));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to check out');
      console.error('Error checking out:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Staff Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <h2 className="text-xl font-semibold mb-4">Today's Reservations</h2>
      
      {reservations.length === 0 ? (
        <p className="text-gray-500">No reservations for today.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reservations.map(reservation => (
            <div key={reservation._id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{reservation.space.name}</h3>
                  <p className="text-gray-600">{reservation.user.name}</p>
                  <p className="text-gray-600">
                    {new Date(reservation.startTime).toLocaleTimeString()} - 
                    {new Date(reservation.endTime).toLocaleTimeString()}
                  </p>
                  <p className="text-gray-600">Total: ₹{reservation.totalAmount}</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm mt-2 ${
                    reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'checked_in' ? 'bg-blue-100 text-blue-800' :
                    reservation.status === 'checked_out' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reservation.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {reservation.checkInTime && (
                    <p className="text-gray-600 text-sm mt-1">
                      Checked in: {new Date(reservation.checkInTime).toLocaleTimeString()}
                    </p>
                  )}
                  {reservation.checkOutTime && (
                    <p className="text-gray-600 text-sm mt-1">
                      Checked out: {new Date(reservation.checkOutTime).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  {reservation.status === 'confirmed' && (
                    <button
                      onClick={() => handleCheckIn(reservation._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Check In
                    </button>
                  )}
                  {reservation.status === 'checked_in' && (
                    <button
                      onClick={() => handleCheckOut(reservation._id)}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                    >
                      Check Out
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}