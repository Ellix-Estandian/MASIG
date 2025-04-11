
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  LogOut, 
  Menu, 
  Package, 
  Settings, 
  X, 
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  // Reduced navigation items
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
    },
    {
      name: "Products",
      href: "/products",
      icon: Package,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden",
        sidebarOpen ? "block" : "hidden"
      )} onClick={() => setSidebarOpen(false)}></div>
      
      <header className="bg-white shadow-sm h-16 flex items-center sticky top-0 z-10">
        <div className="flex justify-between items-center px-4 md:px-6 w-full">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden text-gray-500 hover:text-gray-900 focus:outline-none mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-600 rounded-md flex items-center justify-center">
                <Package className="text-white h-5 w-5" />
              </div>
              <span className="text-lg font-semibold text-gray-900">MASIG Products</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Top navigation tabs */}
            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname === item.href
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* Settings dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.firstName} {user?.lastName}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Mobile sidebar content */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-600 rounded-md flex items-center justify-center">
                <Package className="text-white h-5 w-5" />
              </div>
              <span className="text-lg font-semibold text-gray-900">MASIG Products</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    location.pathname === item.href
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5",
                    location.pathname === item.href
                      ? "text-brand-700"
                      : "text-gray-400 group-hover:text-gray-500"
                  )} />
                  {item.name}
                </Link>
              ))}
              <Link
                to="/settings"
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location.pathname === "/settings"
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className={cn(
                  "mr-3 h-5 w-5",
                  location.pathname === "/settings"
                    ? "text-brand-700"
                    : "text-gray-400 group-hover:text-gray-500"
                )} />
                Settings
              </Link>
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
