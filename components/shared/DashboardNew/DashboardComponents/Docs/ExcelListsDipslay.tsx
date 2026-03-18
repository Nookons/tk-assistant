import React from 'react';
import FileLink from "@/components/shared/FileLink";

const ExcelListsDisplay = () => {
    return (
        <div className={`grid md:grid-cols-3 col-span-3 gap-4`}>
            <div className="w-full overflow-y-auto">
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight py-2">
                    GLPC
                </h4>
                <table className="w-full">
                    <tbody>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Work Hours Records
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://doc.weixin.qq.com/sheet/e3_AQcAOQaBAEQSGPna7TLVrQmWRBGFl?scode=AHIA_gejAGYzX0YFiIAW8AKAZmANA&tab=8084z9`}
                                label={`INT(Wro Time Scheduling)-MAR 26`}
                            />
                        </td>
                    </tr>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Parts Inventory
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://doc.weixin.qq.com/sheet/e3_AQcAOQaBAEQSGWAfgDD1iRKa3z8UF?scode=AHIA_gejAGYYW8bXYvAW8AKAZmANA&tab=BB08J2`}
                                label={`GLP-C Spare Parts Inventory 备件管理`}
                            />
                        </td>
                    </tr>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Records & Robot Offline
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://doc.weixin.qq.com/sheet/e3_AQcAOQaBAEQSGpPqqRNjdRWGYVIdV?scode=AHIA_gejAGYjmylhEUAW8AKAZmANA&tab=BB08J2`}
                                label={`GLP-C Exception Record 异常记录`}
                            />
                        </td>
                    </tr>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Inspection lists
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://doc.weixin.qq.com/sheet/e3_AQcAOQaBAEQSGE0wyVKF2TQeYb9fy?scode=AHIA_gejAGYAu82X1YAW8AKAZmANA&tab=tihzzy`}
                                label={`GLP-C Inspection FEB NEW`}
                            />
                        </td>
                    </tr>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Schedule for Employees
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://doc.weixin.qq.com/sheet/e3_AQ4ANAbHAFQa7Cib3ziS1Gx6BVPDn?scode=AHIA_gejAGYFoFvH6uAW8AKAZmANA&tab=ggl07a`}
                                label={`TK Working schedule`}
                            />
                        </td>
                    </tr>
                    </tbody>
                </table>
                <p className="text-xs text-muted-foreground p-1">
                    The following list above was made for GLPC warehouse and must be checked and filled each shift by employees
                </p>
            </div>
            <div className="w-full overflow-y-auto">
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight py-2">
                    SP3
                </h4>
                <table className="w-full">
                    <tbody>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Maintenance Report
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://xjpwmnsipfug.jp.larksuite.com/wiki/VxhUwddWsif5bnkBIwxjJfGMpXb`}
                                label={`Maintenance Report`}
                            />
                        </td>
                    </tr>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Robots Inspections
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://xjpwmnsipfug.jp.larksuite.com/wiki/Uyizwiv1iitMKOkLjVtj5yjGpPd?sheet=N7TwVg`}
                                label={`P3 HAI-点检表&维护表`}
                            />
                        </td>
                    </tr>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Records & Robot Offline
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://xjpwmnsipfug.jp.larksuite.com/wiki/StFQwhuOtiPVXMkxo51jOe6Dptf?sheet=HrcHft`}
                                label={`Small P3 Project site issue logging`}
                            />
                        </td>
                    </tr>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Schedule for Employees
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://doc.weixin.qq.com/sheet/e3_AQ4ANAbHAFQa7Cib3ziS1Gx6BVPDn?scode=AHIA_gejAGYFoFvH6uAW8AKAZmANA&tab=ggl07a`}
                                label={`TK Working schedule`}
                            />
                        </td>
                    </tr>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Work Hours Records
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://doc.weixin.qq.com/sheet/e3_AQcAOQaBAEQSGPna7TLVrQmWRBGFl?scode=AHIA_gejAGYzX0YFiIAW8AKAZmANA&tab=8084z9`}
                                label={`INT(Wro Time Scheduling)-MAR 26`}
                            />
                        </td>
                    </tr>
                    </tbody>
                </table>
                <p className="text-xs text-muted-foreground p-1">
                    The following list above was made for SP3 warehouse and must be checked and filled each shift by employees
                </p>
            </div>
            <div className="w-full overflow-y-auto">
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight py-2">
                    PNT
                </h4>
                <table className="w-full">
                    <tbody>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Exceptions Records
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://doc.weixin.qq.com/sheet/e3_ATAATwaqAKoh6i9meEYSOKxvVT1cA?scode=AHIA_gejAGYbE722wtAW8AKAZmANA&tab=61eniy`}
                                label={`Shein WS Problems Record`}
                            />
                        </td>
                    </tr>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            All tasks and using parts records
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://doc.weixin.qq.com/sheet/e3_AQcAOQaBAEQrJE9Bu4nQja00AYyDP?scode=AHIA_gejAGYqfNaxKGAW8AKAZmANA&tab=7rtb2s`}
                                label={`(GEEK+)PNT-A SHIEN Task Record`}
                            />
                        </td>
                    </tr>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Robots Inspections
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://doc.weixin.qq.com/sheet/e3_AQcAOQaBAEQzimqikYVTNCiLcwEOP?scode=AHIA_gejAGYL7zNDiSAW8AKAZmANA&tab=xcanl2`}
                                label={`PNT-A Geek+ P1200 inspection`}
                            />
                        </td>
                    </tr>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Charging Stations Inspections
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://doc.weixin.qq.com/sheet/e3_AYcAKwb4AMUSGdQrX4ooqT6qPmFte?scode=AHIA_gejAGYYH9VKJeAW8AKAZmANA&tab=lg44jz`}
                                label={`SHEIN-PNT Charge station inspection`}
                            />
                        </td>
                    </tr>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Parts Stock
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://doc.weixin.qq.com/sheet/e3_AQcAOQaBAEQSGuGPbl2orQmerJrXx?scode=AHIA_gejAGYbDYgLSgAW8AKAZmANA&tab=gvypij`}
                                label={`(GEEK+)SHEIN备件库+欧洲备件库`}
                            />
                        </td>
                    </tr>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Work Hours Records
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://doc.weixin.qq.com/sheet/e3_AQcAOQaBAEQSGPna7TLVrQmWRBGFl?scode=AHIA_gejAGYzX0YFiIAW8AKAZmANA&tab=8084z9`}
                                label={`INT(Wro Time Scheduling)-MAR 26`}
                            />
                        </td>
                    </tr>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            Schedule for Employees
                        </td>
                        <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                            <FileLink
                                href={`https://doc.weixin.qq.com/sheet/e3_AQ4ANAbHAFQa7Cib3ziS1Gx6BVPDn?scode=AHIA_gejAGYFoFvH6uAW8AKAZmANA&tab=ggl07a`}
                                label={`TK Working schedule`}
                            />
                        </td>
                    </tr>
                    </tbody>
                </table>
                <p className="text-xs text-muted-foreground p-1">
                    The following list above was made for PNT warehouse and must be checked and filled each shift by employees
                </p>
            </div>
        </div>
    );
};

export default ExcelListsDisplay;