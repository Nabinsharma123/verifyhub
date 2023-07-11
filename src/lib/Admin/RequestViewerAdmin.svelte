<script>
    import { onMount } from "svelte";
    import { jq, globalSupabase, fetchRequestlist } from "../../store";
    import { clickOutside } from "$lib/click_outside";
    import { createEventDispatcher } from "svelte";
    import AddNewVerifierTasklistAdmin from "./AddNewVerifierTasklistAdmin.svelte";
    import DeleteVerifierTasklistAdmin from "./DeleteVerifierTasklistAdmin.svelte";
    import ViewSubmittedData from "./ViewSubmittedData.svelte";
    import DeletePopup from "./DeletePopup.svelte";

    const dispatch = createEventDispatcher();

    export let name, id, type;
    var loading = true;
    var requestTasklist = false;
    var requestVerifierList = false;
    var submissionDetail = { name: "", data: false };
    var submissionData = { name: "", data: false };
    var requestInfo = {};
    var assignedAdmin = [];
    var addNew = false;
    var deleteList = false;
    var verifierSubmittedData = false;
    var deletePopup = false;
    var deleteLoading = false;

    onMount(async () => {
        $jq("#RequestViewer").modal("show");

        getTasklist_VerifierList();
    });

    async function getTasklist_VerifierList() {
        const { data, error } = await $globalSupabase
            .from("verification_request")
            .select(
                "request_tasklist(tasklist(name,id)),request_verifier(verifier(name,id)),admin(name,id),created_at,assigned_request_to_admin(admin(id,name))"
            )
            .eq("id", id)
            .single();

        if (error) console.log(error);
        else {
            data.assigned_request_to_admin.forEach((e) => {
                assignedAdmin = [...assignedAdmin, e.admin];
            });

            requestInfo = {
                admin_name: data.admin.name,
                admin_id: data.admin.id,
                date: data.created_at,
                name: name,
            };

            requestTasklist = [];
            data.request_tasklist.map((e) => {
                requestTasklist = [...requestTasklist, e.tasklist];
            });
            // console.log(requestTasklist);
            getSubmissionDetails(
                requestTasklist[0].name,
                requestTasklist[0].id
            );

            requestVerifierList = [];
            data.request_verifier.map((e) => {
                requestVerifierList = [...requestVerifierList, e.verifier];
            });
        }
    }

    async function getSubmissionDetails(tasklistName, tasklistId) {
        submissionData = { name: "", data: false };
        submissionDetail.data = false;
        submissionDetail.name = tasklistName;
        const { data, error } = await $globalSupabase
            .from("verifier_tasklist")
            .select("id,verifier(name,id)")
            .match({
                request_id: id,
                tasklist_id: tasklistId,
                status: "submitted",
            });
        submissionDetail.data = [];
        if (error) console.log(error);
        else {
            data.map((e) => {
                submissionDetail.data = [...submissionDetail.data, e];
            });
        }
    }

    async function deleteRequest() {
        deleteLoading = true;
        var res = await fetch("/API/admin/deleteRequest", {
            method: "POST",
            body: JSON.stringify({
                request_id: id,
            }),
            headers: {
                "content-type": "application/json",
            },
        });
        console.log(await res.json());
        await fetchRequestlist(true);
        deleteLoading = false;
        dispatch("close");
        // const { error } = await $globalSupabase
        //     .from("verification_request")
        //     .delete()
        //     .eq("id", id);
        // if (error) console.log(error);
        // else {
        // }
    }

    async function exportSheet() {
        const { data, error } = await $globalSupabase
            .from("verifier_tasklist")
            .select("verifier(name),tasklist(name),status,submitted_JSON_data")
            .eq("request_id", id);

        if (error) console.log(error);
        else console.log(data);

        var tasklistNames = {};
        data.forEach((entry) => {
            // if (!tasklistNames.find((e) => e.name == entry.tasklist.name)) {
            //     tasklistNames = [
            //         ...tasklistNames,
            //         { name: entry.tasklist.name },
            //     ];
            // }

            if (!tasklistNames.hasOwnProperty(entry.tasklist.name)) {
                tasklistNames[entry.tasklist.name] = [];
            }

            var submissionData = {};
            for (var key in entry.submitted_JSON_data) {
                if (entry.submitted_JSON_data[key].type == "file") {
                    submissionData[key] = {
                        t: "s",
                        v: key,
                        l: {
                            Target: $globalSupabase.storage
                                .from("Request")
                                .getPublicUrl(
                                    entry.submitted_JSON_data[key].data
                                ).data.publicUrl,
                        },
                    };
                } else {
                    submissionData[key] = {
                        s: { font: { bold: false } },
                        v: entry.submitted_JSON_data[key].data,
                    };
                }
            }
            tasklistNames[entry.tasklist.name] = [
                ...tasklistNames[entry.tasklist.name],
                {
                    VerifierName: entry.verifier.name,
                    status: entry.status,
                    ...submissionData,
                },
            ];
        });

        const workbook = XLSX.utils.book_new();
        for (var key in tasklistNames) {
            const worksheet = XLSX.utils.json_to_sheet(tasklistNames[key]);
            XLSX.utils.book_append_sheet(workbook, worksheet, key);
        }
        XLSX.writeFile(workbook, `${name}.xlsx`, { compression: true });

        console.log(tasklistNames);
    }
</script>

<div
    class="modal fade"
    id="RequestViewer"
    data-keyboard="false"
    tabindex="-1"
    aria-labelledby="staticBackdropLabel"
    aria-hidden="true"
    data-backdrop="static"
>
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" style="width: 1100px;position: relative;">
            <div class="modal-header">
                <h4 class="modal-title" id="staticBackdropLabel">{name}</h4>
                <button
                    on:click={() => {
                        dispatch("close");
                    }}
                    type="button"
                    class="close"
                    data-dismiss="modal"
                    aria-label="Close"
                >
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body" style="position: static;">
                <div class="">
                    <div>
                        <div
                            class="d-flex justify-content-between align-items-center m-1"
                        >
                            <h5>Submission</h5>
                            <button
                                on:click={() => {
                                    exportSheet();
                                }}
                                type="button"
                                class="btn btn-success"
                            >
                                <i class="bi bi-download" />
                                Export as excel</button
                            >
                        </div>
                        <hr class="m-0" />
                        <div class="d-flex">
                            <div
                                class="pt-2 pr-2"
                                style="min-height: 300px;overflow: auto; flex: 1;border-right: 1px solid gray;"
                            >
                                {#if requestTasklist}
                                    {#each requestTasklist as { name, id }}
                                        <button
                                            on:click={() => {
                                                getSubmissionDetails(name, id);
                                            }}
                                            class="p-2 w-100 mb-2 border rounded-lg d-flex justify-content-between align-items-center"
                                        >
                                            <div
                                                class="d-flex align-items-center"
                                                style="gap: 10px;"
                                            >
                                                <i
                                                    class="bi bi-file-earmark-text fa-2x"
                                                />

                                                <h6 class="m-0">{name}</h6>
                                            </div>
                                            <div>
                                                <i
                                                    class="bi bi-chevron-right"
                                                />
                                            </div>
                                        </button>
                                    {/each}
                                {:else}
                                    <div class="d-flex justify-content-center">
                                        <div
                                            class="spinner-border"
                                            role="status"
                                        />
                                    </div>
                                {/if}
                            </div>
                            <div class="ml-2" style="flex: 3;">
                                <h6 class="mt-1">
                                    Submission for {submissionDetail.name}
                                </h6>
                                <hr class="m-0" />
                                <div
                                    class="pt-2 pr-2"
                                    style="min-height: 300px;overflow: auto; flex: 1;"
                                >
                                    {#if submissionDetail.data}
                                        {#each submissionDetail.data as data}
                                            <button
                                                on:click={() => {
                                                    verifierSubmittedData = {
                                                        verifier_tasklist_id:
                                                            data.id,
                                                        verifier_name:
                                                            data.verifier.name,
                                                    };
                                                }}
                                                class="p-2 w-100 mb-2 border rounded-lg d-flex justify-content-between align-items-center"
                                                style="text-align: left;"
                                            >
                                                <div>
                                                    <h6>
                                                        {data.verifier.name}
                                                    </h6>
                                                    <p class="m-0">
                                                        {data.verifier.id}
                                                    </p>
                                                </div>
                                                <div>
                                                    <i
                                                        class="bi bi-chevron-right"
                                                    />
                                                </div>
                                            </button>
                                        {/each}
                                    {:else}
                                        <div
                                            class="d-flex justify-content-center"
                                        >
                                            <div
                                                class="spinner-border"
                                                role="status"
                                            />
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4">
                        <h5>Request Details</h5>
                        <hr class="mt-0" />
                        <div class="d-flex">
                            <div class="border-right pr-2" style="flex:1;">
                                <div
                                    class="d-flex justify-content-between align-items-center"
                                >
                                    <h6>Verifiers</h6>
                                    {#if type == "owner"}
                                        <div class="d-flex" style="gap:5px">
                                            <button
                                                style=""
                                                class="btn btn-sm btn-success font-weight-bold"
                                                on:click={() => {
                                                    addNew = {
                                                        type: "verifier",
                                                        exlist: requestVerifierList.map(
                                                            (e) => e.id
                                                        ),
                                                    };
                                                }}
                                                ><i class="bi bi-plus" /> Add Verifiers
                                            </button>
                                            <button
                                                style=""
                                                class="btn btn-sm btn-danger font-weight-bold"
                                                on:click={() => {
                                                    deleteList = {
                                                        type: "verifier",
                                                        exlist: requestVerifierList,
                                                    };
                                                }}
                                                ><i class="bi bi-dash" /> Delete
                                            </button>
                                        </div>
                                    {/if}
                                </div>
                                <hr class="mt-1" />
                                <div style="max-height: 200px;overflow: auto;">
                                    {#if requestVerifierList}
                                        {#each requestVerifierList as { name, id }}
                                            <div
                                                class="p-2 mb-2 border rounded-lg"
                                            >
                                                <h6>{name}</h6>
                                                <p class="m-0">
                                                    {id}
                                                </p>
                                            </div>
                                        {/each}
                                    {:else}
                                        <div
                                            class="d-flex justify-content-center"
                                        >
                                            <div
                                                class="spinner-border"
                                                role="status"
                                            />
                                        </div>
                                    {/if}
                                </div>
                            </div>
                            <div class="ml-2" style="flex: 1;">
                                <div
                                    class="d-flex justify-content-between align-items-center"
                                >
                                    <h6>Tasklists</h6>
                                    {#if type == "owner"}
                                        <div class="d-flex" style="gap:5px">
                                            <button
                                                style=""
                                                class="btn btn-sm btn-success font-weight-bold"
                                                on:click={() => {
                                                    addNew = {
                                                        type: "tasklist",
                                                        exlist: requestTasklist.map(
                                                            (e) => e.id
                                                        ),
                                                    };
                                                }}
                                                ><i class="bi bi-plus" /> Add Tasklist
                                            </button>
                                            <button
                                                style=""
                                                class="btn btn-sm btn-danger font-weight-bold"
                                                on:click={() => {
                                                    deleteList = {
                                                        type: "tasklist",
                                                        exlist: requestTasklist,
                                                    };
                                                }}
                                                ><i class="bi bi-dash" /> Delete
                                            </button>
                                        </div>
                                    {/if}
                                </div>
                                <hr class="mt-1" />
                                <div style="max-height: 200px;overflow: auto;">
                                    {#if requestTasklist}
                                        {#each requestTasklist as { name, id }}
                                            <button class="border-0 bg-white">
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
                                                    <h6>{name}</h6>
                                                </div>
                                            </button>
                                        {/each}
                                    {:else}
                                        <div
                                            class="d-flex justify-content-center"
                                        >
                                            <div
                                                class="spinner-border"
                                                role="status"
                                            />
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </div>
                        <div class="mt-5 d-flex">
                            {#if type == "owner"}
                                <div class="border-right pr-2" style="flex: 1;">
                                    <div
                                        class="d-flex justify-content-between align-items-center"
                                    >
                                        <h6>Assigned team members</h6>
                                        <div class="d-flex" style="gap:5px">
                                            <button
                                                style=""
                                                class="btn btn-sm btn-success font-weight-bold"
                                                on:click={() => {
                                                    addNew = {
                                                        type: "admin",
                                                        exlist: assignedAdmin.map(
                                                            (e) => e.id
                                                        ),
                                                    };
                                                }}
                                                ><i class="bi bi-plus" /> Add member
                                            </button>
                                            <button
                                                style=""
                                                class="btn btn-sm btn-danger font-weight-bold"
                                                on:click={() => {
                                                    deleteList = {
                                                        type: "admin",
                                                        exlist: assignedAdmin,
                                                    };
                                                }}
                                                ><i class="bi bi-dash" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                    <hr class="mt-1" />
                                    <div
                                        style="max-height: 200px;overflow: auto;"
                                    >
                                        {#if assignedAdmin}
                                            {#each assignedAdmin as { name, id }}
                                                <div
                                                    class="p-2 mb-2 border rounded-lg d-flex justify-content-between align-items-center"
                                                >
                                                    <div>
                                                        <h6>{name}</h6>
                                                        <p class="m-0">
                                                            {id}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <i
                                                            class="bi bi-chevron-right"
                                                        />
                                                    </div>
                                                </div>
                                            {/each}
                                        {/if}
                                    </div>
                                </div>
                            {/if}

                            <div class="ml-2" style="flex: 1;">
                                <h6>Request info</h6>
                                <hr class="mt-0" />
                                <table class="table table-striped">
                                    <tbody>
                                        <tr>
                                            <td>Request name</td>
                                            <td>{requestInfo.name}</td>
                                        </tr>
                                        <tr>
                                            <td
                                                >{type == "owner"
                                                    ? "Created at"
                                                    : "Assigned Date"}</td
                                            >
                                            <td>{requestInfo.date}</td>
                                        </tr>

                                        <tr>
                                            <td>Description</td>
                                            <td>---</td>
                                        </tr>
                                        {#if type == "assigned"}
                                            <tr>
                                                <td>Requester Name</td>
                                                <td>{requestInfo.admin_name}</td
                                                >
                                            </tr>
                                            <tr>
                                                <td>Requester Id</td>
                                                <td>{requestInfo.admin_id}</td>
                                            </tr>
                                        {/if}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                {#if type == "owner"}
                    <div style="display: flex; justify-content: end;">
                        <button
                            on:click={() => {
                                deletePopup = true;
                            }}
                            class="btn btn-danger">Delete</button
                        >
                    </div>
                {/if}
                {#if addNew}
                    <AddNewVerifierTasklistAdmin
                        on:close={() => {
                            addNew = false;
                        }}
                        type={addNew.type}
                        req_id={id}
                        exlist={addNew.exlist}
                    />
                {/if}

                {#if deleteList}
                    <DeleteVerifierTasklistAdmin
                        on:close={() => {
                            deleteList = false;
                        }}
                        type={deleteList.type}
                        req_id={id}
                        exlist={deleteList.exlist}
                    />
                {/if}

                {#if verifierSubmittedData}
                    <ViewSubmittedData
                        on:close={() => {
                            verifierSubmittedData = false;
                        }}
                        {...verifierSubmittedData}
                        requestName={name}
                    />
                {/if}

                {#if deletePopup}
                    <DeletePopup
                        on:close={() => {
                            deletePopup = false;
                        }}
                        on:delete={deleteRequest}
                    />
                {/if}
                {#if deleteLoading}
                    <div
                        style=" position: absolute;top: 0;left: 0;width: 100%;height: 100%; display: flex; justify-content: center; align-items: center;
                        background-color: rgba(255, 255, 255, 0.7); "
                    >
                        <div class="spinner-border" role="status" />
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
