<script>
    import { onMount } from "svelte";
    import {
        jq,
        globalSupabase,
        userData,
        Tasklist,
        deleteListFromDataBase,
        fetchTasklist,
    } from "../../store";
    import { clickOutside } from "$lib/click_outside";
    import { goto } from "$app/navigation";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let name, id;
    var loading = true;

    onMount(async () => {
        loading = true;
        $jq("#TaskViewer").modal("show");

        const { data, error } = await $globalSupabase
            .from("tasklist")
            .select("JSON_data")
            .eq("id", id)
            .single();

        loading = false;

        if (error) console.log(error);
        else {
            console.log(data);

            var form = await Formio.createForm(
                document.getElementById("formio"),
                data.JSON_data,
                {
                    noAlerts: true,
                }
            );

            form.on("submit", async () => {
                console.log(form.submission.data);

                if (data.JSON_data.display == "form")
                    form.currentForm.emit("submitDone");
            });

            form.on("change", (e) => {
                console.log(e);
            });
        }
    });
</script>

<div
    class="modal fade"
    id="TaskViewer"
    data-keyboard="false"
    data-backdrop="static"
    tabindex="-1"
    aria-labelledby="staticBackdropLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div
            class="modal-content"
            style="width: fit-content; min-width: 600px; "
        >
            <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">{name}</h5>
                <button
                    on:click={() => {
                        dispatch("close");
                    }}
                    type="button"
                    class="close"
                    data-dismiss="modal"
                    aria-label="Close"
                >
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                {#if loading}
                    <div class="d-flex justify-content-center">
                        <div class="spinner-border" role="status" />
                    </div>
                {/if}
                <div id="formio" />
            </div>
            <div class="modal-footer">
                <button
                    on:click={async () => {
                        loading = true;
                        await deleteListFromDataBase(id);
                        await fetchTasklist(true);
                        loading = false;
                        dispatch("close");
                    }}
                    data-dismiss="modal"
                    type="button"
                    class="btn btn-danger"
                >
                    <i class="bi bi-trash" />
                    Delete</button
                >
                <button
                    on:click={() => {
                        dispatch("close");
                        goto(`/Admin/Tasklist/ListBuilder?id=${id}&mode=edit`);
                    }}
                    class="btn btn-primary active"
                    type="button"
                    data-dismiss="modal"
                >
                    <i class="bi bi-pencil-square" />
                    Edit</button
                >
            </div>
        </div>
    </div>
</div>
