'use client'

import React, { useState } from 'react';
import { PasswordInput } from "@/components/ui/passwordInput";
import { Button } from "@/components/ui/button";
import {toast} from "sonner";

const PasswordReset = ({card_id} : {card_id: string}) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [checkPassword, setCheckPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const passwordReset = async () => {
        if (!oldPassword || !newPassword || !checkPassword) {
            toast('Please fill all fields');
            return;
        }

        if (newPassword !== checkPassword) {
            toast('New password and confirmation do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ card_id, oldPassword, newPassword }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.message || 'Failed to reset password');
            }

            toast.success('Password has been reset successfully');
            setOldPassword('');
            setNewPassword('');
            setCheckPassword('');
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm flex flex-col items-center justify-center gap-4">
            <PasswordInput
                placeholder="Old Password"
                value={oldPassword}
                onChange={setOldPassword}
            />
            <PasswordInput
                placeholder="New Password"
                value={newPassword}
                onChange={setNewPassword}
            />
            <PasswordInput
                placeholder="Confirm New Password"
                value={checkPassword}
                onChange={setCheckPassword}
            />
            <Button className="w-full" onClick={passwordReset} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
        </div>
    );
};

export default PasswordReset;
