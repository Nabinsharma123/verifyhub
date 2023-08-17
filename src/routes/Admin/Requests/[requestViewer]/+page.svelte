<script>
    import { onMount } from "svelte";
    import { jq, globalSupabase, fetchRequestlist } from "../../../../store";
    import { clickOutside } from "$lib/click_outside";
    import { createEventDispatcher } from "svelte";
    import AddNewVerifierTasklistAdmin from "$lib/Admin/AddNewVerifierTasklistAdmin.svelte";
    import DeleteVerifierTasklistAdmin from "$lib/Admin/DeleteVerifierTasklistAdmin.svelte";
    import ViewSubmittedData from "$lib/Admin/ViewSubmittedData.svelte";
    import DeletePopup from "$lib/Admin/DeletePopup.svelte";
    import SubmittedDataInfo from "$lib/Admin/SubmittedDataInfo.svelte";
    import Loading from "$lib/Component/Loading.svelte";
    import Card from "$lib/Card.svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import PrintableFormat from "$lib/Admin/PrintableFormat.svelte";

    const dispatch = createEventDispatcher();

    // export let name, id, type, status;
    var requestId = $page.params.requestViewer;
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
    var fullLoading = false;
    var submittedDataInfo;
    var printableFormat = false;

    onMount(async () => {
        // $jq("#RequestViewer").modal("show");
        getTasklist_VerifierList();
    });

    async function getTasklist_VerifierList() {
        const { data, error } = await $globalSupabase
            .from("verification_request")
            .select(
                "name,status,request_tasklist(tasklist(name,id)),request_verifier(verifier(name,id,avatar_url)),admin(name,id),created_at,assigned_request_to_admin(admin(id,name,avatar_url))"
            )
            .eq("id", requestId)
            .single();

        if (error) console.log(error);
        else {
            assignedAdmin = [];
            data.assigned_request_to_admin.forEach((e) => {
                assignedAdmin = [...assignedAdmin, e.admin];
            });

            requestInfo = {
                admin_name: data.admin.name,
                admin_id: data.admin.id,
                created_at: data.created_at,
                name: data.name,
                status: data.status,
            };

            var dateObj = new Date(requestInfo.created_at);
            requestInfo.created_at = {
                date: `${dateObj.getFullYear()}-${
                    dateObj.getMonth() + 1
                }-${dateObj.getDate()}`,
                time: `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`,
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
            .select("id,verifier(name,id,avatar_url)")
            .match({
                request_id: requestId,
                tasklist_id: tasklistId,
                status: "submitted",
            });
        submissionDetail.data = [];
        if (error) console.log(error);
        else {
            data.map((e) => {
                submissionDetail.data = [
                    ...submissionDetail.data,
                    { ...e, tasklistId },
                ];
            });
        }
    }

    async function deleteRequest() {
        fullLoading = true;
        var res = await fetch("/API/admin/deleteRequest", {
            method: "POST",
            body: JSON.stringify({
                request_id: requestId,
            }),
            headers: {
                "content-type": "application/json",
            },
        });
        console.log(await res.json());
        await fetchRequestlist(true);
        fullLoading = false;
        goto(`/Admin/Requests/`);
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
            .select(
                "verifier(name),tasklist(id,name),status,submitted_json_data"
            )
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
            for (var key in entry.submitted_json_data) {
                if (entry.submitted_json_data[key].type == "file") {
                    submissionData[key] = {
                        t: "s",
                        v: key,
                        l: {
                            Target: $globalSupabase.storage
                                .from("Request")
                                .getPublicUrl(
                                    entry.submitted_json_data[key].data
                                ).data.publicUrl,
                        },
                    };
                } else {
                    submissionData[key] = {
                        s: { font: { bold: false } },
                        v: entry.submitted_json_data[key].data,
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
        XLSX.writeFile(workbook, `${requestInfo.name}.xlsx`, {
            compression: true,
        });

        console.log(tasklistNames);
    }

    async function changeStatus() {
        const { error } = await $globalSupabase
            .from("verification_request")
            .update({
                status: requestInfo.status === "Active" ? "Closed" : "Active",
            })
            .eq("id", requestId);
        console.log(error);
    }
</script>

<div class="content-header d-flex pb-4 pt-0 pl-0">
    <h1 class="m-0">{requestInfo.name}</h1>
    {#if requestInfo.status}
        <span
            class="modal-title ml-2 badge badge-warning"
            style="font-size: larger;">{requestInfo.status}</span
        >
    {/if}
</div>

<div>
    <div class="card p-3">
        <div>
            <div class="d-flex justify-content-between align-items-center m-1">
                <h5>Submission</h5>
                <!-- <button
                                on:click={() => {
                                    exportSheet();
                                }}
                                type="button"
                                class="btn btn-success"
                            >
                                <i class="bi bi-download" />
                                Export as excel</button
                            > -->
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
                                    <i class="bi bi-file-earmark-text fa-2x" />

                                    <h6 class="m-0">{name}</h6>
                                </div>
                                <div>
                                    <i class="bi bi-chevron-right" />
                                </div>
                            </button>
                        {/each}
                    {:else}
                        <div class="d-flex justify-content-center">
                            <div class="spinner-border" role="status" />
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
                                <div
                                    class="p-2 w-100 mb-2 border rounded-lg d-flex justify-content-between align-items-center"
                                    style="text-align: left;"
                                >
                                    <div class="d-flex align-items-center">
                                        <img
                                            class="mr-2"
                                            style="height: 48px;border-radius: 10px;"
                                            src={data.verifier.avatar_url}
                                            alt=""
                                        />
                                        <h6 class="m-0">
                                            {data.verifier.name}
                                        </h6>
                                    </div>

                                    <div>
                                        <button
                                            on:click={() => {
                                                printableFormat = {
                                                    verifier_tasklist_id:
                                                        data.id,
                                                    verifier_name:
                                                        data.verifier.name,
                                                    verifier_id:
                                                        data.verifier.id,
                                                    tasklistId: data.tasklistId,
                                                };
                                            }}
                                            class="btn btn-success btn-sm mr-2"
                                        >
                                            <i class="fas fa-folder" />
                                            View
                                        </button>
                                        <button
                                            on:click={() => {
                                                verifierSubmittedData = {
                                                    verifier_tasklist_id:
                                                        data.id,
                                                    verifier_name:
                                                        data.verifier.name,
                                                    verifier_id:
                                                        data.verifier.id,
                                                    tasklistId: data.tasklistId,
                                                };
                                            }}
                                            class="btn btn-primary btn-sm mr-2"
                                            href="#"
                                        >
                                            <i class="bi bi-pencil-square" />
                                            Edit
                                        </button>
                                        <button
                                            on:click={() => {
                                                submittedDataInfo = {
                                                    verifier_tasklist_id:
                                                        data.id,
                                                    verifier_name:
                                                        data.verifier.name,
                                                    verifier_id:
                                                        data.verifier.id,
                                                    tasklist_id:
                                                        data.tasklistId,
                                                    request_id: requestId,
                                                };
                                            }}
                                            class="btn btn-info btn-sm"
                                            href="#"
                                        >
                                            <i class="bi bi-info-circle" />
                                            Info
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        {:else}
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border" role="status" />
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
                    </div>
                    <hr class="mt-1" />
                    <div style="max-height: 200px;overflow: auto;">
                        {#if requestVerifierList}
                            {#each requestVerifierList as { name, avatar_url }}
                                <div
                                    class=" d-flex align-items-center border rounded p-2"
                                    style="gap: 10px;"
                                >
                                    <img
                                        style="height: 48px;border-radius: 10px;"
                                        src={avatar_url}
                                        alt=""
                                    />

                                    <p class="m-0" style="text-align: center;">
                                        {name}
                                    </p>
                                </div>
                            {/each}
                        {:else}
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border" role="status" />
                            </div>
                        {/if}
                    </div>
                </div>
                <div class="ml-2" style="flex: 1;">
                    <div
                        class="d-flex justify-content-between align-items-center"
                    >
                        <h6>Tasklists</h6>

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
                    </div>
                    <hr class="mt-1" />
                    <div style="max-height: 200px;overflow: auto;">
                        {#if requestTasklist}
                            {#each requestTasklist as { name, id }}
                                <Card {name} />
                            {/each}
                        {:else}
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border" role="status" />
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
            <div class="mt-5 d-flex">
                <div class="border-right pr-2" style="flex: 1;">
                    <div
                        class="d-flex justify-content-between align-items-center"
                    >
                        <h6>Add other admin</h6>
                        <div class="d-flex" style="gap:5px">
                            <button
                                style=""
                                class="btn btn-sm btn-success font-weight-bold"
                                on:click={() => {
                                    addNew = {
                                        type: "admin",
                                        exlist: assignedAdmin.map((e) => e.id),
                                    };
                                }}
                                ><i class="bi bi-plus" /> Add admin
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
                    <div style="max-height: 200px;overflow: auto;">
                        {#if assignedAdmin}
                            {#each assignedAdmin as { name, avatar_url }}
                                <div
                                    class=" d-flex align-items-center border rounded p-2"
                                    style="gap: 10px;"
                                >
                                    <img
                                        style="height: 48px;border-radius: 10px;"
                                        src={avatar_url}
                                        alt=""
                                    />

                                    <p class="m-0" style="text-align: center;">
                                        {name}
                                    </p>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>

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
                                <td> Created at </td>
                                <td>
                                    <div>
                                        Date:- {requestInfo.created_at?.date}
                                    </div>
                                    <div>
                                        Time:- {requestInfo.created_at?.time}
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td>Description</td>
                                <td>---</td>
                            </tr>

                            <tr>
                                <td>Requester Name</td>
                                <td>{requestInfo.admin_name}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div style="display: flex; justify-content: end; gap: 5px;">
        <button
            on:click={async () => {
                fullLoading = true;
                await changeStatus();
                await fetchRequestlist(true);
                fullLoading = false;
                goto(`/Admin/Requests/`);
            }}
            class="btn btn-primary"
        >
            {requestInfo.status == "Closed" ? "Open request" : "Close request"}
        </button>
        <button
            on:click={() => {
                deletePopup = true;
            }}
            class="btn btn-danger">Delete</button
        >
    </div>

    {#if addNew}
        <AddNewVerifierTasklistAdmin
            on:close={async () => {
                addNew = false;
            }}
            on:added={async () => {
                addNew = false;
                fullLoading = true;
                await getTasklist_VerifierList();
                fullLoading = false;
            }}
            type={addNew.type}
            req_id={requestId}
            exlist={addNew.exlist}
        />
    {/if}

    {#if deleteList}
        <DeleteVerifierTasklistAdmin
            on:deleted={async () => {
                deleteList = false;
                fullLoading = true;
                await getTasklist_VerifierList();
                fullLoading = false;
            }}
            on:close={() => {
                deleteList = false;
            }}
            type={deleteList.type}
            req_id={requestId}
            exlist={deleteList.exlist}
        />
    {/if}

    {#if verifierSubmittedData}
        <ViewSubmittedData
            on:close={() => {
                verifierSubmittedData = false;
            }}
            {...verifierSubmittedData}
            requestName={requestInfo.name}
            {requestId}
        />
    {/if}
    {#if printableFormat}
        <PrintableFormat
            on:close={() => {
                printableFormat = false;
            }}
            {...printableFormat}
            requestName={requestInfo.name}
            {requestId}
        />
    {/if}

    {#if submittedDataInfo}
        <SubmittedDataInfo
            on:close={() => {
                submittedDataInfo = false;
            }}
            {...submittedDataInfo}
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

    {#if fullLoading}
        <Loading />
    {/if}
</div>
