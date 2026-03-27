import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Users,
    FileBarChart,
    LogOut,
    Settings,
    Menu,
    LineChart,
    User as UserIcon,
    Camera,
    ClipboardList,
    Trophy
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

export default function ManagerLayout() {
    const { logout, user, updateUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const name = formData.get('name') as string;

            // Prepare payload
            const payload: any = { name };
            if (avatarPreview) {
                payload.avatar = avatarPreview;
            }

            await api.put('/auth/update-profile', payload);

            // Update local context
            updateUser({
                ...user,
                name: name,
                avatar: avatarPreview || user.avatar
            });

            toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
            setIsProfileOpen(false);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to update profile.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/manager" },
        { icon: Users, label: "My Team", href: "/manager/team" },
        { icon: Trophy, label: "Leaderboard", href: "/manager/leaderboard" },
        { icon: ClipboardList, label: "Tasks", href: "/manager/tasks" },
        { icon: LineChart, label: "Analytics", href: "/manager/comparison" },
        { icon: FileBarChart, label: "Reports", href: "/manager/reports" },
        { icon: Settings, label: "Settings", href: "/manager/settings" },
    ];

    const SidebarContent = () => (
        <div className="flex h-full flex-col" style={{ background: 'linear-gradient(180deg, hsl(222 47% 11%) 0%, hsl(224 50% 15%) 100%)' }}>
            <div className="flex h-16 items-center px-5 border-b border-white/8">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-primary/20 ring-1 ring-primary/40 flex items-center justify-center">
                        <LineChart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <span className="font-bold text-sm text-white tracking-tight">WorkVision</span>
                        <p className="text-[10px] text-white/40 -mt-0.5">Manager Portal</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="flex flex-col gap-1 px-3">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                        : "text-white/55 hover:text-white hover:bg-white/8"
                                }`}
                            >
                                <item.icon className="h-4 w-4 shrink-0" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile Section at Bottom */}
            <div className="p-3 border-t border-white/8">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-2">
                    <Avatar className="h-9 w-9 border-2 border-primary/40 ring-2 ring-primary/20 shrink-0">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-primary/30 text-primary-foreground text-sm font-bold">
                            {user?.name ? getInitials(user.name) : 'M'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-[10px] text-white/45 truncate">{user?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full text-xs gap-1 h-8">
                                <UserIcon className="h-3 w-3" />
                                Edit
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Profile</DialogTitle>
                                <DialogDescription>
                                    Update your personal information and profile picture.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="flex flex-col items-center justify-center gap-4 py-4">
                                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg cursor-pointer group relative overflow-visible">
                                        <AvatarImage src={avatarPreview || user?.avatar} />
                                        <AvatarFallback className="text-2xl">
                                            {user?.name ? getInitials(user.name) : 'U'}
                                        </AvatarFallback>
                                        <label
                                            htmlFor="avatar-upload-manager"
                                            className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </label>
                                        <input
                                            id="avatar-upload-manager"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </Avatar>
                                    <p className="text-xs text-muted-foreground">
                                        Click camera icon to upload new photo
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" defaultValue={user?.name} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value={user?.email} disabled className="bg-muted" />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsProfileOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Button
                        variant="destructive"
                        size="sm"
                        className="w-full text-xs gap-1 h-8 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive border border-destructive/20 shadow-none"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-3 w-3" />
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[256px_1fr]">
            <div className="hidden md:block sticky top-0 h-screen overflow-y-auto border-r border-white/5 shadow-xl">
                <SidebarContent />
            </div>
            <div className="flex flex-col overflow-y-auto h-screen">
                <header className="flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 px-4 lg:px-6 backdrop-blur-xl sticky top-0 z-30">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                    
                    <div className="flex items-center space-x-4 ml-auto">
                        {user && (
                            <div className="flex items-center space-x-3 bg-card p-1.5 pr-4 rounded-full border shadow-sm h-10 lg:h-12 hidden sm:flex">
                                <Avatar className="h-7 w-7 lg:h-9 lg:w-9 border border-background shadow-sm">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                        {user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'M'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col justify-center">
                                    <p className="text-xs font-semibold leading-none mb-0.5">{user.name}</p>
                                    <p className="text-[10px] text-muted-foreground leading-none">{user.email}</p>
                                </div>
                            </div>
                        )}
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

