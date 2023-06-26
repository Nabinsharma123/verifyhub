/** @type {import('./$types').RequestHandler} */
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
    var signUpData = await request.json()


    const { data, error: err } = await locals.supabase.auth.signUp(
        {
            email: signUpData.email,
            password: signUpData.password,
            options: {
                data: {
                    avatar_url: signUpData.avatar_url,
                    name: signUpData.name
                },
                emailRedirectTo: "http://localhost:5173/API/auth/callback"
            }
        }
    )

    if (err) {
        return json({ error: true, ...err })
    }
    else {
        return json({ error: false, ...data })
    }



}