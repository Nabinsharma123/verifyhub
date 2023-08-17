<script>
    import { onMount } from "svelte";
    import {
        globalSupabase,
        userData,
        fetchRequestlist,
        requestlist,
        jq,
    } from "../../../../store";

    import { createEventDispatcher } from "svelte";
    import { fade, fly } from "svelte/transition";
    import AdminTasklistPrefill from "../../../../lib/Admin/AdminTasklistPrefill.svelte";
    import { goto } from "$app/navigation";
    import Loading from "../../../../lib/Component/Loading.svelte";
    const dispatch = createEventDispatcher();

    var inputTimeoutVerifier;
    var searchResultVerifier = [];
    var inputSearchVerifier = "";
    var isSearchLoadingVerifier;
    var verifier_list = [];

    var inputTimeoutTasklist;
    var searchResultTasklist = [];
    var inputSearchTasklist = "";
    var isSearchLoadingTasklist;
    var Tasklist_list = [];

    var inputTimeoutAdmin;
    var searchResultAdmin = [];
    var inputSearchAdmin = "";
    var isSearchLoadingAdmin;
    var admin_list = [];

    var addPrefillDataModel = false;
    var requestCreateloading = false;
    var requestName = "";
    var prefillData;

    async function searchTasklist() {
        searchResultTasklist = [];

        if (inputSearchTasklist != "" && inputSearchTasklist != " ") {
            const { data, error } = await $globalSupabase
                .from("tasklist")
                .select("id,name")
                .eq("admin_id", $userData.id)
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
                .select("id,name,avatar_url")

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
                .select("id,name,avatar_url")
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
            prefill_data: prefillData,
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
        // const { data, error } = await $globalSupabase.rpc(
        //     "add_new_request",
        //     requestQuery
        // );

        console.log(requestQuery);

        const { data, error } = await $globalSupabase.functions.invoke(
            "hello-world",
            {
                body: requestQuery,
            }
        );

        if (error) console.log(error);
        else console.log(data);
        await fetchRequestlist(true);
        requestCreateloading = false;
    }
</script>

<div class="">
    <div class="content-header pb-4 pt-0 pl-0">
        <h1 class="m-0">New Request</h1>
    </div>
    {#if requestCreateloading}
        <Loading />
    {/if}

    <div class="card">
        <div class="card-body p-3 pt-4">
            <div class=" d-flex" style="gap: 10px;">
                <div class="d-flex align-items-center" style="flex: 3;">
                    <form
                        class="w-100"
                        id="newListForm"
                        on:submit={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <label
                            for="newListName"
                            class=""
                            id="staticBackdropLabel"
                        >
                            Name:
                        </label>
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
            </div>

            <div class="mt-3" style="position: relative;">
                <div class=" d-flex justify-content-around" style="gap: 20px;">
                    <div style="flex:1;position: relative;">
                        <label
                            for="newVerifierName"
                            class=""
                            id="staticBackdropLabel"
                        >
                            Select Verifier's
                        </label>

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
                            id="newVerifierName"
                            type="text"
                            autocomplete="off"
                            placeholder="Search Verifier"
                        />
                        {#if inputSearchVerifier != "" && inputSearchVerifier != ""}
                            <div
                                class="mt-2 w-100 shadow-lg p-3 bg-white rounded"
                                style="z-index: 20; min-height: 100px; overflow: auto;position: absolute;"
                            >
                                {#if isSearchLoadingVerifier}
                                    <div
                                        class="d-flex justify-content-center align-items-center"
                                        style="min-height: inherit"
                                    >
                                        <div
                                            class="spinner-border"
                                            role="status"
                                        />
                                    </div>
                                {:else if searchResultVerifier.length == 0}
                                    <div
                                        class="d-flex justify-content-center align-items-center h-100"
                                    >
                                        <h6>No result</h6>
                                    </div>
                                {:else}
                                    {#each searchResultVerifier as { id, name, avatar_url }}
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
                                                        {
                                                            id,
                                                            name,
                                                            avatar_url,
                                                        },
                                                    ];
                                                    inputSearchVerifier = "";
                                                }
                                            }}
                                            class="searchResultBtn btn rounded p-2 w-100 mb-1"
                                            style="height: 70px;"
                                        >
                                            <div
                                                class=" d-flex align-items-center"
                                                style="gap: 10px;"
                                            >
                                                <img
                                                    style="height: 48px;border-radius: 10px;"
                                                    src={avatar_url}
                                                    alt=""
                                                />

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
                        <div
                            class="mt-2"
                            style=" height: 150px; overflow: auto; "
                        >
                            {#each verifier_list as { id, name, avatar_url }}
                                <div
                                    style=" width: fit-content; display: inline-block;border: 1px solid gray; border-radius: 20px; "
                                >
                                    <div class="d-flex align-items-center p-1">
                                        <img
                                            class="rounded-circle"
                                            style="height: 30px;"
                                            src={avatar_url}
                                            alt=""
                                        />
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
                                                    i < verifier_list.length;
                                                    i++
                                                ) {
                                                    if (
                                                        verifier_list[i].id ==
                                                        id
                                                    ) {
                                                        index = i;
                                                        break;
                                                    }
                                                }

                                                verifier_list.splice(index, 1);
                                                verifier_list = verifier_list;
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

                    <div style="flex: 1;position: relative;">
                        <label
                            for="newTasklistName"
                            class=""
                            id="staticBackdropLabel"
                        >
                            Select Tasklist
                        </label>
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
                            id="newTasklistName"
                            type="text"
                            autocomplete="off"
                            placeholder="Search Tasklist"
                        />

                        {#if inputSearchTasklist != "" && inputSearchTasklist != " "}
                            <div
                                class="mt-2 w-100 shadow-lg p-3 bg-white rounded"
                                style="z-index: 20; min-height: 100px; overflow: auto;position: absolute;"
                            >
                                {#if isSearchLoadingTasklist}
                                    <div
                                        class="d-flex justify-content-center align-items-center"
                                        style="min-height: inherit"
                                    >
                                        <div
                                            class="spinner-border"
                                            role="status"
                                        />
                                    </div>
                                {:else if searchResultTasklist.length == 0}
                                    <div
                                        class="d-flex justify-content-center align-items-center h-100"
                                    >
                                        <h6>No result</h6>
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
                                                    inputSearchTasklist = "";
                                                }
                                            }}
                                            class="searchResultBtn btn rounded p-2 w-100 mb-1"
                                            style="height: 70px;"
                                        >
                                            <div
                                                class=" d-flex align-items-center"
                                                style="gap: 10px;"
                                            >
                                                <img
                                                    style="height: 48px;border-radius: 10px;"
                                                    src="/documentIcon.svg"
                                                    alt=""
                                                />

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

                        <div
                            class="mt-2"
                            style=" height: 150px; overflow: auto; "
                        >
                            {#each Tasklist_list as { id, name }}
                                <div
                                    style=" width: fit-content; display: inline-block;border: 1px solid gray; border-radius: 20px; "
                                >
                                    <div class="d-flex align-items-center p-1">
                                        <img
                                            class="rounded-circle"
                                            style="height: 30px;"
                                            src="/documentIcon.svg"
                                            alt=""
                                        />
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
                                                    i < Tasklist_list.length;
                                                    i++
                                                ) {
                                                    if (
                                                        Tasklist_list[i].id ==
                                                        id
                                                    ) {
                                                        index = i;
                                                        break;
                                                    }
                                                }

                                                Tasklist_list.splice(index, 1);
                                                Tasklist_list = Tasklist_list;
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
                <hr />

                <!-- addCollaborators -->

                <div class="d-flex mt-3">
                    <div style="flex:1;position: relative;">
                        <label
                            for="newVerifierName"
                            class=""
                            id="staticBackdropLabel"
                        >
                            Select Admin's
                        </label>

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
                            id="newAdminName"
                            type="text"
                            autocomplete="off"
                            placeholder="Search Admin"
                        />
                        {#if inputSearchAdmin != "" && inputSearchAdmin != ""}
                            <div
                                class="mt-2 w-100 shadow-lg p-3 bg-white rounded"
                                style="z-index: 20; min-height: 100px; overflow: auto;position: absolute;"
                            >
                                {#if isSearchLoadingAdmin}
                                    <div
                                        class="d-flex justify-content-center align-items-center"
                                        style="min-height: inherit"
                                    >
                                        <div
                                            class="spinner-border"
                                            role="status"
                                        />
                                    </div>
                                {:else if searchResultAdmin.length == 0}
                                    <div
                                        class="d-flex justify-content-center align-items-center h-100"
                                    >
                                        <h6>No result</h6>
                                    </div>
                                {:else}
                                    {#each searchResultAdmin as { id, name, avatar_url }}
                                        <button
                                            class:border-success={admin_list.find(
                                                (e) => e.id == id
                                            )}
                                            on:click={() => {
                                                if (
                                                    !admin_list.find(
                                                        (e) => e.id == id
                                                    )
                                                ) {
                                                    admin_list = [
                                                        ...admin_list,
                                                        {
                                                            id,
                                                            name,
                                                            avatar_url,
                                                        },
                                                    ];
                                                    inputSearchAdmin = "";
                                                }
                                            }}
                                            class="searchResultBtn btn rounded p-2 w-100 mb-1"
                                            style="height: 70px;"
                                        >
                                            <div
                                                class=" d-flex align-items-center"
                                                style="gap: 10px;"
                                            >
                                                <img
                                                    style="height: 48px;border-radius: 10px;"
                                                    src={avatar_url}
                                                    alt=""
                                                />

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
                        <div
                            class="mt-2"
                            style=" height: 150px; overflow: auto; "
                        >
                            {#each admin_list as { id, name, avatar_url }}
                                <div
                                    style=" width: fit-content; display: inline-block;border: 1px solid gray; border-radius: 20px; "
                                >
                                    <div class="d-flex align-items-center p-1">
                                        <img
                                            class="rounded-circle"
                                            style="height: 30px;"
                                            src={avatar_url}
                                            alt=""
                                        />
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
                                                    i < admin_list.length;
                                                    i++
                                                ) {
                                                    if (
                                                        admin_list[i].id == id
                                                    ) {
                                                        index = i;
                                                        break;
                                                    }
                                                }

                                                admin_list.splice(index, 1);
                                                admin_list = admin_list;
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

                    <div style="flex: 1;" />
                </div>

                <!-- addCollaborators -->
            </div>

            <div class="d-flex justify-content-end">
                <!-- disabled={verifier_list.length == 0 || Tasklist_list.length == 0} -->
                <button
                    on:click={async () => {
                        if (!$jq("#newListForm")[0].checkValidity()) {
                            $jq("#newListForm").find("#submit-hidden").click();
                        } else {
                            addPrefillDataModel = {
                                verifier_id: structuredClone(verifier_list),
                                tasklist_id: Tasklist_list.map((e) => e.id),
                                requestName,
                            };

                            console.log(addPrefillDataModel);
                        }
                    }}
                    type="button"
                    class="btn btn-primary"
                    >Next
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Admin prefill Data -->
{#if addPrefillDataModel}
    <AdminTasklistPrefill
        data={addPrefillDataModel}
        on:close={() => {
            addPrefillDataModel = false;
        }}
        on:prefillData={async (e) => {
            console.log(e.detail);
            prefillData = e.detail;

            await createRequest();
            goto("/Admin/Requests");
        }}
    />
{/if}

<!-- Admin prefill Data -->

<style>
    .searchResultBtn:hover {
        background-color: #f4f6f9;
    }
</style>
