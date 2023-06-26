import { writable } from "svelte/store";
import { browser } from "$app/environment";


export const globalSupabase = writable()
export const userData = writable()
export const selectedSidebarOption = writable("");
export const Tasklist = writable([])
export const jq = writable()
export const TasklistkViewer = writable(false)

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
    if (error) console.log(error);
    return error
}
export const fetchTasklist = async () => {
    var supabase
    var admin_id
    globalSupabase.subscribe((value) => {
        supabase = value;
    });

    userData.subscribe((value) => {
        admin_id = value.id
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


