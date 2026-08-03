import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Link from 'next/link';
import { Sofa, Shirt, Cpu, BookOpen, Tag, X, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// You need to set your Mapbox access token from environment variables
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Pastel bubble color + minimal icon per listing category.
const CATEGORY_STYLES = {
  Furniture: { bgClass: 'bg-blue-200', icon: Sofa },
  Clothing: { bgClass: 'bg-pink-200', icon: Shirt },
  Electronics: { bgClass: 'bg-yellow-200', icon: Cpu },
  Books: { bgClass: 'bg-green-200', icon: BookOpen },
  Other: { bgClass: 'bg-purple-200', icon: Tag },
};
const DEFAULT_CATEGORY_STYLE = CATEGORY_STYLES.Other;

function createMarkerElement(listing) {
  const style = CATEGORY_STYLES[listing.category] || DEFAULT_CATEGORY_STYLE;
  const iconMarkup = renderToStaticMarkup(
    <style.icon className="h-4 w-4 text-gray-700" strokeWidth={2} />
  );

  const el = document.createElement('div');
  el.className = `${style.bgClass} flex items-center justify-center h-9 w-9 rounded-full border-2 border-white shadow-md cursor-pointer`;
  el.innerHTML = iconMarkup;
  return el;
}

// Haversine distance between two lat/lng points, in miles.
function haversineMiles(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

const timeFilterThresholdMs = {
  today: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

export default function MapContainer({
  searchQuery = '',
  distance = 50,
  category = 'all',
  timeFilter = 'any',
}) {
  const mapContainerRef = useRef(null);
  const markersRef = useRef([]);
  const [map, setMap] = useState(null);
  const [listings, setListings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const now = Date.now();

    return listings.filter((listing) => {
      if (query) {
        const haystack = `${listing.title || ''} ${listing.description || ''}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (category !== 'all' && listing.category !== category) {
        return false;
      }

      if (userLocation) {
        const miles = haversineMiles(
          userLocation[1],
          userLocation[0],
          listing.latitude,
          listing.longitude
        );
        if (miles > distance) return false;
      }

      if (timeFilter !== 'any') {
        const threshold = timeFilterThresholdMs[timeFilter];
        const postedAt = new Date(listing.created_at).getTime();
        if (Number.isFinite(threshold) && now - postedAt > threshold) return false;
      }

      return true;
    });
  }, [listings, searchQuery, category, distance, userLocation, timeFilter]);

  useEffect(() => {
    // Initialize the map
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-96, 37.8], // Starting position [lng, lat]
      zoom: 13
    });

    setMap(mapInstance);

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
          mapInstance.setCenter([longitude, latitude]);
          mapInstance.setZoom(12);
        },
        (error) => {
          console.error('Error getting user location:', error);
          // Fallback to a default location
        }
      );
    }

    // Fetch listings from Supabase
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_photos (
            photo_url
          )
        `)
        .eq('status', 'available');

      if (error) {
        console.error('Error fetching listings:', error);
        return;
      }

      setListings(data);
    };

    fetchListings();

    // Clean up on unmount
    return () => mapInstance.remove();
  }, []);

  // Draw one custom marker per listing - a pastel, category-colored bubble
  // with a minimal icon - and swap them out whenever the filtered set changes.
  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    filteredListings.forEach((listing) => {
      if (listing.latitude == null || listing.longitude == null) return;

      const el = createMarkerElement(listing);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedListing(listing);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([listing.longitude, listing.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [map, filteredListings]);

  const selectedPhoto = selectedListing?.listing_photos?.[0]?.photo_url;

  return (
    <div>
      <div className="h-screen w-full" ref={mapContainerRef} />

      {selectedListing && (
        <div className="fixed inset-x-4 bottom-24 z-40 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative bg-white rounded-2xl shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => setSelectedListing(null)}
              aria-label="Close"
              className="absolute top-2 right-2 z-10 flex items-center justify-center h-8 w-8 rounded-full bg-white/90 shadow hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>

            {selectedPhoto && (
              <img
                src={selectedPhoto}
                alt={selectedListing.title}
                className="w-full h-40 object-cover"
              />
            )}

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 truncate">{selectedListing.title}</h3>
              <Link
                href={`/listings/${selectedListing.id}`}
                className="mt-3 flex items-center justify-center gap-2 w-full bg-green-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-green-700 transition-colors"
              >
                View details
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
