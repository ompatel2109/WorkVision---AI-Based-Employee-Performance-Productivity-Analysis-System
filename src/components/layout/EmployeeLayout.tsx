import { Outlet, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import {
    LayoutDashboard,
    LogOut,
    ClipboardList,
    History,
    MessageSquare,
    User as UserIcon,
    Camera,
    FileText,
    Menu,
    CheckSquare,
    Bell,
    CheckCheck,
    Settings
} from "lucide-react";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface NotificationItem {
    _id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const [notifRes, countRes] = await Promise.all([
                api.get("/employee/notifications"),
                api.get("/employee/notifications/unread-count"),
            ]);
            setNotifications(notifRes.data);
            setUnreadCount(countRes.data.count);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        try {
            await api.post("/employee/notifications/read", { notification_id: id });
            fetchNotifications();
        } catch (err) { console.error(err); }
    };

    const markAllRead = async () => {
        try {
            await api.post("/employee/notifications/read-all");
            fetchNotifications();
        } catch (err) { console.error(err); }
    };

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={markAllRead}>
                            <CheckCheck className="h-3 w-3" /> Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="max-h-[350px]">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n._id}
                                className={`p-3 border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/50 ${!n.is_read ? "bg-primary/5" : ""}`}
                                onClick={() => !n.is_read && markAsRead(n._id)}
                            >
                                <div className="flex items-start gap-2">
                                    {!n.is_read && (
                                        <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                                    )}
                                    <div className={`flex-1 ${n.is_read ? "pl-4" : ""}`}>
                                        <p className="text-sm font-medium leading-tight">{n.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{getTimeAgo(n.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function EmployeeLayout() {
    const { logout, user, updateUser } = useAuth();
    const navigate = useNavigate();
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
        { icon: LayoutDashboard, label: "Dashboard", href: "/employee" },
        { icon: CheckSquare, label: "My Tasks", href: "/employee/tasks" }, // Added Tasks Link
        { icon: ClipboardList, label: "My Work Logs", href: "/employee/work-log" },
        { icon: History, label: "History", href: "/employee/history" },
        { icon: MessageSquare, label: "Feedback", href: "/employee/feedback" },
        { icon: Settings, label: "Settings", href: "/employee/settings" },
    ];

    const SidebarContent = () => (
        <div className="flex h-full flex-col" style={{ background: 'linear-gradient(180deg, hsl(222 47% 11%) 0%, hsl(224 50% 15%) 100%)' }}>
            <div className="flex h-16 items-center px-5 border-b border-white/8 shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-primary/20 ring-1 ring-primary/40 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <span className="font-bold text-sm text-white tracking-tight">WorkVision</span>
                        <p className="text-[10px] text-white/40 -mt-0.5">Employee Portal</p>
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
            <div className="p-3 border-t border-white/8 shrink-0">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-2">
                    <Avatar className="h-9 w-9 border-2 border-primary/40 ring-2 ring-primary/20 shrink-0">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-primary/30 text-primary-foreground text-sm font-bold">
                            {user?.name ? getInitials(user.name) : 'E'}
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
                                            htmlFor="avatar-upload-employee"
                                            className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </label>
                                        <input
                                            id="avatar-upload-employee"
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
        <div className="grid min-h-screen w-full lg:grid-cols-[256px_1fr]">
            <div className="hidden lg:block sticky top-0 h-screen overflow-y-auto border-r border-white/5 shadow-xl">
                <SidebarContent />
            </div>
            <div className="flex flex-col overflow-y-auto h-screen bg-background">
                <header className="flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 px-4 lg:px-6 backdrop-blur-xl sticky top-0 z-30">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0">
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest hidden sm:block">Employee</p>
                                <h2 className="text-sm font-bold text-foreground -mt-0.5 sm:mt-0">Portal</h2>
                            </div>
                        </div>
                    </div>
                    {/* Notification Bell */}
                    <NotificationBell />
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

