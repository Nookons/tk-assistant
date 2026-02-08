'use client'

import React, {useState} from 'react'
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {useUserStore} from "@/store/user"
import {Progress} from "@/components/ui/progress"
import {
    Contact,
    HardHat,
    IdCardLanyard,
    Warehouse,
    Rocket, Pencil
} from "lucide-react"
import {Button} from "@/components/ui/button"
import UserPasswordResetForm from "@/components/shared/User/UserPasswordResetForm";
import UserEmailResetForm from "@/components/shared/User/UserEmailResetForm";
import UserPhotoChange from "@/components/shared/User/UserPhotoChange";

const Page = () => {
    const user = useUserStore(state => state.currentUser)

    const [isPasswordChange, setIsPasswordChange] = useState<boolean>(false);
    const [isEmailChange, setIsEmailChange] = useState<boolean>(false);

    if (!user) return null

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
            {/* HEADER */}
            <div
                className="flex flex-col flex-wrap md:flex-row md:items-center justify-between gap-4 border rounded-2xl p-4 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <UserPhotoChange />

                    <div>
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Contact className="w-4 h-4"/>
                            {user.user_name}
                        </div>

                        <div className="flex gap-4 mt-2 flex-wrap">
                            <div className={`flex items-center gap-1`}>
                                <HardHat className="w-4 h-4 mr-1"/>
                                <p className={`text-xs`}>{user.position}</p>
                            </div>

                            <div className={`flex items-center gap-1`}>
                                <Warehouse className="w-3 h-3 mr-1"/>
                                <p className={`text-xs`}>{user.warehouse}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button onClick={() => setIsPasswordChange(!isPasswordChange)} variant="secondary">
                        {isPasswordChange ? 'Cancel' : 'Change Password'}
                    </Button>
                    <Button variant="secondary">
                        Get Help
                    </Button>
                </div>
                {isPasswordChange &&
                    <UserPasswordResetForm
                        setIsPasswordChange={setIsPasswordChange}
                    />
                }
            </div>

            {/* MAIN GRID */}
            <div className="grid md:grid-cols-2 gap-4">

                {/* INFO CARD */}
                <div className="border rounded-2xl p-4 space-y-4 backdrop-blur-xl">
                    <h2 className="font-semibold flex items-center gap-2">
                        <IdCardLanyard className="w-4 h-4"/>
                        Employee Info
                    </h2>

                    <div className="space-y-2 text-sm">
                        <div>
                            <p className={`flex items-center gap-2`}>
                                <strong>Email:</strong>
                                <p className={`${user.email.includes('@company.local') && 'text-red-500'}`}>{user.email}</p>
                                {!isEmailChange &&
                                    <Button
                                        onClick={() => setIsEmailChange(true)}
                                        variant={'ghost'}>
                                        <Pencil size={16}/>
                                    </Button>
                                }
                            </p>

                            {isEmailChange &&
                                <UserEmailResetForm
                                    setIsEmailChange={setIsEmailChange}
                                />
                            }

                            {user.email.includes('@company.local') && !isEmailChange &&
                                <p className={`text-muted-foreground text-xs`}>
                                    Please change you Email asap, cause then it will be banned
                                    without approve from email
                                </p>
                            }
                        </div>
                        <p><strong>Phone:</strong> {user.phone}</p>
                        <p><strong>Card ID:</strong> {user.card_id}</p>
                    </div>
                </div>

                {/* PERFORMANCE CARD */}
                <div className="border rounded-2xl p-4 space-y-4 backdrop-blur-xl">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Rocket className="w-4 h-4"/>
                        Performance
                    </h2>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Score</span>
                            <span>{user.score || 0}%</span>
                        </div>

                        <Progress value={user.score || 0}/>
                    </div>
                </div>

            </div>

        </div>
    )
}

export default Page
