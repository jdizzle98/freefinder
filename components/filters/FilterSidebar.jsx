'use client';

import { X } from 'lucide-react';

const categories = ['Furniture', 'Clothing', 'Electronics', 'Books', 'Other'];

const timeOptions = [
  { value: 'any', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

export default function FilterSidebar({
  distance,
  onDistanceChange,
  category,
  onCategoryChange,
  timeFilter,
  onTimeFilterChange,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/30"
      />
      <div className="absolute bottom-0 inset-x-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white shadow-md">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max="50"
                value={distance}
                onChange={(e) => onDistanceChange(parseInt(e.target.value, 10))}
                className="flex-1 h-1 accent-green-600"
              />
              <span className="ml-3 text-sm text-gray-500 w-16 text-right">{distance} miles</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="block w-full mt-1 pl-2 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time last posted</label>
            <div className="flex flex-wrap gap-2">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onTimeFilterChange(option.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    timeFilter === option.value
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
