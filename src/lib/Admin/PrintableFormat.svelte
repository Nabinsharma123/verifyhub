<script>
    import { fade, fly } from "svelte/transition";
    import { globalSupabase, jq, userData } from "../../store";
    import { createEventDispatcher, onMount } from "svelte";
    import Loading from "../Component/Loading.svelte";
    import FormioExport from "formio-export";

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

    onMount(async () => {
        $jq("#printableFormat").modal("show");

        $jq("#printableFormat").on("hidden.bs.modal", () => {
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

            formSubmittedData = data.submitted_json_data;
        }

        console.log(formSubmittedData);

        loadform();

        loading = false;
    });

    var options;
    var exporter;

    async function loadform() {
        // var form = await Formio.createForm(
        //     document.getElementById("formio"),
        //     formData
        // );

        // form.ready.then(async () => {
        //     form.display = "form";
        //     form.submission = {
        //         data: formSubmittedData,
        //     };
        // });

        options = {
            formio: {
                // component specific configuration
                ignoreLayout: true, // should html render respect formio layouts (columns, lables positions, etc)
                emptyValue: "--", // default empty value for rendered components
            },
            component: formData,
            data: {
                data: formSubmittedData,
            },
            config: {
                // pdf export configuration
                download: false, // should the pdf file be downloaded once rendered
                filename: "download.pdf", // the pdf file name
                margin: 10, // the pdf file margins
                html2canvas: {
                    scale: 1, // scale factor for rendering the canvas (overall resolution of the canvas image)
                    logging: false, // should console logging be enable during rendering
                },
                jsPDF: {
                    orientation: "p", // PDF orientation - potrait / landscape
                    unit: "mm", // measurement units used
                    format: "a4", // paper size - can also accept custom (i.e. A4 - [210, 297])
                },
            },
        };

        exporter = new FormioExport(
            formData,
            {
                data: formSubmittedData,
            },
            options
        );

        exporter.toHtml().then((html) => {
            document.getElementById("formio").appendChild(html);
        });
    }
</script>

<div
    class="modal fade"
    id="printableFormat"
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
                    on:click={() => {
                        // exporter.toPdf(options.config).then((pdf) => {
                        //     pdf.save();
                        // });
                        exporter.toPdf(options.config).then((pdf) => {
                            pdf.save();
                        });
                    }}
                    disabled={loading}
                    type="button"
                    class="btn btn-success"
                >
                    <i class="bi bi-download" />
                    Export as excel</button
                >
                <button
                    data-dismiss="modal"
                    type="button"
                    class="btn btn-secondary">Close</button
                >

                <button
                    disabled={loading}
                    type="button"
                    class="btn btn-primary"
                >
                    <i class="bi bi-cloud-arrow-up fa-lg" /> Save the Edit
                </button>
            </div>
        </div>
    </div>
</div>
