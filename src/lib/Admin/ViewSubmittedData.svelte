<script>
    import { fade, fly } from "svelte/transition";
    import { globalSupabase, jq, userData } from "../../store";
    import { createEventDispatcher, onMount } from "svelte";
    import Loading from "../Component/Loading.svelte";
    const dispatch = createEventDispatcher();

    export var verifier_tasklist_id,
        verifier_id,
        verifier_name,
        requestName,
        requestId,
        tasklistId;
    console.log(tasklistId);
    var loading = true;

    var formData, formSubmittedData;

    var form;

    var iframeLoading = true;

    onMount(async () => {
        $jq("#viewSubmitedData").modal("show");

        $jq("#viewSubmitedData").on("hidden.bs.modal", () => {
            dispatch("close");
        });
        const { data, error } = await $globalSupabase
            .from("verifier_tasklist")
            .select("submitted_json_data,tasklist(JSON_data)")
            .eq("id", verifier_tasklist_id)
            .single();

        if (error) console.log(error);
        else {
            console.log(data);

            formData = data.tasklist.JSON_data;
            console.log(formData);
            formSubmittedData = data.submitted_json_data;
        }

        console.log(formSubmittedData);

        loadform();

        loading = false;
    });

    async function loadform() {
        form = await Formio.createForm(
            document.getElementById("formio"),
            formData,

            {
                hooks: {
                    addComponent: (component) => {
                        component.validate.required = false;
                        if (component.type == "file")
                            component.dir = `${requestId}/${tasklistId}/${verifier_id}`;
                        return component;
                    },
                },
                noAlerts: true,
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

        loading = false;
    }

    function exportSheet() {
        var excelJson = [];

        form.everyComponent((component) => {
            excelJson = [
                ...excelJson,
                {
                    name: component.component.label,
                    value: form.submission.data[component.component.key],
                },
            ];
        });

        var sheetRow = [];

        excelJson.forEach((e) => {
            if (typeof e.value == "object") {
                console.log(e);
                sheetRow = [
                    ...sheetRow,
                    {
                        Field: e.name,
                        Value: {
                            t: "s",
                            v: e.name,
                            l: {
                                Target: e.value[0]?.url,
                            },
                        },
                    },
                ];
            } else {
                sheetRow = [
                    ...sheetRow,
                    {
                        Field: e.name,
                        Value: {
                            s: { font: { bold: false } },
                            v: e.value,
                        },
                    },
                ];
            }
        });

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
    class="modal fade"
    id="viewSubmitedData"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
>
    <div
        class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
    >
        <div class="modal-content" style="position: relative;">
            <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">
                    {requestName}-{verifier_name}
                </h5>
            </div>
            <div class="modal-body" style="min-height: 100px;">
                {#if loading}
                    <div
                        class="d-flex justify-content-center align-items-center w-100 h-100"
                        style="top: 0;left: 0;bottom: 0; position: absolute;background-color: rgba(255, 255, 255, 0.8);z-index: 50;"
                    >
                        <div class="spinner-border" role="status" />
                    </div>
                {/if}
                <div id="formio" />
            </div>

            <div class="modal-footer">
                <button
                    data-dismiss="modal"
                    type="button"
                    class="btn btn-secondary">Close</button
                >

                <button
                    disabled={loading}
                    on:click={() => {
                        editDetails();
                    }}
                    type="button"
                    class="btn btn-primary"
                >
                    <i class="bi bi-cloud-arrow-up fa-lg" /> Save the Edit
                </button>
            </div>
        </div>
    </div>
</div>
