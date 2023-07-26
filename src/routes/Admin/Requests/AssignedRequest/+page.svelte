<script>
    import {
        assignedRequestToAdmin,
        fetchAssignedRequestToAdmin,
        jq,
    } from "../../../../store";
    import RequestViewerAdmin from "../../../../lib/Admin/RequestViewerAdmin.svelte";
    import { onMount } from "svelte";
    import Request from "../../../../lib/Component/Request.svelte";

    var loading = true;
    var requestViewer = false;

    onMount(async () => {
        loading = true;
        await fetchAssignedRequestToAdmin();
        loading = false;
    });
</script>

<div>
    <div class="d-flex justify-content-between align-items-top">
        <div class="content-header pb-4 pt-0 pl-0">
            <h1 class="m-0">Assigned Requests</h1>
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
            type="assign"
            on:view={(e) => {
                requestViewer = {
                    name: e.detail.name,
                    id: e.detail.id,
                    type: "assign",
                    status: e.detail.status,
                };
            }}
        />
    {/if}

    <!-- requesr viewer -->
    {#if requestViewer}
        <RequestViewerAdmin
            id={requestViewer.id}
            name={requestViewer.name}
            type={requestViewer.type}
            status={requestViewer.status}
            on:close={() => {
                $jq("#RequestViewer").modal("hide");
                setTimeout(() => {
                    requestViewer = false;
                }, 300);
            }}
        />
    {/if}
    <!-- requesr viewer -->
</div>
