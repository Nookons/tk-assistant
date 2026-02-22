'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IdCardLanyard, Loader, Lock, LogIn, User, UserPen, KeyRound, Mail, ArrowLeft, CircleCheck } from 'lucide-react';
import { useUserStore } from "@/store/user";
import UserLoginPreview from "@/components/shared/User/UserLoginPreview";
import { AuthService } from "@/services/authService";
import {supabase} from "@/lib/supabaseClient";

const CARD_ID_LENGTH = 8;

type View = 'login' | 'forgot-password' | 'forgot-password-success';

const LoginPage = () => {
    const router = useRouter();
    const { setCurrentUser } = useUserStore();

    const [view, setView] = useState<View>('login');
    const [cardId, setCardId] = useState('');
    const [password, setPassword] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user && !window.location.hash.includes('type=recovery')) {
                const user = await AuthService.getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                    router.push(`/dashboard/${user.auth_id}`);
                }
            }
        };
        checkSession();
    }, [router, setCurrentUser]);

    const { data: userPreview, isLoading: isSearching, error } = useQuery({
        queryKey: ['user-preview', cardId],
        queryFn: () => AuthService.getUserByCardId(cardId),
        enabled: cardId.length === CARD_ID_LENGTH,
        retry: false,
    });

    const loginMutation = useMutation({
        mutationFn: ({ cardId, password }: { cardId: string; password: string }) =>
            AuthService.loginWithCard(cardId, password),
        onSuccess: async () => {
            setErrorMessage(null);
            const user = await AuthService.getCurrentUser();
            if (user) {
                setCurrentUser({ ...user, email: user.auth_email });
                router.push(`/dashboard/${user.auth_id}`);
            }
        },
        onError: (error: Error) => {
            setErrorMessage(error.message);
        },
    });

    const resetMutation = useMutation({
        mutationFn: (email: string) => AuthService.requestPasswordReset(email),
        onSuccess: () => {
            setErrorMessage(null);
            setView('forgot-password-success');
        },
        onError: (error: Error) => {
            setErrorMessage(error.message);
        },
    });

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setCardId(value);
        setErrorMessage(null);
        if (value.length < CARD_ID_LENGTH) setPassword('');
    };

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setErrorMessage(null);
    };

    const handleLogin = () => {
        if (cardId.length === CARD_ID_LENGTH && password.length >= 4) {
            loginMutation.mutate({ cardId, password });
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleLogin();
    };

    const handleResetRequest = () => {
        if (resetEmail.trim()) {
            resetMutation.mutate(resetEmail.trim());
        }
    };

    const handleResetKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleResetRequest();
    };

    const handleBackToLogin = () => {
        setView('login');
        setResetEmail('');
        setErrorMessage(null);
    };

    const isLoading = isSearching || loginMutation.isPending;

    // ── Forgot Password Form ─────────────────────────────────────────────────
    if (view === 'forgot-password') {
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
                                value={resetEmail}
                                onChange={(e) => {
                                    setResetEmail(e.target.value);
                                    setErrorMessage(null);
                                }}
                                onKeyPress={handleResetKeyPress}
                                placeholder="you@example.com"
                                className="text-base"
                                disabled={resetMutation.isPending}
                                autoFocus
                            />
                        </div>

                        {errorMessage && (
                            <div className="text-sm text-red-500 font-medium">{errorMessage}</div>
                        )}

                        <div className="grid grid-cols-[1fr_100px] gap-2">
                            <Button
                                onClick={handleResetRequest}
                                disabled={!resetEmail.trim() || resetMutation.isPending}
                                variant="default"
                            >
                                {resetMutation.isPending ? (
                                    <Loader className="animate-spin" />
                                ) : (
                                    'Send reset link'
                                )}
                            </Button>
                            <Button onClick={handleBackToLogin} variant="ghost">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Success Screen ───────────────────────────────────────────────────────
    if (view === 'forgot-password-success') {
        return (
            <div className="fixed inset-0 flex items-center bg-background justify-center z-50">
                <div className="w-full max-w-md p-8 mx-4 rounded-2xl border text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                        <CircleCheck className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Check your email</h1>
                    <p className="text-sm text-muted-foreground mb-6">
                        We sent a password reset link to{' '}
                        <span className="font-medium text-foreground">{resetEmail}</span>.
                        It may take a few minutes to arrive.
                    </p>
                    <Button onClick={handleBackToLogin} variant="outline" className="w-full">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to login
                    </Button>
                </div>
            </div>
        );
    }

    // ── Main Login Form ──────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 flex items-center bg-background justify-center z-50">
            <div className="w-full max-w-md p-8 mx-4 rounded-2xl border">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                        <User className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">TK Service Login</h1>
                    <p className="text-sm text-muted-foreground">Enter your Card ID to continue</p>
                </div>

                <div className="mb-4">
                    <UserLoginPreview user={userPreview} />
                </div>

                <div className="space-y-5">
                    {!userPreview && (
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                <IdCardLanyard className="w-4 h-4" />
                                Card ID
                            </label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                value={cardId}
                                onChange={handleCardChange}
                                placeholder="60072001"
                                maxLength={CARD_ID_LENGTH}
                                className="text-lg font-mono tracking-wider"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                    )}

                    {userPreview && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <Lock className="w-4 h-4" />
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setView('forgot-password');
                                        setErrorMessage(null);
                                    }}
                                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <Input
                                type="password"
                                value={password}
                                onChange={handlePinChange}
                                onKeyPress={handleKeyPress}
                                placeholder="••••••••"
                                maxLength={25}
                                className="text-lg font-mono tracking-wider"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                    )}

                    {errorMessage && (
                        <div className="text-sm text-red-500 font-medium">{errorMessage}</div>
                    )}

                    {error && (
                        <div className="text-sm text-red-500 font-medium">{error.message}</div>
                    )}

                    {userPreview && (
                        <div className={`grid grid-cols-[1fr_100px] gap-2 ${isLoading ? 'opacity-50' : ''}`}>
                            <Button
                                disabled={loginMutation.isPending}
                                onClick={handleLogin}
                                variant="default"
                            >
                                {loginMutation.isPending ? <Loader className="animate-spin" /> : <LogIn />}
                            </Button>
                            <Button onClick={() => setCardId('')} variant="ghost">
                                <UserPen />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;