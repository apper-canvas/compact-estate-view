import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PropertyCard from '@/components/molecules/PropertyCard';
import ApperIcon from '@/components/ApperIcon';
import { savedPropertyService, propertyService } from '@/services';

const SavedProperties = () => {
  const [savedProperties, setSavedProperties] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSavedProperties();
  }, []);

  const loadSavedProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get saved property records
      const savedRecords = await savedPropertyService.getAll();
      setSavedProperties(savedRecords);
      
      // Get full property details for each saved property
      const propertyPromises = savedRecords.map(saved => 
        propertyService.getById(saved.propertyId)
      );
      
      const propertyDetails = await Promise.all(propertyPromises);
      
      // Add saved date and notes to property objects
      const enrichedProperties = propertyDetails.map((property, index) => ({
        ...property,
        savedDate: savedRecords[index].savedDate,
        savedNotes: savedRecords[index].notes,
        savedId: savedRecords[index].Id
      }));
      
      setProperties(enrichedProperties);
    } catch (err) {
      setError(err.message || 'Failed to load saved properties');
      toast.error('Failed to load saved properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async (propertyId, action) => {
    if (action === 'removed') {
      // Remove from local state immediately
      setProperties(prev => prev.filter(p => p.Id !== propertyId));
      setSavedProperties(prev => prev.filter(sp => sp.propertyId !== propertyId.toString()));
    }
  };

  const handleAddNote = async (savedId, note) => {
    try {
      await savedPropertyService.update(savedId, { notes: note });
      
      // Update local state
      setProperties(prev => prev.map(p => 
        p.savedId === savedId ? { ...p, savedNotes: note } : p
      ));
      
      toast.success('Note updated');
    } catch (err) {
      toast.error('Failed to update note');
    }
  };

  const formatSavedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Saved Properties</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadSavedProperties}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading font-bold text-3xl lg:text-4xl text-gray-900 mb-4">
            Saved Properties
          </h1>
          <p className="text-lg text-gray-600">
            Keep track of your favorite properties and compare them easily
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <ApperIcon name="Heart" size={64} className="mx-auto text-gray-300 mb-4" />
          </motion.div>
          <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
            No Saved Properties Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start saving properties you're interested in to create your personalized collection.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Properties
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-heading font-bold text-3xl lg:text-4xl text-gray-900 mb-4">
          Saved Properties
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Keep track of your favorite properties and compare them easily
        </p>
        <p className="text-gray-600">
          {properties.length} saved propert{properties.length !== 1 ? 'ies' : 'y'}
        </p>
      </motion.div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property, index) => (
          <motion.div
            key={property.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Saved Date Badge */}
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Saved {formatSavedDate(property.savedDate)}
              </div>
            </div>

            <PropertyCard 
              property={property}
              isInSaved={true}
              onSaveToggle={handleSaveToggle}
            />

            {/* Notes Section */}
            {property.savedNotes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-yellow-50 border border-yellow-200 rounded-b-xl p-4 -mt-3"
              >
                <div className="flex items-start gap-2">
                  <ApperIcon name="StickyNote" size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-yellow-800 break-words">
                      {property.savedNotes}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SavedProperties;