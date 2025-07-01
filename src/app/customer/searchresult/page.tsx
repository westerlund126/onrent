'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Package, Users } from 'lucide-react';
import OwnerCard from 'components/card/OwnerCard';
import SearchComponent from 'components/search/Search';
import ProductCard from 'components/card/ProductCard';

interface SearchResult {
  products: any[];
  owners: any[];
  totalProducts: number;
  totalOwners: number;
  currentPage: number;
  totalPages: number;
  query: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'owners'>('all');

  useEffect(() => {
    if (query.length >= 2) {
      fetchResults();
    }
  }, [query, page]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    window.history.pushState(null, '', `?${params.toString()}`);
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Search</h1>
            <div className="max-w-md mx-auto">
              <SearchComponent size="lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Results</h1>
          <div className="max-w-md">
            <SearchComponent size="md" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : results ? (
          <>
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">
                Found {results.totalProducts + results.totalOwners} results for "{results.query}"
              </p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 border-b">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'all'
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All ({results.totalProducts + results.totalOwners})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'products'
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package className="h-4 w-4 mr-1" />
                Products ({results.totalProducts})
              </button>
              <button
                onClick={() => setActiveTab('owners')}
                className={`flex items-center px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'owners'
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="h-4 w-4 mr-1" />
                Owners ({results.totalOwners})
              </button>
            </div>

            {/* Results Content */}
            <div className="space-y-8">
              {/* Owners Section */}
              {(activeTab === 'all' || activeTab === 'owners') && results.owners.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Owners
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.owners.map((owner) => (
                      <OwnerCard key={owner.id} owner={owner} />
                    ))}
                  </div>
                </div>
              )}

              {/* Products Section */}
              {(activeTab === 'all' || activeTab === 'products') && results.products.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Products
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {results.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {results.products.length === 0 && results.owners.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">Try searching with different keywords</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {results.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {page} of {results.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= results.totalPages}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Enter a search term to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}