'use client'
import React, {useEffect, useState} from 'react';
import {useParams} from "next/navigation";
import {IUser, IUserApiResponse} from "@/types/user/user";
import {toast} from "sonner";
import dayjs from "dayjs";
import AddRobot from "@/components/shared/dashboard/addRobot/AddRobot";
import {Badge} from "@/components/ui/badge";
import RobotListProvider from "@/components/shared/dashboard/robotsList/robotListProvider";
import {getUserData} from "@/futures/user/getUserData";
import {LoaderCircle, UserStar} from "lucide-react";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardTitle} from "@/components/ui/card";
import ShiftStats from "@/components/shared/dashboard/ShiftStats/ShiftStats";

const Page = () => {
    const params = useParams();
    const card_id = params?.id; // получаем динамический параметр

    const [user_data, setUser_data] = useState<IUser | null>(null)
    const [employees_list, setEmployees_list] = useState<IUser[]>([])

    const [who_complain, setWho_complain] = useState<string>("")
    const [why_complain, setWhy_complain] = useState<string>('')


    const [saved_user, setSaved_user] = useState<IUserApiResponse | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        }
        return null;
    });

    useEffect(() => {
        if (saved_user) {
            const loginTime = dayjs(saved_user.loginTime); // предположим, это timestamp или ISO-строка
            const now = dayjs();

            if (now.diff(loginTime, "minute") > 5) {
                console.log("С момента входа прошло больше 5 минут");
                localStorage.removeItem("user")
                window.location.reload();
            } else {
                console.log("С момента входа прошло меньше 5 минут");
            }
        }
    }, [saved_user]);


    const getEmployeesList = async () => {
        try {
            const res = await fetch(`/api/user/get-employees-list`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                }
            });


            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json(); // исправлено
            setEmployees_list(result)
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            return null;
        }
    }

    const getStartData = async () => {
        try {
            const user_data = await getUserData(card_id)

            if (user_data) {
                setUser_data(user_data)
            }
            getEmployeesList()
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getStartData()
    }, []);


    if (!user_data) return <LoaderCircle className={`animate-spin w-full`}/>

    return (
        <div className={`px-4`}>
            <div className={`flex items-center justify-between mt-4`}>
                <div className={`flex items-center gap-2`}>
                    <Label className={`text-base`}>{user_data.user_name}</Label>
                </div>
                <div className={`flex items-center gap-4`}>
                    <UserStar size={24}/>
                    <Badge className={`text-base px-2`} variant={user_data.score < 0 ? `destructive` : "secondary"}>
                        {user_data.score.toFixed(2)}
                    </Badge>
                </div>
            </div>
            <div className={``}>
                <RobotListProvider card_id={card_id}/>
                <ShiftStats />
            </div>
        </div>
    );
};

export default Page;