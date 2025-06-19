import propertyData from '../mockData/properties.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class PropertyService {
  constructor() {
    this.properties = [...propertyData];
  }

  async getAll() {
    await delay(300);
    return [...this.properties];
  }

  async getById(id) {
    await delay(200);
    const property = this.properties.find(p => p.Id === parseInt(id, 10));
    if (!property) {
      throw new Error('Property not found');
    }
    return { ...property };
  }

  async search(query) {
    await delay(400);
    if (!query) return [...this.properties];
    
    const searchTerm = query.toLowerCase();
    return this.properties.filter(property => 
      property.title.toLowerCase().includes(searchTerm) ||
      property.address.street.toLowerCase().includes(searchTerm) ||
      property.address.city.toLowerCase().includes(searchTerm) ||
      property.address.zipCode.includes(searchTerm)
    );
  }

  async filter(filters) {
    await delay(350);
    let filtered = [...this.properties];

    if (filters.priceMin) {
      filtered = filtered.filter(p => p.price >= filters.priceMin);
    }
    if (filters.priceMax) {
      filtered = filtered.filter(p => p.price <= filters.priceMax);
    }
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      filtered = filtered.filter(p => filters.propertyTypes.includes(p.propertyType));
    }
    if (filters.bedroomsMin) {
      filtered = filtered.filter(p => p.bedrooms >= filters.bedroomsMin);
    }
    if (filters.bathroomsMin) {
      filtered = filtered.filter(p => p.bathrooms >= filters.bathroomsMin);
    }
    if (filters.squareFeetMin) {
      filtered = filtered.filter(p => p.squareFeet >= filters.squareFeetMin);
    }
    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(p => 
        filters.amenities.every(amenity => p.amenities.includes(amenity))
      );
    }

    return filtered;
  }

  async create(property) {
    await delay(500);
    const maxId = Math.max(...this.properties.map(p => p.Id));
    const newProperty = {
      ...property,
      Id: maxId + 1
    };
    this.properties.push(newProperty);
    return { ...newProperty };
  }

  async update(id, data) {
    await delay(400);
    const index = this.properties.findIndex(p => p.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Property not found');
    }
    
    this.properties[index] = { 
      ...this.properties[index], 
      ...data,
      Id: this.properties[index].Id // Prevent Id modification
    };
    return { ...this.properties[index] };
  }

  async delete(id) {
    await delay(300);
    const index = this.properties.findIndex(p => p.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Property not found');
    }
    
    const deleted = this.properties.splice(index, 1)[0];
    return { ...deleted };
  }
}

export default new PropertyService();