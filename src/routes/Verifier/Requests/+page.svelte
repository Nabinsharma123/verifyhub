<script>
    import { onMount } from "svelte";
    import {
        verifierRequestlist,
        fetchVerifierRequestlist,
        jq,
    } from "../../../store";
    import { goto } from "$app/navigation";

    import RequestViewerVerifier from "$lib/Verifier/RequestViewerVerifier.svelte";
    import TasklistFillerVerifier from "$lib/Verifier/TasklistFillerVerifier.svelte";
    import Card from "../../../lib/Card.svelte";
    import Request from "../../../lib/Component/Request.svelte";

    var loading = false;

    var requestViewer = false;
    var tasklistFiller = false;

    onMount(async () => {
        loading = true;
        await fetchVerifierRequestlist();
        loading = false;
    });
</script>

<!-- Dashboardnavbar -->
<div class="d-flex justify-content-between align-items-top">
    <div class="content-header pb-4 pt-0 pl-0">
        <h1 class="m-0">Requests</h1>
    </div>
</div>

{#if loading}
    <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status" />
    </div>
{:else if $verifierRequestlist.length == 0}
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
    {#each $verifierRequestlist as { id, name, status, created_at }}
        <Request
            {name}
            {status}
            {created_at}
            type="verifier"
            on:view={() => {
                requestViewer = {
                    id: id,
                    name: name,
                    status,
                };
            }}
        />
    {/each}
{/if}

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
        status={requestViewer.status}
    />
{/if}

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
