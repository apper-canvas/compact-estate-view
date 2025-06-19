import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PropertyGallery from '@/components/organisms/PropertyGallery';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { propertyService, savedPropertyService } from '@/services';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadProperty();
      checkIfSaved();
    }
  }, [id]);

  const loadProperty = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await propertyService.getById(id);
      setProperty(result);
    } catch (err) {
      setError(err.message || 'Property not found');
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const saved = await savedPropertyService.isPropertySaved(id);
      setIsSaved(saved);
    } catch (err) {
      console.error('Failed to check saved status:', err);
    }
  };

  const handleSaveToggle = async () => {
    setSaving(true);
    
    try {
      const result = await savedPropertyService.toggleSave(id);
      setIsSaved(result.action === 'added');
      
      if (result.action === 'added') {
        toast.success('Property saved to favorites');
      } else {
        toast.success('Property removed from favorites');
      }
    } catch (error) {
      toast.error('Failed to update saved properties');
    } finally {
      setSaving(false);
    }
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

  const formatListingDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          {/* Back Button Skeleton */}
          <div className="mb-6">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>

          {/* Gallery Skeleton */}
          <div className="h-96 lg:h-[500px] bg-gray-200 rounded-lg mb-8"></div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
              
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ApperIcon name="Home" size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
            Property Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => navigate('/')}
            variant="primary"
            icon="ArrowLeft"
          >
            Back to Listings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          icon="ArrowLeft"
        >
          Back
        </Button>
      </motion.div>

      {/* Property Gallery */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <PropertyGallery images={property.images} title={property.title} />
      </motion.div>

      {/* Property Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="font-heading font-bold text-3xl lg:text-4xl text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <p className="text-xl text-gray-600 flex items-center">
                    <ApperIcon name="MapPin" size={20} className="mr-2 flex-shrink-0" />
                    <span className="break-words">
                      {property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}
                    </span>
                  </p>
                </div>
                
                <div className="ml-4 flex-shrink-0 text-right">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {formatPrice(property.price)}
                  </div>
                  <Badge variant="secondary">
                    {property.propertyType}
                  </Badge>
                </div>
              </div>

              {/* Key Stats */}
              <div className="flex flex-wrap gap-6 text-lg text-gray-600">
                <div className="flex items-center">
                  <ApperIcon name="Bed" size={20} className="mr-2" />
                  <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center">
                  <ApperIcon name="Bath" size={20} className="mr-2" />
                  <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center">
                  <ApperIcon name="Square" size={20} className="mr-2" />
                  <span>{formatSquareFeet(property.squareFeet)} sqft</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="font-heading font-bold text-2xl text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="font-heading font-bold text-2xl text-gray-900 mb-4">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <motion.div
                      key={amenity}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <ApperIcon name="Check" size={16} className="text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{amenity}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Listing Information */}
            <div className="border-t pt-6">
              <h2 className="font-heading font-bold text-2xl text-gray-900 mb-4">
                Listing Information
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 mb-1">Listed Date</p>
                    <p className="font-medium text-gray-900">
                      {formatListingDate(property.listingDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Property Type</p>
                    <p className="font-medium text-gray-900">
                      {property.propertyType}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-24"
          >
            {/* Action Card */}
            <div className="bg-white rounded-lg shadow-lg border p-6 mb-6">
              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-primary mb-2">
                  {formatPrice(property.price)}
                </div>
                <p className="text-gray-600">
                  ${Math.round(property.price / property.squareFeet)} per sqft
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleSaveToggle}
                  disabled={saving}
                  variant={isSaved ? "secondary" : "accent"}
                  size="lg"
                  icon={isSaved ? "Heart" : "Heart"}
                  className="w-full"
                >
                  {saving ? 'Updating...' : isSaved ? 'Saved' : 'Save Property'}
                </Button>
                
                <Button
                  variant="primary"
                  size="lg"
                  icon="Phone"
                  className="w-full"
                  onClick={() => toast.info('Contact feature coming soon!')}
                >
                  Contact Agent
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  icon="Calendar"
                  className="w-full"
                  onClick={() => toast.info('Schedule viewing feature coming soon!')}
                >
                  Schedule Viewing
                </Button>
              </div>
            </div>

            {/* Property Stats Card */}
            <div className="bg-white rounded-lg shadow-lg border p-6">
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">
                Property Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bedrooms</span>
                  <span className="font-medium">{property.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bathrooms</span>
                  <span className="font-medium">{property.bathrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Square Feet</span>
                  <span className="font-medium">{formatSquareFeet(property.squareFeet)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-medium">{property.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per sqft</span>
                  <span className="font-medium">
                    ${Math.round(property.price / property.squareFeet)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;