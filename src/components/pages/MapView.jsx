import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import MapComponent from '@/components/organisms/MapComponent';
import FilterPanel from '@/components/molecules/FilterPanel';
import SearchBar from '@/components/molecules/SearchBar';
import ApperIcon from '@/components/ApperIcon';
import { propertyService } from '@/services';

const MapView = () => {
  const [properties, setProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

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
        setProperties(searchResults);
      } else {
        setProperties(allProperties);
      }
      setSelectedProperty(null);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = async (filters) => {
    setCurrentFilters(filters);
    setLoading(true);
    
    try {
      let baseProperties = allProperties;
      
      if (searchQuery.trim()) {
        baseProperties = await propertyService.search(searchQuery);
      }
      
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
      setSelectedProperty(null);
    } catch (err) {
      toast.error('Filter update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
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
            Property Map View
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Explore properties by location and discover your perfect neighborhood
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
              {loading ? 'Loading...' : `${properties.length} properties on map`}
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

        {/* Map */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border h-96 lg:h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : properties.length === 0 && !error ? (
            <div className="bg-white rounded-lg shadow-sm border h-96 lg:h-[500px] flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <ApperIcon name="MapPin" size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
                  No Properties Found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filters to find properties in this area.
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
            </div>
          ) : (
            <MapComponent
              properties={properties}
              selectedProperty={selectedProperty}
              onPropertySelect={handlePropertySelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;