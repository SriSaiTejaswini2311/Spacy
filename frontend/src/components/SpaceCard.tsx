import Link from 'next/link';

interface Space {
  _id: string;
  name: string;
  description: string;
  about?: string;
  address: string;
  capacity: number;
  amenities: string[];
  images: string[];
  pricingRules: any[];
}

interface SpaceCardProps {
  space: Space;
}

export default function SpaceCard({ space }: SpaceCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      {/* Image Section */}
      <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {space.images && space.images.length > 0 ? (
          <img
            src={space.images[0]}
            alt={space.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          </div>
        )}
        
        {/* Capacity Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {space.capacity}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {space.name}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {space.description}
          </p>
        </div>

        {/* About Section */}
        {space.about && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
              {space.about}
            </p>
          </div>
        )}
        
        {/* Location */}
        <div className="flex items-start mb-4">
          <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500 text-sm leading-relaxed">{space.address}</p>
        </div>
        
        {/* Amenities */}
        {space.amenities && space.amenities.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {space.amenities.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100"
                >
                  {amenity}
                </span>
              ))}
              {space.amenities.length > 4 && (
                <span className="text-gray-500 text-xs font-medium px-3 py-1 rounded-full bg-gray-100">
                  +{space.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center">
            {space.pricingRules && space.pricingRules.length > 0 && (
              <div>
                <span className="text-2xl font-bold text-green-600">
                  ₹{space.pricingRules[0].rate}
                </span>
                <span className="text-gray-500 text-sm ml-1">/hour</span>
              </div>
            )}
          </div>
          <Link
            href={`/space/${space._id}`}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}