'use client';
import React, { useState } from 'react';
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Input } from "@/components/ui/input";
import {LogIn, Phone, Lock, User, AlertCircle, IdCardLanyard} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/passwordInput";
import PasswordReset from "@/components/shared/login/PasswordReset";
import { useUserStore } from "@/store/user";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

interface UserData {
    user_name: string;
    warehouse: string;
    [key: string]: any;
}

const Page = () => {
    const [card_id, setCard_id] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [isPasswordReset, setIsPasswordReset] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const router = useRouter();

    // Fetch user by phone
    const fetchUserByPhone = async (phone: string) => {
        try {
            setLoading(true);
            setError('');

            const res = await fetch(`/api/user/get-user-by-phone?phone=${phone}`);
            let data;
            if (res.ok) {
                data = await res.json();
            } else {
                data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'User not found');
            }

            setUserData(data);
            setError('');
        } catch (err: any) {
            setUserData(null);
            setError(err.message || 'User not found');
            toast.error(err.message || 'User not found');
        } finally {
            setLoading(false);
        }
    };

    // Handle phone number change
    const handlePhoneChange = (value: string) => {
        setCard_id(value);
        setPassword('');
        setError('');
        setUserData(null);

        if (/^\d{8}$/.test(value)) {
            fetchUserByPhone(value);
        }
    };

    // Login handler
    const handleLogin = async () => {
        if (!password) {
            toast.error('Please enter your password');
            return;
        }

        try {
            setLoginLoading(true);
            setError('');

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    card_id: card_id.replace(/\D/g, ''),
                    password: password,
                }),
            });

            let data;

            if (res.ok) {
                data = await res.json();

                toast.success('Login successful!');

                localStorage.setItem(
                    'user',
                    JSON.stringify({
                        ...data,
                        loginTime: dayjs().valueOf(),
                    })
                );

                window.dispatchEvent(new Event("authChange"));
                router.push(`/dashboard/${data.user.card_id}`);
            } else {
                data = await res.json().catch(() => ({}));
                const errorMessage = data.error || 'Login failed';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (err) {
            const errorMessage = 'Network error. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoginLoading(false);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && userData && password && !loginLoading) {
            handleLogin();
        }
    };

    // Toggle password reset mode
    const togglePasswordReset = () => {
        setIsPasswordReset(!isPasswordReset);
        setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="rounded-2xl shadow-xl border p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 shadow-lg">
                            <User className="w-8 h-8 " />
                        </div>
                        <h1 className="text-2xl font-bold mb-1">
                            TK Service Login
                        </h1>
                        <p className="text-sm">
                            Enter your ID Card number to continue
                        </p>
                    </div>

                    {/* User Info Card */}
                    {userData && !loading && (
                        <div className="rounded-lg p-0 mb-4">
                            <Item className="w-full p-0 border-none bg-transparent">
                                <ItemContent>
                                    <ItemTitle className="text-lg">
                                        {userData.user_name}
                                    </ItemTitle>
                                    <ItemDescription className="font-medium">
                                        {userData.warehouse}
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Phone Number Input */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold">
                                <IdCardLanyard className="w-4 h-4" />
                                CARD ID
                            </label>
                            <Input
                                value={card_id}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                placeholder="XXXXXXXX"
                                maxLength={8}
                                className="text-lg tracking-wider font-mono"
                                disabled={loading || loginLoading}
                            />
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center gap-2 py-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2"></div>
                                <span className="text-sm font-medium">Searching user...</span>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && !loading && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Password Section */}
                        {userData && !loading && (
                            <>
                                {!isPasswordReset ? (
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-semibold">
                                            <Lock className="w-4 h-4" />
                                            Password
                                        </label>
                                        <div className="flex gap-2" onKeyDown={handleKeyPress}>
                                            <PasswordInput
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={setPassword}
                                            />
                                            <Button
                                                onClick={handleLogin}
                                                disabled={loginLoading || !password}
                                                className="shadow-lg hover:shadow-xl transition-all duration-200"
                                            >
                                                {loginLoading ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                ) : (
                                                    <LogIn className="w-5 h-5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl">
                                        <PasswordReset card_id={card_id} />
                                    </div>
                                )}

                                {/* Toggle Password Reset */}
                                <div className="text-center pt-2">
                                    <span className="text-sm">
                                        {isPasswordReset ? 'Remember your password?' : 'Forgot password?'}{' '}
                                    </span>
                                    <Button
                                        variant="link"
                                        onClick={togglePasswordReset}
                                        className="font-semibold p-0 h-auto"
                                    >
                                        {isPasswordReset ? 'Sign In' : 'Reset Password'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-500 mt-6">
                    🔒 Protected by industry-standard security
                </p>
            </div>
        </div>
    );
};

export default Page;
