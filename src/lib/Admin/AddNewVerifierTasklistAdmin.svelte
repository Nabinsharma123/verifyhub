<script>
    import { globalSupabase, userData, jq } from "../../store";
    import { createEventDispatcher, onMount } from "svelte";
    const dispatch = createEventDispatcher();

    export var type, req_id, exlist;

    var inputTimeout;
    var searchResult = [];
    var inputSearch = "";
    var isSearchLoading = false;
    var list = [];
    var loading = false;

    onMount(() => {
        $jq("#AddTVA").modal("show");

        $jq("#AddTVA").on("hidden.bs.modal", () => {
            dispatch("close");
        });
    });

    async function search() {
        searchResult = [];

        if (inputSearch != "" && inputSearch != " ") {
            if (type == "verifier") {
                const { data, error } = await $globalSupabase
                    .from("verifier")
                    .select("id,name,avatar_url")
                    .ilike("name", `%${inputSearch}%`)
                    .not("id", "in", `(${exlist})`);
                if (error) console.log(error);
                else searchResult = data;
            } else if (type == "tasklist") {
                const { data, error } = await $globalSupabase
                    .from("tasklist")
                    .select("id,name")
                    .eq("admin_id", $userData.id)
                    .ilike("name", `%${inputSearch}%`)
                    .not("id", "in", `(${exlist})`);
                if (error) console.log(error);
                else searchResult = data;
            } else if (type == "admin") {
                const { data, error } = await $globalSupabase
                    .from("admin")
                    .select("id,name,avatar_url")
                    .ilike("name", `%${inputSearch}%`)
                    .not("id", "in", `(${[...exlist, $userData.id]})`);
                if (error) console.log(error);
                else searchResult = data;
            }
        }

        isSearchLoading = false;
    }
    async function add() {
        loading = true;

        var query = {};

        if (type == "verifier") {
            query = {
                verifier_id: list.map((e) => e.id),
                req_id: req_id,
            };
            const { data, error } = await $globalSupabase.rpc(
                "add_new_verifiers_to_request",
                query
            );

            if (error) console.log(error);
            else console.log(data);
        } else if (type == "tasklist") {
            query = {
                tasklist_id: list.map((e) => e.id),
                req_id: req_id,
            };
            const { data, error } = await $globalSupabase.rpc(
                "add_new_tasklist_to_request",
                query
            );

            if (error) console.log(error);
            else console.log(data);
        } else if (type == "admin") {
            query = {
                admin_id: list.map((e) => e.id),
                req_id: req_id,
            };
            const { data, error } = await $globalSupabase.rpc(
                "add_new_admin_to_request",
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
    id="AddTVA"
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
                    Add {type}s to this request
                </h5>
            </div>
            <div class="modal-body" style="height: 300px;">
                <div style="position: relative;">
                    <input
                        bind:value={inputSearch}
                        on:keydown={() => {
                            isSearchLoading = true;
                            clearTimeout(inputTimeout);
                        }}
                        on:keyup={() => {
                            clearTimeout(inputTimeout);
                            inputTimeout = setTimeout(search, 300);
                        }}
                        class="form-control"
                        id="selectAdmin"
                        type="text"
                        autocomplete="off"
                        placeholder="Search {type} name"
                    />

                    {#if inputSearch != "" && inputSearch != " "}
                        <div
                            class="mt-2 w-100 shadow-lg p-3 bg-white rounded"
                            style="z-index: 20; min-height: 100px; overflow: auto;position: absolute;"
                        >
                            {#if isSearchLoading}
                                <div
                                    class="d-flex justify-content-center align-items-center"
                                    style="min-height: inherit"
                                >
                                    <div class="spinner-border" role="status" />
                                </div>
                            {:else if searchResult.length == 0}
                                <div
                                    class="d-flex justify-content-center align-items-center h-100"
                                >
                                    <h6>No result</h6>
                                </div>
                            {:else}
                                {#each searchResult as { id, name, avatar_url }}
                                    <button
                                        class:border-success={list.find(
                                            (e) => e.id == id
                                        )}
                                        on:click={() => {
                                            if (!list.find((e) => e.id == id)) {
                                                list = [
                                                    ...list,
                                                    {
                                                        id,
                                                        name,
                                                        avatar_url,
                                                    },
                                                ];
                                                inputSearch = "";
                                            }
                                        }}
                                        class="searchResultBtn btn rounded p-2 w-100 mb-1"
                                        style="height: 70px;"
                                    >
                                        <div
                                            class=" d-flex align-items-center"
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

                                            <p
                                                class="m-0"
                                                style="text-align: center;"
                                            >
                                                {name}
                                            </p>
                                        </div>
                                    </button>
                                {/each}
                            {/if}
                        </div>
                    {/if}

                    <!-- <div class="mt-2" style="min-height: 200px; overflow: auto;">
                        {#if isSearchLoading}
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border" role="status" />
                            </div>
                        {:else}
                            <div style="height: 200px;">
                                {#each searchResult as { id, name }}
                                    <button
                                        class:border-success={list.find(
                                            (e) => e.id == id
                                        )}
                                        on:click={() => {
                                            if (!list.find((e) => e.id == id)) {
                                                list = [...list, { id, name }];
                                            }
                                        }}
                                        class=" btn border p-2 w-100"
                                        style=""
                                    >
                                        <p class="m-0" style="text-align: left;">
                                            Name : {name}
                                        </p>
                                        <p style="text-align: left;" class="m-0">
                                            id : {id}
                                        </p>
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div> -->

                    <div class="mt-2" style=" height: 150px; overflow: auto; ">
                        {#each list as { id, name, avatar_url }}
                            <div
                                style=" width: fit-content; display: inline-block;border: 1px solid gray; border-radius: 20px; "
                            >
                                <div class="d-flex align-items-center p-1">
                                    {#if type == "tasklist"}
                                        <img
                                            class="rounded-circle"
                                            style="height: 30px;"
                                            src="/documentIcon.svg"
                                            alt=""
                                        />
                                    {:else}
                                        <img
                                            class="rounded-circle"
                                            style="height: 30px;"
                                            src={avatar_url}
                                            alt=""
                                        />
                                    {/if}
                                    <p
                                        class="m-0 ml-2"
                                        style="text-align: center;"
                                    >
                                        {name}
                                    </p>

                                    <button
                                        on:click={() => {
                                            var index;
                                            for (
                                                let i = 0;
                                                i < list.length;
                                                i++
                                            ) {
                                                if (list[i].id == id) {
                                                    index = i;
                                                    break;
                                                }
                                            }

                                            list.splice(index, 1);
                                            list = list;
                                        }}
                                        class="ml-2"
                                        style="padding: 0; border-radius: 100%; border: 0; background-color: white;"
                                    >
                                        <i class="bi bi-x fa-lg" />
                                    </button>
                                </div>
                            </div>
                            ,
                        {/each}
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button
                    data-dismiss="modal"
                    type="button"
                    class="btn btn-secondary">Close</button
                >
                <button
                    on:click={async () => {
                        await add();

                        dispatch("added");
                        $jq("#AddTVA").modal("hide");
                    }}
                    type="button"
                    class="btn btn-success">Add</button
                >
            </div>
        </div>
    </div>
</div>
