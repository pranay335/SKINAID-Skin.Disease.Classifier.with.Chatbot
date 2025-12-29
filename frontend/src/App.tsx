import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState, createContext, useContext, ReactNode, useEffect } from "react";

// Page Imports
import Index from "./pages/Index";
import ClassifyImage from "./pages/ClassifyImage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatbotInterface from "./pages/ChatbotInterface";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import History from "./pages/History";
import DashboardLayout from "./components/ui/layout/DashboardLayout";
import NearbyDermatologists from "./pages/NearbyDermatologists";

const queryClient = new QueryClient();

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, user: any) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Inside the AuthProvider component

const login = (token: string, user: any) => {
  try {
    // This is the crucial part: saving BOTH the token and the user object
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setIsAuthenticated(true);
    return true;
  } catch (error) {
    console.error("Auth login error:", error);
    return false;
  }
};
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
         
            <Route element={<ProtectedLayout />}>
              <Route path="/chatbot" element={<ChatbotInterface />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/history" element={<History />} />
               <Route path="/NearbyDermatologists" element={<NearbyDermatologists/>} />
              <Route path="/classify" element={<ClassifyImage />} />
            </Route>
            
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;