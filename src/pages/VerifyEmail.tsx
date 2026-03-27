import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link.');
                return;
            }

            try {
                await api.post('/auth/verify-email', { token });
                setStatus('success');
            } catch (error: any) {
                setStatus('error');
                console.error("Verification Error:", error);
                const errorMsg = error.response?.data?.error
                    || error.message
                    || 'Verification failed. The link may have expired.';

                setMessage(errorMsg + (error.code === "ERR_NETWORK" ? " (Network Error: Is backend running? Firewall?)" : ""));
            }
        };

        verify();
    }, [searchParams]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        {status === 'loading' && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                        {status === 'success' && <CheckCircle2 className="h-8 w-8 text-green-500" />}
                        {status === 'error' && <XCircle className="h-8 w-8 text-destructive" />}
                    </div>
                    <CardTitle className="text-2xl">
                        {status === 'loading' && 'Verifying...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </CardTitle>
                    <CardDescription>
                        {message}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {status !== 'loading' && (
                            <Button
                                className="w-full"
                                onClick={() => navigate('/login')}
                            >
                                Go to Login
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
