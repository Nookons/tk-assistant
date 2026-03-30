import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {SessionService} from "@/services/sessionService";

const PUBLIC_ROUTES = [
    '/login',
    '/reset-password',
    '/confirm-email',
    '/forgot-password',
    '/invite-expired',
    '/set-password',
    '/change-password',
]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.next()
    }

    let response = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const response_session = await SessionService.getCurrentSession(user.id)
    console.log(response_session);

    if (!response_session) {
        if (pathname !== '/no-session') {
            return NextResponse.redirect(new URL('/no-session', request.url))
        }
    }

    const sessionJson = JSON.stringify(response_session)
    const sessionBase64 = Buffer.from(sessionJson, 'utf-8').toString('base64')
    response.headers.set('x-session', sessionBase64)
    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api).*)',
    ],
}