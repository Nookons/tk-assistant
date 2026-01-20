import type {Metadata} from "next";
import "./globals.css";
import {ThemeProvider} from "@/components/shared/theme/theme-provider";
import {Header} from "@/components/shared/header/header";
import {Toaster} from "@/components/ui/sonner";
import {QueryProvider} from "@/components/providers/query-provider";
import MainProvider from "@/app/MainProvider";

export const metadata: Metadata = {
    title: "TK Assist",
    description: "Page generated for helping in work process with robots and inventory",
};

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode }>) {


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
                <Toaster richColors position="bottom-right"/>
                <div className="">
                    <Header/>
                    <MainProvider/>
                    {children}
                    <div className={`flex justify-center items-center w-full h-full bg-background-foreground`}>
                        <p className={`py-8 text-muted-foreground`}>TK Service by Kolomiiets Dmytro</p>
                    </div>
                </div>
            </QueryProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
