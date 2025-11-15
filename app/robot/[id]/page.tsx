'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import Image from "next/image";
import { IRobotApiResponse } from "@/types/robot/robot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Item } from "@/components/ui/item";

const InfoRow = ({ title, value }: { title: string; value: string | number | null }) => (
    <Item variant="muted" className="flex justify-between px-4 py-2 rounded-md bg-muted/50">
        <Label className="font-semibold ">{title}:</Label>
        <Label className="">{value || "—"}</Label>
    </Item>
);

const UserCard = ({ title, user }: any) => (
    <Card className="rounded-xl shadow-sm">
        <CardHeader>
            <CardTitle className="text-lg font-bold ">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 ">
            <p><span className="font-semibold">Name:</span> {user.user_name}</p>
            <p><span className="font-semibold">Warehouse:</span> {user.warehouse}</p>
            <p><span className="font-semibold">Phone:</span> {user.phone}</p>
        </CardContent>
    </Card>
);

const Page = () => {
    const params = useParams();
    const robot_id = params?.id;

    const [robot_data, setRobotData] = useState<IRobotApiResponse | null>(null);

    const getRobotData = async () => {
        try {
            const res = await fetch(`/api/robots/get-robot?robot_id=${robot_id}`);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const response = await res.json();
            setRobotData(response);

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (robot_id) getRobotData();
    }, [robot_id]);

    if (!robot_data) return null;

    return (
        <div className="max-w-[1200px] m-auto p-6 grid md:grid-cols-3 gap-6  border rounded-2xl shadow-sm">

            {/* ROBOT IMAGE */}
            <div className="flex justify-center items-center">
                <Image
                    width={260}
                    height={260}
                    src="/img/rt_kubot_mini.png"
                    alt="robot image"
                    className="drop-shadow-md"
                />
            </div>

            {/* ROBOT INFO */}
            <div className="flex flex-col gap-3 mt-4">
                <InfoRow title="Robot Number" value={robot_data.robot_number} />
                <InfoRow title="Robot Type" value={robot_data.robot_type} />
                <InfoRow title="Updated At" value={robot_data.updated_at} />
                <InfoRow title="Created At" value={robot_data.created_at} />
                <InfoRow title="Problem Type" value={robot_data.type_problem} />
                <InfoRow title="Problem Note" value={robot_data.problem_note || "No Notes"} />
            </div>

            {/* USER CARDS */}
            <div className="grid gap-4 mt-4">
                <UserCard title="Added By" user={robot_data.add_by} />
                {robot_data.updated_by && <UserCard title="Updated By" user={robot_data.updated_by} />}
            </div>
        </div>
    );
};

export default Page;
