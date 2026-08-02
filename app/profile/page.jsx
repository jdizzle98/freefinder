'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Fetch user's listings
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select(`
            *,
            listing_photos (photo_url)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (listingsError) throw listingsError;

        setProfile(profileData);
        setListings(listingsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse delay-100"></div>
          <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse delay-200"></div>
        </div>
        <span className="ml-3 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-start sm:items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <div className="space-x-3">
            {/* Edit Profile Button */}
            <button
              onClick={() => {
                // TODO: Implement edit profile modal/page
                alert('Edit profile functionality coming soon');
              }}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Profile Header */}
          <div className="flex items-center space-x-6 p-6">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.name}'s avatar`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-300 rounded-flex items-center justify-center">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                  />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile?.name || 'No Name'}</h2>
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                {profile?.age && (
                  <span>
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5z"
                      />
                    </svg>
                    {profile.age}
                  </span>
                )}
                {profile?.city && (
                  <span>
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-6.421-6.421a1.998 1.998 0 010-2.827l2.828-2.828a1.998 1.998 0 012.827 0l1.415 1.415L13.414 12l4.243 4.243zM12 14l1.293-1.293a1 1 0 001.414 0l1.293 1.293a1 1 0 00-1.414 1.414l1.293-1.293a1 1 0 001.414 0z"
                      />
                    </svg>
                    {profile.city}
                  </span>
                )}
              </div>
              {profile?.bio && (
                <p className="mt-2 text-gray-600">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-3 py-4 text-center text-gray-600">
              <div>
                <p className="text-sm font-medium">{listings.length}</p>
                <p className="text-xs">Listings</p>
              </div>
              <div>
                <p className="text-sm font-medium">0</p>
                <p className="text-xs">Likes Received</p>
              </div>
              <div>
                <p className="text-sm font-medium">0</p>
                <p className="text-xs">Reviews Given</p>
              </div>
            </div>
          </div>

          {/* User's Listings */}
          {listings.length > 0 && (
            <div className="py-6">
              <h3 className="text-lg font-semibold mb-4 px-6">My Listings</h3>
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="border-t border-gray-200 pt-4">
                    <div className="flex items-start space-x-4">
                      {listing.listing_photos[0] ? (
                        <img
                          src={listing.listing_photos[0].photo_url}
                          alt={listing.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 12m-8 4h.01M9 16h.01M4 12h.01M9 12h.01M4 8h.01M9 8h.01M4 4h.01M9 4h.01"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{listing.title}</h4>
                        <p className="text-sm text-gray-500 truncate">
                          {listing.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <span>
                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"
                              />
                            </svg>
                            {listing.category}
                          </span>
                          <span className="mx-2">•</span>
                          <span>
                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8 7H3m8 4H3m-9 8h10"
                              />
                            </svg>
                            {listing.status === 'available' ? 'Available' : 'Claimed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {listings.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-gray-500">You haven't posted any listings yet.</p>
              <button
                onClick={() => {
                  // In a real app, we would navigate to the post page
                  alert('Redirect to post page');
                }}
                className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Post an Item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
