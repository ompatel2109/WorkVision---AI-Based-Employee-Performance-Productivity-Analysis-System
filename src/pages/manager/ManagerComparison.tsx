import { useEffect, useState } from "react";
import { Check, Users, RefreshCw, BarChart4, TrendingUp, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    LineChart, Line
} from "recharts";
import { useToast } from "@/hooks/use-toast";

interface Employee { _id: string; name: string; department: string; status?: string; }
interface ComparisonData {
    id: string; name: string; avg_score: number; latest_score: number;
    metrics: { [key: string]: number };
    history: { date: string; score: number }[];
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function ManagerComparison() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        api.get("/manager/team").then((res) => setEmployees(res.data)).catch(console.error);
    }, []);

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id);
            if (prev.length >= 5) {
                toast({ title: "Limit Reached", description: "You can compare up to 5 employees at once.", variant: "default" });
                return prev;
            }
            return [...prev, id];
        });
    };

    const handleCompare = async () => {
        if (selectedIds.length === 0) return;
        setLoading(true);
        try {
            const res = await api.post("/manager/comparison", { employee_ids: selectedIds });
            setComparisonData(res.data);
            if (res.data.length === 0) {
                toast({ title: "No Data", description: "No performance data found for the selected employees.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Comparison failed", error);
            toast({ title: "Error", description: "Failed to load comparison data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const clearSelection = () => {
        setSelectedIds([]);
        setComparisonData([]);
    };

    // Filter employees for the picker
    const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

    // ── Transform Data for Charts ──────────────────────────────────────────
    
    // 1. Radar Chart (Skills/Metrics)
    // We want data shape: [{ metric: "Task Completion", "Om Patel": 85, "John Doe": 90 }, ...]
    const radarData: any[] = [];
    if (comparisonData.length > 0) {
        // Assume all employees have the same metric keys based on the first one
        const metricKeys = Object.keys(comparisonData[0].metrics || {});
        metricKeys.forEach(metricName => {
            const row: any = { metric: metricName };
            comparisonData.forEach(emp => {
                row[emp.name] = emp.metrics[metricName] || 0;
            });
            radarData.push(row);
        });
    }

    // 2. Trend Line Chart
    // We want to align history by date index (Last 10 entries)
    // Structure: [{ idx: "Latest", "Om": 80, "John": 85 }, { idx: "-1", "Om": 79... }]
    const trendData: any[] = [];
    if (comparisonData.length > 0) {
        // Find max history length
        const maxLen = Math.max(...comparisonData.map(e => e.history.length));
        for (let i = 0; i < maxLen; i++) {
            const row: any = { time: `T-${maxLen - 1 - i}` };
            if (i === maxLen - 1) row.time = "Latest";
            
            comparisonData.forEach(emp => {
                // history is sorted newest first (index 0 is latest)
                // We want oldest left to newest right, so we pull from the end
                const histIdx = emp.history.length - 1 - (maxLen - 1 - i);
                if (histIdx >= 0 && histIdx < emp.history.length) {
                    row[emp.name] = emp.history[histIdx].score;
                }
            });
            trendData.push(row);
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Performance Comparison</h1>
                <p className="text-muted-foreground mt-2">Select up to 5 team members to compare their metrics and trends side-by-side.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-12 items-start">
                {/* ── Left Side: Employee Selection ── */}
                <Card className="lg:col-span-4 border-muted/50 shadow-sm sticky top-6">
                    <CardHeader className="bg-muted/10 pb-4 border-b">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5 text-indigo-500" /> Choose Employees
                            </CardTitle>
                            <Badge variant="secondary" className={selectedIds.length === 5 ? "bg-red-500/10 text-red-500" : ""}>
                                {selectedIds.length} / 5
                            </Badge>
                        </div>
                        <div className="relative mt-3">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name..."
                                className="pl-9 bg-background"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[350px] overflow-y-auto p-2 space-y-1">
                            {filteredEmployees.length === 0 ? (
                                <p className="text-center text-sm tracking-tight text-muted-foreground p-4">No employees found.</p>
                            ) : (
                                filteredEmployees.map((emp) => {
                                    const isSelected = selectedIds.includes(emp._id);
                                    return (
                                        <button
                                            key={emp._id}
                                            onClick={() => toggleSelection(emp._id)}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-sm transition-all duration-200 ${
                                                isSelected
                                                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-medium border"
                                                    : "hover:bg-muted/50 border border-transparent text-foreground"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                                    isSelected ? "bg-indigo-500 text-white" : "bg-muted text-muted-foreground"
                                                }`}>
                                                    {emp.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{emp.name}</span>
                                                </div>
                                            </div>
                                            {isSelected && <Check className="h-4 w-4 text-indigo-500" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                        <div className="p-4 border-t bg-muted/10 flex gap-2">
                            <Button
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={handleCompare}
                                disabled={selectedIds.length === 0 || loading}
                            >
                                {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <BarChart4 className="mr-2 h-4 w-4" />}
                                Compare Analysis
                            </Button>
                            {selectedIds.length > 0 && (
                                <Button variant="ghost" onClick={clearSelection} className="px-3" title="Clear All">
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Right Side: Charts & Analysis ── */}
                <div className="lg:col-span-8 space-y-6">
                    {comparisonData.length === 0 && !loading ? (
                        <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground border-dashed border-2 bg-transparent shadow-none">
                            <BarChart4 className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium tracking-tight">No comparison generated</p>
                            <p className="text-sm">Select employees from the left panel and click Compare Analysis.</p>
                        </Card>
                    ) : (
                        <>
                            {/* Summary Bar Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {comparisonData.map((emp, i) => (
                                    <div key={emp.id} className="p-4 rounded-xl border bg-card shadow-sm flex flex-col gap-2 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <div className="flex justify-between items-start pl-2">
                                            <p className="font-bold text-sm truncate pr-2">{emp.name}</p>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-muted-foreground uppercase">Score</p>
                                                <p className="font-black text-xl" style={{ color: COLORS[i % COLORS.length] }}>{emp.latest_score}</p>
                                            </div>
                                        </div>
                                        <div className="pl-2 relative z-10">
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span>vs Avg ({emp.avg_score})</span>
                                                <span className={emp.latest_score >= emp.avg_score ? "text-green-500" : "text-red-500"}>
                                                    {emp.latest_score >= emp.avg_score ? "+" : ""}{(emp.latest_score - emp.avg_score).toFixed(1)}
                                                </span>
                                            </div>
                                            <Progress value={(emp.latest_score / 100) * 100} className="h-1.5" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Metric Comparison - Radar Chart */}
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Users className="h-4 w-4 text-indigo-500" /> Metric Breakdown
                                        </CardTitle>
                                        <CardDescription>Relative strengths across 4 key areas</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[280px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                                    <PolarGrid strokeOpacity={0.2} />
                                                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 11 }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', color: '#f3f4f6', border: 'none', borderRadius: 8 }} />
                                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                                    {comparisonData.map((emp, i) => (
                                                        <Radar
                                                            key={emp.id}
                                                            name={emp.name}
                                                            dataKey={emp.name}
                                                            stroke={COLORS[i % COLORS.length]}
                                                            fill={COLORS[i % COLORS.length]}
                                                            fillOpacity={0.2}
                                                            strokeWidth={2}
                                                        />
                                                    ))}
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Trend over time */}
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-emerald-500" /> Historical Trend
                                        </CardTitle>
                                        <CardDescription>Performance score trajectory</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[280px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={trendData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                                                    <YAxis domain={['auto', 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', color: '#f3f4f6', border: 'none', borderRadius: 8 }} />
                                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                                    {comparisonData.map((emp, i) => (
                                                        <Line
                                                            key={emp.id}
                                                            type="monotone"
                                                            dataKey={emp.name}
                                                            stroke={COLORS[i % COLORS.length]}
                                                            strokeWidth={2.5}
                                                            dot={{ r: 3, strokeWidth: 1.5 }}
                                                            activeDot={{ r: 5 }}
                                                        />
                                                    ))}
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Detailed Breakdown Bar */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Categorical Score Comparison</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={radarData} layout="vertical" margin={{ left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.15} />
                                                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} />
                                                <YAxis type="category" dataKey="metric" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: 8, border: 'none' }} />
                                                <Legend />
                                                {comparisonData.map((emp, i) => (
                                                    <Bar
                                                        key={emp.id}
                                                        dataKey={emp.name}
                                                        fill={COLORS[i % COLORS.length]}
                                                        barSize={12}
                                                        radius={[0, 4, 4, 0]}
                                                    />
                                                ))}
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
