<script>
  import { onMount } from "svelte";
  import {
    formBuilderDraftData,
    jq,
    globalSupabase,
    tasklist,
    userData,
    fetchTasklist,
  } from "../../../store";
  import { goto } from "$app/navigation";
  import TasklistViewerAdmin from "$lib/Admin/TasklistViewerAdmin.svelte";
  import Card from "../../../lib/Card.svelte";
  var loading = false;
  var tasklistViewer = false;
  var FormType = "Single";

  onMount(async () => {
    loading = true;
    await fetchTasklist();
    loading = false;

    // console.log($Tasklist);
  });

  function truncateText(str) {
    if (str.length > 25) {
      return str.slice(0, 29) + "...";
    } else return str;
  }
</script>

<!-- all tasklist navbar -->
<div class="d-flex justify-content-between align-items-top">
  <h3>All Tasklists</h3>

  <button
    style="height: fit-content;"
    class="btn btn-success font-weight-bold"
    on:click={() => {
      if ($formBuilderDraftData) $jq("#previousDraftDeleteModel").modal("show");
      else $jq("#newNameModel").modal("show");
    }}
    data-toggle="modal"
    aria-pressed="true"
    ><i class="bi bi-plus-lg" /> Add new list
  </button>
</div>
<hr class="m-0" />
<!-- all tasklist navbar -->

<!-- tasklists -->
<div class="mt-2 position-relative" style="min-height: 40vh;">
  {#if loading}
    <div class="d-flex justify-content-center">
      <div class="spinner-border" role="status" />
    </div>
  {:else if $tasklist.length == 0}
    <div
      class="d-flex align-items-center position-absolute"
      style="right: 120px; width: 800px;"
    >
      <h3 class="mr-2" style="color: rgba(148, 148, 148, 0.4);">
        No Tasklist available. create new here
      </h3>
      <img
        style="rotate: 185deg;transform: scaleX(-1);width: 300px;"
        src="/curlyArrow.svg"
        alt=""
      />
    </div>
  {:else}
    {#each $tasklist as list}
      <Card
        name={list.name}
        on:click={() => {
          tasklistViewer = {
            name: list.name,
            id: list.id,
          };
        }}
      />
    {/each}
  {/if}
</div>
<!-- tasklists -->

<!-- draft -->
{#if $formBuilderDraftData}
  <div>
    <h3>Draft</h3>
    <hr class="m-0" />
    <div class="mt-2">
      <Card
        on:click={() => {
          goto("/Admin/Tasklist/ListBuilder?id=draft&mode=edit");
        }}
        name={$formBuilderDraftData.formMetadata.name}
      />
    </div>
  </div>
{/if}

<!-- draft -->

<!-- delete previous draft delete model -->

<div
  class="modal fade"
  id="previousDraftDeleteModel"
  data-backdrop="static"
  data-keyboard="false"
  tabindex="-1"
  aria-labelledby="staticBackdropLabel"
  aria-hidden="true"
>
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="staticBackdropLabel">Previous draft</h5>
      </div>
      <div class="modal-body">Do you want to delete previous draft?</div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal"
          >Cancel</button
        >
        <button
          on:click={() => {
            $jq("#previousDraftDeleteModel").modal("hide");

            $jq("#newNameModel").modal("show");
          }}
          type="button"
          class="btn btn-danger">Delete & create new list</button
        >
      </div>
    </div>
  </div>
</div>

<!-- delete previous draft delete model -->

<!-- new list name model -->

<div
  class="modal fade"
  id="newNameModel"
  data-backdrop="static"
  data-keyboard="false"
  tabindex="-1"
  aria-labelledby="staticBackdropLabel"
  aria-hidden="true"
>
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <form
        id="newListform"
        on:submit|preventDefault={() => {
          if (FormType == "Multiple") {
            $formBuilderDraftData = {
              form: { display: "wizard" },
              formMetadata: {
                name: document.getElementById("newListName").value,
              },
            };
          } else {
            $formBuilderDraftData = {
              form: { display: "form" },
              formMetadata: {
                name: document.getElementById("newListName").value,
              },
            };
          }
          $jq("#newNameModel").modal("hide");
          goto("/Admin/Tasklist/ListBuilder?id=draft&mode=create");
        }}
      >
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel">New list</h5>
        </div>
        <div class="modal-body">
          <input
            class="form-control"
            id="newListName"
            type="text"
            autocomplete="off"
            placeholder="New List name"
            required
          />

          <div class="d-flex mt-4" style="gap:20px">
            <h6>Form Type :-</h6>

            <label class="m-0 d-flex" style="gap: 5px;">
              <input
                bind:group={FormType}
                type="radio"
                name="FormType"
                value="Single"
              />
              Single Page
            </label>
            <label class="m-0 d-flex" style="gap: 5px;">
              <input
                bind:group={FormType}
                type="radio"
                name="FormType"
                value="Multiple"
              />
              Multi Page
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal"
            >Close</button
          >
          <button type="submit" class="btn btn-primary">Ok</button>
        </div>
      </form>
    </div>
  </div>
</div>
<!-- new list name Modal -->

<!-- tasklistViewer -->
{#if tasklistViewer}
  <TasklistViewerAdmin
    on:close={() => {
      $jq("#TaskViewer").modal("hide");
      setTimeout(() => {
        tasklistViewer = false;
      }, 300);
    }}
    id={tasklistViewer.id}
    name={tasklistViewer.name}
  />
{/if}

<!-- tasklistViewer -->

<style>
</style>
