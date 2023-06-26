import { redirect } from '@sveltejs/kit'

/** @type {import('./$types').PageLoad} */
export async function load({ locals: { getSession } }) {
    var session = await getSession()
    if (!session) {
        throw redirect(303, "/Login/Verifier")
    }

}