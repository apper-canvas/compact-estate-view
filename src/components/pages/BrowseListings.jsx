import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PropertyGrid from '@/components/molecules/PropertyGrid';
import FilterPanel from '@/components/molecules/FilterPanel';
import SearchBar from '@/components/molecules/SearchBar';
import ApperIcon from '@/components/ApperIcon';
import { propertyService } from '@/services';

const BrowseListings = () => {
  const [properties, setProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Load all properties on mount
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await propertyService.getAll();
      setAllProperties(result);
      setProperties(result);
    } catch (err) {
      setError(err.message || 'Failed to load properties');
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setLoading(true);
    
    try {
      if (query.trim()) {
        const searchResults = await propertyService.search(query);
        // Apply current filters to search results
        if (Object.keys(currentFilters).some(key => currentFilters[key] && 
          (Array.isArray(currentFilters[key]) ? currentFilters[key].length > 0 : true))) {
          const filteredResults = await propertyService.filter({
            ...currentFilters,
            searchResults
          });
          setProperties(filteredResults);
        } else {
          setProperties(searchResults);
        }
      } else {
        // If no search query, apply filters to all properties
        if (Object.keys(currentFilters).some(key => currentFilters[key] && 
          (Array.isArray(currentFilters[key]) ? currentFilters[key].length > 0 : true))) {
          const filtered = await propertyService.filter(currentFilters);
          setProperties(filtered);
        } else {
          setProperties(allProperties);
        }
      }
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = useCallback(async (filters) => {
    setCurrentFilters(filters);
    setLoading(true);
    
    try {
      let baseProperties = allProperties;
      
      // If there's a search query, search first
      if (searchQuery.trim()) {
        baseProperties = await propertyService.search(searchQuery);
      }
      
      // Apply filters
      if (Object.keys(filters).some(key => filters[key] && 
        (Array.isArray(filters[key]) ? filters[key].length > 0 : true))) {
        const filtered = baseProperties.filter(property => {
          if (filters.priceMin && property.price < filters.priceMin) return false;
          if (filters.priceMax && property.price > filters.priceMax) return false;
          if (filters.propertyTypes?.length > 0 && !filters.propertyTypes.includes(property.propertyType)) return false;
          if (filters.bedroomsMin && property.bedrooms < filters.bedroomsMin) return false;
          if (filters.bathroomsMin && property.bathrooms < filters.bathroomsMin) return false;
          if (filters.squareFeetMin && property.squareFeet < filters.squareFeetMin) return false;
          if (filters.amenities?.length > 0 && !filters.amenities.every(amenity => property.amenities.includes(amenity))) return false;
          return true;
        });
        setProperties(filtered);
      } else {
        setProperties(baseProperties);
      }
    } catch (err) {
      toast.error('Filter update failed');
    } finally {
      setLoading(false);
    }
  }, [allProperties, searchQuery]);

  const handleSaveToggle = (propertyId, action) => {
    // This will be handled by the PropertyCard component
    // No need to update local state as we're not tracking saved status here
  };

  if (error && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Properties</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadProperties}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-heading font-bold text-3xl lg:text-4xl text-gray-900 mb-4">
            Find Your Dream Home
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Discover the perfect property from our curated collection of homes
          </p>
          
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search by location, address, or zip code..."
            />
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${properties.length} properties found`}
            </p>
            
            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ApperIcon name="Filter" size={18} className="mr-2" />
              Filters
            </button>
          </div>
        </motion.div>
      </div>

      {/* Content Layout */}
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'} mb-8 lg:mb-0`}>
          <div className="sticky top-24">
            <FilterPanel onFiltersChange={handleFiltersChange} />
          </div>
        </div>

        {/* Property Grid */}
        <div className="lg:col-span-3">
          {!loading && properties.length === 0 && !error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <ApperIcon name="Home" size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or filters to find more properties.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  handleSearch('');
                }}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear Search
              </button>
            </motion.div>
          ) : (
            <PropertyGrid
              properties={properties}
              loading={loading}
              onSaveToggle={handleSaveToggle}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseListings;