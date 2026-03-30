'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, KeyRound, Loader, Mail } from 'lucide-react';
import { AuthService } from '@/services/authService';

const ForgotPasswordPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const resetMutation = useMutation({
        mutationFn: (email: string) => AuthService.requestPasswordReset(email),
        onSuccess: () => router.push('/forgot-password/success?email=' + encodeURIComponent(email)),
        onError: (error: Error) => setErrorMessage(error.message),
    });

    return (
        <div className="fixed inset-0 flex items-center bg-background justify-center z-50">
            <div className="w-full max-w-md p-8 mx-4 rounded-2xl border">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                        <KeyRound className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter the email address linked to your account and we'll send you a reset link.
                    </p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Mail className="w-4 h-4" />
                            Email address
                        </label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setErrorMessage(null); }}
                            onKeyPress={(e) => e.key === 'Enter' && email.trim() && resetMutation.mutate(email.trim())}
                            placeholder="you@example.com"
                            disabled={resetMutation.isPending}
                            autoFocus
                        />
                    </div>

                    {errorMessage && <div className="text-sm text-red-500 font-medium">{errorMessage}</div>}

                    <div className="grid grid-cols-[1fr_100px] gap-2">
                        <Button
                            onClick={() => email.trim() && resetMutation.mutate(email.trim())}
                            disabled={!email.trim() || resetMutation.isPending}
                        >
                            {resetMutation.isPending ? <Loader className="animate-spin" /> : 'Send reset link'}
                        </Button>
                        <Button onClick={() => router.push('/login')} variant="ghost">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;