'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function ListingCard({ listing }) {
  const [isHovered, setIsHovered] = useState(false);

  const firstPhoto = listing.listing_photos?.[0]?.photo_url || null;
  const reviewCount = listing.reviews?.length || 0;
  const avgRating = listing.reviews?.reduce((acc, r) => acc + r.rating, 0) / reviewCount || 0;

  return (
    <Link href={`/listings/${listing.id}`} passHref className="group">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Image */}
        <div className="relative">
          {firstPhoto ? (
            <Image
              src={firstPhoto}
              alt={listing.title}
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 12m-8 4h.01M9 16h.01M4 12h.01M9 12h.01M4 8h.01M9 8h.01M4 4h.01M9 4h.01"></path>
              </svg>
            </div>
          )}
          {/* Category Badge */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
            {listing.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Poster Avatar */}
            <div className="flex-shrink-0">
              <Image
                src={listing.users.avatar_url || '/default-avatar.png'}
                alt={`${listing.users.name}'s avatar`}
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-2">{listing.title}</h3>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{listing.description}</p>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <span className="mr-3">
                  By {listing.users.name}
                </span>
                <span>
                  • {new Date(listing.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer with stats */}
          <div className="mt-3 flex items-center text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zM12 4a8 8 0 100 16 8 8 0 000-16z"
                />
              </svg>
              <span>{reviewCount} reviews</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
