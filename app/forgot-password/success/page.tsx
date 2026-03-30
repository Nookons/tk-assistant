'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CircleCheck } from 'lucide-react';

const ForgotPasswordSuccessPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') ?? '';

    return (
        <div className="fixed inset-0 flex items-center bg-background justify-center z-50">
            <div className="w-full max-w-md p-8 mx-4 rounded-2xl border text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                    <CircleCheck className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Check your email</h1>
                <p className="text-sm text-muted-foreground mb-6">
                    We sent a password reset link to{' '}
                    <span className="font-medium text-foreground">{email}</span>.
                    It may take a few minutes to arrive.
                </p>
                <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                </Button>
            </div>
        </div>
    );
};

export default ForgotPasswordSuccessPage;