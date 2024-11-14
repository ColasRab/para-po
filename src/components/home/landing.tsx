"use client";

import { useEffect, useState, useCallback, KeyboardEvent } from "react";
import LandingAnimation from "@/components/home/animation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spline from "@splinetool/react-spline";
import { Search, MapPin, MessageCircle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";

interface Location {
  name: string;
  lat: number;
  lon: number;
}

export default function Landing() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        setShowSuggestions(true);
        setSelectedIndex(-1); // Reset selection when new suggestions arrive
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(destination);
  }, [destination, fetchSuggestions]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getUserLocation = async (selectedDestination: string) => {
    setIsLocating(true);
    setLocationError("");

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      // Reverse geocode the coordinates to get the address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
      );
      const data = await response.json();

      // Navigate to the route page with both origin and destination
      if (selectedDestination) {
        const params = new URLSearchParams({
          originLat: position.coords.latitude.toString(),
          originLon: position.coords.longitude.toString(),
          originName: data.display_name,
          destination: selectedDestination,
        });

        router.push(`/route?${params.toString()}`);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError(
        "Unable to get your location. Please allow location access and try again."
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (destination) {
      await getUserLocation(destination);
    }
  };

  const handleSuggestionClick = async (suggestion: Location) => {
    setDestination(suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    await getUserLocation(suggestion.name);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <div className="w-full lg:w-1/3 flex flex-col justify-center items-center relative">
        <div
          className={`w-full ${
            isMobile ? "h-[40vh] pt-5" : "h-[50vh]"
          } flex justify-center items-center`}
        >
          <div
            className={`${
              isMobile ? "scale-50" : ""
            } transform transition-transform duration-300`}
          >
            <LandingAnimation />
          </div>
        </div>

        <div className="w-full px-4 lg:px-0 space-y-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Find Your Way
            </h2>
            <p className="text-gray-600 mt-1">
              Enter your destination to get started
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-sm mx-auto items-center space-x-2 relative"
          >
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Where are you going?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
                onFocus={() => setShowSuggestions(true)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg z-50 max-h-48 overflow-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`px-4 py-2 cursor-pointer ${
                        index === selectedIndex
                          ? "bg-blue-100 text-blue-900"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSuggestionClick(suggestion);
                      }}
                    >
                      {suggestion.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={!destination || isLocating}
              className="relative"
            >
              {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Go"}
            </Button>
          </form>

          {locationError && (
            <div className="text-red-500 text-sm text-center">
              {locationError}
            </div>
          )}

          {isMobile && (
            <>
              <div className="grid grid-cols-2 gap-4 mt-8 max-w-sm mx-auto">
                <Button
                  variant="outline"
                  className="flex items-center justify-center space-x-2 py-6"
                >
                  <MapPin className="h-5 w-5" />
                  <span>Nearby Spots</span>
                </Button>
                <Link href="/forum" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2 py-6"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Latest Updates</span>
                  </Button>
                </Link>
              </div>

              <div className="mt-8 max-w-sm mx-auto">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Recent Searches
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mall of Asia
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    BGC Central
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {!isMobile && (
        <div className="w-full lg:w-2/3 h-[50vh] lg:h-screen flex justify-center overflow-hidden items-center">
          <Spline
            scene="https://prod.spline.design/zpMJQkPWSrM6Shpm/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
}
