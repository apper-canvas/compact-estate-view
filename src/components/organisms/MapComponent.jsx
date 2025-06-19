import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import PropertyCard from '@/components/molecules/PropertyCard';

const MapComponent = ({ properties, selectedProperty, onPropertySelect, className = '' }) => {
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [mapCenter, setMapCenter] = useState({ lat: 34.0522, lng: -118.2437 });
  const [zoom, setZoom] = useState(10);

  // Simulate map markers
  const MapMarker = ({ property, isSelected, onClick }) => {
    const formatPrice = (price) => {
      if (price >= 1000000) {
        return `$${(price / 1000000).toFixed(1)}M`;
      }
      return `$${(price / 1000).toFixed(0)}K`;
    };

    return (
      <motion.div
        className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
          isSelected ? 'z-20' : 'z-10'
        }`}
        style={{
          left: `${((property.coordinates.lng + 118.5) / 1.5) * 100}%`,
          top: `${((34.3 - property.coordinates.lat) / 0.6) * 100}%`
        }}
        onClick={() => onClick(property)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div
          className={`px-3 py-1 rounded-full text-white font-medium shadow-lg transition-all ${
            isSelected
              ? 'bg-accent scale-110'
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {formatPrice(property.price)}
        </div>
        {/* Marker Pin */}
        <div
          className={`w-3 h-3 rounded-full mx-auto mt-1 ${
            isSelected ? 'bg-accent' : 'bg-primary'
          }`}
        />
      </motion.div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border overflow-hidden ${className}`}>
      {/* Map Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-gray-900">
            Property Locations
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'map'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ApperIcon name="Map" size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ApperIcon name="List" size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="relative h-96 lg:h-[500px] bg-gradient-to-br from-blue-100 to-green-100 overflow-hidden">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gray-300 relative">
              {/* Grid pattern to simulate map */}
              <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-30">
                {[...Array(100)].map((_, i) => (
                  <div key={i} className="border border-gray-400"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Property Markers */}
          {properties.map(property => (
            <MapMarker
              key={property.Id}
              property={property}
              isSelected={selectedProperty?.Id === property.Id}
              onClick={onPropertySelect}
            />
          ))}

          {/* Map Controls */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setZoom(prev => Math.min(prev + 1, 15))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ApperIcon name="Plus" size={16} />
              </button>
              <div className="border-t border-gray-200"></div>
              <button
                onClick={() => setZoom(prev => Math.max(prev - 1, 5))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ApperIcon name="Minus" size={16} />
              </button>
            </div>
          </div>

          {/* Selected Property Popup */}
          {selectedProperty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-80"
            >
              <div className="bg-white rounded-lg shadow-xl p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-bold text-lg text-gray-900 truncate">
                      {selectedProperty.title}
                    </h4>
                    <p className="text-accent font-bold text-lg">
                      ${selectedProperty.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <ApperIcon name="Bed" size={14} className="mr-1" />
                        {selectedProperty.bedrooms}
                      </span>
                      <span className="flex items-center">
                        <ApperIcon name="Bath" size={14} className="mr-1" />
                        {selectedProperty.bathrooms}
                      </span>
                      <span className="flex items-center">
                        <ApperIcon name="Square" size={14} className="mr-1" />
                        {selectedProperty.squareFeet.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onPropertySelect(null)}
                    className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                  >
                    <ApperIcon name="X" size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="h-96 lg:h-[500px] overflow-y-auto p-4">
          <div className="space-y-4">
            {properties.map(property => (
              <motion.div
                key={property.Id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onPropertySelect(property)}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-bold text-lg text-gray-900 truncate">
                      {property.title}
                    </h4>
                    <p className="text-accent font-bold text-lg">
                      ${property.price.toLocaleString()}
                    </p>
                    <p className="text-gray-600 text-sm truncate">
                      {property.address.street}, {property.address.city}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center">
                        <ApperIcon name="Bed" size={14} className="mr-1" />
                        {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center">
                        <ApperIcon name="Bath" size={14} className="mr-1" />
                        {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center">
                        <ApperIcon name="Square" size={14} className="mr-1" />
                        {property.squareFeet.toLocaleString()} sqft
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;