import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  createdAt: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/profile", {
          headers: {
            "x-auth-token": token || "",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !user) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || "Could not load user profile."}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="text-center">
          <Avatar className="h-28 w-28 mx-auto mb-4 border-4 border-primary/10">
            <AvatarImage src={user.profilePicture || `https://api.dicebear.com/8.x/bottts/svg?seed=${user.name}`} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-base italic px-4">
            {user.bio || "No bio provided."}
          </p>
          <div className="text-sm text-muted-foreground">
            Member since: {new Date(user.createdAt).toLocaleDateString()}
          </div>
          <Button>Edit Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Skeleton component for loading state
const ProfileSkeleton = () => (
  <div className="w-full max-w-2xl mx-auto">
    <Card>
      <CardHeader className="text-center">
        <Skeleton className="h-28 w-28 rounded-full mx-auto mb-4" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-6 w-64 mx-auto mt-2" />
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-10 w-32 mx-auto mt-4" />
      </CardContent>
    </Card>
  </div>
);

export default Profile;