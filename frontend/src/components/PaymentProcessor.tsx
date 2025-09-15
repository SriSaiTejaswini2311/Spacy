'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentProcessorProps {
  reservation: any;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function PaymentProcessor({ reservation, onSuccess, onError }: PaymentProcessorProps) {
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }
      
      await initiatePayment();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment initialization failed');
    } finally {
      setProcessing(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async () => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: reservation.totalAmount * 100,
      currency: 'INR',
      name: 'Fanpit Spaces',
      description: `Booking for ${reservation.space.name}`,
      order_id: reservation.razorpayOrderId,
      handler: async (response: any) => {
        try {
          await verifyPayment(response);
          onSuccess();
        } catch (error) {
          onError('Payment verification failed');
        }
      },
      prefill: {
        name: reservation.user.name,
        email: reservation.user.email,
        contact: '+919999999999' // Default contact number
      },
      theme: {
        color: '#3399cc'
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed');
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const verifyPayment = async (response: any) => {
    try {
      await api.post('/payments/verify', {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature
      });
    } catch (error) {
      throw new Error('Payment verification failed');
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={processing}
      className="bg-green-600 text-white px-6 py-3 rounded disabled:bg-gray-400"
    >
      {processing ? 'Processing...' : `Pay ₹${reservation.totalAmount}`}
    </button>
  );
}