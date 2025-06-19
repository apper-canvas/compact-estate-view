import savedPropertyData from '../mockData/savedProperties.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class SavedPropertyService {
  constructor() {
    this.savedProperties = [...savedPropertyData];
  }

  async getAll() {
    await delay(200);
    return [...this.savedProperties];
  }

  async getById(id) {
    await delay(150);
    const saved = this.savedProperties.find(sp => sp.Id === parseInt(id, 10));
    if (!saved) {
      throw new Error('Saved property not found');
    }
    return { ...saved };
  }

  async create(savedProperty) {
    await delay(300);
    const maxId = this.savedProperties.length > 0 
      ? Math.max(...this.savedProperties.map(sp => sp.Id))
      : 0;
    const newSaved = {
      ...savedProperty,
      Id: maxId + 1,
      savedDate: new Date().toISOString()
    };
    this.savedProperties.push(newSaved);
    return { ...newSaved };
  }

  async update(id, data) {
    await delay(250);
    const index = this.savedProperties.findIndex(sp => sp.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Saved property not found');
    }
    
    this.savedProperties[index] = { 
      ...this.savedProperties[index], 
      ...data,
      Id: this.savedProperties[index].Id
    };
    return { ...this.savedProperties[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.savedProperties.findIndex(sp => sp.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Saved property not found');
    }
    
    const deleted = this.savedProperties.splice(index, 1)[0];
    return { ...deleted };
  }

  async isPropertySaved(propertyId) {
    await delay(100);
    return this.savedProperties.some(sp => sp.propertyId === propertyId.toString());
  }

  async toggleSave(propertyId) {
    await delay(200);
    const existingIndex = this.savedProperties.findIndex(sp => sp.propertyId === propertyId.toString());
    
    if (existingIndex !== -1) {
      // Remove from saved
      const deleted = this.savedProperties.splice(existingIndex, 1)[0];
      return { action: 'removed', savedProperty: deleted };
    } else {
      // Add to saved
      const maxId = this.savedProperties.length > 0 
        ? Math.max(...this.savedProperties.map(sp => sp.Id))
        : 0;
      const newSaved = {
        Id: maxId + 1,
        propertyId: propertyId.toString(),
        savedDate: new Date().toISOString(),
        notes: ''
      };
      this.savedProperties.push(newSaved);
      return { action: 'added', savedProperty: newSaved };
    }
  }
}

export default new SavedPropertyService();