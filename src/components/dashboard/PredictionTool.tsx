import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PredictionTool() {
    const [inputs, setInputs] = useState({
        projects_completed: 10,
        hours_worked: 160,
        bugs_fixed: 5,
        training_hours: 10,
        peer_review_score: 4.0,
        client_feedback_score: 4.0,
        department: "Engineering",
        role: "Mid-Level"
    });
    const [prediction, setPrediction] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs({ ...inputs, [e.target.id]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value });
    };

    const handlePredict = async () => {
        setIsLoading(true);
        try {
            const res = await api.post("/predict", inputs);
            setPrediction(res.data.predicted_score);
            toast.success("Prediction calculated successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to get prediction");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>AI Productivity Predictor</CardTitle>
                    <CardDescription>Enter metrics to predict performance score</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="projects_completed">Projects Completed</Label>
                            <Input id="projects_completed" type="number" value={inputs.projects_completed} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hours_worked">Hours Worked</Label>
                            <Input id="hours_worked" type="number" value={inputs.hours_worked} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bugs_fixed">Bugs Fixed</Label>
                            <Input id="bugs_fixed" type="number" value={inputs.bugs_fixed} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="training_hours">Training Hours</Label>
                            <Input id="training_hours" type="number" value={inputs.training_hours} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="peer_review_score">Peer Review (1-5)</Label>
                            <Input id="peer_review_score" type="number" step="0.1" value={inputs.peer_review_score} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="client_feedback_score">Client Feedback (1-5)</Label>
                            <Input id="client_feedback_score" type="number" step="0.1" value={inputs.client_feedback_score} onChange={handleChange} />
                        </div>
                    </div>
                    <Button className="w-full mt-4" onClick={handlePredict} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Predict Score
                    </Button>
                </CardContent>
            </Card>

            <Card className="flex items-center justify-center bg-muted/50">
                <CardContent className="text-center">
                    {prediction !== null ? (
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-muted-foreground">Predicted Score</h3>
                            <div className="text-6xl font-bold text-primary">{prediction.toFixed(1)}</div>
                            <p className="text-sm text-muted-foreground">/ 100</p>
                        </div>
                    ) : (
                        <div className="text-muted-foreground">
                            Run a prediction to see the result
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
