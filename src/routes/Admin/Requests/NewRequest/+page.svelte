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

<div class="">
    {#if requestCreateloading}
        <div
            style="z-index: 50; position: absolute;width: 100%;height: 100%;background-color: rgba(255, 255, 255, 0.5);"
            class="d-flex justify-content-center align-items-center"
        >
            <div class="spinner-border" role="status" />
        </div>
    {/if}

    <div class=" d-flex" style="gap: 10px;">
        <div class="d-flex align-items-center" style="flex: 3;">
            <h5 class="modal-title mr-2" id="staticBackdropLabel">Name:</h5>
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
                <input id="submit-hidden" type="submit" style="display: none" />
            </form>
        </div>
    </div>

    <div class="mt-5" style="">
        <div class=" d-flex justify-content-around">
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
                    <div class="my-2" style="height: 200px; overflow: auto;">
                        {#if isSearchLoadingVerifier}
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border" role="status" />
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
                                    <p class="m-0" style="text-align: left;">
                                        Name : {name}
                                    </p>
                                    <p style="text-align: left;" class="m-0">
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
                                                i < verifier_list.length;
                                                i++
                                            ) {
                                                if (verifier_list[i].id == id) {
                                                    index = i;
                                                    break;
                                                }
                                            }

                                            verifier_list.splice(index, 1);
                                            verifier_list = verifier_list;
                                        }}
                                        style="padding: 0; border-radius: 100%; border: 0; position: absolute;top: -5px; right: -5px;background-color: white;"
                                    >
                                        <i class="bi bi-x fa-sm" />
                                    </button>
                                    {name.slice(0, 4) + ".." + id.slice(0, 4)}
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
                    <div class="my-2" style="height: 200px; overflow: auto;">
                        {#if isSearchLoadingTasklist}
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border" role="status" />
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
                                    <p class="m-0" style="text-align: left;">
                                        Name : {name}
                                    </p>
                                    <p style="text-align: left;" class="m-0">
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
                                                i < Tasklist_list.length;
                                                i++
                                            ) {
                                                if (Tasklist_list[i].id == id) {
                                                    index = i;
                                                    break;
                                                }
                                            }

                                            Tasklist_list.splice(index, 1);
                                            Tasklist_list = Tasklist_list;
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
        <hr />

        <!-- addCollaborators -->

        <div class="d-flex mt-3">
            <div style="flex: 1; border-right: 1px solid gray;">
                <div class="px-2">
                    <h5>Add admins to this request</h5>
                    <input
                        bind:value={inputSearchAdmin}
                        on:keydown={() => {
                            isSearchLoadingAdmin = true;
                            clearTimeout(inputTimeoutAdmin);
                        }}
                        on:keyup={() => {
                            clearTimeout(inputTimeoutAdmin);
                            inputTimeoutAdmin = setTimeout(searchAdmin, 300);
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
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border" role="status" />
                            </div>
                        {:else}
                            {#each searchResultAdmin as { id, name }}
                                <button
                                    class:border-success={admin_list.find(
                                        (e) => e.id == id
                                    )}
                                    on:click={() => {
                                        if (
                                            !admin_list.find((e) => e.id == id)
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
                                    <p class="m-0" style="text-align: left;">
                                        Name : {name}
                                    </p>
                                    <p style="text-align: left;" class="m-0">
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
                                            i < admin_list.length;
                                            i++
                                        ) {
                                            if (admin_list[i].id == id) {
                                                index = i;
                                                break;
                                            }
                                        }

                                        admin_list.splice(index, 1);
                                        admin_list = admin_list;
                                    }}
                                    style="padding: 0; border-radius: 100%; border: 0; position: absolute;top: -5px; right: -5px;background-color: white;"
                                >
                                    <i class="bi bi-x fa-sm" />
                                </button>
                                {name.slice(0, 4) + ".." + id.slice(0, 4)}
                            </div>
                            ,
                        {/each}
                    </div>
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
                // if (!$jq("#newListForm")[0].checkValidity()) {
                //     $jq("#newListForm").find("#submit-hidden").click();
                // } else {
                //     await createRequest();
                //     dispatch("close");
                // }
                addPrefillDataModel = {
                    verifier_id: structuredClone(verifier_list),
                    tasklist_id: Tasklist_list.map((e) => e.id),
                };

                console.log(addPrefillDataModel);
            }}
            type="button"
            class="btn btn-primary"
            >Next
        </button>
    </div>
</div>

<!-- Admin prefill Data -->
{#if addPrefillDataModel}
    <AdminTasklistPrefill
        data={addPrefillDataModel}
        on:close={() => {
            $jq("#addPrefillDataModel").modal("hide");
            setTimeout(() => {
                addPrefillDataModel = false;
            }, 300);
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
