import { useState } from 'react';

export default function FilterSidebar({ onClose, className }) {
  const [distance, setDistance] = useState(5); // miles
  const [category, setCategory] = useState('all');

  return (
    <aside
      className={`${className} p-6`}
      aria-label="Filters"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Filters</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={distance}
                  onChange={(e) => setDistance(parseInt(e.target.value))}
                  className="flex-1 h-1"
                />
                <span className="ml-3 text-sm text-gray-500 w-10">{distance} miles</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full mt-1 pl-2 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">All Categories</option>
                <option value="furniture">Furniture</option>
                <option value="clothing">Clothing</option>
                <option value="electronics">Electronics</option>
                <option value="books">Books</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-between px-3 py-2 bg-white text-sm font-medium text-gray-900 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Apply Filters
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.586 7.707 8.293l-1.414 1.414L12.293 15l-2.993 2.993z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
