'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { getAllWallpapersWithRanking, updateWallpaperRanking, getWallpapersCount } from '@/services/adminService';
import PaginationControls from '@/components/admin/PaginationControls';

// Import types from the types folder
import { WallpaperWithRanking as Wallpaper, RankingControlProps, StatusBadgeProps } from '@/types/wallpaper';

// Product status badge component
const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    draft: 'bg-yellow-100 text-yellow-800',
    discontinued: 'bg-red-100 text-red-800',
  };

  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.inactive;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Ranking control component
const RankingControl = ({ 
  wallpaperId, 
  currentRanking, 
  onUpdateRanking 
}: RankingControlProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRankingChange = async (change: number) => {
    if (isUpdating) return;
    
    const newRanking = currentRanking + change;
    if (newRanking < 1) return; // Don't allow negative or zero rankings
    
    setIsUpdating(true);
    try {
      await onUpdateRanking(wallpaperId, newRanking);
    } catch (error) {
      console.error('Error updating ranking:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">{currentRanking}</span>
      <div className="flex flex-col">
        <button 
          onClick={() => handleRankingChange(-1)}
          disabled={isUpdating || currentRanking <= 1}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
          title="Increase ranking (lower number = higher rank)"
        >
          ▲
        </button>
        <button 
          onClick={() => handleRankingChange(1)}
          disabled={isUpdating}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
          title="Decrease ranking (higher number = lower rank)"
        >
          ▼
        </button>
      </div>
    </div>
  );
};

export default function ProductsPage() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<'ranking' | 'price' | 'date'>('ranking');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [prevTokens, setPrevTokens] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const wallpapersPerPage = 10;

  // Function to fetch wallpapers with pagination and filters
  const fetchWallpapers = async (token: string | null = null, isNewSearch: boolean = false) => {
    setIsLoading(true);
    try {
      // Prepare filters for the API call
      const filters: any = {};
      
      if (categoryFilter !== 'all') {
        filters.primaryImagery = categoryFilter;
      }
      
      if (searchTerm.length > 0) {
        filters.searchTerm = searchTerm;
      }
      
      if (priceRange[0] > 0 || priceRange[1] < 1000) {
        filters.priceMin = priceRange[0];
        filters.priceMax = priceRange[1];
      }
      
      // Call the API with pagination parameters
      const result = await getAllWallpapersWithRanking({
        filters,
        limit: wallpapersPerPage,
        nextToken: token || undefined,
        sortBy,
        sortOrder
      });
      
      // If this is a new search/filter, reset pagination state and get total count
      if (isNewSearch) {
        setWallpapers(result.wallpapers || []);
        setPrevTokens([]);
        setNextToken(result?.nextToken || null);
        setCurrentPage(1);
        
        // Get total count of wallpapers that match the filters
        const count = await getWallpapersCount(filters);
        setTotalItems(count);
      } else {
        setWallpapers(result.wallpapers || []);
        setNextToken(result?.nextToken || null);
      }
      
      // Update hasMore flag
      setHasMore(!!result.nextToken);
    } catch (error) {
      console.error('Error fetching wallpapers:', error);
      toast.error('Failed to load wallpapers');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle next page
  const handleNextPage = () => {
    if (nextToken) {
      // Save current token to prevTokens for back navigation
      setPrevTokens([...prevTokens, nextToken]);
      fetchWallpapers(nextToken);
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Function to handle previous page
  const handlePrevPage = () => {
    if (prevTokens.length > 0) {
      // Get the previous token
      const newPrevTokens = [...prevTokens];
      const prevToken = newPrevTokens.pop();
      setPrevTokens(newPrevTokens);
      
      // If we're going back to the first page, use null as token
      fetchWallpapers(newPrevTokens.length > 0 ? newPrevTokens[newPrevTokens.length - 1] : null);
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchWallpapers(null, true);
  }, []);
  
  // Handle filter changes
  useEffect(() => {
    fetchWallpapers(null, true);
  }, [categoryFilter, sortBy, sortOrder]);
  
  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWallpapers(null, true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, priceRange]);

  // Handle ranking update
  const handleUpdateRanking = async (wallpaperId: string, newRanking: number) => {
    try {
      const success = await updateWallpaperRanking(wallpaperId, newRanking);
      if (success) {
        toast.success('Wallpaper ranking updated');
        
        // Update the wallpaper in the local state
        const updatedWallpapers = wallpapers.map(wallpaper => 
          wallpaper.id === wallpaperId 
            ? { ...wallpaper, ranking: newRanking }
            : wallpaper
        );
        
        // Sort by ranking
        updatedWallpapers.sort((a, b) => a.ranking - b.ranking);
        setWallpapers(updatedWallpapers);
      } else {
        toast.error('Failed to update wallpaper ranking');
      }
    } catch (error) {
      console.error('Error updating wallpaper ranking:', error);
      toast.error('Failed to update wallpaper ranking');
    }
  };

  // Get unique categories for filter
  const categories = ['all', ...Array.from(new Set(wallpapers.map(wallpaper => wallpaper.primaryImagery)))];

  // No client-side filtering needed as we're using server-side filtering
  const filteredWallpapers = wallpapers;

  // Handle product deletion
  const handleDeleteProduct = (productId: string) => {
    // Show a toast confirmation instead of using window.confirm
    toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Delete Wallpaper</p>
                <p className="mt-1 text-sm text-gray-500">Are you sure you want to delete this wallpaper? This action cannot be undone.</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 p-3 flex justify-end space-x-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // In a real application, call API to delete product
                setWallpapers(wallpapers.filter(wallpaper => wallpaper.id !== productId));
                toast.dismiss(t.id);
                toast.success('Wallpaper deleted successfully');
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium text-white transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Wallpaper Management</h1>
          <p className="text-gray-600 mt-1">Manage your wallpaper products</p>
        </div>
        <Link 
          href="/admin/products/create" 
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add New Wallpaper
        </Link>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or description"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category || ""}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading wallpapers...</p>
          </div>
        ) : wallpapers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallpapers.map((wallpaper) => {
              // Create a data URL from the base64 image data
              const imageUrl = wallpaper.imageData.startsWith('data:') 
                ? wallpaper.imageData 
                : `${wallpaper.imageData}`;
              return (
                <div key={wallpaper.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48 w-full bg-gray-100">
                    <img 
                      src={imageUrl} 
                      alt={wallpaper.description || `Wallpaper ${wallpaper.id}`}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{wallpaper.description || `Wallpaper ${wallpaper.id}`}</h3>
                      <RankingControl 
                        wallpaperId={wallpaper.id || ""}
                        currentRanking={wallpaper.ranking}
                        onUpdateRanking={handleUpdateRanking}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{wallpaper.primaryImagery}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-purple-600">${wallpaper.price.toFixed(2)}</span>
                      <span className="text-sm text-gray-500">{wallpaper.size}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Added: {new Date(wallpaper.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Link 
                          href={`/admin/products/${wallpaper.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(wallpaper.id || "")}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No wallpapers found. Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!isLoading && filteredWallpapers.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <PaginationControls
            currentPage={currentPage}
            hasMore={hasMore}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            isLoading={isLoading}
            totalItems={totalItems} // Now we have the actual total count from the API
          />
        </div>
      )}
    </div>
  );
}