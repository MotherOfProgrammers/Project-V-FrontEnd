import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createNumberedIcon = (numbers: number | string) => {
  const displayText = typeof numbers === 'string' ? numbers : numbers.toString();
  const width = displayText.length > 2 ? 40 : 32;
  return L.divIcon({
    className: 'custom-numbered-icon',
    html: `<div style="background-color: #F47920; color: white; width: ${width}px; height: 32px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: ${displayText.length > 3 ? '11px' : '14px'}; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${displayText}</div>`,
    iconSize: [width, 32],
    iconAnchor: [width / 2, 16],
  });
};

interface Destination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  description?: string;
  day?: number;
}

interface DestinationMapProps {
  destinations?: Destination[];
  showRoute?: boolean;
  center?: [number, number];
  zoom?: number;
}

export default function DestinationMap({ 
  destinations = [], 
  showRoute = false,
  center = [7.8731, 80.7718],
  zoom = 8
}: DestinationMapProps) {
  const [mapDestinations, setMapDestinations] = useState<Destination[]>(destinations);
  const [hasFetched, setHasFetched] = useState(false);
  const [roadRoute, setRoadRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    if (destinations.length === 0 && !hasFetched) {
      setHasFetched(true);
      fetch('http://localhost:5000/api/map/destinations')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMapDestinations(data.destinations);
          }
        })
        .catch(err => console.error('Error fetching destinations:', err));
    } else if (destinations.length > 0) {
      setMapDestinations(destinations);
    }
  }, [destinations, hasFetched]);

  useEffect(() => {
    if (showRoute && mapDestinations.length > 1) {
      fetchRoadRoute();
    }
  }, [mapDestinations, showRoute]);

  const fetchRoadRoute = async () => {
    try {
      const coords = mapDestinations.map(d => `${d.lng},${d.lat}`).join(';');
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.code === 'Ok' && data.routes[0]) {
        const routeCoords = data.routes[0].geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );
        setRoadRoute(routeCoords);
      }
    } catch (error) {
      console.error('Error fetching road route:', error);
      setRoadRoute(mapDestinations.map(d => [d.lat, d.lng]));
    }
  };

  const routeCoordinates = roadRoute.length > 0 ? roadRoute : [];

  // Group destinations by location to show multiple day numbers on same marker
  const groupedDestinations = showRoute ? (() => {
    const locationMap = new Map<string, Destination & { days: number[] }>();
    mapDestinations.forEach(dest => {
      const key = `${dest.lat.toFixed(4)},${dest.lng.toFixed(4)}`;
      if (locationMap.has(key)) {
        const existing = locationMap.get(key)!;
        if (dest.day && !existing.days.includes(dest.day)) {
          existing.days.push(dest.day);
          existing.days.sort((a, b) => a - b);
        }
      } else {
        locationMap.set(key, { ...dest, days: dest.day ? [dest.day] : [] });
      }
    });
    return Array.from(locationMap.values());
  })() : mapDestinations.map(d => ({ ...d, days: d.day ? [d.day] : [] }));

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', position: 'relative', zIndex: 0 }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {groupedDestinations.map((dest, index) => {
          const dayLabel = dest.days.length > 0 ? dest.days.join(',') : (index + 1).toString();
          return (
            <Marker 
              key={dest.id} 
              position={[dest.lat, dest.lng]}
              icon={showRoute ? createNumberedIcon(dayLabel) : undefined}
            >
              <Popup>
                <div className="p-2">
                  {dest.days.length > 0 && (
                    <div className="font-bold text-orange-600">
                      Day {dest.days.join(', ')}
                    </div>
                  )}
                  <div className="font-semibold">{dest.name.replace(/\s*\(Day \d+\)/, '')}</div>
                  <div className="text-sm text-gray-600">{dest.type}</div>
                  {dest.description && (
                    <div className="text-xs mt-1">{dest.description}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {showRoute && routeCoordinates.length > 1 && (
          <Polyline 
            positions={routeCoordinates} 
            color="#F47920" 
            weight={5}
            opacity={0.9}
          />
        )}
      </MapContainer>
    </div>
  );
}
