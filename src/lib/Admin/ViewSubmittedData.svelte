<script>
    import { fade, fly } from "svelte/transition";
    import { globalSupabase, userData } from "../../store";
    import { createEventDispatcher, onMount } from "svelte";
    const dispatch = createEventDispatcher();

    export var verifier_tasklist_id,
        verifier_id,
        verifier_name,
        requestName,
        requestId,
        tasklistId;
    var loading = true;

    var formData, formSubmittedData;
    var editMode = false;
    var form;

    var newEditedSubmissionData = {};

    onMount(async () => {
        const { data, error } = await $globalSupabase
            .from("verifier_tasklist")
            .select(
                "submitted_json_data,tasklist(JSON_data),request_id,tasklist_id,verifier_id"
            )
            .eq("id", verifier_tasklist_id)
            .single();

        if (error) console.log(error);
        else {
            console.log(data);

            // for (var key in data.submitted_json_data) {
            //     if (
            //         data.submitted_json_data[key].type == "file" &&
            //         data.submitted_json_data[key].data.length != 0
            //     ) {
            //         const { data: data1 } = $globalSupabase.storage
            //             .from("Request")
            //             .getPublicUrl(data.submitted_json_data[key].data);

            //         var res = await toDataURL(data1.publicUrl);

            //         data.submitted_json_data[key] = [
            //             {
            //                 url: res.url,
            //                 size: res.size,
            //                 name: key,
            //                 originalName: key,
            //                 storage: "base64",
            //             },
            //         ];
            //     } else {
            //         data.submitted_json_data[key] =
            //             data.submitted_json_data[key].data;
            //     }
            // }

            formData = data.tasklist.JSON_data;
            formSubmittedData = data.submitted_json_data;
        }

        console.log(formSubmittedData);

        loadform(true);

        loading = false;
    });

    async function loadform(readOnly) {
        form = await Formio.createForm(
            document.getElementById("formio"),
            formData,

            {
                hooks: {
                    addComponent: (component) => {
                        if (component.type == "file")
                            component.dir = `${requestId}/${tasklistId}/${verifier_id}`;
                        return component;
                    },
                },
                noAlerts: true,
                readOnly: readOnly,
            }
        );

        form.on("fileUploadingStart", () => {
            loading = true;
        });
        form.on("fileUploadingEnd", () => {
            loading = false;
        });

        form.ready.then(async () => {
            form.submission = {
                data: formSubmittedData,
            };

            // setTimeout(() => {
            //     form.on("change", (e) => {
            //         console.log(e);
            //         newEditedSubmissionData[e.changed.component.key] = {
            //             type: e.changed.component.type,
            //             name: e.changed.component.label,
            //             data: e.changed.value,
            //         };
            //         console.log(newEditedSubmissionData);
            //     });
            // }, 300);
        });
    }

    async function editDetails() {
        loading = true;

        const { data, error } = await $globalSupabase
            .from("verifier_tasklist")
            .update({
                submitted_json_data: form.submission.data,
                status: "submitted",
            })
            .eq("id", verifier_tasklist_id);

        if (error) {
            console.log(error);
            alert(error.message);
        }
        // var res = await fetch("/API/admin/editSubmittedData", {
        //     method: "POST",
        //     body: JSON.stringify({
        //         submissionData: newEditedSubmissionData,

        //         verifier_tasklist_id,
        //         verifier_id,
        //         tasklist_id,
        //         request_id,
        //     }),
        //     headers: {
        //         "content-type": "application/json",
        //     },
        // });
        loading = false;
    }

    function exportSheet() {
        var excelJson = form.submission.data;
        console.log(excelJson);
        var sheetRow = [];

        for (var key in excelJson) {
            // console.log(typeof excelJson[key]);
            if (typeof excelJson[key] == "object") {
                sheetRow = [
                    ...sheetRow,
                    {
                        Field: key,
                        Value: {
                            t: "s",
                            v: key,
                            l: {
                                Target: excelJson[key][0].url,
                            },
                        },
                    },
                ];
            } else {
                sheetRow = [
                    ...sheetRow,
                    {
                        Field: key,
                        Value: {
                            s: { font: { bold: false } },
                            v: excelJson[key],
                        },
                    },
                ];
            }
        }

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(sheetRow);
        const max_width1 = sheetRow.reduce(
            (w, r) => Math.max(w, r.Field.length),
            10
        );

        worksheet["!cols"] = [{ wch: max_width1 }, { wch: max_width1 }];
        XLSX.utils.book_append_sheet(workbook, worksheet, verifier_name);

        XLSX.writeFile(workbook, `${verifier_name}.xlsx`);
    }
</script>

<div
    transition:fade
    style=" position: absolute;top: 0;left: 0;width: 100%;height: 100%; display: flex; justify-content: center; align-items: center;
                    background-color: rgba(0, 0, 0, 0.2); "
>
    <div
        transition:fly={{ y: -50, duration: 500 }}
        class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
    >
        <div class="modal-content" style="width: 700px;position: relative;">
            <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">
                    {requestName}-{verifier_name}
                </h5>
            </div>
            <div class="modal-body" style="min-height: 100px;">
                {#if loading}
                    <div
                        class="d-flex justify-content-center align-items-center w-100 h-100"
                        style="top: 0;left: 0; position: absolute;background-color: rgba(255, 255, 255, 0.8);z-index: 50;"
                    >
                        <div class="spinner-border" role="status" />
                    </div>
                {/if}
                <div id="formio" />
            </div>

            <div class="modal-footer">
                <button
                    disabled={loading}
                    on:click={() => {
                        exportSheet();
                    }}
                    type="button"
                    class="btn btn-success"
                >
                    <i class="bi bi-download" />
                    Export as excel</button
                >
                <button
                    on:click={() => {
                        dispatch("close");
                    }}
                    type="button"
                    class="btn btn-secondary">Close</button
                >

                <button
                    disabled={loading}
                    on:click={() => {
                        if (editMode) {
                            editDetails();
                        } else {
                            editMode = true;
                            loadform(false);
                        }
                    }}
                    type="button"
                    class="btn btn-primary"
                >
                    {@html editMode
                        ? "<i class='bi bi-cloud-arrow-up fa-lg'></i> Save the Edit"
                        : "<i class='bi bi-pencil-square'></i> Edit"}
                </button>
            </div>
        </div>
    </div>
</div>
