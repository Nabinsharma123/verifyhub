// src/routes/auth/callback/+server.js
import { redirect } from '@sveltejs/kit'

export const GET = async ({ url, locals: { supabase } }) => {
    const code = url.searchParams.get('code')

    if (code) {
        await supabase.auth.exchangeCodeForSession(code)
        console.log("code");
        throw redirect(303, '/')
        // if (url.searchParams.get('type') == 'admin') {

        //     console.log("/Admin/Dashboard");
        //     throw redirect(303, '/Admin/Dashboard')
        // }
        // else {
        //     console.log("/Verifier/Dashboard");


        //     throw redirect(303, '/Verifier/Dashboard')
        // }

    }

}
