<script>
    import { onMount } from "svelte";
    import {
        globalSupabase,
        userData,
        fetchRequestlist,
        requestlist,
        jq,
    } from "../../store";

    import { createEventDispatcher } from "svelte";
    import { fade, fly } from "svelte/transition";
    const dispatch = createEventDispatcher();

    var inputTimeoutVerifier;
    var searchResultVerifier = [];
    var inputSearchVerifier;
    var isSearchLoadingVerifier;
    var verifier_list = [];

    var inputTimeoutTasklist;
    var searchResultTasklist = [];
    var inputSearchTasklist;
    var isSearchLoadingTasklist;
    var Tasklist_list = [];

    var inputTimeoutAdmin;
    var searchResultAdmin = [];
    var inputSearchAdmin;
    var isSearchLoadingAdmin;
    var admin_list = [];

    var isAddTeamMembersOpen = false;

    var requestCreateloading = false;
    var requestName = "";

    onMount(() => {
        $jq("#requestBuilder").modal("show");
    });

    async function searchTasklist() {
        searchResultTasklist = [];

        if (inputSearchTasklist != "" && inputSearchTasklist != " ") {
            const { data, error } = await $globalSupabase
                .from("tasklist")
                .select("id,name")
                .ilike("name", `%${inputSearchTasklist}%`);

            if (error) console.log(error);
            else searchResultTasklist = data;

            console.log(data);
        }

        isSearchLoadingTasklist = false;
    }

    async function searchVerifier() {
        searchResultVerifier = [];

        if (inputSearchVerifier != "" && inputSearchVerifier != " ") {
            const { data, error } = await $globalSupabase
                .from("verifier")
                .select("id,name")
                .ilike("name", `%${inputSearchVerifier}%`);

            if (error) console.log(error);
            else searchResultVerifier = data;
        }

        isSearchLoadingVerifier = false;
    }

    async function searchAdmin() {
        searchResultAdmin = [];
        if (inputSearchAdmin != "" && inputSearchAdmin != " ") {
            const { data, error } = await $globalSupabase
                .from("admin")
                .select("id,name")
                .ilike("name", `%${inputSearchAdmin}%`)
                .neq("id", $userData.id);
            if (error) console.log(error);
            else searchResultAdmin = data;
        }
        isSearchLoadingAdmin = false;
    }

    function requestQueryBuilder() {
        var requestQuery = {
            verifier_id: verifier_list.map((e) => e.id),
            tasklist_id: Tasklist_list.map((e) => e.id),
            admin_id: admin_list.map((e) => e.id),
            name: requestName,
            owner_admin_id: $userData.id,
        };

        console.log(requestQuery);
        return requestQuery;
    }

    async function createRequest() {
        requestCreateloading = true;
        var requestQuery;
        requestQuery = requestQueryBuilder();
        const { data, error } = await $globalSupabase.rpc(
            "add_new_request",
            requestQuery
        );
        if (error) console.log(error);
        else console.log(data);
        await fetchRequestlist(true);
        requestCreateloading = false;
    }
</script>

<div
    class="modal fade"
    id="requestBuilder"
    data-backdrop="static"
    data-keyboard="false"
    tabindex="-1"
    aria-labelledby="staticBackdropLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" style="width: 900px;position: relative;">
            {#if requestCreateloading}
                <div
                    style="z-index: 50; position: absolute;width: 100%;height: 100%;background-color: rgba(255, 255, 255, 0.5);"
                    class="d-flex justify-content-center align-items-center"
                >
                    <div class="spinner-border" role="status" />
                </div>
            {/if}

            <div class="modal-header d-flex" style="gap: 10px;">
                <div class="d-flex align-items-center" style="flex: 3;">
                    <h5 class="modal-title mr-2" id="staticBackdropLabel">
                        Name:
                    </h5>
                    <form
                        class="w-100"
                        id="newListForm"
                        on:submit={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <input
                            required
                            class="form-control"
                            id="newListName"
                            type="text"
                            autocomplete="off"
                            bind:value={requestName}
                            placeholder="Enter request name"
                        />
                        <input
                            id="submit-hidden"
                            type="submit"
                            style="display: none"
                        />
                    </form>
                </div>
                <div
                    style="flex: 1;display: flex;justify-content: center;flex-direction: column;"
                >
                    <button
                        style=""
                        class="btn btn-success font-weight-bold"
                        on:click={() => {
                            isAddTeamMembersOpen = true;
                        }}
                        ><i class="bi bi-plus-lg" /> Add Team Members
                    </button>
                    <!-- <h6 style="text-align: center;">
                        {admin_list.length}
                        {admin_list.length > 1 ? "Members" : "Member"} added
                    </h6> -->
                </div>
            </div>

            <div class="modal-body" style="position: static;">
                <div class="modal-body d-flex justify-content-around">
                    <div style="flex: 1;border-right: 1px solid gray;">
                        <div class="px-2">
                            <h5>Select Verifier's</h5>

                            <input
                                bind:value={inputSearchVerifier}
                                on:keydown={() => {
                                    isSearchLoadingVerifier = true;
                                    clearTimeout(inputTimeoutVerifier);
                                }}
                                on:keyup={() => {
                                    clearTimeout(inputTimeoutVerifier);
                                    inputTimeoutVerifier = setTimeout(
                                        searchVerifier,
                                        300
                                    );
                                }}
                                class="form-control"
                                id="newListName"
                                type="text"
                                autocomplete="off"
                                placeholder="Search Verifier name"
                            />
                            <div
                                class="my-2"
                                style="height: 200px; overflow: auto;"
                            >
                                {#if isSearchLoadingVerifier}
                                    <div class="d-flex justify-content-center">
                                        <div
                                            class="spinner-border"
                                            role="status"
                                        />
                                    </div>
                                {:else}
                                    {#each searchResultVerifier as { id, name }}
                                        <button
                                            class:border-success={verifier_list.find(
                                                (e) => e.id == id
                                            )}
                                            on:click={() => {
                                                if (
                                                    !verifier_list.find(
                                                        (e) => e.id == id
                                                    )
                                                ) {
                                                    verifier_list = [
                                                        ...verifier_list,
                                                        { id, name },
                                                    ];
                                                }
                                            }}
                                            class=" btn border p-2 w-100"
                                            style=""
                                        >
                                            <p
                                                class="m-0"
                                                style="text-align: left;"
                                            >
                                                Name : {name}
                                            </p>
                                            <p
                                                style="text-align: left;"
                                                class="m-0"
                                            >
                                                id : {id}
                                            </p>
                                        </button>
                                    {/each}
                                {/if}
                            </div>
                            <div style="height: 100px; overflow: auto;">
                                {#if verifier_list.length != 0}
                                    {#each verifier_list as { id, name }}
                                        <div
                                            style="display: inline-block;position: relative; width: fit-content;border: 1px solid gray; border-radius: 20px; padding: 2px;"
                                        >
                                            <button
                                                on:click={() => {
                                                    var index;
                                                    for (
                                                        let i = 0;
                                                        i <
                                                        verifier_list.length;
                                                        i++
                                                    ) {
                                                        if (
                                                            verifier_list[i]
                                                                .id == id
                                                        ) {
                                                            index = i;
                                                            break;
                                                        }
                                                    }

                                                    verifier_list.splice(
                                                        index,
                                                        1
                                                    );
                                                    verifier_list =
                                                        verifier_list;
                                                }}
                                                style="padding: 0; border-radius: 100%; border: 0; position: absolute;top: -5px; right: -5px;background-color: white;"
                                            >
                                                <i class="bi bi-x fa-sm" />
                                            </button>
                                            {name.slice(0, 4) +
                                                ".." +
                                                id.slice(0, 4)}
                                        </div>
                                        ,
                                    {/each}
                                {/if}
                            </div>
                        </div>
                    </div>

                    <div style="flex: 1;">
                        <div class="px-2">
                            <h5>Select Tasklist</h5>
                            <input
                                bind:value={inputSearchTasklist}
                                on:keydown={() => {
                                    isSearchLoadingTasklist = true;
                                    clearTimeout(inputTimeoutTasklist);
                                }}
                                on:keyup={() => {
                                    clearTimeout(inputTimeoutTasklist);
                                    inputTimeoutTasklist = setTimeout(
                                        searchTasklist,
                                        300
                                    );
                                }}
                                class="form-control"
                                id="newListName"
                                type="text"
                                autocomplete="off"
                                placeholder="Search Tasklist name"
                            />
                            <div
                                class="my-2"
                                style="height: 200px; overflow: auto;"
                            >
                                {#if isSearchLoadingTasklist}
                                    <div class="d-flex justify-content-center">
                                        <div
                                            class="spinner-border"
                                            role="status"
                                        />
                                    </div>
                                {:else}
                                    {#each searchResultTasklist as { id, name }}
                                        <button
                                            class:border-success={Tasklist_list.find(
                                                (e) => e.id == id
                                            )}
                                            on:click={() => {
                                                if (
                                                    !Tasklist_list.find(
                                                        (e) => e.id == id
                                                    )
                                                ) {
                                                    Tasklist_list = [
                                                        ...Tasklist_list,
                                                        { id, name },
                                                    ];
                                                }
                                            }}
                                            class=" btn border p-2 w-100"
                                            style=""
                                        >
                                            <p
                                                class="m-0"
                                                style="text-align: left;"
                                            >
                                                Name : {name}
                                            </p>
                                            <p
                                                style="text-align: left;"
                                                class="m-0"
                                            >
                                                id : {id}
                                            </p>
                                        </button>
                                    {/each}
                                {/if}
                            </div>
                            <div style="height: 100px; overflow: auto;">
                                {#if Tasklist_list.length != 0}
                                    {#each Tasklist_list as { id, name }}
                                        <div
                                            style="display: inline-block;position: relative; width: fit-content;border: 1px solid gray; border-radius: 20px; padding: 2px;"
                                        >
                                            <button
                                                on:click={() => {
                                                    var index;
                                                    for (
                                                        let i = 0;
                                                        i <
                                                        Tasklist_list.length;
                                                        i++
                                                    ) {
                                                        if (
                                                            Tasklist_list[i]
                                                                .id == id
                                                        ) {
                                                            index = i;
                                                            break;
                                                        }
                                                    }

                                                    Tasklist_list.splice(
                                                        index,
                                                        1
                                                    );
                                                    Tasklist_list =
                                                        Tasklist_list;
                                                }}
                                                style="padding: 0; border-radius: 100%; border: 0; position: absolute;top: -5px; right: -5px;background-color: white;"
                                            >
                                                <i class="bi bi-x fa-sm" />
                                            </button>
                                            {name.slice(0, 4) + ".." + id}
                                        </div>
                                        ,
                                    {/each}
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- addCollaborators -->
                {#if isAddTeamMembersOpen}
                    <div
                        transition:fade
                        style="position: absolute;top: 0;left: 0;width: 100%;height: 100%; display: flex; justify-content: center; align-items: center;
                    background-color: rgba(0, 0, 0, 0.2); "
                    >
                        <div
                            transition:fly={{ y: -50, duration: 500 }}
                            class="modal-dialog"
                        >
                            <div class="modal-content" style="width: 500px;">
                                <div class="modal-header">
                                    <h5
                                        class="modal-title"
                                        id="staticBackdropLabel"
                                    >
                                        Assign team member to this request
                                    </h5>
                                </div>
                                <div class="modal-body">
                                    <h5>Select team members</h5>
                                    <input
                                        bind:value={inputSearchAdmin}
                                        on:keydown={() => {
                                            isSearchLoadingAdmin = true;
                                            clearTimeout(inputTimeoutAdmin);
                                        }}
                                        on:keyup={() => {
                                            clearTimeout(inputTimeoutAdmin);
                                            inputTimeoutAdmin = setTimeout(
                                                searchAdmin,
                                                300
                                            );
                                        }}
                                        class="form-control"
                                        id="selectAdmin"
                                        type="text"
                                        autocomplete="off"
                                        placeholder="Search admin name"
                                    />

                                    <div
                                        class="mt-2"
                                        style="min-height: 200px; overflow: auto;"
                                    >
                                        {#if isSearchLoadingAdmin}
                                            <div
                                                class="d-flex justify-content-center"
                                            >
                                                <div
                                                    class="spinner-border"
                                                    role="status"
                                                />
                                            </div>
                                        {:else}
                                            {#each searchResultAdmin as { id, name }}
                                                <button
                                                    class:border-success={admin_list.find(
                                                        (e) => e.id == id
                                                    )}
                                                    on:click={() => {
                                                        if (
                                                            !admin_list.find(
                                                                (e) =>
                                                                    e.id == id
                                                            )
                                                        ) {
                                                            admin_list = [
                                                                ...admin_list,
                                                                { id, name },
                                                            ];
                                                        }
                                                    }}
                                                    class=" btn border p-2 w-100"
                                                    style=""
                                                >
                                                    <p
                                                        class="m-0"
                                                        style="text-align: left;"
                                                    >
                                                        Name : {name}
                                                    </p>
                                                    <p
                                                        style="text-align: left;"
                                                        class="m-0"
                                                    >
                                                        id : {id}
                                                    </p>
                                                </button>
                                            {/each}
                                        {/if}
                                    </div>

                                    <div style="height: 50px; overflow: auto;">
                                        {#each admin_list as { id, name }}
                                            <div
                                                style="display: inline-block;position: relative; width: fit-content;border: 1px solid gray; border-radius: 20px; padding: 2px;"
                                            >
                                                <button
                                                    on:click={() => {
                                                        var index;
                                                        for (
                                                            let i = 0;
                                                            i <
                                                            admin_list.length;
                                                            i++
                                                        ) {
                                                            if (
                                                                admin_list[i]
                                                                    .id == id
                                                            ) {
                                                                index = i;
                                                                break;
                                                            }
                                                        }

                                                        admin_list.splice(
                                                            index,
                                                            1
                                                        );
                                                        admin_list = admin_list;
                                                    }}
                                                    style="padding: 0; border-radius: 100%; border: 0; position: absolute;top: -5px; right: -5px;background-color: white;"
                                                >
                                                    <i class="bi bi-x fa-sm" />
                                                </button>
                                                {name.slice(0, 4) +
                                                    ".." +
                                                    id.slice(0, 4)}
                                            </div>
                                            ,
                                        {/each}
                                    </div>
                                </div>

                                <div class="modal-footer">
                                    <button
                                        on:click={() => {
                                            isAddTeamMembersOpen = false;
                                        }}
                                        type="button"
                                        class="btn btn-secondary">Close</button
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}

                <!-- addCollaborators -->
            </div>

            <div class="modal-footer">
                <button
                    type="button"
                    class="btn btn-secondary"
                    on:click={() => {
                        dispatch("close");
                    }}>Close</button
                >
                <button
                    disabled={verifier_list.length == 0 ||
                        Tasklist_list.length == 0}
                    on:click={async () => {
                        if (!$jq("#newListForm")[0].checkValidity()) {
                            $jq("#newListForm").find("#submit-hidden").click();
                        } else {
                            await createRequest();
                            dispatch("close");
                        }
                    }}
                    type="button"
                    class="btn btn-primary"
                    >Send request
                </button>
            </div>
        </div>
    </div>
</div>
