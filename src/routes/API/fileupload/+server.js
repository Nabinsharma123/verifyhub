/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals: { supabase } }) {
    var res = await request.formData()
    console.log(res);
    console.log(res.get("dir"));

    var url = await fileUpload(res.get('file'))
    // var url = ""


    return new Response(
        JSON.stringify({ url: url }), { status: 200, statusText: "Ok" });






    async function fileUpload(file) {

        var extention = file.type.split("/")[1];

        const { data, error } = await supabase.storage
            .from("Request")
            .upload(`${res.get("dir")}/${res.get("name")}`, file, {
                upsert: true,
            });
        console.log(data, error);



        return supabase.storage.from("Request").getPublicUrl(data.path).data.publicUrl

    }




};