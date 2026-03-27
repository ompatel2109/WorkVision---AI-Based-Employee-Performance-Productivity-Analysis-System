import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Moon, Sun, Laptop, Bell, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export default function ManagerSettings() {
    const { user, updateUser } = useAuth();
    const { setTheme, theme } = useTheme();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);

    // Profile Form State
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/auth/update-profile', {
                name,
                password: password ? password : undefined
            });

            // Update local context
            if (user) {
                updateUser({ ...user, name });
            }

            toast({ title: "Profile Updated", description: "Your profile details have been securely saved." });
            setPassword('');
        } catch (error) {
            toast({ title: "Update Failed", description: "Could not update profile.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage your profile, application appearance, and team notifications.
                </p>
            </motion.div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Team Security</TabsTrigger>
                </TabsList>

                {/* PROFILE TAB */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Personal Information</CardTitle>
                            <CardDescription>Update your display name and change your password.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleUpdateProfile}>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value={email} disabled className="bg-muted text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Please contact IT admin if you need to update your email address.</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Leave empty to keep current password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        minLength={6}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                {/* APPEARANCE TAB */}
                <TabsContent value="appearance">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Moon className="h-5 w-5" /> Appearance
                            </CardTitle>
                            <CardDescription>Customize the look and feel of your manager portal.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Button
                                    type="button"
                                    variant={theme === 'light' ? 'default' : 'outline'}
                                    className="flex flex-col items-center gap-2 h-24"
                                    onClick={() => setTheme('light')}
                                >
                                    <Sun className="h-6 w-6" />
                                    Light
                                </Button>
                                <Button
                                    type="button"
                                    variant={theme === 'dark' ? 'default' : 'outline'}
                                    className="flex flex-col items-center gap-2 h-24"
                                    onClick={() => setTheme('dark')}
                                >
                                    <Moon className="h-6 w-6" />
                                    Dark
                                </Button>
                                <Button
                                    type="button"
                                    variant={theme === 'system' ? 'default' : 'outline'}
                                    className="flex flex-col items-center gap-2 h-24"
                                    onClick={() => setTheme('system')}
                                >
                                    <Laptop className="h-6 w-6" />
                                    System
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* NOTIFICATIONS TAB */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" /> Team Notifications
                            </CardTitle>
                            <CardDescription>Manage how you receive alerts about your team.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Weekly Reports</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get a summary of team performance every Monday.
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">At-Risk Alerts</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive emails when an employee's score drops significantly.
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Feedback Reminders</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Remind me to give performance feedback monthly.
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SECURITY TAB (EXTRA/CUSTOM) */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" /> Privacy & Security
                            </CardTitle>
                            <CardDescription>Extra security controls for manager accounts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4 border-warning/50 bg-warning/5">
                                <div className="space-y-0.5">
                                    <Label className="text-base text-warning">Two-Factor Authentication</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Require a security code when logging in from unknown devices.
                                    </p>
                                </div>
                                <Button variant="outline" size="sm">Enable 2FA</Button>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Mask Detailed Scores</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Hide raw employee scores in casual views to prevent shoulder-surfing.
                                    </p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
