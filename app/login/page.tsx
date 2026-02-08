'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {IdCardLanyard, Loader, Lock, LogIn, User, UserPen} from 'lucide-react';
import {useUserStore} from "@/store/user";
import UserLoginPreview from "@/components/shared/User/UserLoginPreview";
import {AuthService} from "@/services/authService";

const CARD_ID_LENGTH = 8;

const LoginPage = () => {
    const router = useRouter();
    const { setCurrentUser } = useUserStore();

    const [cardId, setCardId] = useState('');
    const [password, setPassword] = useState('');

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const hasSession = await AuthService.hasSession();
            if (hasSession) {
                const user = await AuthService.getCurrentUser();

                if (user) {
                     setCurrentUser(user);
                     router.push(`/dashboard/${user.auth_id}`);
                 }
            }
        };
        checkSession();
    }, [router, setCurrentUser]);

    const { data: userPreview, isLoading: isSearching, error} = useQuery({
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
                setCurrentUser({
                    ...user,
                    email: user.auth_email,
                });
                router.push(`/dashboard/${user.auth_id}`);
            }
        },

        onError: (error: Error) => {
            setErrorMessage(error.message);
        },
    });


    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setCardId(value);
        setErrorMessage(null);

        if (value.length < CARD_ID_LENGTH) {
            setPassword('');
        }
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
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    const isLoading = isSearching || loginMutation.isPending;

    return (
        <div className="fixed inset-0 flex items-center bg-background justify-center z-50">
            <div className="w-full max-w-md p-8 mx-4 rounded-2xl border">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full  mb-4">
                        <User className="w-8 h-8 " />
                    </div>
                    <h1 className="text-2xl font-bold  mb-2">
                        TK Service Login
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your Card ID to continue
                    </p>
                </div>

                <div className={`mb-4`}>
                    <UserLoginPreview user={userPreview} />
                </div>

                <div className="space-y-5">
                    {!userPreview && (
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium  mb-2">
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
                            <label className="flex items-center gap-2 text-sm font-medium  mb-2">
                                <Lock className="w-4 h-4" />
                                Password
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={handlePinChange}
                                onKeyPress={handleKeyPress}
                                placeholder="••••••••"
                                maxLength={25}
                                className="text-lg font-mono tracking-wider"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    {errorMessage && (
                        <div className="text-sm text-red-500 font-medium">
                            {errorMessage}
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-red-500 font-medium">
                            {error.message}
                        </div>
                    )}

                    {userPreview && (
                        <div className={`grid grid-cols-[1fr_100px] gap-2 ${isLoading ? 'opacity-50' : ''}`}>
                            <Button
                                disabled={loginMutation.isPending}
                                onClick={handleLogin}
                                variant={`default`}
                            >
                                {loginMutation.isPending ? <Loader className={`animate-spin`} /> : <LogIn />}
                            </Button>
                            <Button
                                onClick={() => setCardId('')}
                                variant={`ghost`
                            }>
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