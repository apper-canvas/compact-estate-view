import { toast } from 'react-toastify';

class SavedPropertyService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'saved_property';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "property_id" } },
          { field: { Name: "saved_date" } },
          { field: { Name: "notes" } }
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
      console.error('Error fetching saved properties:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const recordId = parseInt(id, 10);
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "property_id" } },
          { field: { Name: "saved_date" } },
          { field: { Name: "notes" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, recordId, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error('Saved property not found');
      }

      if (!response.data) {
        throw new Error('Saved property not found');
      }

      return this.transformToUIFormat(response.data);
    } catch (error) {
      console.error(`Error fetching saved property with ID ${id}:`, error);
      throw error;
    }
  }

  async create(savedProperty) {
    try {
      // Transform UI data to database format and include only updateable fields
      const dbSavedProperty = this.transformToDBFormat(savedProperty);
      
      const params = {
        records: [dbSavedProperty]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error('Failed to create saved property');
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
      
      throw new Error('Failed to create saved property');
    } catch (error) {
      console.error('Error creating saved property:', error);
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
        throw new Error('Failed to update saved property');
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
      
      throw new Error('Failed to update saved property');
    } catch (error) {
      console.error('Error updating saved property:', error);
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
        throw new Error('Failed to delete saved property');
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to delete saved property');
        }
      }
      
      return { Id: recordId };
    } catch (error) {
      console.error('Error deleting saved property:', error);
      throw error;
    }
  }

  async isPropertySaved(propertyId) {
    try {
      const params = {
        fields: [{ field: { Name: "property_id" } }],
        where: [{ FieldName: "property_id", Operator: "EqualTo", Values: [parseInt(propertyId, 10)] }],
        pagingInfo: { limit: 1, offset: 0 }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return false;
      }

      return response.data && response.data.length > 0;
    } catch (error) {
      console.error('Error checking if property is saved:', error);
      return false;
    }
  }

  async toggleSave(propertyId) {
    try {
      const numericPropertyId = parseInt(propertyId, 10);
      
      // Check if property is already saved
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "property_id" } },
          { field: { Name: "saved_date" } },
          { field: { Name: "notes" } }
        ],
        where: [{ FieldName: "property_id", Operator: "EqualTo", Values: [numericPropertyId] }],
        pagingInfo: { limit: 1, offset: 0 }
      };

      const checkResponse = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!checkResponse.success) {
        console.error(checkResponse.message);
        toast.error(checkResponse.message);
        throw new Error('Failed to check saved property status');
      }

      if (checkResponse.data && checkResponse.data.length > 0) {
        // Property is saved, remove it
        const savedProperty = checkResponse.data[0];
        await this.delete(savedProperty.Id);
        return { action: 'removed', savedProperty: this.transformToUIFormat(savedProperty) };
      } else {
        // Property is not saved, add it
        const newSaved = {
          property_id: numericPropertyId,
          saved_date: new Date().toISOString(),
          notes: ''
        };
        const created = await this.create(newSaved);
        return { action: 'added', savedProperty: created };
      }
    } catch (error) {
      console.error('Error toggling saved property:', error);
      throw error;
    }
  }

  transformToUIFormat(dbItem) {
    return {
      Id: dbItem.Id,
      propertyId: dbItem.property_id ? dbItem.property_id.toString() : '',
      savedDate: dbItem.saved_date || new Date().toISOString(),
      notes: dbItem.notes || ''
    };
  }

  transformToDBFormat(uiItem) {
    const dbItem = {};
    
    // Only include updateable fields
    if (uiItem.property_id !== undefined) dbItem.property_id = parseInt(uiItem.property_id, 10);
    if (uiItem.propertyId !== undefined) dbItem.property_id = parseInt(uiItem.propertyId, 10);
    if (uiItem.saved_date !== undefined) dbItem.saved_date = uiItem.saved_date;
    if (uiItem.savedDate !== undefined) dbItem.saved_date = uiItem.savedDate;
    if (uiItem.notes !== undefined) dbItem.notes = uiItem.notes;
    
    return dbItem;
  }
}

export default new SavedPropertyService();