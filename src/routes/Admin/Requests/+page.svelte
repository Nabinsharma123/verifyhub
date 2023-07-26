<script>
    import { onMount } from "svelte";
    import {
        globalSupabase,
        userData,
        fetchRequestlist,
        requestlist,
        fetchAssignedRequestToAdmin,
        assignedRequestToAdmin,
        jq,
    } from "../../../store";
    import { goto } from "$app/navigation";

    import RequestBuilder from "$lib/Admin/RequestBuilder.svelte";
    import RequestViewerAdmin from "$lib/Admin/RequestViewerAdmin.svelte";
    import Card from "../../../lib/Card.svelte";
    import DeletePopup from "../../../lib/Admin/DeletePopup.svelte";
    import Request from "../../../lib/Component/Request.svelte";

    var loading = true;

    var requestBuilder = false;
    var requestViewer = false;
    var deletePopup = false;

    onMount(async () => {
        loading = true;
        await fetchRequestlist();

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
        await fetchRequestlist(true);
        loading = false;
    }
</script>

<!-- Dashboardnavbar -->
<div class="d-flex justify-content-between align-items-top">
    <div class="content-header pb-4 pt-0 pl-0">
        <h1 class="m-0">My Requests</h1>
    </div>

    <button
        style="height: fit-content;"
        class="btn btn-success font-weight-bold"
        on:click={() => {
            // requestBuilder = true;
            goto("/Admin/Requests/NewRequest");
        }}
        ><i class="bi bi-plus-lg" /> Create new request
    </button>
</div>
{#if loading}
    <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status" />
    </div>
{:else if $requestlist.length == 0}
    <div
        class="d-flex align-items-center position-absolute"
        style="right: 120px; width: 800px;"
    >
        <h3 class="mr-2" style="color: rgba(148, 148, 148, 0.4);">
            No Request available. create new here
        </h3>
        <img
            style="rotate: 185deg;transform: scaleX(-1);width: 300px;"
            src="/curlyArrow.svg"
            alt=""
        />
    </div>
{:else}
    {#each $requestlist as { id, name, status, created_at }}
        <Request
            {name}
            {status}
            {created_at}
            type="admin"
            on:view={() => {
                requestViewer = {
                    name: name,
                    id: id,
                    type: "owner",
                    status,
                };
            }}
            on:delete={() => {
                deletePopup = { id };
            }}
        />
    {/each}
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
