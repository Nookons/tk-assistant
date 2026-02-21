import React from 'react';
import { IRobotException } from "@/types/Exception/Exception";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {Clock, AlertCircle, CheckCircle2, User, Trash2} from "lucide-react";
import dayjs from "dayjs";
import Image from "next/image";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useMutation} from "@tanstack/react-query";
import {Button} from "@/components/ui/button";
import {ExceptionService} from "@/services/exceptionService";
import {toast} from "sonner";
import {useExceptionStore} from "@/store/exception";
import {id} from "date-fns/locale";

const Exception = ({ data }: { data: IRobotException[] }) => {
    const remove_exception_store = useExceptionStore(state => state.remove_exception);

    const removeMutation = useMutation({
        mutationFn: (id: number) => ExceptionService.removeException(id),
        onSuccess: (data) => {
            remove_exception_store(data);
            toast.success("Exception removed successfully");
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const handleRemove = (id: number) => {
        removeMutation.mutate(id);
    };

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-semibold">Robot</TableHead>
                        <TableHead className="font-semibold">Error Details</TableHead>
                        <TableHead className="font-semibold">Recovery</TableHead>
                        <TableHead className="font-semibold text-center">Duration</TableHead>
                        <TableHead className="font-semibold">
                            <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4" />
                                Operator
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((exception) => {
                        const isHighRobot = exception.device_type !== "K50H";

                        return (
                            <TableRow
                                key={exception.uniq_key}
                                className="hover:bg-muted/30 transition-colors group"
                            >
                                {/* Robot Cell */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                                                <Image
                                                    src={isHighRobot ? `/img/K50H_red.svg` : `/img/A42T_red.svg`}
                                                    alt="robot"
                                                    width={24}
                                                    height={24}
                                                    className="opacity-90 min-w-[24px] min-h-[24px]"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-base tracking-tight">
                                                {exception.error_robot}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {exception.device_type}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Error Details Cell */}
                                <TableCell>
                                    <div className="space-y-1.5 ">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="font-medium max-w-[200px] line-clamp-1 text-sm leading-tight">
                                                    {exception.first_column}
                                                </p>
                                                {exception.second_column && (
                                                    <p className="text-xs max-w-[200px] line-clamp-1 text-muted-foreground mt-1 leading-relaxed">
                                                        {exception.second_column}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Timeline Cell */}
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-muted-foreground">Start:</span>
                                            <span className="text-sm font-mono font-semibold">
                                                {dayjs(exception.error_start_time).format("HH:mm")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-muted-foreground">End:</span>
                                            <span className="text-sm font-mono font-semibold">
                                                {dayjs(exception.error_end_time).format("HH:mm")}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Duration Cell */}
                                <TableCell>
                                    <div className="flex justify-center">
                                        <Badge
                                            className="font-mono font-bold px-3 py-1"
                                        >
                                            {exception.solving_time} min
                                        </Badge>
                                    </div>
                                </TableCell>

                                {/* Operator Cell */}
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Avatar className="h-10 w-10 border-2 border-primary/10">
                                                <AvatarImage
                                                    src={exception.user?.avatar_url}
                                                    alt={exception.user?.user_name || 'User'}
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                                    {exception.user?.user_name.slice(0, 2) || 'NA'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <span className="font-medium text-sm">
                                            {exception.employee || "—"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <Button onClick={() => handleRemove(exception.id)} variant={`destructive`}><Trash2 /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center backdrop-blur-sm">
                    <CheckCircle2 className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                        No exceptions recorded
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                        All systems operating normally
                    </p>
                </div>
            )}
        </div>
    );
};

export default Exception;