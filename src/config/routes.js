import BrowseListings from '@/components/pages/BrowseListings';
import MapView from '@/components/pages/MapView';
import SavedProperties from '@/components/pages/SavedProperties';
import PropertyDetail from '@/components/pages/PropertyDetail';

export const routes = {
  browse: {
    id: 'browse',
    label: 'Browse Listings',
    path: '/',
    icon: 'Home',
    component: BrowseListings
  },
  map: {
    id: 'map',
    label: 'Map View',
    path: '/map',
    icon: 'Map',
    component: MapView
  },
  saved: {
    id: 'saved',
    label: 'Saved Properties',
    path: '/saved',
    icon: 'Heart',
    component: SavedProperties
  },
  propertyDetail: {
    id: 'propertyDetail',
    label: 'Property Details',
    path: '/property/:id',
    icon: 'Eye',
    component: PropertyDetail,
    hidden: true
  }
};

export const routeArray = Object.values(routes);
export default routes;