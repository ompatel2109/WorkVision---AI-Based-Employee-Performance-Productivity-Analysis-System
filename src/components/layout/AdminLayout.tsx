import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

function usePageTitle(path: string) {
    const titles: Record<string, string> = {
        '/admin': 'Dashboard',
        '/admin/users': 'User Management',
        '/admin/team': 'Department Teams',
        '/admin/departments': 'Departments',
        '/admin/reports': 'Reports',
        '/admin/ai': 'AI Analytics',
        '/admin/logs': 'System Logs',
        '/admin/settings': 'Settings',
    };
    return titles[path] || 'Admin Panel';
}

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const pageTitle = usePageTitle(location.pathname);
    const [isDark, setIsDark] = useState(() =>
        document.documentElement.classList.contains('dark')
    );

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        setIsDark(prev => !prev);
    };

    return (
        <div className="min-h-screen bg-background">
            <AdminSidebar />

            <div className="pl-64 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Admin</p>
                            <h2 className="text-sm font-bold text-foreground -mt-0.5">{pageTitle}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={toggleTheme}
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>

                        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-1.5 shadow-sm">
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-foreground hidden sm:block">{user?.name}</span>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign out
                        </Button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
