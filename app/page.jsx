'use client';
import MapContainer from '@/components/map/MapContainer';
import FilterSidebar from '@/components/filters/FilterSidebar';
import PostFAB from '@/components/fab/PostFAB';
import { useState } from 'react';

export default function Home() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-gray-50">
      <MapContainer />
      <button
        onClick={() => setFilterOpen(!filterOpen)}
        className="absolute top-4 left-4 z-50 bg-white rounded-full shadow-lg p-3 hover:bg-gray-50 transition-colors"
        aria-label="Open filters"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {filterOpen && (
        <FilterSidebar onClose={() => setFilterOpen(false)} className="absolute top-0 left-0 z-40 h-full w-64 bg-white shadow-lg border-r transform translate-x-0 transition-transform duration-300 ease-in-out" />
      )}
      <PostFAB />
    </div>
  );
}