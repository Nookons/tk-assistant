import type {Metadata} from "next";
import "./globals.css";
import {ThemeProvider} from "@/components/shared/theme/theme-provider";
import {Toaster} from "@/components/ui/sonner";
import {QueryProvider} from "@/components/providers/query-provider";
import MainProvider from "@/components/providers/MainProvider";
import Snow from "@/app/snow";
import * as React from "react";
import {headers} from "next/headers";
import {SessionProvider} from "@/components/SessionProvider";

export const metadata: Metadata = {
    title: "TK Assist",
    description: "Page generated for helping in work process with robots and inventory",
};

export default async function RootLayout({children,}: Readonly<{ children: React.ReactNode }>) {
    const headersList = await headers()
    const sessionBase64 = headersList.get('x-session')
    const session = sessionBase64
        ? JSON.parse(Buffer.from(sessionBase64, 'base64').toString('utf-8'))
        : null

    return (
        <html lang="en" suppressHydrationWarning>
        <body className="antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <QueryProvider>
                <div className="">
                    {session && <SessionProvider session={session} />}
                    <MainProvider/>
                    {children}
                </div>
            </QueryProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
