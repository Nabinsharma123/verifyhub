// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'


const supabase = createClient('https://expijoaopgpataeqtkby.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cGlqb2FvcGdwYXRhZXF0a2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY5ODMwNDEsImV4cCI6MjAwMjU1OTA0MX0.2bUBFIavW5aa2WEA1OgFYGZzMJtvgrwJFkza6y5aPEY')

console.log("Hello from Functions!")

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "apikey, X-Client-Info, Authorization, content-type",
      }
    })
  }

  const requestDetails = await req.json()



  const { data: req_id } = await supabase
    .from('verification_request')
    .insert({ name: requestDetails.name, admin_id: requestDetails.owner_admin_id, status: "Active" })
    .select("id")
    .single()


  for (var [index, form] of requestDetails.prefill_data.entries()) {
    for (var key in form.prefillData) {
      if (typeof form.prefillData[key] == "object") {
        var url = form.prefillData[key][0].url.replace(
          "https://expijoaopgpataeqtkby.supabase.co/storage/v1/object/public/Request/",
          ""
        );
        var name = form.prefillData[key][0].name;

        const { data, error } = await supabase.storage
          .from("Request")
          .move(url, `${req_id.id}/${form.tid}/${form.vid}/${name}`);
        console.log(data, error);

        requestDetails.prefill_data[index].prefillData[key][0].url =
          supabase.storage
            .from("Request")
            .getPublicUrl(
              `${req_id}/${form.tid}/${form.vid}/${name}`
            ).data.publicUrl;
        requestDetails.prefill_data[index].prefillData[
          key
        ][0].data.url = supabase.storage
          .from("Request")
          .getPublicUrl(
            `${req_id}/${form.tid}/${form.vid}/${name}`
          ).data.publicUrl;
      }
    }
  }



  const { data, error } = await supabase.rpc(
    "add_new_request",
    { ...requestDetails, req_id: req_id.id }
  );



  return new Response(
    JSON.stringify({ data, error }),
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "apikey, X-Client-Info, Authorization, content-type", "Content-Type": "application/json"
      }
    },
  )
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
