'use client'
import React, {useEffect, useState} from "react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {IUser, IUserApiResponse} from "@/types/user/user";
import {Button} from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {toast} from "sonner";
import dayjs from "dayjs";
import {Item} from "@/components/ui/item";
import {Badge} from "@/components/ui/badge";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {ChevronDownIcon, Loader, LoaderPinwheel} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {generateShiftReport} from "@/futures/PDF/shiftReport";
import {IEmployeeReport} from "@/types/shift/Report";



const Page = () => {
    const [employee_at_shift, setEmployee_at_shift] = useState<number>(1)
    const [employees_list, setEmployees_list] = useState<IUser[]>([])

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [saved_user, setSaved_user] = useState<IUserApiResponse | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        }
        return null;
    });


    const initialDate = dayjs().format("YYYY-MM-DD"); // только дата

    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(dayjs(initialDate).toDate());
    const [shift_type, setShift_type] = useState<string>("day")
    const [report_data, setReport_data] = useState<IEmployeeReport[] | null>(null)

    const [card_data, setCard_data] = useState({
        rt_kubot_exc: "0",
        rt_kubot_mini_exc: "0",
        rt_kubot_e2_exc: "0",
        abnormal_location: "0",
        abnormal_case: "0",
        employee_select: "",
    })

    const getEmployeesList = async () => {
        try {
            const res = await fetch(`/api/user/get-employees-list`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (res.status !== 200) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const result = await res.json();
            setEmployees_list(result);

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getEmployeesList()
    }, []);

    const addReportCardHandle = () => {
        if (!card_data.employee_select.length) {
            toast.error("User is must be assigned to the report, please select the user")
            return;
        }

        const filtered = report_data?.filter(item => item.employee_select !== card_data.employee_select)
        setReport_data([...filtered || [], card_data] as IEmployeeReport[])
    }

    const generatePDFReport = async () => {
        if (!report_data || report_data.length === 0) {
            toast.error("No report data available to generate PDF");
            return;
        }

        try {
            setIsLoading(true);
            const promises_shifts = report_data.map(async (item) => {
                const user_name = item.employee_select.split("-")[0];
                const card_id = item.employee_select.split("-")[1];

                const data = {
                    employee_name: user_name,
                    shift_type: shift_type,
                    card_id: card_id,
                    rt_kubot_exc: item.rt_kubot_exc,
                    rt_kubot_mini: item.rt_kubot_mini_exc,
                    rt_kubot_e2: item.rt_kubot_e2_exc,
                    abnormal_locations: item.abnormal_location,
                    abnormal_cases: item.abnormal_case,
                    shift_date: date,
                };

                const score_summ = Number(data.rt_kubot_exc) + Number(data.rt_kubot_mini) + Number(data.rt_kubot_e2) + Number(data.abnormal_locations) + Number(data.abnormal_cases);
                const new_score = score_summ / 100
                try {
                    const res = await fetch(`/api/user/update-user-score`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            card_id: card_id,
                            value: new_score
                        })
                    });

                    const res_shift = await fetch(`/api/user/add-employee-shift`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    });

                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }

                    if (!res_shift.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }

                    const result = await res.json();
                    console.log(result);
                    return result;
                } catch (err) {
                    console.error('Error updating stats for card_id:', card_id, err);
                }
            });

            await Promise.all(promises_shifts);
            await generateShiftReport({report_data, date, shift_type})

            setTimeout(() => {
                setIsLoading(false);
            }, 250)

        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error("Failed to generate PDF report");
        }
    }

    return (
        <div className="max-w-[1200px] m-auto">
            <div className={`mb-6`}>
                <h1 className="text-2xl mb-4">SHEIN REPORT PAGE</h1>
                <div className={`flex flex-wrap items-center gap-2`}>
                    <Button
                        onClick={generatePDFReport}
                        disabled={!report_data || report_data.length === 0 || isLoading}
                    >
                        {isLoading && <Loader className={`animate-spin`} /> }
                        Generate PDF Report
                    </Button>
                    <Select value={shift_type} onValueChange={(value) => setShift_type(value)}>
                        <SelectTrigger className="w-auto">
                            <SelectValue placeholder="Shift Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="day">Day</SelectItem>
                                <SelectItem value="night">Night</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <div className="flex flex-col gap-3">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="date"
                                    className="w-auto justify-between font-normal"
                                >
                                    {date ? date.toLocaleDateString() : "Shift Date"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                        setDate(date)
                                        setOpen(false)
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>
            <Card>
                <CardHeader className={`flex flex-wrap  w-full justify-between items-center mb-6`}>
                    <CardTitle className={`mb-4`}>Employee Report Card</CardTitle>
                    <CardAction>
                        <div className={`flex w-full items-center gap-2`}>
                            <Select
                                value={card_data.employee_select}
                                onValueChange={(value) => setCard_data((prev) => ({...prev, employee_select: value})) }>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a employee"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Employee</SelectLabel>
                                        {employees_list.map((employee, index) => (
                                            <SelectItem key={index} value={`${employee.user_name}-${employee.card_id}`}>{employee.user_name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardAction>
                </CardHeader>

                <CardContent>
                    <div className={`flex flex-col gap-6`}>
                        <div className={`flex flex-wrap gap-4`}>
                            <div>
                                <div className={`grid items-center gap-3`}>
                                    <Label htmlFor="picture">RT KUBOT</Label>
                                    <Input
                                        className={`max-w-[100px]`}
                                        value={card_data.rt_kubot_exc}
                                        onChange={(e) => setCard_data((prev) => ({...prev, rt_kubot_exc: e.target.value}))}
                                        type={"number"}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className={`grid max-w-sm items-center gap-3`}>
                                    <Label htmlFor="picture">RT KUBOT MINI</Label>
                                    <Input
                                        className={`max-w-[100px]`}
                                        value={card_data.rt_kubot_mini_exc}
                                        onChange={(e) => setCard_data((prev) => ({...prev, rt_kubot_mini_exc:e.target.value}))}
                                        type={"number"}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className={`grid max-w-sm items-center gap-3`}>
                                    <Label htmlFor="picture">RT KUBOT E2</Label>
                                    <Input
                                        className={`max-w-[100px]`}
                                        value={card_data.rt_kubot_e2_exc}
                                        onChange={(e) => setCard_data((prev) => ({...prev, rt_kubot_e2_exc:e.target.value}))}
                                        type={"number"}
                                    />
                                </div>
                            </div>
                            <p className={`col-span-3 text-neutral-500 text-xs`}>In this section, please record the number
                                of robots of this type that you have solved during the shift.</p>
                        </div>
                        <div className={`flex flex-wrap items-center gap-4`}>
                            <div>
                                <div className={`grid w-full max-w-sm items-center gap-3`}>
                                    <Label htmlFor="picture">ABNORMAL LOCATION</Label>
                                    <Input
                                        className={`max-w-[155px]`}
                                        value={card_data.abnormal_location}
                                        onChange={(e) => setCard_data((prev) => ({...prev, abnormal_location:e.target.value}))}
                                        type={"number"}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className={`grid w-full max-w-sm items-center gap-3`}>
                                    <Label htmlFor="picture">ABNORMAL CASES</Label>
                                    <Input
                                        className={`max-w-[155px]`}
                                        value={card_data.abnormal_case}
                                        onChange={(e) => setCard_data((prev) => ({...prev, abnormal_case:e.target.value}))}
                                        type={"number"}
                                    />
                                </div>
                            </div>
                            <p className={`col-span-3 w-full text-neutral-500 text-xs`}>
                                In this section, please record the number
                                of abnormal position data.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-end gap-2">
                    <Button onClick={addReportCardHandle}>
                        Add to report
                    </Button>
                    <Button variant="outline">
                        Clean
                    </Button>
                </CardFooter>
            </Card>


            <div className={`flex flex-col gap-2 mt-4`}>
                {report_data?.map((item, index) => (
                    <Item key={index} variant={`outline`} className={`flex flex-col items-start gap-4`}>
                        <h5>{item.employee_select}</h5>
                        <div className={`grid grid-cols-2 items-center gap-2`}>
                            <Badge variant={`secondary`}>RT_KUBOT: {item.rt_kubot_exc}</Badge>
                            <Badge variant={`secondary`}>RT_KUBOT_MINI: {item.rt_kubot_mini_exc}</Badge>
                            <Badge variant={`secondary`}>RT_KUBOT_E2: {item.rt_kubot_e2_exc}</Badge>
                            <Badge variant={`secondary`}>ABNORMAL_LOCATIONS: {item.abnormal_location}</Badge>
                            <Badge variant={`secondary`}>ABNORMAL_CASE: {item.abnormal_case}</Badge>
                        </div>
                    </Item>
                ))}
            </div>
        </div>
    );
};

export default Page;