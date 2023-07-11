import { writable } from "svelte/store";
import { browser } from "$app/environment";


export const globalSupabase = writable()
export const userData = writable()

export const Tasklist = writable(false)
export const requestlist = writable(false)
export const assignedListAdmin = writable(false)
export const verifierRequestlist = writable(false)
export const jq = writable()


export const formBuilderDraftData = writable(browser ? window.localStorage.getItem('formBuilderDraftData') ? JSON.parse(window.localStorage.getItem('formBuilderDraftData')) : false : false)

formBuilderDraftData.subscribe((value) => {
    if (browser) {
        window.localStorage.setItem('formBuilderDraftData', JSON.stringify(value));
    }
})



export const deleteListFromDataBase = async (id) => {
    var supabase

    globalSupabase.subscribe((value) => {
        supabase = value;
    });

    const { error } = await supabase
        .from("tasklist")
        .delete()
        .eq("id", id);
    console.log("ok");
    if (error) console.log(error);
    return error
}
export const fetchTasklist = async (force = false) => {

    var supabase
    var admin_id
    var list
    Tasklist.subscribe((value) => {
        list = value
    })

    if (!list || force) {

        globalSupabase.subscribe((value) => {
            supabase = value;
        });

        userData.subscribe((value) => {
            admin_id = value?.id
        })
        let { data, error } = await supabase
            .from("tasklist")
            .select("id,name")
            .eq("admin_id", admin_id);

        if (error) console.log(error);
        else {
            Tasklist.set(data)
        }
        console.log(data);

        return error
    }


}

export const fetchRequestlist = async (force = false) => {
    var supabase
    var admin_id
    var list
    requestlist.subscribe((value) => {
        list = value
    })

    if (!list || force) {

        globalSupabase.subscribe((value) => {
            supabase = value;
        });
        userData.subscribe((value) => {
            admin_id = value?.id
        })

        let { data, error } = await supabase
            .from("verification_request")
            .select("id,name")
            .eq("admin_id", admin_id);

        if (error) console.log(error);
        else {
            requestlist.set(data)
        }
        console.log(data);

        return error
    }

}

export const fetchAssignedListAdmin = async (force) => {

    var supabase
    var admin_id
    var list
    assignedListAdmin.subscribe((value) => {
        list = value
    })

    if (!list || force) {
        globalSupabase.subscribe((value) => {
            supabase = value;
        });
        userData.subscribe((value) => {
            admin_id = value?.id
        })


        const { data, error } = await supabase
            .from("assigned_request_to_admin")
            .select("verification_request(name,id)")
            .eq("admin_id", admin_id);
        if (error) console.log(error);
        else {

            assignedListAdmin.set(data)

        }
    }
}

export const fetchVerifierRequestlist = async (force = false) => {
    console.log(1);
    var supabase
    var verifier_id
    var list
    verifierRequestlist.subscribe((value) => {
        list = value
    })

    if (!list || force) {

        globalSupabase.subscribe((value) => {
            supabase = value;
        });
        userData.subscribe((value) => {
            verifier_id = value?.id
        })

        let { data, error } = await supabase
            .from("request_verifier")
            .select("verification_request(id,name)")
            .eq("verifier_id", verifier_id);

        if (error) console.log(error);
        else {
            verifierRequestlist.set(data)
        }
        console.log(data);

        return error
    }





}





