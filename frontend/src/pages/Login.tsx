import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// UI Components (assuming they are from shadcn/ui)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Icons from lucide-react
import { Stethoscope, Mail, Lock, Loader2, Hospital } from "lucide-react";

// Custom Hooks
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        toast({
            title: "Missing Information",
            description: "Please enter both email and password.",
            variant: "destructive",
        });
        return;
    }
    setIsLoading(true);

    try {
      console.log("[Login] submitting", { email });

      // --- API CALL TO BACKEND FOR LOGIN ---
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("[Login] response", { ok: response.ok, data });

      if (!response.ok) {
        // server returned non-2xx
        const msg = data?.message || "Invalid credentials. Please try again.";
        toast({ title: "Login failed", description: msg, variant: "destructive" });
        return;
      }

      // Validate returned payload
      if (!data || !data.token || !data.user) {
        console.error("[Login] invalid payload", data);
        toast({ title: "Login failed", description: "Invalid server response.", variant: "destructive" });
        return;
      }

      // Save auth via context (login returns boolean)
      const loginResult = await login(data.token, data.user);
      console.log("[Login] loginResult", loginResult);

      if (!loginResult) {
        toast({ title: "Login failed", description: "Could not initialize session.", variant: "destructive" });
        return;
      }

      // Success - show toast then navigate
      toast({ title: "Login successful", description: "Redirecting to chatbot..." });

      // Try immediate navigation
      try {
        navigate("/chatbot", { replace: true });
        console.log("[Login] navigated to /chatbot");
      } catch (navErr) {
        console.warn("[Login] navigate failed, will retry after short delay", navErr);
        setTimeout(() => navigate("/chatbot", { replace: true }), 500);
      }

    } catch (err: any) {
      console.error("[Login] error", err);
      toast({
        title: "Login failed",
        description: err?.message || "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Framer Motion variants for staggered animation
  const formContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const formItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 bg-background">
      {/* Left Column: Branding and Welcome Message */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-10 border-r border-border/50">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center"
        >
          <Stethoscope className="w-24 h-24 mx-auto text-primary" />
          <h1 className="mt-6 text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome Back to SkinAid
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Sign in to continue your journey to better skin health.
          </p>
          <div className="mt-8 flex items-center justify-center space-x-2 text-muted-foreground">
             <Hospital className="w-5 h-5" />
             <span className="font-medium">Advanced AI Skin Analysis</span>
          </div>
        </motion.div>
      </div>
      
      {/* Right Column: Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="card-medical border-none shadow-2xl shadow-primary/10">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center"
              >
                <Lock className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-6"
                variants={formContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div className="space-y-2" variants={formItemVariants}>
                  <Label htmlFor="email" className="flex items-center"><Mail className="w-4 h-4 mr-2" />Email</Label>
                  <Input
                    id="email" type="email" placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="transition-all duration-300 focus:shadow-[var(--shadow-medical)]"
                    required
                  />
                </motion.div>

                <motion.div className="space-y-2" variants={formItemVariants}>
                  <Label htmlFor="password" className="flex items-center"><Lock className="w-4 h-4 mr-2" />Password</Label>
                  <Input
                    id="password" type="password" placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="transition-all duration-300 focus:shadow-[var(--shadow-medical)]"
                    required
                  />
                </motion.div>
                
                <motion.div variants={formItemVariants}>
                  <Button type="submit" className="w-full btn-medical" disabled={isLoading}>
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loader"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 10, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-center"
                        >
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          <span>Signing In...</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="text"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 10, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          Sign In
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </motion.form>

              <motion.div 
                className="mt-6 text-center"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.8}}
              >
                <div className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-primary hover:underline font-medium">
                    Create one
                  </Link>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
