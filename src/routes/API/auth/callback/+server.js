// src/routes/auth/callback/+server.js
import { redirect } from '@sveltejs/kit'

export const GET = async ({ url, locals: { supabase } }) => {
    const code = url.searchParams.get('code')

    if (code) {
        await supabase.auth.exchangeCodeForSession(code)
        if (url.searchParams.get('type') == 'admin')
            throw redirect(303, '/Admin/Dashboard')
        else
            throw redirect(303, '/Verifier/Dashboard')

    }

}
