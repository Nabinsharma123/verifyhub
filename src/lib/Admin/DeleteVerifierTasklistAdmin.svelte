<script>
    import { fade, fly } from "svelte/transition";
    import { globalSupabase, userData, jq } from "../../store";
    import { createEventDispatcher, onMount } from "svelte";
    const dispatch = createEventDispatcher();

    export var type, req_id, exlist;

    var inputSearch = "";
    var list = [];
    var searchResult = [];
    var loading = false;

    $: searchResult = exlist.filter((e) => e.name.includes(inputSearch));

    onMount(() => {
        $jq("#DeleteTVA").modal("show");

        $jq("#DeleteTVA").on("hidden.bs.modal", () => {
            dispatch("close");
        });
    });

    async function Delete() {
        loading = true;
        var query = {};
        if (type == "verifier") {
            query = {
                verifier_id: list.map((e) => e.id),
                req_id: req_id,
            };
            console.log(query);
            const { data, error } = await $globalSupabase.rpc(
                "delete_verifiers_from_request",
                query
            );

            if (error) console.log(error);
            else console.log(data);
        } else if (type == "tasklist") {
            query = {
                tasklist_id: list.map((e) => e.id),
                req_id: req_id,
            };
            console.log(query);
            const { data, error } = await $globalSupabase.rpc(
                "delete_tasklist_from_request",
                query
            );

            if (error) console.log(error);
            else console.log(data);
        } else if (type == "admin") {
            query = {
                admin_id: list.map((e) => e.id),
                req_id: req_id,
            };
            console.log(query);
            const { data, error } = await $globalSupabase.rpc(
                "delete_admin_from_request",
                query
            );

            if (error) console.log(error);
            else console.log(data);
        }

        loading = false;
    }
</script>

<div
    class="modal fade"
    id="DeleteTVA"
    data-keyboard="false"
    data-backdrop="static"
    tabindex="-1"
    aria-labelledby="staticBackdropLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" style="position: relative;">
            {#if loading}
                <div
                    class="d-flex justify-content-center align-items-center w-100 h-100"
                    style="position: absolute;background-color: rgba(255, 255, 255, 0.8);z-index: 50;"
                >
                    <div class="spinner-border" role="status" />
                </div>
            {/if}
            <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">
                    Delete {type}s from this request
                </h5>
            </div>
            <div class="modal-body">
                <h5>Select team members</h5>
                <input
                    bind:value={inputSearch}
                    class="form-control"
                    id="selectAdmin"
                    type="text"
                    autocomplete="off"
                    placeholder="Search admin name"
                />

                <div class="mt-2" style="min-height: 200px; overflow: auto;">
                    {#each searchResult as { id, name, avatar_url }}
                        <button
                            class:border-success={list.find((e) => e.id == id)}
                            on:click={() => {
                                if (!list.find((e) => e.id == id)) {
                                    list = [...list, { id, name }];
                                } else {
                                    var index;
                                    for (let i = 0; i < list.length; i++) {
                                        if (list[i].id == id) {
                                            index = i;
                                            break;
                                        }
                                    }

                                    list.splice(index, 1);
                                    list = list;
                                }
                            }}
                            class=" btn border px-3 py-2 w-100 mb-2 d-flex align-items-center justify-content-between"
                        >
                            <div
                                class="d-flex align-items-center"
                                style="gap: 10px;"
                            >
                                {#if type == "tasklist"}
                                    <img
                                        style="height: 48px;border-radius: 10px;"
                                        src="/documentIcon.svg"
                                        alt=""
                                    />
                                {:else}
                                    <img
                                        style="height: 48px;border-radius: 10px;"
                                        src={avatar_url}
                                        alt=""
                                    />
                                {/if}
                                <p class="m-0" style="text-align: left;">
                                    {name}
                                </p>
                            </div>
                            {#if list.find((e) => e.id == id)}
                                <div>
                                    <i
                                        style="color: green;"
                                        class="bi bi-check-lg"
                                    />
                                </div>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- <div style="height: 50px; overflow: auto;">
                {#each list as { id, name }}
                    <div
                        style="display: inline-block;position: relative; width: fit-content;border: 1px solid gray; border-radius: 20px; padding: 2px;"
                    >
                        <button
                            on:click={() => {
                                var index;
                                for (let i = 0; i < list.length; i++) {
                                    if (list[i].id == id) {
                                        index = i;
                                        break;
                                    }
                                }

                                list.splice(index, 1);
                                list = list;
                            }}
                            style="padding: 0; border-radius: 100%; border: 0; position: absolute;top: -5px; right: -5px;background-color: white;"
                        >
                            <i class="bi bi-x fa-sm" />
                        </button>
                        {#if type == "tasklist"}
                            {name.slice(0, 4) + ".." + id}
                        {:else}
                            {name.slice(0, 4) + ".." + id.slice(0, 4)}
                        {/if}
                    </div>
                    ,
                {/each}
            </div> -->

            <div class="modal-footer">
                <button
                    data-dismiss="modal"
                    type="button"
                    class="btn btn-secondary">Close</button
                >
                <button
                    on:click={async () => {
                        await Delete();
                        dispatch("deleted");
                        $jq("#DeleteTVA").modal("hide");
                    }}
                    type="button"
                    class="btn btn-danger">Delete</button
                >
            </div>
        </div>
    </div>
</div>
