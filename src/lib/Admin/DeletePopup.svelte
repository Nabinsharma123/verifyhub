<script>
    import { createEventDispatcher } from "svelte";
    import { fade, fly } from "svelte/transition";
    const dispatch = createEventDispatcher();
</script>

<div
    transition:fade
    style=" position: absolute;top: 0;left: 0;width: 100%;height: 100%; display: flex; justify-content: center; align-items: center;
                    background-color: rgba(0, 0, 0, 0.2); "
>
    <div transition:fly={{ y: -50, duration: 500 }} class="modal-dialog">
        <div class="modal-content" style="width: 500px;position: relative;">
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
                        dispatch("close");
                    }}
                    type="button"
                    class="btn btn-secondary">No</button
                >
                <button
                    on:click={async () => {
                        dispatch("delete");
                        dispatch("close");
                    }}
                    type="button"
                    class="btn btn-danger">Delete</button
                >
            </div>
        </div>
    </div>
</div>
