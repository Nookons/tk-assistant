'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IdCardLanyard, Loader, Lock, LogIn, User, UserPen } from 'lucide-react';
import { useUserStore } from "@/store/user";
import UserLoginPreview from "@/components/shared/User/UserLoginPreview";
import { AuthService } from "@/services/authService";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

const CARD_ID_LENGTH = 8;

const LoginPage = () => {
    const router = useRouter();
    const { setCurrentUser } = useUserStore();

    const [cardId, setCardId] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const hash = window.location.hash;

        if (hash.includes('error=')) {
            const params = new URLSearchParams(hash.substring(1));
            const errorCode = params.get('error_code');
            window.history.replaceState(null, '', window.location.pathname);

            if (errorCode === 'otp_expired') {
                router.push('/invite-expired');
                return;
            }

            setErrorMessage(params.get('error_description')?.replace(/\+/g, ' ') ?? 'Something went wrong.');
            return;
        }

        if (hash.includes('type=invite')) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
                supabase.auth
                    .setSession({ access_token: accessToken, refresh_token: refreshToken })
                    .then(({ data, error }) => {
                        if (error) { router.push('/invite-expired'); return; }
                        if (data.session) {
                            window.history.replaceState(null, '', window.location.pathname);
                            router.push('/set-password');
                        }
                    });
            }
            return;
        }

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user && !hash.includes('type=recovery')) {
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

        onSuccess: async (result) => {
            const user = await AuthService.getCurrentUser()
            if (user) {
                setCurrentUser({ ...user, email: user.auth_email })
                if (user.must_change_password) {
                    window.location.href = '/change-password'  // ← вместо router.push
                    return
                }
                window.location.href = `/dashboard/${user.auth_id}` // ← вместо router.push
            }
        },
        onError: (error: Error) => setErrorMessage(error.message),
    });

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setCardId(value);
        setErrorMessage(null);
        if (value.length < CARD_ID_LENGTH) setPassword('');
    };

    const handleLogin = () => {
        if (cardId.length === CARD_ID_LENGTH && password.length >= 4) {
            loginMutation.mutate({ cardId, password });
        }
    };

    const isLoading = isSearching || loginMutation.isPending;

    return (
        <div className="fixed inset-0 flex items-center bg-background justify-center z-50">
            <div className="w-full max-w-md p-8 mx-4 rounded-2xl border">
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
                                <Link
                                    type="button"
                                    href={`/forgot-password`}
                                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                placeholder="••••••••"
                                maxLength={25}
                                className="text-lg font-mono tracking-wider"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                    )}

                    {errorMessage && <div className="text-sm text-red-500 font-medium">{errorMessage}</div>}
                    {error && <div className="text-sm text-red-500 font-medium">{error.message}</div>}

                    {userPreview && (
                        <div className={`grid grid-cols-[1fr_100px] gap-2 ${isLoading ? 'opacity-50' : ''}`}>
                            <Button disabled={loginMutation.isPending} onClick={handleLogin}>
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