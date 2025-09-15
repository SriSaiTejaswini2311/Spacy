'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function SpaceDetailsPage() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">✅ Space Details Page Working!</h1>
            <p className="text-gray-600 mb-4">Space ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{params.id}</span></p>
            <p className="text-sm text-gray-500 mb-6">The routing is working correctly. This confirms the 404 issue is resolved.</p>
            
            <div className="flex justify-center space-x-4">
              <a 
                href="/spaces" 
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                ← Back to Spaces
              </a>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Test Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}