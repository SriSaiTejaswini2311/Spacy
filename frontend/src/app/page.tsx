'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Space {
  _id: string;
  name: string;
  description: string;
  address: string;
  capacity: number;
  amenities: string[];
  images: string[];
  pricingRules: Array<{ rate: number }>;
}

const categories = [
  { name: 'Workspace', icon: '💼', color: 'from-blue-500 to-cyan-500' },
  { name: 'Entertainment', icon: '🎭', color: 'from-purple-500 to-pink-500' },
  { name: 'Sports', icon: '⚽', color: 'from-green-500 to-emerald-500' },
  { name: 'Education', icon: '📚', color: 'from-orange-500 to-red-500' },
  { name: 'Social', icon: '🎉', color: 'from-pink-500 to-rose-500' },
  { name: 'Meetup', icon: '🤝', color: 'from-indigo-500 to-purple-500' },
  { name: 'Business', icon: '🏢', color: 'from-gray-600 to-gray-800' },
];

export default function HomePage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const response = await api.get('/spaces');
      setSpaces(response.data);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <img 
                src="/logos/logo-with-tagline.png" 
                alt="Fanpit" 
                className="h-24 w-auto"
              />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-6" style={{color: '#8C52FF'}}>
              Spaces
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover and book amazing spaces for work, events, and unforgettable experiences
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/spaces" 
                className="text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                style={{backgroundColor: '#8C52FF'}}
              >
                Explore Spaces
              </Link>
              <Link 
                href="/register" 
                className="border-2 text-white hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300"
                style={{borderColor: '#8C52FF', color: '#8C52FF'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8C52FF'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                List Your Space
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{color: '#8C52FF'}}>
              Browse by Category
            </h2>
            <p className="text-xl text-gray-400">Find the perfect space for any occasion</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/spaces?category=${category.name.toLowerCase()}`}
                className="group bg-gray-800 rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300 border border-gray-700 hover:border-purple-500"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 text-2xl`}>
                  {category.icon}
                </div>
                <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>



      {/* About Section */}
      <div className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-12">
            <img 
              src="/logos/logo-with-tagline.png" 
              alt="Fanpit" 
              className="h-16 w-auto mx-auto mb-8 opacity-80"
            />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Connecting People with Amazing Spaces
            </h2>
            <div className="text-lg text-gray-300 leading-relaxed space-y-4">
              <p>
                Fanpit Spaces is your gateway to discovering and booking exceptional venues for any occasion. 
                Whether you're planning a corporate event, looking for a creative workspace, or organizing 
                a memorable celebration, we connect you with the perfect space.
              </p>
              <p>
                Our platform features carefully curated venues across multiple categories, from professional 
                business centers to unique entertainment spaces. Each venue is verified and equipped with 
                modern amenities to ensure your event or experience is nothing short of extraordinary.
              </p>
              <p>
                Join thousands of satisfied customers who trust Fanpit Spaces for their venue needs. 
                Discover, book, and create unforgettable moments in spaces designed to inspire.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/spaces" 
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Start Exploring
            </Link>
            <Link 
              href="/register" 
              className="border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300"
            >
              List Your Venue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}