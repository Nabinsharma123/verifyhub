<script>
    import { createEventDispatcher, onMount } from "svelte";

    import { jq } from "../../store";
    const dispatch = createEventDispatcher();
    onMount(() => {
        $jq("#deletepopup").modal("show");
        $jq("#deletepopup").on("hidden.bs.modal", () => {
            dispatch("close");
        });
    });
</script>

<div
    class="modal fade"
    id="deletepopup"
    data-keyboard="false"
    data-backdrop="static"
    tabindex="-1"
    aria-labelledby="staticBackdropLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">
                    Are you want to delete this?
                </h5>
            </div>
            <div class="modal-body">
                Deleting the request will also delete all the data and files
                associated with the request
            </div>
            <div class="modal-footer">
                <button
                    on:click={() => {
                        $jq("#deletepopup").modal("hide");
                    }}
                    class="btn btn-secondary active"
                    type="button"
                    data-dismiss="modal"
                >
                    No</button
                >
                <button
                    on:click={async () => {
                        dispatch("delete");
                        $jq("#deletepopup").modal("hide");
                    }}
                    type="button"
                    class="btn btn-danger"
                >
                    <i class="bi bi-trash" />
                    Delete</button
                >
            </div>
        </div>
    </div>
</div>
