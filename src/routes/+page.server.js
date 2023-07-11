import { redirect } from '@sveltejs/kit'

/** @type {import('./$types').PageLoad} */
export async function load({ locals: { getSession } }) {
    var session = await getSession()


    if (session) {

        if (session.user.user_metadata?.role == 'admin') {

            throw redirect(308, "/Admin/Dashboard")
        }
        else {
            throw redirect(308, "/Verifier/Dashboard")

        }
    }
}