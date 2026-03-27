import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface PerformanceEntry {
    date: string;
    score: number;
    metrics: any;
}

export default function EmployeeHistory() {
    const [history, setHistory] = useState<PerformanceEntry[]>([]);

    useEffect(() => {
        // Re-using dashboard endpoint for history since it sends recent history, 
        // or actually we need a full history endpoint. 
        // Employee routes currently don't expose full history explicitly separate from work-logs 
        // or dashboard trend.
        // Let's use /dashboard trend data or /work-log for now, 
        // BUT the plan said "EmployeeHistory.tsx - Visual timeline".
        // Let's assume we can add a GET /employee/history endpoint later or reuse /work-log to show detailed history.
        // Actually /work-log gives us raw data. Let's use that.
        // Wait, dashboard returns "trend" which is simplified.
        // Let's filter /work-log for this view.
        api.get("/employee/work-log").then(res => setHistory(res.data));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Performance History</h1>
                <p className="text-muted-foreground">A timeline of your work and performance.</p>
            </div>

            <div className="space-y-4">
                {history.map((entry, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">
                                    {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </CardTitle>
                                {/* Placeholder for score if we had it linked in work-log response */}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                                <div>
                                    <p className="text-muted-foreground">Assigned</p>
                                    <p className="font-medium">{(entry as any).tasks_assigned}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Completed</p>
                                    <p className="font-medium">{(entry as any).tasks_completed}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Hours</p>
                                    <p className="font-medium">{(entry as any).hours_worked}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Adherence</p>
                                    <Badge variant={(entry as any).deadline_adherence < 100 ? "destructive" : "default"}>
                                        {(entry as any).deadline_adherence}%
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
