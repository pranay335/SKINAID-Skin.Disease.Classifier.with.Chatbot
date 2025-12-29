import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Bot, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";

// Define the structure for a place
interface IPlace {
  _id: string;
  name: string;
  address: string;
  rating: string;
  review_count: number;
  map_url: string;
  distance: string;
}

const NearbyDermatologists = () => {
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This function now takes coordinates
  const fetchNearbyPlaces = async (latitude: number, longitude: number) => {
    try {
      const token = localStorage.getItem('token');
      // Pass lat/lng as query parameters
      const response = await fetch(`http://localhost:5000/api/nearby/dermatologists?lat=${latitude}&lng=${longitude}`, {
        headers: { 'x-auth-token': token || '' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby places');
      }
      
      const data = await response.json();
      setPlaces(data);
      setError(null); // Clear any previous errors
    } catch (error: any) {
      console.error(error);
      setError("Could not fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect now gets the user's location first
  useEffect(() => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    // Ask user for their location
    navigator.geolocation.getCurrentPosition(
      // Success Callback
      (position) => {
        const { latitude, longitude } = position.coords;
        // Now that we have the location, fetch the places
        fetchNearbyPlaces(latitude, longitude);
      },
      // Error Callback
      (err) => {
        console.error(err);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Please enable location services in your browser to see nearby places.");
        } else {
          setError("Unable to retrieve your location.");
        }
        setLoading(false);
      }
    );
  }, []); // Runs once on component mount

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 flex items-center">
        <Bot className="mr-3 h-8 w-8" /> Nearby Dermatologists
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Local Skin Specialists</CardTitle>
          <CardDescription>
            {error 
              ? "Could not load places." 
              : "Here are some dermatologists near you. Click one to open in Google Maps."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Show skeletons while loading
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : error ? (
            // Show error message if there is one
            <EmptyState message={error} />
          ) : places.length > 0 ? (
            // Display the list of places
            <motion.div 
              variants={containerVariants} 
              initial="hidden" 
              animate="visible" 
              className="space-y-3"
            >
              {places.map(place => (
                <motion.a
                  key={place._id}
                  variants={itemVariants}
                  href={place.map_url} // This is the Google Maps link
                  target="_blank"      // Opens in a new tab
                  rel="noopener noreferrer"
                  className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg">{place.name}</p>
                    <div className="flex items-center text-sm font-medium text-primary">
                      {place.distance}
                      <MapPin className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{place.address}</p>
                  <div className="flex items-center text-sm mt-1">
                    <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{place.rating}</span>
                    <span className="text-muted-foreground ml-1">({place.review_count} reviews)</span>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          ) : (
            // Show empty state if no results
            <EmptyState message="No dermatologists found within 5km of your location." />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg bg-muted/20">
    <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);

export default NearbyDermatologists;