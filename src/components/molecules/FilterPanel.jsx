import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import { filterService } from '@/services';

const FilterPanel = ({ onFiltersChange, className = '' }) => {
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    propertyTypes: [],
    bedroomsMin: '',
    bathroomsMin: '',
    squareFeetMin: '',
    amenities: []
  });
  
  const [availablePropertyTypes] = useState(['House', 'Condo', 'Townhouse', 'Apartment']);
  const [availableAmenities] = useState([
    'Pool', 'Gym', 'Parking', 'Balcony', 'Garden', 'Fireplace',
    'Air Conditioning', 'Dishwasher', 'Washer/Dryer', 'Pet Friendly'
  ]);
  
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    propertyType: true,
    bedsBaths: true,
    amenities: false
  });

  useEffect(() => {
    // Convert empty strings to null for API
    const processedFilters = {
      priceMin: filters.priceMin ? parseInt(filters.priceMin, 10) : null,
      priceMax: filters.priceMax ? parseInt(filters.priceMax, 10) : null,
      propertyTypes: filters.propertyTypes,
      bedroomsMin: filters.bedroomsMin ? parseInt(filters.bedroomsMin, 10) : null,
      bathroomsMin: filters.bathroomsMin ? parseInt(filters.bathroomsMin, 10) : null,
      squareFeetMin: filters.squareFeetMin ? parseInt(filters.squareFeetMin, 10) : null,
      amenities: filters.amenities
    };
    
    onFiltersChange(processedFilters);
  }, [filters, onFiltersChange]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePropertyTypeChange = (type) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      priceMin: '',
      priceMax: '',
      propertyTypes: [],
      bedroomsMin: '',
      bathroomsMin: '',
      squareFeetMin: '',
      amenities: []
    });
  };

  const hasActiveFilters = 
    filters.priceMin || filters.priceMax || filters.propertyTypes.length > 0 ||
    filters.bedroomsMin || filters.bathroomsMin || filters.squareFeetMin ||
    filters.amenities.length > 0;

  const FilterSection = ({ title, isExpanded, onToggle, children }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary transition-colors"
      >
        <span>{title}</span>
        <ApperIcon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={16} 
        />
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-bold text-lg text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            icon="X"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        isExpanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            placeholder="Min Price"
            value={filters.priceMin}
            onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={filters.priceMax}
            onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
          />
        </div>
      </FilterSection>

      {/* Property Type */}
      <FilterSection
        title="Property Type"
        isExpanded={expandedSections.propertyType}
        onToggle={() => toggleSection('propertyType')}
      >
        <div className="space-y-3">
          {availablePropertyTypes.map(type => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.propertyTypes.includes(type)}
                onChange={() => handlePropertyTypeChange(type)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Beds & Baths */}
      <FilterSection
        title="Beds & Baths"
        isExpanded={expandedSections.bedsBaths}
        onToggle={() => toggleSection('bedsBaths')}
      >
        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Min Bedrooms"
            value={filters.bedroomsMin}
            onChange={(e) => setFilters(prev => ({ ...prev, bedroomsMin: e.target.value }))}
            min="0"
          />
          <Input
            type="number"
            placeholder="Min Bathrooms"
            value={filters.bathroomsMin}
            onChange={(e) => setFilters(prev => ({ ...prev, bathroomsMin: e.target.value }))}
            min="0"
            step="0.5"
          />
          <Input
            type="number"
            placeholder="Min Square Feet"
            value={filters.squareFeetMin}
            onChange={(e) => setFilters(prev => ({ ...prev, squareFeetMin: e.target.value }))}
            min="0"
          />
        </div>
      </FilterSection>

      {/* Amenities */}
      <FilterSection
        title="Amenities"
        isExpanded={expandedSections.amenities}
        onToggle={() => toggleSection('amenities')}
      >
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {availableAmenities.map(amenity => (
            <label key={amenity} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity)}
                onChange={() => handleAmenityChange(amenity)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {filters.priceMin && (
              <Badge variant="accent" size="sm">
                Min: ${parseInt(filters.priceMin, 10).toLocaleString()}
              </Badge>
            )}
            {filters.priceMax && (
              <Badge variant="accent" size="sm">
                Max: ${parseInt(filters.priceMax, 10).toLocaleString()}
              </Badge>
            )}
            {filters.propertyTypes.map(type => (
              <Badge key={type} variant="secondary" size="sm">
                {type}
              </Badge>
            ))}
            {filters.bedroomsMin && (
              <Badge variant="accent" size="sm">
                {filters.bedroomsMin}+ beds
              </Badge>
            )}
            {filters.bathroomsMin && (
              <Badge variant="accent" size="sm">
                {filters.bathroomsMin}+ baths
              </Badge>
            )}
            {filters.squareFeetMin && (
              <Badge variant="accent" size="sm">
                {parseInt(filters.squareFeetMin, 10).toLocaleString()}+ sqft
              </Badge>
            )}
            {filters.amenities.slice(0, 3).map(amenity => (
              <Badge key={amenity} variant="secondary" size="sm">
                {amenity}
              </Badge>
            ))}
            {filters.amenities.length > 3 && (
              <Badge variant="secondary" size="sm">
                +{filters.amenities.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;