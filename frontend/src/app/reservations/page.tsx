'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Reservation {
  _id: string;
  space: {
    _id: string;
    name: string;
    address: string;
    images: string[];
  };
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations');
      setReservations(response.data);
    } catch (error: any) {
      setMessage('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id: string) => {
    if (!confirm('Cancel this reservation?')) return;
    
    try {
      await api.patch(`/reservations/${id}/cancel`);
      setMessage('✅ Reservation cancelled');
      fetchReservations();
    } catch (error: any) {
      setMessage('❌ Failed to cancel reservation');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Please Login</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to view your reservations.</p>
          <a href="/login" className="text-white px-6 py-2 rounded-lg" style={{backgroundColor: '#8C52FF'}}>Login</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#8C52FF'}}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{color: '#8C52FF'}}>My Reservations</h1>
          <p className="text-gray-400">Manage your space reservations</p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('✅') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
          }`}>
            {message}
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">No Reservations Yet</h3>
            <p className="text-gray-400 mb-6">You haven't made any space reservations yet.</p>
            <a href="/spaces" className="text-white px-6 py-2 rounded-lg" style={{backgroundColor: '#8C52FF'}}>Browse Spaces</a>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation._id} className="bg-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {reservation.space.name}
                    </h3>
                    <p className="text-gray-400 mb-2">{reservation.space.address}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-300">Date & Time</p>
                        <p className="text-white">{new Date(reservation.startTime).toLocaleDateString()}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
                          {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">Total Amount</p>
                        <p className="text-xl font-bold" style={{color: '#8C52FF'}}>₹{reservation.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          reservation.status === 'confirmed' ? 'bg-green-900/50 text-green-300' :
                          reservation.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300' :
                          reservation.status === 'cancelled' ? 'bg-red-900/50 text-red-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6">
                    {(reservation.status === 'pending' || reservation.status === 'confirmed') && user?.role === 'consumer' && (
                      <button
                        onClick={() => cancelReservation(reservation._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}