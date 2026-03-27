import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Settings,
    Activity,
    Bot,
    GitBranch,
    FileText,
    LogOut,
    User as UserIcon,
    Camera,
    Upload,
    Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logoImg from '@/assets/logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
    { icon: Users, label: 'User Management', to: '/admin/users' },
    { icon: Building2, label: 'Department Teams', to: '/admin/team' },
    { icon: GitBranch, label: 'Departments', to: '/admin/departments' },
    { icon: FileText, label: 'Reports', to: '/admin/reports' },
    { icon: Settings, label: 'Settings', to: '/admin/settings' },
];

export function AdminSidebar() {
    const { user, logout, updateUser } = useAuth();
    const { toast } = useToast();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

    return (
        <aside className="sidebar-wrapper border-r border-white/5 shadow-xl">
            <div className="flex h-16 items-center justify-start px-5 gap-3 border-b border-white/8 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/40">
                    <img src={logoImg} alt="Logo" className="h-5 w-5" />
                </div>
                <div>
                    <span className="font-bold text-sm text-white tracking-tight">WorkVision</span>
                    <p className="text-[10px] text-white/40 -mt-0.5">Admin Panel</p>
                </div>
            </div>

            <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/admin'}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                    : "text-white/55 hover:text-white hover:bg-white/8"
                            )
                        }
                    >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile Section at Bottom */}
            <div className="p-3 border-t border-white/8">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-2">
                    <Avatar className="h-9 w-9 border-2 border-primary/40 ring-2 ring-primary/20 shrink-0">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-primary/30 text-primary-foreground text-sm font-bold">
                            {user?.name ? getInitials(user.name) : 'U'}
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
                                            htmlFor="avatar-upload"
                                            className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </label>
                                        <input
                                            id="avatar-upload"
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
                        onClick={logout}
                    >
                        <LogOut className="h-3 w-3" />
                        Logout
                    </Button>
                </div>
            </div>
        </aside>
    );
}

