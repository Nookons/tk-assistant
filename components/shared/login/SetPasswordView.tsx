import React, {useState} from 'react';
import {Eye, EyeOff, IdCardLanyard, InfoIcon, KeyRound, Loader, Lock, User} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useMutation} from "@tanstack/react-query";
import {supabase} from "@/lib/supabaseClient";
import {AuthService} from "@/services/authService";
import {useUserStore} from "@/store/user";
import {useRouter} from "next/navigation";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {IUser} from "@/types/user/user";

type SetPasswordPayload = {
    password: string;
    card_id: string;
    firstName: string;
    lastName: string;
};

const SetPasswordView = () => {
    const router = useRouter();
    const { setCurrentUser } = useUserStore();

    const [card_id_value, setCard_id_value] = useState<string>('')
    const [newPassword, setNewPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isShow, setIsShow] = useState<boolean>(false);

    const setPasswordMutation = useMutation<IUser | null, Error, SetPasswordPayload>({
        mutationFn: ({ password, card_id, firstName, lastName }) =>
            AuthService.createUser(card_id, password, firstName, lastName),
        onSuccess: async () => {
            setErrorMessage(null);
            const user = await AuthService.getCurrentUser();
            if (user) {
                setCurrentUser({ ...user, email: user.auth_email });
                router.push(`/dashboard/${user.auth_id}`);
            }
        },
        onError: (error) => {
            setErrorMessage(error.message);
        },
    });

    const isValid =
        newPassword.length >= 6 &&
        firstName.trim().length > 0 &&
        lastName.trim().length > 0;

    const handleSubmit = () => {
        if (isValid) {
            setPasswordMutation.mutate({
                password: newPassword,
                card_id: card_id_value,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            });
        }
    };

    return (
        <div className="fixed inset-0 flex items-center bg-background justify-center z-50">
            <div className="w-full max-w-md p-8 mx-4 rounded-2xl border">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                        <KeyRound className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Create your account</h1>
                    <p className="text-sm text-muted-foreground">
                        Welcome! Fill in your details to secure your account.
                    </p>
                </div>

                <div className="space-y-5">
                    {/* First name + Last name */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                <User className="w-4 h-4" />
                                First name
                            </label>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="John"
                                disabled={setPasswordMutation.isPending}
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                <User className="w-4 h-4" />
                                Last name
                            </label>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                                disabled={setPasswordMutation.isPending}
                            />
                        </div>
                    </div>

                    {/* Card ID */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <IdCardLanyard className="w-4 h-4" />
                            SHEIN CARD ID
                        </label>
                        <InputGroup>
                            <InputGroupInput
                                value={card_id_value}
                                onChange={(e) => setCard_id_value(e.target.value)}
                                placeholder="60072001"
                            />
                            <InputGroupAddon align="inline-end" className="pl-2">
                                <HoverCard openDelay={10} closeDelay={100}>
                                    <HoverCardTrigger asChild>
                                        <InfoIcon className="cursor-pointer" />
                                    </HoverCardTrigger>
                                    <HoverCardContent className="flex w-64 flex-col gap-0.5">
                                        <p className="text-xs">
                                            This is the card that was purchased from Shein. We only use
                                            your card number for internal purposes and do not share this
                                            or any other information with other companies.
                                        </p>
                                    </HoverCardContent>
                                </HoverCard>
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Lock className="w-4 h-4" />
                            New password
                        </label>
                        <InputGroup>
                            <InputGroupInput
                                type={isShow ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setErrorMessage(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSubmit();
                                }}
                                placeholder="••••••••"
                                className="text-lg font-mono tracking-wider"
                                disabled={setPasswordMutation.isPending}
                            />
                            <InputGroupAddon align="inline-end">
                                {isShow
                                    ? <EyeOff className="cursor-pointer" onClick={() => setIsShow(false)} />
                                    : <Eye className="cursor-pointer" onClick={() => setIsShow(true)} />
                                }
                            </InputGroupAddon>
                        </InputGroup>
                        <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
                    </div>

                    {errorMessage && (
                        <div className="text-sm text-red-500 font-medium">{errorMessage}</div>
                    )}

                    <Button
                        className="w-full"
                        disabled={!isValid || setPasswordMutation.isPending}
                        onClick={handleSubmit}
                    >
                        {setPasswordMutation.isPending ? (
                            <Loader className="animate-spin" />
                        ) : (
                            'Save & continue'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SetPasswordView;