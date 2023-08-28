<script>
    import { onMount } from "svelte";
    import { jq, globalSupabase, userData } from "../../store";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let data;

    var tasklistVerifierPair = [];
    var loading = true;
    var currentTasklistVerifierPair = 0;
    var lockSubmission = true;

    onMount(async () => {
        loading = true;
        $jq("#addPrefillDataModel").modal("show");
        $jq("#addPrefillDataModel").on("hidden.bs.modal", () => {
            dispatch("close");
        });
        const { data: JSON_data, error } = await $globalSupabase
            .from("tasklist")
            .select("id,name,JSON_data,admin_required_field")
            .in("id", data.tasklist_id);

        if (error) console.log(error);
        else {
            console.log(JSON_data);
            data.verifier_id.forEach(({ id: vid, name: vname }) => {
                JSON_data.forEach(
                    ({
                        id: tid,
                        name: tname,
                        JSON_data,
                        admin_required_field,
                    }) => {
                        tasklistVerifierPair = [
                            ...tasklistVerifierPair,
                            {
                                tid,
                                tname,
                                vid,
                                vname,
                                form_Json_data: structuredClone(JSON_data),
                                prefillData: {},
                                requiredField: admin_required_field,
                            },
                        ];
                    }
                );
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
                        if (
                            tasklistVerifierPair[currentTasklistVerifierPair]
                                .requiredField[component.key]
                        ) {
                            component.validate.required = true;
                        } else {
                            component.validate.required = false;
                        }
                        if (component.type == "file")
                            component.dir = `TemporaryFiles/${$userData.id}/${tasklistVerifierPair[currentTasklistVerifierPair].tid}/${tasklistVerifierPair[currentTasklistVerifierPair].vid}`;
                        return component;
                    },
                },
            }
        );

        form.submission = {
            data: tasklistVerifierPair[currentTasklistVerifierPair].prefillData,
        };

        form.on("fileUploadingStart", () => {
            loading = true;
        });
        form.on("fileUploadingEnd", () => {
            loading = false;
        });

        form.on("nextPage", () => {
            $jq(".modal-body").animate({ scrollTop: 0 }, "fast");
        });
        form.on("prevPage", () => {
            $jq(".modal-body").animate({ scrollTop: 0 }, "fast");
        });

        form.on("error", () => {
            $jq(".modal-body").animate({ scrollTop: 0 }, "fast");
        });

        form.on("submitError", () => {
            $jq(".modal-body").animate({ scrollTop: 0 }, "fast");
        });

        form.on("change", (e) => {
            if (e.changed) {
                // console.log(e);
                var key = e.changed.component.key;
                var value = e.changed.value;
                if (
                    value &&
                    ((value.constructor === String && value !== "") ||
                        (value.constructor === Array && value.length !== 0) ||
                        (value.constructor === Number && value.length !== 0) ||
                        (value.constructor === Object &&
                            Object.keys(value).find((key) => value[key])))
                ) {
                    tasklistVerifierPair[
                        currentTasklistVerifierPair
                    ].prefillData[key] = value;
                } else {
                    if (
                        Object.hasOwn(
                            tasklistVerifierPair[currentTasklistVerifierPair]
                                .prefillData,
                            key
                        )
                    ) {
                        delete tasklistVerifierPair[currentTasklistVerifierPair]
                            .prefillData[key];
                    }
                }

                console.log(
                    tasklistVerifierPair[currentTasklistVerifierPair]
                        .prefillData
                );
            }
        });

        form.on("submit", (e) => {
            if (
                tasklistVerifierPair[currentTasklistVerifierPair].form_Json_data
                    .display == "form"
            ) {
                form.currentForm.emit("submitDone");
            }

            if (currentTasklistVerifierPair < tasklistVerifierPair.length - 1) {
                currentTasklistVerifierPair++;
                renderForm();
            } else if (
                currentTasklistVerifierPair ==
                tasklistVerifierPair.length - 1
            ) {
                lockSubmission = false;
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
                <div>
                    <h6 class="modal-title" id="exampleModalLabel">
                        Prefill the form fields
                    </h6>

                    <h5 class="m-0">
                        {#if !loading}
                            {tasklistVerifierPair[currentTasklistVerifierPair]
                                ?.vname}
                            <i class="bi bi-arrow-right" />
                            {tasklistVerifierPair[currentTasklistVerifierPair]
                                ?.tname}
                        {/if}
                    </h5>
                </div>
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
                        style={`display:${
                            lockSubmission ? "none" : "inline-block"
                        }`}
                        type="button"
                        class="btn btn-success"
                        on:click={async () => {
                            console.log(tasklistVerifierPair);

                            // subimit prefill and create request
                            var pre = structuredClone(tasklistVerifierPair);
                            for (var i = 0; i < pre.length; i++) {
                                delete pre[i].form_Json_data;
                            }
                            console.log(pre);
                            dispatch("prefillData", pre);
                            $jq("#addPrefillDataModel").modal("hide");
                        }}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
