import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BarChart3, LogOut, Settings, User, Menu } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden font-semibold text-foreground sm:block">PerformanceAI</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden items-center gap-6 md:flex">
              {user.role === 'admin' ? (
                <>
                  <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/admin/employees" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Employees
                  </Link>
                  <Link to="/admin/reports" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Reports
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/work-entry" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Log Work
                  </Link>
                  <Link to="/history" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    History
                  </Link>
                </>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu Button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="hero">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {user.role === 'admin' ? (
                <>
                  <Link to="/admin" className="px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Link>
                  <Link to="/admin/employees" className="px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Employees
                  </Link>
                  <Link to="/admin/reports" className="px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Reports
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Link>
                  <Link to="/work-entry" className="px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Log Work
                  </Link>
                  <Link to="/history" className="px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    History
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
