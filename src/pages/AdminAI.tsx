import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Metrics {
    accuracy: number;
    mae: number;
    rmse: number;
    last_trained: string;
}

export default function AdminAI() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [training, setTraining] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const res = await api.get('/admin/ai/metrics');
            setMetrics(res.data);
        } catch (error) {
            console.error("Failed to fetch metrics", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTrain = async () => {
        setTraining(true);
        setProgress(10);

        // Simulate progress for UX
        const interval = setInterval(() => {
            setProgress(old => {
                if (old >= 90) return 90;
                return old + 10;
            });
        }, 500);

        try {
            await api.post('/admin/ai/train');
            setProgress(100);
            setTimeout(() => {
                clearInterval(interval);
                setTraining(false);
                fetchMetrics(); // Refresh stats
                setProgress(0);
            }, 1000);
        } catch (error) {
            console.error("Training failed", error);
            clearInterval(interval);
            setTraining(false);
            setProgress(0);
        }
    };

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-foreground">AI Model Management</h1>
                <p className="mt-2 text-muted-foreground">
                    Train, evaluate, and deploy prediction models.
                </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ActivityIcon className="h-5 w-5 text-primary" />
                            Current Performance
                        </CardTitle>
                        <CardDescription>Evaluation metrics on the current test set.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div>Loading metrics...</div>
                        ) : metrics ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Model Accuracy</span>
                                    <span className="text-2xl font-bold text-success">{(metrics.accuracy * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Mean Absolute Error (MAE)</span>
                                    <span className="text-xl font-mono">{metrics.mae}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Root Mean Sq Error (RMSE)</span>
                                    <span className="text-xl font-mono">{metrics.rmse}</span>
                                </div>
                                <div className="pt-4 border-t border-border">
                                    <p className="text-xs text-muted-foreground">
                                        Last Trained: {new Date(metrics.last_trained).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div>No model found.</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-purple-500" />
                            Model Actions
                        </CardTitle>
                        <CardDescription>Trigger retraining on the latest dataset.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                            <p className="mb-2"><AlertCircle className="inline h-4 w-4 mr-1 text-warning" /> Note:</p>
                            Training may take several minutes depending on dataset size. The system will use all available performance records.
                        </div>

                        {training && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span>Training in progress...</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        )}

                        <Button
                            className="w-full"
                            onClick={handleTrain}
                            disabled={training || loading}
                        >
                            {training ? (
                                "Training..."
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" /> Retrain Model
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ActivityIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
