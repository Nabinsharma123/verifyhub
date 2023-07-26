/** @type {import('./$types').RequestHandler} */


export async function POST({ fetch, request, locals: { supabase } }) {
    var { submissionData, formData, requestId, userId, tasklistId } = await request.json()



    for (var field in formData) {
        if (submissionData[field].type == "file") {
            if (formData[field].length != 0) {
                var res = await fileUpload(
                    formData[field][0],
                    field, fetch
                );
                submissionData[field].data = res.path;
            }
        } else {
            submissionData[field].data = formData[field];
        }
    }

    const { data, error } = await supabase
        .from("verifier_tasklist")
        .update({
            submitted_json_data: submissionData,
            status: "submitted",
        })
        .match({
            request_id: requestId,
            verifier_id: userId,
            tasklist_id: tasklistId,
        });

    if (error) console.log(error);



    async function fileUpload(file, name) {

        var extention = file.type.split("/")[1];

        const base64Response = await fetch(file.url);
        const blob = await base64Response.blob();

        const { data, error } = await supabase.storage
            .from("Request")
            .upload(`${requestId}/${tasklistId}/${userId}/${name}.${extention}`, blob, {
                upsert: true,
            });

        if (error) console.log(error);
        else return data;
    }

    return new Response(JSON.stringify({ text: data }), { status: 200, statusText: "Ok" });
}





