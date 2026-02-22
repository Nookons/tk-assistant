'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader, Lock, CircleCheck, CircleX } from 'lucide-react';

type View = 'loading' | 'form' | 'success' | 'error';

const ResetPasswordPage = () => {
    const router = useRouter();

    const [view, setView] = useState<View>('loading');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('auth event:', event, session);

            if (event === 'PASSWORD_RECOVERY' && session) {
                setView('form');
                return;
            }

            if (event === 'SIGNED_IN' && session) {
                try {
                    const payload = JSON.parse(atob(session.access_token.split('.')[1]));
                    const isRecovery = payload?.amr?.some((a: any) => a.method === 'recovery');
                    if (isRecovery) {
                        setView('form');
                        return;
                    }
                } catch (e) {
                    console.error('Failed to decode token', e);
                }
            }
        });

        const timer = setTimeout(() => {
            setView((prev) => prev === 'loading' ? 'error' : prev);
        }, 5000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const handleSubmit = async () => {
        setErrorMessage(null);

        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        setIsSubmitting(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setErrorMessage(error.message);
            setIsSubmitting(false);
            return;
        }

        await supabase.auth.signOut();
        setView('success');
        setIsSubmitting(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (view === 'loading') {
        return (
            <div className="fixed inset-0 flex items-center bg-background justify-center z-50">
                <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // ── Invalid / expired link ───────────────────────────────────────────────
    if (view === 'error') {
        return (
            <div className="fixed inset-0 flex items-center bg-background justify-center z-50">
                <div className="w-full max-w-md p-8 mx-4 rounded-2xl border text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                        <CircleX className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Link expired</h1>
                    <p className="text-sm text-muted-foreground mb-6">
                        This reset link is invalid or has already been used. Please request a new one.
                    </p>
                    <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
                        Back to login
                    </Button>
                </div>
            </div>
        );
    }

    // ── Success ──────────────────────────────────────────────────────────────
    if (view === 'success') {
        return (
            <div className="fixed inset-0 flex items-center bg-background justify-center z-50">
                <div className="w-full max-w-md p-8 mx-4 rounded-2xl border text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                        <CircleCheck className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Password updated</h1>
                    <p className="text-sm text-muted-foreground mb-6">
                        Your password has been changed successfully. You can now log in with your new password.
                    </p>
                    <Button onClick={() => router.push('/login')} className="w-full">
                        Go to login
                    </Button>
                </div>
            </div>
        );
    }

    // ── Form ─────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 flex items-center bg-background justify-center z-50">
            <div className="w-full max-w-md p-8 mx-4 rounded-2xl border">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Set new password</h1>
                    <p className="text-sm text-muted-foreground">
                        Choose a strong password for your account.
                    </p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Lock className="w-4 h-4" />
                            New password
                        </label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }}
                            onKeyPress={handleKeyPress}
                            placeholder="••••••••"
                            maxLength={25}
                            className="text-lg font-mono tracking-wider"
                            disabled={isSubmitting}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Lock className="w-4 h-4" />
                            Confirm password
                        </label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setErrorMessage(null); }}
                            onKeyPress={handleKeyPress}
                            placeholder="••••••••"
                            maxLength={25}
                            className="text-lg font-mono tracking-wider"
                            disabled={isSubmitting}
                        />
                    </div>

                    {errorMessage && (
                        <div className="text-sm text-red-500 font-medium">{errorMessage}</div>
                    )}

                    <Button
                        onClick={handleSubmit}
                        disabled={!password || !confirmPassword || isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? <Loader className="animate-spin" /> : 'Update password'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;