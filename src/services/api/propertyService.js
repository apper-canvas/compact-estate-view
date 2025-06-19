import { toast } from 'react-toastify';

class PropertyService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'property';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "price" } },
          { field: { Name: "address_street" } },
          { field: { Name: "address_city" } },
          { field: { Name: "address_state" } },
          { field: { Name: "address_zip_code" } },
          { field: { Name: "bedrooms" } },
          { field: { Name: "bathrooms" } },
          { field: { Name: "square_feet" } },
          { field: { Name: "property_type" } },
          { field: { Name: "images" } },
          { field: { Name: "description" } },
          { field: { Name: "amenities" } },
          { field: { Name: "listing_date" } },
          { field: { Name: "coordinates_lat" } },
          { field: { Name: "coordinates_lng" } }
        ],
        pagingInfo: { limit: 100, offset: 0 }
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Transform database data to UI format
      return response.data.map(item => this.transformToUIFormat(item));
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const recordId = parseInt(id, 10);
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "price" } },
          { field: { Name: "address_street" } },
          { field: { Name: "address_city" } },
          { field: { Name: "address_state" } },
          { field: { Name: "address_zip_code" } },
          { field: { Name: "bedrooms" } },
          { field: { Name: "bathrooms" } },
          { field: { Name: "square_feet" } },
          { field: { Name: "property_type" } },
          { field: { Name: "images" } },
          { field: { Name: "description" } },
          { field: { Name: "amenities" } },
          { field: { Name: "listing_date" } },
          { field: { Name: "coordinates_lat" } },
          { field: { Name: "coordinates_lng" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, recordId, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error('Property not found');
      }

      if (!response.data) {
        throw new Error('Property not found');
      }

      return this.transformToUIFormat(response.data);
    } catch (error) {
      console.error(`Error fetching property with ID ${id}:`, error);
      throw error;
    }
  }

  async search(query) {
    try {
      if (!query || !query.trim()) {
        return this.getAll();
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "price" } },
          { field: { Name: "address_street" } },
          { field: { Name: "address_city" } },
          { field: { Name: "address_state" } },
          { field: { Name: "address_zip_code" } },
          { field: { Name: "bedrooms" } },
          { field: { Name: "bathrooms" } },
          { field: { Name: "square_feet" } },
          { field: { Name: "property_type" } },
          { field: { Name: "images" } },
          { field: { Name: "description" } },
          { field: { Name: "amenities" } },
          { field: { Name: "listing_date" } },
          { field: { Name: "coordinates_lat" } },
          { field: { Name: "coordinates_lng" } }
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [{
            operator: "OR",
            conditions: [
              { fieldName: "title", operator: "Contains", values: [query] },
              { fieldName: "address_street", operator: "Contains", values: [query] },
              { fieldName: "address_city", operator: "Contains", values: [query] },
              { fieldName: "address_zip_code", operator: "Contains", values: [query] }
            ]
          }]
        }],
        pagingInfo: { limit: 100, offset: 0 }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(item => this.transformToUIFormat(item));
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  }

  async create(property) {
    try {
      // Transform UI data to database format and include only updateable fields
      const dbProperty = this.transformToDBFormat(property);
      
      const params = {
        records: [dbProperty]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error('Failed to create property');
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          return this.transformToUIFormat(successfulRecords[0].data);
        }
      }
      
      throw new Error('Failed to create property');
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const recordId = parseInt(id, 10);
      const dbData = this.transformToDBFormat(data);
      
      const params = {
        records: [{ Id: recordId, ...dbData }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error('Failed to update property');
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          return this.transformToUIFormat(successfulUpdates[0].data);
        }
      }
      
      throw new Error('Failed to update property');
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const recordId = parseInt(id, 10);
      const params = {
        RecordIds: [recordId]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error('Failed to delete property');
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to delete property');
        }
      }
      
      return { Id: recordId };
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  transformToUIFormat(dbItem) {
    return {
      Id: dbItem.Id,
      title: dbItem.title || '',
      price: dbItem.price || 0,
      address: {
        street: dbItem.address_street || '',
        city: dbItem.address_city || '',
        state: dbItem.address_state || '',
        zipCode: dbItem.address_zip_code || ''
      },
      bedrooms: dbItem.bedrooms || 0,
      bathrooms: dbItem.bathrooms || 0,
      squareFeet: dbItem.square_feet || 0,
      propertyType: dbItem.property_type || '',
      images: dbItem.images ? dbItem.images.split('\n').filter(img => img.trim()) : [],
      description: dbItem.description || '',
      amenities: dbItem.amenities ? dbItem.amenities.split(',').map(a => a.trim()).filter(a => a) : [],
      listingDate: dbItem.listing_date || new Date().toISOString(),
      coordinates: {
        lat: dbItem.coordinates_lat || 0,
        lng: dbItem.coordinates_lng || 0
      }
    };
  }

  transformToDBFormat(uiItem) {
    const dbItem = {};
    
    // Only include updateable fields
    if (uiItem.title !== undefined) dbItem.title = uiItem.title;
    if (uiItem.price !== undefined) dbItem.price = uiItem.price;
    if (uiItem.address?.street !== undefined) dbItem.address_street = uiItem.address.street;
    if (uiItem.address?.city !== undefined) dbItem.address_city = uiItem.address.city;
    if (uiItem.address?.state !== undefined) dbItem.address_state = uiItem.address.state;
    if (uiItem.address?.zipCode !== undefined) dbItem.address_zip_code = uiItem.address.zipCode;
    if (uiItem.bedrooms !== undefined) dbItem.bedrooms = uiItem.bedrooms;
    if (uiItem.bathrooms !== undefined) dbItem.bathrooms = uiItem.bathrooms;
    if (uiItem.squareFeet !== undefined) dbItem.square_feet = uiItem.squareFeet;
    if (uiItem.propertyType !== undefined) dbItem.property_type = uiItem.propertyType;
    if (uiItem.images !== undefined) dbItem.images = Array.isArray(uiItem.images) ? uiItem.images.join('\n') : uiItem.images;
    if (uiItem.description !== undefined) dbItem.description = uiItem.description;
    if (uiItem.amenities !== undefined) dbItem.amenities = Array.isArray(uiItem.amenities) ? uiItem.amenities.join(',') : uiItem.amenities;
    if (uiItem.listingDate !== undefined) dbItem.listing_date = uiItem.listingDate;
    if (uiItem.coordinates?.lat !== undefined) dbItem.coordinates_lat = uiItem.coordinates.lat;
    if (uiItem.coordinates?.lng !== undefined) dbItem.coordinates_lng = uiItem.coordinates.lng;
    
    return dbItem;
  }
}

export default new PropertyService();