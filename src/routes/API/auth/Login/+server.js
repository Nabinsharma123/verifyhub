/** @type {import('./$types').RequestHandler} */
import { json, redirect } from '@sveltejs/kit';

export async function POST({ request, locals }) {
    var loginData = await request.json()



    const { data, error: err } = await locals.supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
    })


    if (err) {
        console.log(err);
        return json({ error: true, ...err })
    }
    else {
        console.log(data);
        return json({ error: false, ...data })
    }



}