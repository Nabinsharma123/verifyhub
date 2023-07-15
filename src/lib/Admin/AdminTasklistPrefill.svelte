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
        const { data: JSON_data, error } = await $globalSupabase
            .from("tasklist")
            .select("id,name,JSON_data")
            .in("id", data.tasklist_id);

        if (error) console.log(error);
        else {
            JSON_data.forEach(({ id: tid, name: tname, JSON_data }) => {
                data.verifier_id.forEach(({ id: vid, name: vname }) => {
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

    async function renderForm() {
        var form = await Formio.createForm(
            document.getElementById("formio"),
            tasklistVerifierPair[currentTasklistVerifierPair].form_Json_data,
            {
                noAlerts: true,
            }
        );
        form.on("submit", async () => {
            console.log(form.submission.data);

            if (
                tasklistVerifierPair[currentTasklistVerifierPair].form_Json_data
                    .display == "form"
            )
                form.currentForm.emit("submitDone");
        });

        form.on("change", (e) => {
            var key = e.changed.component.key;
            var value = e.data[key];

            if (
                tasklistVerifierPair[currentTasklistVerifierPair].form_Json_data
                    .display == "form"
            ) {
                for (
                    var i = 0;
                    i <
                    tasklistVerifierPair[currentTasklistVerifierPair]
                        .form_Json_data.components.length;
                    i++
                ) {
                    if (
                        tasklistVerifierPair[currentTasklistVerifierPair]
                            .form_Json_data.components[i].key === key
                    ) {
                        tasklistVerifierPair[
                            currentTasklistVerifierPair
                        ].form_Json_data.components[i].defaultValue = value;

                        tasklistVerifierPair[
                            currentTasklistVerifierPair
                        ].prefillData[key] = value;
                    }
                }
            } else {
                for (
                    var i = 0;
                    i <
                    tasklistVerifierPair[currentTasklistVerifierPair]
                        .form_Json_data.components[form.page].components.length;
                    i++
                ) {
                    if (
                        tasklistVerifierPair[currentTasklistVerifierPair]
                            .form_Json_data.components[form.page].components[i]
                            .key === key
                    ) {
                        tasklistVerifierPair[
                            currentTasklistVerifierPair
                        ].form_Json_data.components[form.page].components[
                            i
                        ].defaultValue = value;

                        tasklistVerifierPair[
                            currentTasklistVerifierPair
                        ].prefillData[`page${form.page + 1}`] =
                            tasklistVerifierPair[currentTasklistVerifierPair]
                                .prefillData[`page${form.page + 1}`] || {};

                        tasklistVerifierPair[
                            currentTasklistVerifierPair
                        ].prefillData[`page${form.page + 1}`][key] = value;
                    }
                }
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
    <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h6 class="modal-title" id="exampleModalLabel">
                    Prefill the form fields
                </h6>
                <button
                    on:click={() => {
                        dispatch("close");
                    }}
                    type="button"
                    class="close"
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
                            ?.tname} <i class="bi bi-arrow-right" />
                        {tasklistVerifierPair[currentTasklistVerifierPair]
                            ?.vname}
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
                        on:click={() => {
                            if (currentTasklistVerifierPair > 0) {
                                currentTasklistVerifierPair--;
                                renderForm();
                            }
                        }}
                    >
                        <i class="bi bi-chevron-left" />
                        Prev
                    </button>
                    <button
                        type="button"
                        class="btn btn-primary"
                        on:click={() => {
                            if (
                                currentTasklistVerifierPair <
                                tasklistVerifierPair.length - 1
                            ) {
                                currentTasklistVerifierPair++;

                                renderForm();
                            }
                        }}>Next <i class="bi bi-chevron-right" /></button
                    >
                </div>
                <div>
                    <button
                        on:click={() => {
                            var pre = structuredClone(tasklistVerifierPair);
                            delete pre.form_Json_data;
                            dispatch("prefillData", pre);
                            dispatch("close");
                        }}
                        type="button"
                        class="btn btn-primary">Save changes</button
                    >
                </div>
            </div>
        </div>
    </div>
</div>
