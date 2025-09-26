import React from 'react';
import { Search, Mic } from 'lucide-react';

interface ProductFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    toggleMic: () => void;
    listening: boolean;
    micSupported: boolean;
    sort: string;
    setSort: (value: string) => void;
}

export const ProductFilters = ({ search, setSearch, toggleMic, listening, micSupported, sort, setSort }: ProductFiltersProps) => (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full md:w-auto md:flex-1">
            {/* Search Icon Container */}
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="text-gray-400 h-5 w-5" />
            </div>

            {/* Input Field */}
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products..."
                className="w-full border dark:border-gray-700 bg-transparent rounded-lg pl-10 pr-12 py-2.5 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
            />

            {/* Mic Icon Button Container */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                    type="button"
                    onClick={toggleMic}
                    disabled={!micSupported}
                    title={!micSupported ? "Voice search not supported" : "Search with voice"}
                    className={`p-1 rounded-full transition-colors ${listening
                            ? 'text-red-500 animate-pulse'
                            : 'text-gray-500 hover:text-black dark:hover:text-white'
                        } ${!micSupported && 'cursor-not-allowed text-gray-300'}`}
                >
                    <Mic className="h-5 w-5" />
                </button>
            </div>
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full md:w-auto border dark:border-gray-700 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-900 cursor-pointer focus:ring-2 focus:ring-yellow-400 outline-none">
            <option value="id">Default Sorting</option>
            <option value="-price">Price: High to Low</option>
            <option value="price">Price: Low to High</option>
            <option value="-rating">Sort by Rating</option>
        </select>
    </div>
);
