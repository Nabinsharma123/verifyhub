<script>
    import { onMount } from "svelte";
    import {
        globalSupabase,
        userData,
        fetchRequestlist,
        fetchAssignedListAdmin,
        assignedListAdmin,
        requestlist,
        jq,
    } from "../../../store";

    import RequestBuilder from "$lib/Admin/RequestBuilder.svelte";
    import RequestViewerAdmin from "$lib/Admin/RequestViewerAdmin.svelte";

    var loading = false;

    var requestBuilder = false;
    var requestViewer = false;

    onMount(async () => {
        loading = true;
        await fetchRequestlist();
        await fetchAssignedListAdmin();
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
            requestBuilder = true;
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
    {:else if $requestlist}
        {#if $requestlist.length == 0}
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
                <button
                    on:click={() => {
                        requestViewer = {
                            name: name,
                            id: id,
                            type: "owner",
                        };
                    }}
                    class="border-0 bg-white"
                >
                    <div
                        class="card rounded-lg py-1.5 px-3"
                        style="width: 150px;"
                    >
                        <div class="d-flex justify-content-center">
                            <i class="bi bi-file-earmark-text fa-5x" />
                        </div>
                        <hr class="m-0" />
                        <h6>
                            {name}
                        </h6>
                    </div>
                </button>
            {/each}
        {/if}
    {/if}
</div>
<!-- request list -->

<!-- assigned to you -->

<div>
    {#if $assignedListAdmin && $assignedListAdmin.length !== 0}
        <h3>Assigned to you</h3>
        <hr class="m-0" />

        <div class="mt-2 position-relative">
            {#each $assignedListAdmin as { verification_request: { name, id } }}
                <button
                    on:click={() => {
                        requestViewer = {
                            name: name,
                            id: id,
                            type: "assigned",
                        };
                    }}
                    class="border-0 bg-white"
                >
                    <div
                        class="card rounded-lg py-1.5 px-3"
                        style="width: 150px; position: relative;"
                    >
                        <div class="d-flex justify-content-center">
                            <i class="bi bi-file-earmark-text fa-5x" />
                            <i
                                class="bi bi-people fa-lg"
                                style="position: absolute;top: 5px;right: 5px;"
                            />
                        </div>
                        <hr class="m-0" />
                        <h6>
                            {name}
                        </h6>
                    </div>
                </button>
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
