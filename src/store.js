import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { supabase } from "@supabase/auth-ui-shared";


export const globalSupabase = writable()
export const userData = writable()

export const tasklist = writable([])

export const requestlist = writable([])
export const assignedRequestToAdmin = writable([])
export const dashboardAdmin = writable({})
export const dashboardVerifier = writable({})

export const verifierRequestlist = writable([])
export const jq = writable(false)
export const notification = writable([])

export const formBuilderDraftData = writable(browser ? window.localStorage.getItem('formBuilderDraftData') ? JSON.parse(window.localStorage.getItem('formBuilderDraftData')) : false : false)

formBuilderDraftData.subscribe((value) => {
    if (browser) {
        window.localStorage.setItem('formBuilderDraftData', JSON.stringify(value));
    }

})




export const refreshLocalstorage = async () => {
    //admin
    console.log(1);
    window.localStorage.removeItem("tasklist")
    window.localStorage.removeItem("requestlist")
    window.localStorage.removeItem("assignedRequestToAdmin")
    window.localStorage.removeItem("requestlist")
    window.localStorage.removeItem("dashboardAdmin")


    // verifier
    window.localStorage.removeItem("verifierRequestlist")
    window.localStorage.removeItem("dashboardVerifier")


}


if (browser) {
    refreshLocalstorage()

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

        const { data: res, error } = await supabase
            .from("admin")
            .select("tasklist(count),verification_request(count),assigned_request_to_admin(count)")
            .eq("id", admin_id)
            .single()


        if (error) {
            console.log(error)
            return []

        }
        else {
            var data = {
                totalRequest: res.verification_request[0].count,
                totalTasklist: res.tasklist[0].count,
                assigned_request_to_admin: res.assigned_request_to_admin[0].count
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


export const fetchDashboardVerifier = async (force = false) => {
    var supabase
    var verifier_id

    if (!window.localStorage.getItem("dashboardVerifier") || force) {
        globalSupabase.subscribe((value) => {
            supabase = value;
        });

        userData.subscribe((value) => {
            verifier_id = value?.id
        })

        const { data: res, error } = await supabase
            .from("verifier")
            .select("request_verifier(count)")
            .eq("id", verifier_id)
            .single()


        if (error) {
            console.log(error)
            return []

        }
        else {

            var data = {
                totalRequest: res.request_verifier[0].count,

            }
            dashboardVerifier.set(data)
            console.log(data);
            window.localStorage.setItem("dashboardVerifier", JSON.stringify(data))
        }
    }
    else {
        return JSON.parse(window.localStorage.getItem("dashboardVerifier"))
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


    if (!window.localStorage.getItem("requestlist") || force) {

        globalSupabase.subscribe((value) => {
            supabase = value;
        });
        userData.subscribe((value) => {
            admin_id = value?.id
        })

        let { data, error } = await supabase
            .from("verification_request")
            .select("id,name,status,created_at")
            .eq("admin_id", admin_id);

        if (error) {
            console.log(error);
            return []

        }
        else {

            for (var i = 0; i < data.length; i++) {

                var dateObj = new Date(data[i].created_at);
                data[i].created_at = {
                    date: `${dateObj.getFullYear()}-${dateObj.getMonth() + 1
                        }-${dateObj.getDate()}`,
                    time: `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`,
                };

            }
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
            .select("verification_request(name,id,status,created_at)")
            .eq("admin_id", admin_id);
        if (error) {
            console.log(error);
            return []
        }
        else {
            var requestlist = data.map(e => e.verification_request)
            for (var i = 0; i < requestlist.length; i++) {

                var dateObj = new Date(requestlist[i].created_at);
                requestlist[i].created_at = {
                    date: `${dateObj.getFullYear()}-${dateObj.getMonth() + 1
                        }-${dateObj.getDate()}`,
                    time: `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`,
                };

            }
            assignedRequestToAdmin.set(requestlist)
            window.localStorage.setItem("assignedRequestToAdmin", JSON.stringify(requestlist))
            console.log(requestlist);


        }
    }
    else {

        return JSON.parse(window.localStorage.getItem("assignedRequestToAdmin"))
    }

}

export const fetchVerifierRequestlist = async (force = false) => {

    var supabase
    var verifier_id
    var list


    if (!window.localStorage.getItem("verifierRequestlist") || force) {

        globalSupabase.subscribe((value) => {
            supabase = value;
        });
        userData.subscribe((value) => {
            verifier_id = value?.id
        })

        let { data, error } = await supabase
            .from("request_verifier")
            .select("verification_request(id,name,status,created_at)")
            .eq("verifier_id", verifier_id);

        if (error) {
            console.log(error)
            return []
        }
        else {

            var requestlist = data.map(e => e.verification_request)
            for (var i = 0; i < requestlist.length; i++) {

                var dateObj = new Date(requestlist[i].created_at);
                requestlist[i].created_at = {
                    date: `${dateObj.getFullYear()}-${dateObj.getMonth() + 1
                        }-${dateObj.getDate()}`,
                    time: `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`,
                };

            }
            verifierRequestlist.set(requestlist)


            window.localStorage.setItem("verifierRequestlist", JSON.stringify(requestlist))

            console.log(requestlist);
        }


    }
    else {
        return JSON.parse(window.localStorage.getItem("verifierRequestlist"))


    }





}





