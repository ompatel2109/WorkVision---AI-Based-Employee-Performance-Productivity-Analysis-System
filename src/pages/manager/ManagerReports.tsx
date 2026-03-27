import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function ManagerReports() {
    const { toast } = useToast();
    const [pdfLoading, setPdfLoading] = useState(false);

    const handleExportCsv = async () => {
        try {
            const response = await api.get('/manager/reports/export', {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `team_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast({ title: "CSV Exported", description: "Team report saved as CSV." });
        } catch (error) {
            console.error("Failed to export report", error);
            toast({ variant: "destructive", title: "Export Failed" });
        }
    };

    const handleExportPdf = async () => {
        setPdfLoading(true);
        try {
            toast({ title: "Generating PDF…", description: "Building your team performance report." });
            const response = await api.get('/manager/reports/team_pdf', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `workvision_team_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast({ title: "✅ PDF Downloaded", description: "Team performance report saved to your device." });
        } catch {
            toast({ variant: "destructive", title: "PDF Export Failed", description: "Could not generate the PDF. Please try again." });
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                <p className="text-muted-foreground">Generate analytics reports for your team.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Team Performance CSV */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team Performance Report</CardTitle>
                        <CardDescription>
                            Export a detailed CSV of latest scores, categories, and contact info for all team members.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleExportCsv} variant="outline" className="w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </CardContent>
                </Card>

                {/* Team Performance PDF */}
                <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-white" />
                            </div>
                            <CardTitle>Team Performance PDF</CardTitle>
                        </div>
                        <CardDescription>
                            Download a beautifully formatted PDF report with WorkVision branding — includes scores, categories, and department overview.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleExportPdf}
                            disabled={pdfLoading}
                            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700"
                        >
                            {pdfLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</>
                            ) : (
                                <><FileText className="mr-2 h-4 w-4" /> Download PDF Report</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

