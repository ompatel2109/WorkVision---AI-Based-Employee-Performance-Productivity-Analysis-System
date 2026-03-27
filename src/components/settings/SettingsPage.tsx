import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Application Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="notifications" className="flex flex-col space-y-1">
                        <span>Email Notifications</span>
                        <span className="font-normal text-xs text-muted-foreground">Receive weekly performance reports</span>
                    </Label>
                    <Switch id="notifications" />
                </div>
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                        <span>Dark Mode</span>
                        <span className="font-normal text-xs text-muted-foreground">Enable dark theme for the dashboard</span>
                    </Label>
                    <Switch id="dark-mode" />
                </div>
            </CardContent>
        </Card>
    );
}
