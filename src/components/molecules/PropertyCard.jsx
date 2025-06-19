import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { savedPropertyService } from '@/services';

const PropertyCard = ({ property, isInSaved = false, onSaveToggle }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(isInSaved);
  const [saving, setSaving] = useState(false);

  const handleImageNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleImagePrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    setSaving(true);
    
    try {
      const result = await savedPropertyService.toggleSave(property.Id);
      setIsSaved(result.action === 'added');
      
      if (result.action === 'added') {
        toast.success('Property saved to favorites');
      } else {
        toast.success('Property removed from favorites');
      }
      
      if (onSaveToggle) {
        onSaveToggle(property.Id, result.action);
      }
    } catch (error) {
      toast.error('Failed to update saved properties');
    } finally {
      setSaving(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/property/${property.Id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatSquareFeet = (sqft) => {
    return new Intl.NumberFormat('en-US').format(sqft);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <motion.img
          src={property.images[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Image Navigation */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={handleImagePrev}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </button>
            <button
              onClick={handleImageNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ApperIcon name="ChevronRight" size={16} />
            </button>
            
            {/* Image Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
              {property.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-4 left-4">
          <Badge variant="primary" size="lg" className="font-bold">
            {formatPrice(property.price)}
          </Badge>
        </div>
        
        {/* Save Button */}
        <div className="absolute top-4 right-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSaveToggle}
            disabled={saving}
            className={`p-2 rounded-full transition-colors ${
              isSaved 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <ApperIcon 
              name={isSaved ? "Heart" : "Heart"} 
              size={20}
              className={isSaved ? "fill-current" : ""}
            />
          </motion.button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="font-heading font-bold text-xl text-gray-900 mb-2 line-clamp-2">
          {property.title}
        </h3>
        
        <p className="text-gray-600 mb-4 flex items-center">
          <ApperIcon name="MapPin" size={16} className="mr-1 flex-shrink-0" />
          <span className="truncate">
            {property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}
          </span>
        </p>

        {/* Property Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <ApperIcon name="Bed" size={16} className="mr-1" />
            <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <ApperIcon name="Bath" size={16} className="mr-1" />
            <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <ApperIcon name="Square" size={16} className="mr-1" />
            <span>{formatSquareFeet(property.squareFeet)} sqft</span>
          </div>
        </div>

        {/* Property Type */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" size="sm">
            {property.propertyType}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            icon="Eye"
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;