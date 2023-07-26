import { redirect } from '@sveltejs/kit'

/** @type {import('./$types').PageLoad} */
export async function load({ locals: { getSession } }) {
    var session = await getSession()
    console.log(1);

    if (session) {

        if (session.user.user_metadata.role == 'admin') {
            console.log(1);

            throw redirect(307, "/Admin/Dashboard")
        }
        else {
            throw redirect(307, "/Verifier/Dashboard")

        }
    }
    else {
        throw redirect(307, "/Login")

    }
}