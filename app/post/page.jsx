'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/post/ImageUpload';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

const categories = ['Furniture', 'Clothing', 'Electronics', 'Books', 'Other'];

export default function PostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setLocationError('Location access is required to post a listing. Please enable location access and try again.');
      }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || photos.length === 0) {
      alert('Please fill in all fields and add at least one photo');
      return;
    }

    if (!location) {
      alert(locationError || 'Still getting your location, please try again in a moment.');
      return;
    }

    setLoading(true);
    try {
      // Upload photos to Supabase Storage
      const uploadedPhotos = await Promise.all(
        photos.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const { data, error } = await supabase.storage
            .from('listing-photos')
            .upload(fileName, file);
          if (error) throw error;
          return data.path;
        })
      );

      // Get the public URLs for the uploaded files
      const photoUrls = uploadedPhotos.map((path) => {
        const { data } = supabase.storage.from('listing-photos').getPublicUrl(path);
        return data.publicUrl;
      });

      const { latitude, longitude } = location;

      // Create the listing
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title,
          description,
          category,
          status: 'available',
          latitude,
          longitude,
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Create listing_photos entries
      const photoInserts = photoUrls.map((url, index) => ({
        listing_id: listingData.id,
        photo_url: url,
        order: index,
      }));

      const { error: photosError } = await supabase
        .from('listing_photos')
        .insert(photoInserts);

      if (photosError) throw photosError;

      alert('Listing posted successfully!');
      router.push(`/listings/${listingData.id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to post listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a Free Item</h1>
        {locationError && !location && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded" role="alert">
            {locationError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="photos" className="block text-sm font-medium text-gray-700 mb-2">
              Photos (up to 5)
            </label>
            <ImageUpload
              multiple
              maxFiles={5}
              onChange={setPhotos}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50`}
            >
              {loading ? 'Posting...' : 'Post Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
