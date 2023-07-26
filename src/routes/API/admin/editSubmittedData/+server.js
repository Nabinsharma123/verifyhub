/** @type {import('./$types').RequestHandler} */
export async function POST({ fetch, request, locals: { supabase } }) {
    var { submissionData, verifier_tasklist_id, verifier_id, tasklist_id, request_id } = await request.json()
    // console.log({ submissionData, verifier_tasklist_id, verifier_id, tasklist_id, request_id });

    for (var key in submissionData) {

        if (submissionData[key].type == "file") {
            if (submissionData[key].data.length != 0) {
                var res = await fileUpload(
                    submissionData[key].data[0],
                    key
                );
                submissionData[key].data = res.path;
            }
        }

    }











    async function fileUpload(file, name) {

        var extention = file.type.split("/")[1];

        const base64Response = await fetch(file.url);
        const blob = await base64Response.blob();

        const { data, error } = await supabase.storage
            .from("Request")
            .upload(`${request_id}/${tasklist_id}/${verifier_id}/${name}.${extention}`, blob, {
                upsert: true,
            });

        if (error) console.log(error);
        else return data;
    }




    const { data, error } = await supabase.rpc(
        "update_submitted_data",
        {
            updated_data: submissionData,
            verifier_tasklist_id
        }
    );

    console.log(data, error);


    return new Response(JSON.stringify({ text: "ok" }), { status: 200, statusText: "Ok" });

}