import mapboxgl from 'mapbox-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// You need to set your Mapbox access token from environment variables
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

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
  const [map, setMap] = useState(null);
  const [listings, setListings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

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

    // Set up a popup when clicking on a marker. Registered once here (rather
    // than in the effect below, which re-runs on every filter/search change)
    // since Mapbox's layer-scoped events are matched by layer id at click
    // time, not bound to a specific layer instance - re-registering them on
    // every filter change would stack duplicate handlers and duplicate popups.
    mapInstance.on('click', 'listings-points', (e) => {
      const feature = e.features[0];
      const popup = new mapboxgl.Popup()
        .setLngLat(feature.geometry.coordinates)
        .setHTML(`
          <div class="w-64">
            <h3 class="text-lg font-bold mb-2">${feature.properties.title}</h3>
            ${feature.properties.photo_url ? `<img src="${feature.properties.photo_url}" alt="${feature.properties.title}" class="w-full h-48 object-cover rounded mb-2" />` : ''}
            <p class="text-gray-600 mb-2">${feature.properties.description}</p>
          </div>
        `)
        .addTo(mapInstance);
    });

    // Change the cursor to a pointer when hovering over a marker
    mapInstance.on('mouseenter', 'listings-points', () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    mapInstance.on('mouseleave', 'listings-points', () => {
      mapInstance.getCanvas().style.cursor = '';
    });

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

  useEffect(() => {
    if (!map || listings.length === 0) return;

    // Remove existing markers and popups
    // Note: In a real app, you would use a source and layer for markers.
    // For simplicity, we'll create a new marker for each listing.

    // First, remove any existing markers
    if (map.getLayer('listings-points')) {
      map.removeLayer('listings-points');
    }
    if (map.getSource('listings')) {
      map.removeSource('listings');
    }

    // Create a GeoJSON source for the listings
    const geojson = {
      type: 'FeatureCollection',
      features: filteredListings.map((listing) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [listing.longitude, listing.latitude]
        },
        properties: {
          title: listing.title,
          description: listing.description,
          // We'll take the first photo if available
          photo_url: listing.listing_photos[0]?.photo_url || null,
          id: listing.id
        }
      }))
    };

    // Add the source and layer to the map
    if (map.getSource('listings')) {
      map.getSource('listings').setData(geojson);
    } else {
      map.addSource('listings', {
        type: 'geojson',
        data: geojson
      });

      map.addLayer({
        id: 'listings-points',
        type: 'circle',
        source: 'listings',
        paint: {
          'circle-radius': 8,
          'circle-color': '#007cbf',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
    }
  }, [map, listings, filteredListings]);

  return (
    <div>
      <div className="h-screen w-full" ref={mapContainerRef} />
    </div>
  );
}
