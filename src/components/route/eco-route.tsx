"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import BIKE_LANES from "@/data/bikeLanes";
import type { LatLngTuple } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import debounce from "lodash/debounce";
import {
  Bike,
  Bus,
  Car,
  ChevronDown,
  ChevronUp,
  Leaf,
  PersonStanding,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const Map: React.FC<{
  routes: Record<TransportMode, RouteData | null>;
  activeMode: TransportMode;
  markers: LatLngTuple[];
  initialConfig: {
    center: LatLngTuple;
    zoom: number;
  };
}> = ({ routes, activeMode, markers, initialConfig }) => {
  const mapRef = useRef<L.Map | null>(null);
  const routeLayersRef = useRef<Record<TransportMode, L.Polyline | null>>({
    [TransportMode.CAR]: null,
    [TransportMode.BIKE]: null,
    [TransportMode.WALK]: null,
  });
  const markerLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        center: initialConfig.center,
        zoom: initialConfig.zoom,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);

      markerLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialConfig]);

  // Handle route updates
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing routes
    Object.values(routeLayersRef.current).forEach((layer) => {
      if (layer) {
        layer.remove();
      }
    });

    // Draw new routes
    Object.entries(routes).forEach(([mode, routeData]) => {
      if (routeData) {
        const color =
          mode === TransportMode.BIKE
            ? "#22c55e"
            : mode === TransportMode.WALK
            ? "#3b82f6"
            : "#ef4444";

        const polyline = L.polyline(routeData.coordinates, {
          color,
          weight: mode === activeMode ? 5 : 3,
          opacity: mode === activeMode ? 1 : 0.5,
        }).addTo(mapRef.current!);

        routeLayersRef.current[mode as TransportMode] = polyline;
      }
    });

    // Fit bounds if there are routes
    const activeRoute = routes[activeMode];
    if (activeRoute?.coordinates.length) {
      mapRef.current.fitBounds(activeRoute.coordinates);
    }
  }, [routes, activeMode]);

  // Handle marker updates
  useEffect(() => {
    if (!mapRef.current || !markerLayerGroupRef.current) return;

    markerLayerGroupRef.current.clearLayers();

    markers.forEach((position) => {
      const icon = L.divIcon({
        className: "bg-black rounded-full w-3 h-3 border-2 border-white",
        iconSize: [12, 12],
      });

      L.marker(position, { icon }).addTo(markerLayerGroupRef.current!);
    });

    if (markers.length > 1) {
      mapRef.current.fitBounds(markers);
    }
  }, [markers]);

  return <div id="map" className="flex-1 h-full w-full" />;
};

const CO2_EMISSIONS = {
  CAR: 192, // Average car emissions g/km
  BIKE: 0,
  WALK: 0,
};

// Add average speeds (km/h)
const AVERAGE_SPEEDS = {
  CAR: 30,
  BIKE: 15,
  WALK: 5,
};

// Dynamic imports for map components
const MapWithNoSSR = dynamic(() => Promise.resolve(Map), {
  ssr: false,
  loading: () => <div className="flex-1 h-full w-full bg-gray-100" />,
});

enum TransportMode {
  CAR = "CAR",
  BIKE = "BIKE",
  WALK = "WALK",
}

const INITIAL_MAP_CONFIG = {
  center: [14.5995, 120.9842] as LatLngTuple,
  zoom: 13,
};

const getDirection = (start: LatLngTuple, end: LatLngTuple): string => {
  const startLat = (start[0] * Math.PI) / 180;
  const startLng = (start[1] * Math.PI) / 180;
  const endLat = (end[0] * Math.PI) / 180;
  const endLng = (end[1] * Math.PI) / 180;

  const dLng = endLng - startLng;

  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  // Convert bearing to cardinal direction
  if (bearing >= 337.5 || bearing < 22.5) return "Head North";
  if (bearing >= 22.5 && bearing < 67.5) return "Turn Northeast";
  if (bearing >= 67.5 && bearing < 112.5) return "Turn East";
  if (bearing >= 112.5 && bearing < 157.5) return "Turn Southeast";
  if (bearing >= 157.5 && bearing < 202.5) return "Turn South";
  if (bearing >= 202.5 && bearing < 247.5) return "Turn Southwest";
  if (bearing >= 247.5 && bearing < 292.5) return "Turn West";
  return "Turn Northwest";
};

// Interfaces
interface Location {
  name: string;
  lat: number;
  lon: number;
}

interface RouteInfo {
  distance: string;
  duration: number;
  durationInTraffic?: number;
  directions: DirectionStep[];
  hasBikeLane?: boolean;
  co2Impact: number;
}

interface RouteData {
  coordinates: LatLngTuple[];
  mode: TransportMode;
}

interface RouteInfoCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

interface LocationSearchProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: Location) => void;
  disabled?: boolean;
}

interface DirectionStep {
  instruction: string;
  distance: number;
  duration: number;
  name: string;
}

const RouteInfoCard: React.FC<RouteInfoCardProps> = ({
  icon,
  title,
  value,
}) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 backdrop-blur">
    {icon}
    <div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);

interface LocationSearchProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: Location) => void;
  disabled?: boolean;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  placeholder,
  value,
  onChange,
  onSelect,
  disabled,
}) => {
  const [suggestions, setSuggestions] = useState<Location[]>([]);

  const fetchSuggestions = useCallback(
    debounce(async (searchText: string) => {
      if (searchText.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchText
          )}&limit=5`
        );
        const data = (await response.json()) as {
          display_name: string;
          lat: string;
          lon: string;
        }[];
        setSuggestions(
          data.map((item) => ({
            name: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
          }))
        );
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(value);
  }, [value, fetchSuggestions]);

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-white"
      />
      {suggestions.length > 0 && (
        <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg z-50 max-h-48 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(suggestion.name);
                onSelect(suggestion);
                setSuggestions([]);
              }}
            >
              {suggestion.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EcoRoute: React.FC = () => {
  const searchParams = useSearchParams();

  const [isMounted, setIsMounted] = useState(false);
  const [originValue, setOriginValue] = useState<string>("");
  const [destinationValue, setDestinationValue] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<TransportMode>(
    TransportMode.CAR
  );
  const [originLocation, setOriginLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] =
    useState<Location | null>(null);
  const [routes, setRoutes] = useState<Record<TransportMode, RouteData | null>>(
    {
      [TransportMode.CAR]: null,
      [TransportMode.BIKE]: null,
      [TransportMode.WALK]: null,
    }
  );
  const [markers, setMarkers] = useState<LatLngTuple[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const getDistance = (point1: LatLngTuple, point2: LatLngTuple): number => {
    const [lat1, lon1] = point1;
    const [lat2, lon2] = point2;
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    dragStartY.current = e.clientY;
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return;
    const dragDistance = e.clientY - dragStartY.current;
    if (dragDistance > 50) {
      setIsExpanded(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (searchParams) {
      const originLat = searchParams.get("originLat");
      const originLon = searchParams.get("originLon");
      const originName = searchParams.get("originName");
      const destination = searchParams.get("destination");

      if (originLat && originLon && originName) {
        setOriginValue(originName);
        setOriginLocation({
          name: originName,
          lat: parseFloat(originLat),
          lon: parseFloat(originLon),
        });
      }

      if (destination) {
        setDestinationValue(destination);
        const fetchDestination = async () => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                destination
              )}&limit=1`
            );
            const data = await response.json();
            if (data && data[0]) {
              setDestinationLocation({
                name: destination,
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
              });
            }
          } catch (error) {
            console.error("Error fetching destination coordinates:", error);
          }
        };
        fetchDestination();
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (originLocation && destinationLocation) {
      calculateRoutes();
    }
  }, [originLocation, destinationLocation]);

  // Effect to handle mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Early return if not mounted
  if (!isMounted) {
    return null;
  }

  const calculateRoutes = async (): Promise<void> => {
    if (!originLocation || !destinationLocation) return;

    setIsLoading(true);
    setError(null);

    try {
      const routePromises = Object.values(TransportMode).map(async (mode) => {
        const osrmUrl = `https://router.project-osrm.org/route/v1/${mode}/${originLocation.lon},${originLocation.lat};${destinationLocation.lon},${destinationLocation.lat}?overview=full&geometries=geojson&steps=true`;
        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates: LatLngTuple[] = route.geometry.coordinates.map(
            ([lon, lat]: [number, number]) => [lat, lon] as LatLngTuple
          );

          const distanceKm = route.distance / 1000;

          const co2Impact =
            mode === TransportMode.CAR
              ? CO2_EMISSIONS.CAR * distanceKm
              : CO2_EMISSIONS.CAR * distanceKm * -1;

          const duration = (distanceKm / AVERAGE_SPEEDS[mode]) * 60;

          const directions: DirectionStep[] = route.legs[0].steps.map(
            (step: DirectionStep, index: number) => {
              const currentCoord = coordinates[index];
              const nextCoord = coordinates[index + 1] || coordinates[index];
              const direction = getDirection(currentCoord, nextCoord);

              return {
                instruction: `${direction} on `,
                distance: step.distance,
                duration: Math.round(
                  (step.distance / 1000 / AVERAGE_SPEEDS[mode]) * 60
                ),
                name: step.name || "unnamed road",
              };
            }
          );

          const hasBikeLane =
            mode === TransportMode.BIKE &&
            coordinates.some((point) =>
              BIKE_LANES.some((lane) =>
                lane.path.some(
                  (lanePoint) =>
                    lanePoint.lat !== null &&
                    Math.abs(lanePoint.lat - point[0]) < 0.001 &&
                    lanePoint.lng !== null &&
                    Math.abs(lanePoint.lng - point[1]) < 0.001
                )
              )
            );

          return {
            mode,
            routeData: {
              coordinates,
              mode,
            },
            routeInfo: {
              distance: distanceKm.toFixed(2),
              duration: Math.round(duration),
              durationInTraffic:
                mode === TransportMode.CAR
                  ? Math.round(duration * 1.2)
                  : undefined,
              directions,
              hasBikeLane,
              co2Impact,
            },
          };
        }
        return null;
      });

      const results = await Promise.all(routePromises);
      const newRoutes: Record<TransportMode, RouteData | null> = {
        [TransportMode.CAR]: null,
        [TransportMode.BIKE]: null,
        [TransportMode.WALK]: null,
      };

      results.forEach((result) => {
        if (result) {
          newRoutes[result.mode] = result.routeData;
          if (result.mode === selectedMode) {
            setRouteInfo(result.routeInfo);
          }
        }
      });

      setRoutes(newRoutes);
      setMarkers([
        [originLocation.lat, originLocation.lon],
        [destinationLocation.lat, destinationLocation.lon],
      ]);
    } catch (err) {
      setError("Failed to calculate routes. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearRoute = (): void => {
    setOriginValue("");
    setDestinationValue("");
    setOriginLocation(null);
    setDestinationLocation(null);
    setRoutes({
      [TransportMode.CAR]: null,
      [TransportMode.BIKE]: null,
      [TransportMode.WALK]: null,
    });
    setMarkers([]);
    setRouteInfo(null);
    setError(null);
  };

  const getTransportIcon = (mode: TransportMode): React.ReactNode => {
    switch (mode) {
      case TransportMode.BIKE:
        return <Bike className="w-5 h-5" />;
      case TransportMode.WALK:
        return <PersonStanding className="w-5 h-5" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  const handleModeChange = (mode: TransportMode) => {
    setSelectedMode(mode);

    if (routes[mode]) {
      const route = routes[mode]!;

      // Calculate the actual distance in kilometers using route coordinates
      const distanceKm = route.coordinates.reduce((acc, curr, idx, arr) => {
        if (idx === 0) return 0;
        const prev = arr[idx - 1];
        const distLat = curr[0] - prev[0];
        const distLng = curr[1] - prev[1];
        const distance = Math.sqrt(distLat * distLat + distLng * distLng) * 111;
        return acc + distance;
      }, 0);

      const duration = (distanceKm / AVERAGE_SPEEDS[mode]) * 60;

      const co2Impact =
        mode === TransportMode.CAR
          ? CO2_EMISSIONS.CAR * distanceKm
          : CO2_EMISSIONS.CAR * distanceKm * -1;

      const directions = route.coordinates
        .map((coord, index, coords) => {
          if (index === coords.length - 1) return null;
          const nextCoord = coords[index + 1];
          const direction = getDirection(coord, nextCoord);
          return {
            instruction: direction,
            distance: getDistance(coord, nextCoord) * 1000,
            duration: Math.round(
              (getDistance(coord, nextCoord) / AVERAGE_SPEEDS[mode]) * 60
            ),
            name: "Continue on current road",
          };
        })
        .filter(Boolean) as DirectionStep[];

      const hasBikeLane =
        mode === TransportMode.BIKE &&
        route.coordinates.some((point) =>
          BIKE_LANES.some((lane) =>
            lane.path.some(
              (lanePoint) =>
                lanePoint.lat !== null &&
                Math.abs(lanePoint.lat - point[0]) < 0.001 &&
                lanePoint.lng !== null &&
                Math.abs(lanePoint.lng - point[1]) < 0.001
            )
          )
        );

      setRouteInfo({
        distance: distanceKm.toFixed(2),
        duration: Math.round(duration),
        durationInTraffic:
          mode === TransportMode.CAR ? Math.round(duration * 1.2) : undefined,
        directions,
        hasBikeLane,
        co2Impact,
      });
    }
  };

  return (
    <div className="h-screen w-full relative flex flex-col md:flex-row">
      <div className="flex-1 h-full w-full order-1">
        <MapWithNoSSR
          routes={routes}
          activeMode={selectedMode}
          markers={markers}
          initialConfig={INITIAL_MAP_CONFIG}
        />
      </div>
      <div
        className={`absolute bottom-0 left-0 right-0 z-[1000] transition-all duration-300 ease-in-out
                    ${isExpanded ? "h-[calc(100%-4rem)]" : "h-auto"}`}
        style={{
          transform: isExpanded
            ? "translateY(0)"
            : "translateY(calc(100% - 10rem))",
        }}
      >
        <Card
          className="rounded-t-xl shadow-xl h-full"
          ref={cardRef}
          draggable
          onDragStart={handleDragStart}
          onDrag={handleDrag}
        >
          <div
            className="flex justify-center p-2 cursor-pointer"
            onClick={toggleExpand}
          >
            {isExpanded ? (
              <ChevronDown className="w-6 h-6" />
            ) : (
              <ChevronUp className="w-6 h-6" />
            )}
          </div>
          <CardHeader>
            <CardTitle>Para Po Route</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-auto">
            {error && (
              <div className="p-2 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <LocationSearch
                placeholder="Enter origin location"
                value={originValue}
                onChange={(value) => {
                  setOriginValue(value);
                  setIsExpanded(true);
                }}
                onSelect={setOriginLocation}
                disabled={isLoading}
              />

              <LocationSearch
                placeholder="Enter destination location"
                value={destinationValue}
                onChange={(value) => {
                  setDestinationValue(value);
                  setIsExpanded(true);
                }}
                onSelect={setDestinationLocation}
                disabled={isLoading}
              />

              <div className="flex gap-2">
                {Object.values(TransportMode).map((mode) => (
                  <Button
                    key={mode}
                    variant={selectedMode === mode ? "default" : "outline"}
                    className={`p-2 flex-1 ${
                      selectedMode === mode
                        ? "bg-black hover:bg-gray-800"
                        : "border-black text-black hover:bg-gray-100"
                    }`}
                    onClick={() => handleModeChange(mode)}
                  >
                    {getTransportIcon(mode)}
                  </Button>
                ))}
              </div>

              <Button
                onClick={calculateRoutes}
                disabled={!originLocation || !destinationLocation || isLoading}
                className="w-full bg-black hover:bg-gray-800"
              >
                Calculate Route
              </Button>

              <Button
                onClick={clearRoute}
                disabled={isLoading}
                className="w-full bg-gray-300 hover:bg-gray-400"
              >
                Clear Route
              </Button>
            </div>

            {isExpanded && routeInfo && (
              <div className="space-y-4 mt-4">
                <RouteInfoCard
                  icon={getTransportIcon(selectedMode)}
                  title="Distance"
                  value={`${routeInfo.distance} km`}
                />
                <RouteInfoCard
                  icon={<Bus className="w-5 h-5" />}
                  title="Duration"
                  value={`${routeInfo.duration} mins`}
                />
                {selectedMode === TransportMode.CAR && (
                  <>
                    <RouteInfoCard
                      icon={<Car className="w-5 h-5" />}
                      title="Estimated Delay"
                      value={`${routeInfo.durationInTraffic} mins`}
                    />
                    <RouteInfoCard
                      icon={<Leaf className="w-5 h-5 text-red-500" />}
                      title="CO2 Emissions"
                      value={`${Math.abs(routeInfo.co2Impact).toFixed(1)} g`}
                    />
                  </>
                )}
                {(selectedMode === TransportMode.BIKE ||
                  selectedMode === TransportMode.WALK) && (
                  <RouteInfoCard
                    icon={<Leaf className="w-5 h-5 text-green-500" />}
                    title="CO2 Savings"
                    value={`${Math.abs(routeInfo.co2Impact).toFixed(1)} g`}
                  />
                )}
              </div>
            )}

            {isExpanded &&
              selectedMode === TransportMode.BIKE &&
              routeInfo?.hasBikeLane && (
                <div className="p-2 mt-4 bg-green-100 text-green-700 rounded-md">
                  🚴 This route includes bike lanes!
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EcoRoute;
