import { useState, ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bot, FileImage, History, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/App";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Chatbot", path: "/chatbot", icon: Bot },
  { name: "Classifier", path: "/classify", icon: FileImage },
  { name: "History", path: "/history", icon: FileImage },
  { name: "NEARBY Dermet", path: "/NearbyDermatologists", icon: Bot}
];

const NavContent = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-6 px-2">SkinAid</h2>
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 rounded-lg transition-colors text-base font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <Button variant="ghost" className="w-full justify-start items-center space-x-3 p-3 text-base" onClick={handleLogout}>
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </Button>
    </div>
  );
};


const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background p-4">
        <NavContent />
      </aside>

      {/* Mobile Header and Sheet */}
      <div className="md:hidden flex items-center justify-between w-full p-4 border-b bg-background fixed top-0 left-0 z-10">
        <h2 className="text-xl font-bold">SkinAid</h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-4">
             <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 pt-20 md:pt-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;