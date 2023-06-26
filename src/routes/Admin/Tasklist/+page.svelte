<script>
  import { onMount } from "svelte";
  import {
    formBuilderDraftData,
    jq,
    globalSupabase,
    userData,
    Tasklist,
    TasklistkViewer,
    fetchTasklist,
  } from "../../../store";
  import { goto } from "$app/navigation";
  var loading = false;
  onMount(async () => {
    if ($Tasklist.length == 0) {
      loading = true;
      await fetchTasklist();
      loading = false;
    }
    // console.log($Tasklist);
  });
</script>

<!-- all tasklist navbar -->
<div class="d-flex justify-content-between align-items-top">
  <h3>All Tasklists</h3>

  <button
    style="height: fit-content;"
    class="btn btn-primary font-weight-bold"
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
<div class="mt-2" style="min-height: 40vh;">
  {#if loading}
    <div class="d-flex justify-content-center">
      <div class="spinner-border" role="status" />
    </div>
  {:else}
    {#each $Tasklist as list}
      <button
        on:click={() => {
          $TasklistkViewer = {
            name: list.name,
            id: list.id,
          };
        }}
        class="border-0 bg-white"
      >
        <div class="card rounded-lg py-1.5 px-3" style="width: 150px;">
          <div class="d-flex justify-content-center">
            <i class="bi bi-file-earmark-text fa-5x" />
          </div>
          <hr class="m-0" />
          <h6>
            {list.name}
          </h6>
        </div>
      </button>
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
      <button
        on:click={() => {
          goto("/Admin/Tasklist/ListBuilder?id=draft&mode=edit");
        }}
        class="border-0 bg-white"
      >
        <div class="card rounded-lg py-1.5 px-3" style="width: 150px;">
          <div class="d-flex justify-content-center">
            <i class="bi bi-file-earmark-text fa-5x" />
          </div>
          <hr class="m-0" />
          <h6>
            {$formBuilderDraftData.formMetadata.name}
          </h6>
        </div>
      </button>
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
        />
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal"
          >Close</button
        >
        <button
          on:click={() => {
            $formBuilderDraftData = {
              formMetadata: {
                name: document.getElementById("newListName").value,
              },
            };
            $jq("#newNameModel").modal("hide");
            goto("/Admin/Tasklist/ListBuilder?id=draft&mode=create");
          }}
          type="button"
          class="btn btn-primary">Ok</button
        >
      </div>
    </div>
  </div>
</div>
<!-- new list name Modal -->
