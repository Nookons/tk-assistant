'use client'

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthRedirect({ status }: { status: string | null}) {
    const router = useRouter()

    useEffect(() => {
        if (status === "unauthorized") {
            router.replace("/login")
        }

        if (status === "no-session") {
            router.replace("/no-session")
        }
    }, [status])

    return null
}