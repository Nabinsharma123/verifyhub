<script>
    import { onMount } from "svelte";
    import {
        jq,
        globalSupabase,
        TasklistkViewer,
        userData,
        Tasklist,
        deleteListFromDataBase,
        fetchTasklist,
    } from "../store";
    import { clickOutside } from "$lib/click_outside";
    import { goto } from "$app/navigation";

    export let name, id;
    var loading = true;

    onMount(async () => {
        loading = true;
        $jq("#TaskViewer").modal("show");

        const { data, error } = await $globalSupabase
            .from("tasklist")
            .select("JSON_data")
            .eq("id", id)
            .limit(1)
            .single();

        loading = false;

        if (error) console.log(error);
        else {
            console.log(data);

            Formio.createForm(
                document.getElementById("formio"),
                data.JSON_data,
                {
                    noAlerts: true,
                }
            ).then((form) => {
                form.on("submit", () => {
                    console.log(form.submission.data);
                    setTimeout(() => {
                        form.currentForm.emit("submitDone");
                    }, 1000);
                });
            });
        }
    });
</script>

<div
    class="modal fade"
    id="TaskViewer"
    data-keyboard="false"
    tabindex="-1"
    aria-labelledby="staticBackdropLabel"
    aria-hidden="true"
    use:clickOutside
    on:outclick={() => {
        $TasklistkViewer = false;
    }}
>
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" style="width: 600px;">
            <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">{name}</h5>
                <button
                    on:click={() => {
                        $TasklistkViewer = false;
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
                        await fetchTasklist();
                        loading = false;
                        $TasklistkViewer = false;
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
                        $TasklistkViewer = false;
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
