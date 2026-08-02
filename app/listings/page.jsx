'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import ListingCard from '@/components/listings/ListingCard';
import { useRouter } from 'next/navigation';

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            users (
              id,
              name,
              avatar_url
            ),
            listing_photos (
              photo_url
            ),
            likes (
              user_id
            ),
            reviews (
              id,
              rating
            )
          `)
          .eq('status', 'available')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse delay-100"></div>
            <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse delay-200"></div>
          </div>
          <span className="ml-3 text-gray-600">Loading listings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Free Items Near You</h1>
        
        {/* Search and Filter Bar (placeholder) */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-3 sm:mb-0">
            <input
              type="text"
              placeholder="Search for items..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/post')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Post an Item
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No listings found. Be the first to post an item!</p>
            <Link href="/post" className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Post an Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
