'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { createRazorpayOrder } from '@/lib/razorpay';
import dynamic from 'next/dynamic';

interface Space {
  _id: string;
  name: string;
  description: string;
  about?: string;
  address: string;
  capacity: number;
  amenities: string[];
  images: string[];
  pricingRules: Array<{ rate: number }>;
  owner: { _id: string; name: string; email: string; };
}

function SpaceDetailsPage() {
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
  }, []);
  
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchSpace();
  }, [params.id]);

  const fetchSpace = async () => {
    try {
      const response = await api.get(`/spaces/${params.id}`);
      setSpace(response.data);
    } catch (error) {
      setMessage('Failed to load space');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!space || !startTime || !endTime) return 0;
    
    const start = new Date(`2024-01-01T${startTime}`);
    const end = new Date(`2024-01-01T${endTime}`);
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    
    if (hours <= 0) return 0;
    const rate = space.pricingRules?.[0]?.rate || 100;
    return hours * rate;
  };

  const handleBooking = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setBookingLoading(true);
    setMessage('');

    try {
      const startDateTime = new Date(`${bookingDate}T${startTime}`);
      const endDateTime = new Date(`${bookingDate}T${endTime}`);
      
      const requestData = {
        space: space!._id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        totalAmount: calculateTotal()
      };
      
      console.log('Booking request data:', requestData);
      console.log('User:', user);
      console.log('Auth token:', localStorage.getItem('access_token'));
      
      const response = await api.post('/reservations', requestData);
      const { reservation, order } = response.data;

      if (order) {
        // Open Razorpay payment
        const rzp = await createRazorpayOrder({
          ...order,
          prefill: {
            name: user.name || user.email,
            email: user.email
          }
        });

        rzp.on('payment.success', async (response: any) => {
          try {
            await api.post('/reservations/verify-payment', {
              orderId: order.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amount: order.amount
            });
            setMessage('✅ Payment successful! Redirecting...');
            setTimeout(() => router.push('/reservations'), 2000);
          } catch (error) {
            setMessage('❌ Payment verification failed');
          }
        });

        rzp.on('payment.failed', () => {
          setMessage('❌ Payment failed. Please try again.');
        });

        rzp.open();
      } else {
        setMessage('✅ Booking successful! Redirecting...');
        setTimeout(() => router.push('/reservations'), 2000);
      }
      
    } catch (error: any) {
      console.error('Full booking error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Booking failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in to make a booking.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid booking data. Please check your selection.';
      }
      
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setBookingLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#8C52FF'}}></div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Space Not Found</h2>
          <a href="/spaces" className="text-white px-4 py-2 rounded" style={{backgroundColor: '#8C52FF'}}>Back to Spaces</a>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-8 mb-6">
              {space.images && space.images.length > 0 && (
                <img src={space.images[0]} alt={space.name} className="w-full h-64 object-cover rounded-lg mb-6" />
              )}
              
              <h1 className="text-3xl font-bold mb-4" style={{color: '#8C52FF'}}>{space.name}</h1>
              <p className="text-gray-300 mb-4">{space.description}</p>
              <p className="text-gray-400 mb-4">📍 {space.address}</p>
              <p className="text-gray-400 mb-4">👥 Capacity: {space.capacity} people</p>
              
              {space.about && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2" style={{color: '#8C52FF'}}>About</h3>
                  <p className="text-gray-300">{space.about}</p>
                </div>
              )}

              {space.amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{color: '#8C52FF'}}>Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {space.amenities.map((amenity, index) => (
                      <span key={index} className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold" style={{color: '#8C52FF'}}>
                  ₹{space.pricingRules[0]?.rate || 100}
                </div>
                <div className="text-gray-400">per hour</div>
              </div>

              {message && (
                <div className={`p-4 rounded-lg mb-4 ${
                  message.includes('✅') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                }`}>
                  {message}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Booking Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {total > 0 && (
                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Amount:</span>
                    <span className="text-xl font-bold" style={{color: '#8C52FF'}}>₹{total}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={bookingLoading || !startTime || !endTime || !bookingDate}
                className="w-full text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:bg-gray-600"
                style={{backgroundColor: bookingLoading || !startTime || !endTime || !bookingDate ? '#6B7280' : '#8C52FF'}}
              >
                {bookingLoading ? 'Booking...' : user ? `Book Now - ₹${total}` : 'Login to Book'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(SpaceDetailsPage), {
  ssr: false
});