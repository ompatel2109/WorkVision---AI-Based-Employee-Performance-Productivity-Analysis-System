import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCcw, Database, Shield, User, Moon, Sun, Laptop } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
    const { user, updateUser } = useAuth();
    const { setTheme, theme } = useTheme();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [seeding, setSeeding] = useState(false);

    // Profile Form State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const handleSeedData = async () => {
        if (!confirm("This will populate the database with sample data. Continue?")) return;
        setSeeding(true);
        try {
            await api.post('/admin/seed');
            toast({ title: "System Seeded", description: "Sample data generated successfully." });
        } catch (error) {
            console.error("Seeding failed", error);
            toast({ title: "Error", description: "Failed to seed data.", variant: "destructive" });
        } finally {
            setSeeding(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) {
            toast({ title: "Error", description: "User ID missing. Please refresh.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            await api.put(`/admin/users/${user?.id}`, {
                name,
                // email: email, // Email updates often require re-verification, skipping for now or handle carefully
                password: password ? password : undefined
            });

            // Update local context
            if (user) {
                updateUser({ ...user, name });
            }

            toast({ title: "Profile Updated", description: "Your profile details have been saved." });
            setPassword('');
        } catch (error) {
            toast({ title: "Update Failed", description: "Could not update profile.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage your profile, system preferences, and data.
                </p>
            </motion.div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="general">System</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                </TabsList>

                {/* PROFILE TAB */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Admin Profile</CardTitle>
                            <CardDescription>Update your personal account details.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleUpdateProfile}>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value={email} disabled className="bg-muted text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Leave empty to keep current"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of the dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <Button
                                    variant={theme === 'light' ? 'default' : 'outline'}
                                    className="flex flex-col items-center gap-2 h-24"
                                    onClick={() => setTheme('light')}
                                >
                                    <Sun className="h-6 w-6" />
                                    Light
                                </Button>
                                <Button
                                    variant={theme === 'dark' ? 'default' : 'outline'}
                                    className="flex flex-col items-center gap-2 h-24"
                                    onClick={() => setTheme('dark')}
                                >
                                    <Moon className="h-6 w-6" />
                                    Dark
                                </Button>
                                <Button
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

                {/* GENERAL TAB */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Configuration</CardTitle>
                            <CardDescription>Manage global application settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Same as before */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Maintenance Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Disable access for non-admin users.
                                    </p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* DATA TAB */}
                <TabsContent value="data">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Data Management</CardTitle>
                            <CardDescription>Tools for data hygiene and initialization.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border border-warning/50 bg-warning/10 p-4">
                                <h4 className="font-semibold text-warning mb-2">Demo Data Generator</h4>
                                <Button
                                    variant="outline"
                                    onClick={handleSeedData}
                                    disabled={seeding}
                                >
                                    {seeding ? "Generating..." : <><RefreshCcw className="mr-2 h-4 w-4" /> Generate Sample Data</>}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
