declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = async (orderData: any) => {
  await loadRazorpay();
  
  const razorpayKey = 'rzp_test_RHSYT9Kk2MlI4e';
  
  const options = {
    key: razorpayKey,
    amount: orderData.amount,
    currency: orderData.currency,
    name: 'Spacy',
    description: 'Space Booking Payment',
    order_id: orderData.id,
    handler: function (response: any) {
      // This will be handled by the calling component
      return response;
    },
    prefill: {
      name: orderData.prefill?.name || '',
      email: orderData.prefill?.email || '',
      contact: orderData.prefill?.contact || ''
    },
    theme: {
      color: '#8C52FF'
    }
  };

  const rzp = new window.Razorpay(options);
  return rzp;
};