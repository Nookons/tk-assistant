import React, {useState} from 'react';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {PencilOff, Save} from "lucide-react";
import {useMutation} from "@tanstack/react-query";
import {AuthService} from "@/services/authService";
import {toast} from "sonner";

interface props {
    setIsEmailChange: (e: boolean) => void;
}

const UserEmailResetForm: React.FC<props> = ({setIsEmailChange}) => {
    const [email_value, setEmail_value] = useState<string>('')

    const handleSubmit = useMutation({
        mutationFn: (email: string) => AuthService.updateEmail(email),
        onSuccess: () => {
            setIsEmailChange(false)
            toast.success("Email changed successfully!")
            toast.warning("Please approve you new email by checking your inbox. It may take a few minutes to arrive.")
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    return (
        <div className={`flex items-center gap-2 mt-2`}>
            <Input
                value={email_value}
                onChange={(e) => setEmail_value(e.target.value)}
                type="email"
                placeholder="New Email"
            />
            <Button
                onClick={() => handleSubmit.mutate(email_value)}
            >
                <Save />
            </Button>

            <Button
                variant="secondary"
                onClick={() => setIsEmailChange(false)}
            >
                <PencilOff/>
            </Button>
        </div>
    );
};

export default UserEmailResetForm;