import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// You need to set your Mapbox access token from environment variables
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function MapContainer() {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [listings, setListings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Initialize the map
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-96, 37.8], // Starting position [lng, lat]
      zoom: 3
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

  useEffect(() => {
    if (!map || listings.length === 0) return;

    // Remove existing markers and popups
    // Note: In a real app, you would use a source and layer for markers.
    // For simplicity, we'll create a new marker for each listing.

    // First, remove any existing markers
    map.eachLayer((layer) => {
      if (layer.type === 'symbol') {
        map.removeLayer(layer);
      }
    });
    map.eachSource((source) => {
      if (source.type === 'geojson') {
        map.removeSource(source);
      }
    });

    // Create a GeoJSON source for the listings
    const geojson = {
      type: 'FeatureCollection',
      features: listings.map((listing) => ({
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
          like_count: listing.likes?.length || 0,
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

    // Set up a popup when clicking on a marker
    map.on('click', 'listings-points', (e) => {
      const feature = e.features[0];
      const popup = new mapboxgl.Popup()
        .setLngLat(feature.geometry.coordinates)
        .setHTML(`
          <div class="w-64">
            <h3 class="text-lg font-bold mb-2">${feature.properties.title}</h3>
            ${feature.properties.photo_url ? `<img src="${feature.properties.photo_url}" alt="${feature.properties.title}" class="w-full h-48 object-cover rounded mb-2" />` : ''}
            <p class="text-gray-600 mb-2">${feature.properties.description}</p>
            <div class="flex items-center space-x-2 text-sm">
              <span class="text-gray-500">👍 ${feature.properties.like_count}</span>
            </div>
          </div>
        `)
        .addTo(map);
    });

    // Change the cursor to a pointer when hovering over a marker
    map.on('mouseenter', 'listings-points', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'listings-points', () => {
      map.getCanvas().style.cursor = '';
    });
  }, [map, listings]);

  return (
    <div>
      <div className="h-screen w-full" ref={mapContainerRef} />
    </div>
  );
}
