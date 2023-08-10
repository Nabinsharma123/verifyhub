<script>
    import { onMount } from "svelte";
    import { jq, globalSupabase } from "../../store";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let data;

    var tasklistVerifierPair = [];
    var loading = true;
    var currentTasklistVerifierPair = 0;

    onMount(async () => {
        loading = true;
        $jq("#addPrefillDataModel").modal("show");
        $jq("#addPrefillDataModel").on("hidden.bs.modal", () => {
            dispatch("close");
        });
        const { data: JSON_data, error } = await $globalSupabase
            .from("tasklist")
            .select("id,name,JSON_data")
            .in("id", data.tasklist_id);

        if (error) console.log(error);
        else {
            console.log(JSON_data);
            data.verifier_id.forEach(({ id: vid, name: vname }) => {
                JSON_data.forEach(({ id: tid, name: tname, JSON_data }) => {
                    tasklistVerifierPair = [
                        ...tasklistVerifierPair,
                        {
                            tid,
                            tname,
                            vid,
                            vname,
                            form_Json_data: structuredClone(JSON_data),
                            prefillData: {},
                        },
                    ];
                });
            });

            renderForm();
        }

        loading = false;
    });

    var form;
    async function renderForm() {
        form = await Formio.createForm(
            document.getElementById("formio"),
            tasklistVerifierPair[currentTasklistVerifierPair].form_Json_data,
            {
                hooks: {
                    addComponent: (component) => {
                        component.validate.required = false;
                        return component;
                    },
                },
                noAlerts: true,
            }
        );
        form.on("submit", async () => {
            // console.log(form.submission.data);

            if (
                tasklistVerifierPair[currentTasklistVerifierPair].form_Json_data
                    .display == "form"
            )
                form.currentForm.emit("submitDone");
        });
        form.submission = {
            data: tasklistVerifierPair[currentTasklistVerifierPair].prefillData,
        };

        form.on("fileUploadingStart", () => {
            loading = true;
        });
        form.on("fileUploadingEnd", () => {
            loading = false;
        });

        form.on("change", (e) => {
            if (e.changed) {
                // console.log(e);
                var key = e.changed.component.key;
                var value = e.changed.value;
                tasklistVerifierPair[currentTasklistVerifierPair].prefillData[
                    key
                ] = value;

                // console.log(tasklistVerifierPair);
            }
        });
    }
</script>

<div
    class="modal fade"
    id="addPrefillDataModel"
    data-backdrop="static"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
>
    <div
        class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered"
    >
        <div class="modal-content">
            <div class="modal-header">
                <h6 class="modal-title" id="exampleModalLabel">
                    Prefill the form fields
                </h6>
                <button
                    type="button"
                    class="close"
                    data-dismiss="modal"
                    aria-label="Close"
                >
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                {#if loading}
                    <div class="d-flex justify-content-center">
                        <div class="spinner-border" role="status" />
                    </div>
                {:else}
                    <h5>
                        {tasklistVerifierPair[currentTasklistVerifierPair]
                            ?.vname}
                        <i class="bi bi-arrow-right" />
                        {tasklistVerifierPair[currentTasklistVerifierPair]
                            ?.tname}
                    </h5>
                {/if}
                <div id="formio" />
            </div>
            <div
                class="modal-footer"
                style="display: flex;justify-content: space-between;"
            >
                <div>
                    <button
                        type="button"
                        class="btn btn-primary"
                        style={`display:${
                            currentTasklistVerifierPair > 0
                                ? "inline-block"
                                : "none"
                        }`}
                        on:click={() => {
                            if (currentTasklistVerifierPair > 0) {
                                currentTasklistVerifierPair--;
                                renderForm();
                            }
                        }}
                    >
                        <i class="bi bi-chevron-left" />
                        Prev form
                    </button>
                    <button
                        type="button"
                        class="btn btn-primary"
                        on:click={async () => {
                            try {
                                await form.submit();

                                if (
                                    currentTasklistVerifierPair <
                                    tasklistVerifierPair.length - 1
                                )
                                    currentTasklistVerifierPair++;
                                else {
                                    // subimit prefill and create request
                                    var pre =
                                        structuredClone(tasklistVerifierPair);
                                    for (var i = 0; i < pre.length; i++) {
                                        delete pre[i].form_Json_data;
                                    }

                                    console.log(pre);

                                    dispatch("prefillData", pre);
                                    $jq("#addPrefillDataModel").modal("hide");
                                }

                                renderForm();
                            } catch (e) {
                                alert(
                                    "Please fill all the mandatory fields in the form"
                                );
                            }
                        }}
                    >
                        {currentTasklistVerifierPair ==
                        tasklistVerifierPair.length - 1
                            ? "Submit"
                            : "Next form"}<i
                            class="bi bi-chevron-right"
                        /></button
                    >
                </div>
            </div>
        </div>
    </div>
</div>
