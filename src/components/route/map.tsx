"use client";

import BIKE_LANES from "@/data/bikeLanes";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    MapContainer,
    Marker,
    Polyline,
    TileLayer,
    useMap,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
// Enums and Constants
export enum TransportMode {
    CAR = "driving",
    BIKE = "bicycle",
    WALK = "foot",
}
export interface RouteData {
    coordinates: LatLngTuple[];
    mode: TransportMode;
}
export interface MapProps {
    routes: Record<TransportMode, RouteData | null>;
    activeMode: TransportMode;
    markers: LatLngTuple[];
    initialConfig: {
        center: LatLngTuple;
        zoom: number;
    };
}

// Move your existing MapComponent here and rename it to MapContent
const MapContent: React.FC<Omit<MapProps, 'initialConfig'>> = ({
    routes,
    activeMode,
    markers,
}) => {
    const map = useMap();

    useEffect(() => {
        if (markers.length === 2) {
            const bounds = L.latLngBounds(markers);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [markers, map]);

    return (
        <>
            {routes[activeMode] && (
                <Polyline
                    positions={routes[activeMode]!.coordinates}
                    pathOptions={{
                        color: activeMode === TransportMode.BIKE ? "#22c55e" : "#2196F3",
                        weight: 5,
                    }}
                />
            )}

            {BIKE_LANES.map((lane, index) => (
                <Polyline
                    key={`bike-lane-${index}`}
                    positions={lane.path
                        .filter((p) => p.lat !== null && p.lng !== null)
                        .map((p) => [p.lat!, p.lng!])}
                    pathOptions={{
                        color: "#22c55e",
                        weight: 3,
                        dashArray: "5, 10",
                    }}
                />
            ))}

            {markers.map((position, index) => (
                <Marker key={index} position={position} />
            ))}
        </>
    );
};

// Create a new wrapper component
const MapComponent: React.FC<MapProps> = ({
    routes,
    activeMode,
    markers,
    initialConfig
}) => {
    return (
        <MapContainer
            center={initialConfig.center}
            zoom={initialConfig.zoom}
            className="flex-1 h-full w-full"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            <MapContent
                routes={routes}
                activeMode={activeMode}
                markers={markers}
            />
        </MapContainer>
    );
};

export default MapComponent;