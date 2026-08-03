'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, User, SlidersHorizontal, Plus, MessageCircle } from 'lucide-react';
import MapContainer from '@/components/map/MapContainer';
import FilterSidebar from '@/components/filters/FilterSidebar';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [distance, setDistance] = useState(5);
  const [category, setCategory] = useState('all');
  const [timeFilter, setTimeFilter] = useState('any');
  const [filterOpen, setFilterOpen] = useState(false);

  const filtersActive = category !== 'all' || timeFilter !== 'any' || distance !== 5;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MapContainer
        searchQuery={searchQuery}
        distance={distance}
        category={category}
        timeFilter={timeFilter}
      />

      {/* Top floating search bar */}
      <div className="fixed top-4 inset-x-4 z-30 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-md sm:-translate-x-1/2">
        <div className="flex items-center gap-2 bg-white rounded-2xl shadow-md px-4 py-3">
          <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for free items..."
            className="flex-1 min-w-0 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Bottom floating nav bar */}
      <div className="fixed bottom-4 inset-x-4 z-30 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-md sm:-translate-x-1/2">
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-md px-6 py-3">
          <Link
            href="/profile"
            aria-label="Profile"
            className="flex items-center justify-center w-11 h-11 rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <User className="h-6 w-6" />
          </Link>

          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            aria-label="Open filters"
            className={`flex items-center justify-center w-11 h-11 rounded-full transition-colors ${
              filtersActive ? 'text-green-600' : 'text-gray-600'
            } hover:bg-gray-50 hover:text-green-600`}
          >
            <SlidersHorizontal className="h-6 w-6" />
          </button>

          <Link
            href="/post"
            aria-label="Post a new item"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 text-white shadow-sm hover:bg-green-700 transition-colors -translate-y-1"
          >
            <Plus className="h-6 w-6" />
          </Link>

          <Link
            href="/messages"
            aria-label="Messages"
            className="flex items-center justify-center w-11 h-11 rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <MessageCircle className="h-6 w-6" />
          </Link>
        </div>
      </div>

      {filterOpen && (
        <FilterSidebar
          distance={distance}
          onDistanceChange={setDistance}
          category={category}
          onCategoryChange={setCategory}
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </div>
  );
}
