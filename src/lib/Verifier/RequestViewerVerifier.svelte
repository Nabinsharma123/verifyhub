<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { clickOutside } from "$lib/click_outside";
    import { jq, globalSupabase, Tasklist } from "../../store";

    const dispatch = createEventDispatcher();
    export var id, name;
    var loading = true;

    var requestInfo;
    onMount(async () => {
        loading = true;
        $jq("#requestViewer").modal("show");
        const { data, error } = await $globalSupabase
            .from("verification_request")
            .select(
                "id,created_at,name,admin(name,id),request_tasklist(tasklist(name,id))"
            )
            .eq("id", id)
            .limit(1)
            .single();

        if (error) console.log(error);
        else {
            requestInfo = data;
        }
        loading = false;
    });
</script>

<div
    class="modal fade"
    id="requestViewer"
    data-keyboard="false"
    tabindex="-1"
    aria-labelledby="staticBackdropLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div
            use:clickOutside
            on:outclick={() => {
                dispatch("close");
            }}
            class="modal-content"
            style="width: 800px;"
        >
            <div class="modal-header bg-secondary">
                <h5 class="modal-title text-white" id="staticBackdropLabel">
                    {name}
                </h5>
                <button
                    on:click={() => {
                        dispatch("close");
                    }}
                    type="button"
                    class="close"
                    aria-label="Close"
                >
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body" style="height: 400px;">
                <div class="d-flex h-100">
                    {#if loading}
                        <div class="d-flex w-100 h-100 justify-content-center">
                            <div class="spinner-border" role="status" />
                        </div>
                    {:else}
                        <div
                            class="pr-2"
                            style="flex: 1;border-right: 1px solid gray;"
                        >
                            <h5>Verification forms</h5>
                            <hr class="mt-0" />
                            <div style="max-height: 300px;overflow: auto;">
                                {#each requestInfo.request_tasklist as { tasklist }}
                                    <button
                                        on:click={() => {
                                            dispatch("openTasklistFiller", {
                                                name: tasklist.name,
                                                id: tasklist.id,
                                                requestName: name,
                                                requestId: id,
                                            });
                                        }}
                                        class="border-0 bg-white p-2"
                                    >
                                        <div
                                            class="card rounded-lg py-1.5 px-3"
                                            style="width: 150px;"
                                        >
                                            <div
                                                class="d-flex justify-content-center"
                                            >
                                                <i
                                                    class="bi bi-file-earmark-text fa-5x"
                                                />
                                            </div>
                                            <hr class="m-0" />
                                            <h6>{tasklist.name}</h6>
                                        </div>
                                    </button>
                                {/each}
                            </div>
                        </div>
                        <div class="pl-2" style="flex: 1;">
                            <h5>Request Detail</h5>
                            <hr class="mt-0" />
                            <div style="max-height: 300px;overflow: auto;">
                                <table class="table table-striped">
                                    <tbody>
                                        <tr>
                                            <td>Request name</td>
                                            <td
                                                >{requestInfo.name}({requestInfo.id})</td
                                            >
                                        </tr>
                                        <tr>
                                            <td>Assigned Date</td>
                                            <td>{requestInfo.created_at}</td>
                                        </tr>

                                        <tr>
                                            <td>Description</td>
                                            <td>---</td>
                                        </tr>

                                        <tr>
                                            <td>Requester Name</td>
                                            <td>{requestInfo.admin.name}</td>
                                        </tr>
                                        <tr>
                                            <td>Requester Id</td>
                                            <td>{requestInfo.admin.id}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
            <div class="modal-footer" />
        </div>
    </div>
</div>
