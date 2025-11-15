'use client'
import React, {use, useEffect, useState} from 'react';
import {useParams} from "next/navigation";
import {IUser, IUserApiResponse} from "@/types/user/user";
import {LoaderCircle, SquarePlus, ThumbsDown, UserStar} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import ComplainList from "@/components/shared/dashboard/ComplainList";
import dayjs from "dayjs";
import {Item, ItemActions, ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import EmployeeStats from "@/components/shared/dashboard/employeeStats/EmployeeStats";
import EmployeeShiftsList from "@/components/shared/dashboard/employeeShiftsList/employeeShiftsList";
import {Label} from "@/components/ui/label";
import AdminShiftsList from "@/components/shared/dashboard/adminShiftsList/adminShiftsList";
import AddRobot from "@/components/shared/dashboard/addRobot/AddRobot";
import {Badge} from "@/components/ui/badge";
import RobotListProvider from "@/components/shared/dashboard/robotsList/robotListProvider";

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


    const getUserData = async () => {
        try {
            const res = await fetch(`/api/user/get-user-by-phone?phone=${card_id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                }
            });


            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json(); // исправлено
            setUser_data(result)
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            return null;
        }
    };

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

    useEffect(() => {
        getUserData()
        getEmployeesList()
    }, [])

    const complainHandle = async () => {
        toast.info(who_complain)
        toast.info(why_complain)

        try {

            if (!user_data?.card_id) return null

            const res = await fetch(`/api/complain/add`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    card_id: Number(who_complain),
                    type: "complain",
                    description: why_complain,
                    add_by: user_data.card_id,
                    value: -1
                })
            });


            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json(); // исправлено
            console.log(result);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            return null;
        }
    }


    if (!user_data) return <LoaderCircle className={`animate-spin w-full`}/>


    return (
        <div>
            {user_data.position === 'leader' &&
                <div className={`mb-4`}>
                    <Dialog>
                        <DialogTrigger>
                            <div className={`mb-4`}>
                                <Button variant={`outline`}><ThumbsDown /></Button>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-[90vw] sm:max-w-[425px] w-full max-h-[90vh] overflow-y-auto rounded-2xl">
                            <DialogHeader>
                                <DialogTitle>Add complain to employee?</DialogTitle>
                                <DialogDescription>
                                    This action will add a complain to another worker and affect their score.
                                    <div className="mt-4 flex flex-col gap-2">
                                        <Select value={who_complain} onValueChange={(value) => setWho_complain(value)}>
                                            <SelectTrigger className={`w-full`}>
                                                <SelectValue placeholder="Employee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employees_list.map((item) => (
                                                    <SelectItem key={item.card_id} value={item.card_id.toString()}>
                                                        {item.user_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Textarea
                                            className="w-full"
                                            value={why_complain}
                                            onChange={(e) => setWhy_complain(e.target.value)}
                                            placeholder="Why are you adding this complain?"
                                        />
                                        <Button onClick={complainHandle}>Add</Button>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                    <div>
                        <AdminShiftsList />
                    </div>
                    <div className={`my-4`}>
                        <Label>Employees Stats</Label>
                        <div className={`grid grid-cols-1 md:flex md:flex-wrap gap-2 mt-2`}>
                            {employees_list.map((item, i) => {
                                const min = -100;
                                const max = 100;
                                const value = item.score;
                                const percent = ((value - min) / (max - min)) * 100; // преобразуем в 0–100%


                                return (
                                    <Item variant="outline">
                                        <ItemContent>
                                            <ItemTitle>{item.user_name}</ItemTitle>
                                            <ItemDescription>
                                                {item.warehouse}
                                                <p className="text-sm text-right mt-1">{value > 0 ? `+${value}` : value}</p>
                                            </ItemDescription>
                                        </ItemContent>
                                    </Item>
                                )
                            })}
                        </div>
                    </div>
                </div>
            }
            <div>
                <RobotListProvider card_id={card_id} />
            </div>
            <div className={`flex items-center border p-4 rounded-t-2xl justify-between`}>
                <div className={`flex items-center gap-2`}>
                    <h1>Dashboard for {user_data.user_name}</h1>
                </div>
                <div className={`flex items-center gap-4`}>
                    <UserStar size={24} />
                    <Badge className={`text-base px-2`} variant={user_data.score < 0 ? `destructive` : "secondary"}>
                        {user_data.score.toFixed(2)}
                    </Badge>
                </div>
            </div>
            <div className={`border px-2 py-4`}>
                <AddRobot card_id={card_id} />
            </div>
            <div className={` border p-4 rounded-b-2xl`}>
                <div className={`mt-4 grid grid-cols-1 gap-4`}>
                    <div>
                        <Label className={`mb-4 text-neutral-500 text-xs`}>
                            SHIFTS HISTORY
                        </Label>
                        <EmployeeShiftsList card_id={card_id} />
                    </div>
                    <div>
                        <Label className={`mb-4 text-neutral-500 text-xs`}>
                            COMPLAINS LIST
                        </Label>
                        <ComplainList user_data={user_data}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;