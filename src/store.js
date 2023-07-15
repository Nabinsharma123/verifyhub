import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { supabase } from "@supabase/auth-ui-shared";


export const globalSupabase = writable()
export const userData = writable()

export const tasklist = writable([])

export const requestlist = writable([])
export const assignedRequestToAdmin = writable([])
export const dashboardAdmin = writable({})
export const verifierRequestlist = writable(false)
export const jq = writable()

export const formBuilderDraftData = writable(browser ? window.localStorage.getItem('formBuilderDraftData') ? JSON.parse(window.localStorage.getItem('formBuilderDraftData')) : false : false)

formBuilderDraftData.subscribe((value) => {
    if (browser) {
        window.localStorage.setItem('formBuilderDraftData', JSON.stringify(value));
    }

})


if (browser) {
    //admin

    window.localStorage.removeItem("tasklist")
    window.localStorage.removeItem("requestlist")
    window.localStorage.removeItem("assignedRequestToAdmin")
    window.localStorage.removeItem("requestlist")
    window.localStorage.removeItem("dashboardAdmin")


    // verifier
    window.localStorage.removeItem("verifierRequestlist")
}




export const fetchDashboardAdmin = async (force = false) => {
    var supabase
    var admin_id

    if (!window.localStorage.getItem("dashboardAdmin") || force) {
        globalSupabase.subscribe((value) => {
            supabase = value;
        });

        userData.subscribe((value) => {
            admin_id = value?.id
        })

        const { data: res, error } = await supabase.from("admin")
            .select("tasklist(count),verification_request(count)")
            .eq("id", admin_id)
            .single()


        if (error) {
            console.log(error)
            return []

        }
        else {
            var data = {
                totalRequest: res.verification_request[0].count,
                totalTasklist: res.tasklist[0].count
            }
            dashboardAdmin.set(data)
            console.log(data);
            window.localStorage.setItem("dashboardAdmin", JSON.stringify(data))
        }
    }
    else {
        return JSON.parse(window.localStorage.getItem("dashboardAdmin"))
    }
}



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
    // var list
    // Tasklist.subscribe((value) => {
    //     list = value
    // })

    if (!window.localStorage.getItem("tasklist") || force) {

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

        if (error) {
            console.log(error)
            // return []
        }
        else {
            tasklist.set(data)
            window.localStorage.setItem("tasklist", JSON.stringify(data))
            console.log(data);
            // return data
        }
    }
    else {
        return JSON.parse(window.localStorage.getItem("tasklist"))
    }
}

export const fetchRequestlist = async (force = false) => {
    var supabase
    var admin_id
    var list
    // requestlist.subscribe((value) => {
    //     list = value
    // })

    if (!window.localStorage.getItem("requestlist") || force) {

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

        if (error) {
            console.log(error);
            return []

        }
        else {
            requestlist.set(data)
            console.log(data);
            window.localStorage.setItem("requestlist", JSON.stringify(data))
        }
    }
    else {
        return JSON.parse(window.localStorage.getItem("requestlist"))
    }

}

export const fetchAssignedRequestToAdmin = async (force) => {


    var supabase
    var admin_id
    // var list
    // assignedListAdmin.subscribe((value) => {
    //     list = value
    // })

    if (!window.localStorage.getItem("assignedRequestToAdmin") || force) {

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
        if (error) {
            console.log(error);
            return []
        }
        else {
            assignedRequestToAdmin.set(data)
            window.localStorage.setItem("assignedRequestToAdmin", JSON.stringify(data))
            console.log(data);


        }
    }
    else {

        return JSON.parse(window.localStorage.getItem("assignedRequestToAdmin"))
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





