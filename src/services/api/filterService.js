const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class FilterService {
  constructor() {
    this.filters = {
      priceMin: null,
      priceMax: null,
      propertyTypes: [],
      bedroomsMin: null,
      bathroomsMin: null,
      squareFeetMin: null,
      amenities: []
    };
  }

  async getFilters() {
    await delay(100);
    return { ...this.filters };
  }

  async updateFilters(newFilters) {
    await delay(150);
    this.filters = { ...this.filters, ...newFilters };
    return { ...this.filters };
  }

  async clearFilters() {
    await delay(100);
    this.filters = {
      priceMin: null,
      priceMax: null,
      propertyTypes: [],
      bedroomsMin: null,
      bathroomsMin: null,
      squareFeetMin: null,
      amenities: []
    };
    return { ...this.filters };
  }

  async getPropertyTypes() {
    await delay(100);
    return ['House', 'Condo', 'Townhouse', 'Apartment'];
  }

  async getAmenities() {
    await delay(100);
    return [
      'Pool', 'Gym', 'Parking', 'Balcony', 'Garden', 'Fireplace',
      'Air Conditioning', 'Dishwasher', 'Washer/Dryer', 'Pet Friendly'
    ];
  }
}

export default new FilterService();