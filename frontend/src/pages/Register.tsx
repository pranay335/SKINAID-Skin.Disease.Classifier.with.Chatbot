import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion

// UI Components (assuming they are from shadcn/ui)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Icons from lucide-react (added Loader2 for loading state)
import { Stethoscope, User, Mail, Lock, Shield, Loader2, Hospital } from "lucide-react";

// Custom Hooks
import { useAuth } from "../App";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // --- Backend logic and form submission remain completely unchanged ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      
      login(data.token, data.user); 

      toast({
        title: "Account created successfully!",
        description: "Welcome to SkinAid. Your account has been created.",
      });

      navigate("/chatbot");

    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Unable to create account. Please try again.",
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
        staggerChildren: 0.1,
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
            Welcome to SkinAid
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your personal AI-powered dermatology assistant. Create an account to get started.
          </p>
          <div className="mt-8 flex items-center justify-center space-x-2 text-muted-foreground">
             <Hospital className="w-5 h-5" />
             <span className="font-medium">Trusted by Medical Professionals</span>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Registration Form */}
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
                <User className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
              <CardDescription>
                Join SkinAid to access advanced AI-powered skin analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-4"
                variants={formContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div className="grid grid-cols-2 gap-4" variants={formItemVariants}>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName" type="text" placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="transition-all duration-300 focus:shadow-[var(--shadow-medical)]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName" type="text" placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="transition-all duration-300 focus:shadow-[var(--shadow-medical)]"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div className="space-y-2" variants={formItemVariants}>
                  <Label htmlFor="email" className="flex items-center"><Mail className="w-4 h-4 mr-2" />Email</Label>
                  <Input
                    id="email" type="email" placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="transition-all duration-300 focus:shadow-[var(--shadow-medical)]"
                    required
                  />
                </motion.div>

                <motion.div className="space-y-2" variants={formItemVariants}>
                  <Label htmlFor="password" className="flex items-center"><Lock className="w-4 h-4 mr-2" />Password</Label>
                  <Input
                    id="password" type="password" placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="transition-all duration-300 focus:shadow-[var(--shadow-medical)]"
                    required
                  />
                </motion.div>

                <motion.div className="space-y-2" variants={formItemVariants}>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword" type="password" placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="transition-all duration-300 focus:shadow-[var(--shadow-medical)]"
                    required
                  />
                </motion.div>

                <motion.div className="flex items-center space-x-2" variants={formItemVariants}>
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", !!checked)}
                  />
                  <Label htmlFor="terms" className="text-sm flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    I agree to the <a href="/terms" className="underline hover:text-primary ml-1">Terms & Privacy Policy</a>
                  </Label>
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
                          <span>Creating Account...</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="text"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 10, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          Create Account
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
                transition={{delay: 1}}
              >
                <div className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in
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

export default Register;