'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useParams } from 'next/navigation';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewList from '@/components/reviews/ReviewList';

export default function ListingDetail() {
  const { id } = useParams(); // id is a string
  const router = useRouter();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('listings')
          .select(`
            *,
            users (id, name, avatar_url),
            listing_photos (photo_url),
            reviews (
              *,
              users (id, name, avatar_url)
            ),
            likes (user_id)
          `)
          .eq('id', id)
          .single();

        if (err) throw err;
        setListing(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!listing) return <div className="p-8">Listing not found</div>;

  const user = listing.users || {};
  const firstPhoto = listing.listing_photos?.[0]?.photo_url || null;

  // Function to toggle like
  const toggleLike = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('Please log in to like this item');
      return;
    }

    // Check if the current user has already liked this listing
    const alreadyLiked = listing.likes?.some((like) => like.user_id === user.id);

    if (alreadyLiked) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .match({ listing_id: id, user_id: user.id });

      if (error) throw error;
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert({ listing_id: id, user_id: user.id });

      if (error) throw error;
    }

    // Refetch the listing to update like count
    fetchListing();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Listings
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Image Carousel (simplified to show first image) */}
          <div className="relative">
            {firstPhoto ? (
              <Image
                src={firstPhoto}
                alt={listing.title}
                fill
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 12m-8 4h.01M9 16h.01M4 12h.01M9 12h.01M4 8h.01M9 8h.01M4 4h.01M9 4h.01"></path>
                </svg>
                <span className="mt-2 text-sm text-gray-500">No Image</span>
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 text-sm">
              {listing.category}
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="mb-4 flex items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex-1">{listing.title}</h2>
              <button
                onClick={toggleLike}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.363l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{listing.likes?.length || 0} likes</span>
              </button>
            </div>

            <p className="text-gray-700 mb-4">{listing.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">Posted by:</span> {user.name || 'Anonymous'}
              </div>
              <div>
                <span className="font-medium">Posted on:</span> {new Date(
                  listing.created_at
                ).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Category:</span> {listing.category}
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${listing.status === 'available'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700'
                  }`}>
                  {listing.status === 'available' ? 'Available' : 'Claimed'}
                </span>
              </div>
            </div>

            {/* Message Poster Button */}
            <div className="mb-6">
              <button
                onClick={() => {
                  // Navigate to:TODO: Handle navigation to messaging with the poster
                  // For now, just show an alert
                  alert(`Message poster: ${user.name}`);
                }}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Message Poster
              </button>
            </div>

            {/* Reviews Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Reviews ({listing.reviews?.length || 0})
              </h3>
              {user.id ? (
                <ReviewForm
                  listingId={listing.id}
                  onReviewSubmit={() => {
                    // After submitting a review, refetch the listing to get the updated reviews
                    fetchListing();
                  }}
                />
              ) : (
                <p className="text-gray-500">Please log in to leave a review.</p>
              )}
            </div>
            <ReviewList reviews={listing.reviews || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
