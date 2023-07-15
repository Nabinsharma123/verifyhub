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

    var loading = false;

    var requestBuilder = false;
    var requestViewer = false;

    onMount(async () => {
        loading = true;
        await fetchRequestlist();
        await fetchAssignedRequestToAdmin();
        loading = false;
    });
</script>

<!-- Dashboardnavbar -->
<div class="d-flex justify-content-between align-items-top">
    <h3>Your Requests</h3>

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
<hr class="m-0" />
<!-- Dashboardnavbar -->

<!-- request list -->
<div class="mt-2 position-relative" style="min-height: 40vh;">
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
        {#each $requestlist as { name, id }}
            <Card
                on:click={() => {
                    requestViewer = {
                        name: name,
                        id: id,
                        type: "owner",
                    };
                }}
                {name}
            />
        {/each}
    {/if}
</div>
<!-- request list -->

<!-- assigned to you -->

<div>
    {#if $assignedRequestToAdmin.length !== 0}
        <h3>Assigned to you</h3>
        <hr class="m-0" />

        <div class="mt-2 position-relative">
            {#each $assignedRequestToAdmin as { verification_request: { name, id } }}
                <Card
                    on:click={() => {
                        requestViewer = {
                            name: name,
                            id: id,
                            type: "assigned",
                        };
                    }}
                    {name}
                />
            {/each}
        </div>
    {/if}
</div>
<!-- assigned to you -->

<!-- request builder -->
{#if requestBuilder}
    <RequestBuilder
        on:close={() => {
            $jq("#requestBuilder").modal("hide");
            setTimeout(() => {
                requestBuilder = false;
            }, 300);
        }}
    />
{/if}
<!-- request builder -->

<!-- requesr viewer -->
{#if requestViewer}
    <RequestViewerAdmin
        id={requestViewer.id}
        name={requestViewer.name}
        type={requestViewer.type}
        on:close={() => {
            $jq("#RequestViewer").modal("hide");
            setTimeout(() => {
                requestViewer = false;
            }, 300);
        }}
    />
{/if}
<!-- requesr viewer -->
