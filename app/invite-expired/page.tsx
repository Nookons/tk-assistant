'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, KeyRound } from 'lucide-react';

const InviteExpiredPage = () => {
    const router = useRouter();

    return (
        <div className="fixed inset-0 flex items-center bg-background justify-center z-50">
            <div className="w-full max-w-md p-8 mx-4 rounded-2xl border text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                    <KeyRound className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Link expired</h1>
                <p className="text-sm text-muted-foreground mb-6">
                    This invite link has already been used or has expired.
                    Contact your administrator to get a new one.
                </p>
                <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                </Button>
            </div>
        </div>
    );
};

export default InviteExpiredPage;