/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals: { supabase } }) {
    var { request_id } = await request.json()
    var fList

    const { error } = await supabase
        .from("verification_request")
        .delete()
        .eq("id", request_id);

    fList = await getFilesList()
    const { data, error: err } = await supabase
        .storage
        .from('Request')
        .remove(fList)








    async function getFilesList() {
        var fileList = []

        const { data: tasklists, error } = await supabase
            .storage
            .from('Request')
            .list(request_id)

        if (tasklists.length != 0) {


            for (var tasklist of tasklists) {

                const { data: verifiers, error } = await supabase
                    .storage
                    .from('Request')
                    .list(`${request_id}/${tasklist.name}`)

                for (var verifier of verifiers) {
                    const { data: files, error } = await supabase
                        .storage
                        .from('Request')
                        .list(`${request_id}/${tasklist.name}/${verifier.name}`)

                    fileList = [...fileList, ...files.map((e) => {
                        return `${request_id}/${tasklist.name}/${verifier.name}/${e.name}`
                    })]




                }
            }
        }


        return fileList
    }


    // console.log(err);
    // console.log(data);
    return new Response(JSON.stringify({ "result": "ok" }), { status: 200, statusText: "Ok" });
}