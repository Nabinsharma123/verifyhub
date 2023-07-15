<script>
    import { onMount } from "svelte";
    import {
        verifierRequestlist,
        fetchVerifierRequestlist,
        jq,
    } from "../../../store";

    import RequestViewerVerifier from "$lib/Verifier/RequestViewerVerifier.svelte";
    import TasklistFillerVerifier from "$lib/Verifier/TasklistFillerVerifier.svelte";
    import Card from "../../../lib/Card.svelte";

    var loading = false;

    var requestViewer = false;
    var tasklistFiller = false;
    onMount(async () => {
        loading = true;
        await fetchVerifierRequestlist();
        loading = false;
    });
</script>

<h3>Dashboard</h3>
<hr />

<div class="mt-2 position-relative" style="min-height: 40vh;">
    {#if loading}
        <div class="d-flex justify-content-center">
            <div class="spinner-border" role="status" />
        </div>
    {:else if $verifierRequestlist}
        {#if $verifierRequestlist.length == 0}
            <div class="d-flex w-100 justify-content-center position-absolute">
                <h3 class="mr-2" style="color: rgba(148, 148, 148, 0.4);">
                    No Request available
                </h3>
            </div>
        {:else}
            {#each $verifierRequestlist as list}
                <Card
                    on:click={() => {
                        requestViewer = {
                            id: list.verification_request.id,
                            name: list.verification_request.name,
                        };
                    }}
                    name={list.verification_request.name}
                />
            {/each}
        {/if}
    {/if}
</div>

<!-- requestViewer -->
{#if requestViewer}
    <RequestViewerVerifier
        on:close={() => {
            $jq("#requestViewer").modal("hide");
            setTimeout(() => {
                requestViewer = false;
            }, 300);
        }}
        on:openTasklistFiller={(e) => {
            tasklistFiller = e.detail;
            $jq("#requestViewer").modal("hide");
            setTimeout(() => {
                requestViewer = false;
            }, 300);
        }}
        id={requestViewer.id}
        name={requestViewer.name}
    />
{/if}
<!-- requestViewer -->

<!-- TasklistViewer -->

{#if tasklistFiller}
    <TasklistFillerVerifier
        id={tasklistFiller.id}
        name={tasklistFiller.name}
        requestName={tasklistFiller.requestName}
        requestId={tasklistFiller.requestId}
        on:close={() => {
            $jq("#tasklistFiller").modal("hide");
            setTimeout(() => {
                tasklistFiller = false;
            }, 300);
        }}
    />
{/if}
<!-- TasklistViewer -->
