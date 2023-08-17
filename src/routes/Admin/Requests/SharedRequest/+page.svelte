<script>
    import {
        assignedRequestToAdmin,
        fetchAssignedRequestToAdmin,
        jq,
    } from "../../../../store";
    import RequestViewerAdmin from "../../../../lib/Admin/RequestViewerAdmin.svelte";
    import { onMount } from "svelte";
    import Request from "../../../../lib/Component/Request.svelte";
    import { goto } from "$app/navigation";
    import DeletePopup from "../../../../lib/Admin/DeletePopup.svelte";

    var loading = true;
    var requestViewer = false;
    var deletePopup = false;

    onMount(async () => {
        loading = true;
        await fetchAssignedRequestToAdmin();
        loading = false;
    });
    async function deleteRequest(req_id) {
        loading = true;
        var res = await fetch("/API/admin/deleteRequest", {
            method: "POST",
            body: JSON.stringify({
                request_id: req_id,
            }),
            headers: {
                "content-type": "application/json",
            },
        });
        console.log(await res.json());
        await fetchAssignedRequestToAdmin(true);
        loading = false;
    }
</script>

<div>
    <div class="d-flex justify-content-between align-items-top">
        <div class="content-header pb-4 pt-0 pl-0">
            <h1 class="m-0">Shared Request</h1>
        </div>
    </div>
    {#if loading}
        <div class="d-flex justify-content-center">
            <div class="spinner-border" role="status" />
        </div>
    {:else if $assignedRequestToAdmin.length == 0}
        <div
            class="d-flex align-items-center position-absolute"
            style="right: 120px; width: 800px;"
        >
            <h3 class="mr-2" style="color: rgba(148, 148, 148, 0.4);">
                No Request available
            </h3>
        </div>
    {:else}
        <Request
            list={$assignedRequestToAdmin}
            on:view={(e) => {
                goto(`/Admin/Requests/${e.detail.id}`);
            }}
            on:delete={(e) => {
                deletePopup = { id: e.detail.id };
            }}
        />
    {/if}

    {#if deletePopup}
        <DeletePopup
            on:close={() => {
                deletePopup = false;
            }}
            on:delete={() => {
                deleteRequest(deletePopup.id);
            }}
        />
    {/if}
</div>
