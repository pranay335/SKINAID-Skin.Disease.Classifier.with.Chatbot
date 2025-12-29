import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Camera, Brain, Users, Shield, Zap } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SkinAid
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Classify</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/login">
              <Button className="btn-medical">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Professional medical environment with dermatology equipment"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 hero-gradient opacity-30"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Skin Disease Classification
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Harness the power of AI to get instant, accurate skin condition analysis.
              Upload an image and receive professional-grade diagnostic insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/classify">
                <Button size="lg" className="btn-medical px-8 py-4 text-lg">
                  <Camera className="w-5 h-5 mr-2" />
                  Start Classification
                </Button>
              </Link>
              <Link to="/practice">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Medical AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              State-of-the-art technology for accurate skin condition analysis
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-medical hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300 animate-float">
              <CardHeader>
                <Brain className="w-12 h-12 text-primary mb-4" />
                <CardTitle>AI-Powered Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced machine learning algorithms trained on thousands of dermatological cases
                  for accurate disease classification.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="card-medical hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300 animate-float" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <Shield className="w-12 h-12 text-secondary mb-4" />
                <CardTitle>HIPAA Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your medical data is protected with enterprise-grade security
                  and full HIPAA compliance standards.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="card-medical hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300 animate-float" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <Zap className="w-12 h-12 text-accent mb-4" />
                <CardTitle>Instant Results</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get comprehensive analysis results in seconds, not hours.
                  Fast, reliable, and always available.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="card-medical max-w-4xl mx-auto p-12">
            <Users className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Join Thousands of Healthcare Professionals
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Trusted by dermatologists, clinicians, and medical professionals worldwide
            </p>
            <Link to="/register">
              <Button size="lg" className="btn-medical px-8 py-4 text-lg">
                Start Your Analysis Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Stethoscope className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">SkinAid</span>
          </div>
          <p className="text-center text-muted-foreground">
            © 2025 SkinAid. Professional skin disease classification powered by AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;