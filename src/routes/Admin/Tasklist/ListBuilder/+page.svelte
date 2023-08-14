<script>
    import { onDestroy, onMount } from "svelte";
    import {
        formBuilderDraftData,
        jq,
        globalSupabase,
        userData,
        fetchTasklist,
        deleteListFromDataBase,
    } from "../../../../store";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import RequiredFieldVerifierAdmin from "$lib/Admin/RequiredFieldVerifierAdmin.svelte";

    var mode = $page.url.searchParams.get("mode");
    var formId = $page.url.searchParams.get("id");

    var builder;
    var formData = "";
    var formName;
    var previousRequiredField = {
        verifier: [],
        admin: [],
    };
    var loading = false;
    var requiredFieldVerifierAdmin = false;

    async function fetchFormData() {
        loading = true;
        const { data, error } = await $globalSupabase
            .from("tasklist")
            .select(
                "JSON_data,name,admin_required_field,verifier_required_field"
            )
            .eq("id", formId)
            .limit(1)
            .single();
        loading = false;

        if (error) console.log(error);
        else {
            console.log(data);
            formData = data.JSON_data;
            formName = data.name;
            previousRequiredField = {
                verifier: data.verifier_required_field
                    ? data.verifier_required_field
                    : [],
                admin: data.admin_required_field
                    ? data.admin_required_field
                    : [],
            };
        }
    }
    onMount(async () => {
        $jq('[data-widget="pushmenu"]').PushMenu("collapse");
        if (formId == "draft") {
            formData = $formBuilderDraftData.form;
            formName = $formBuilderDraftData.formMetadata.name;
        } else {
            await fetchFormData();
        }

        builder = await Formio.builder(
            document.getElementById("builder"),
            formData,
            {
                builder: {
                    data: false,
                },
            }
        );

        var file = Formio.Components.components.file.editForm();
        file.components[0].components[1].components[0]["defaultValue"] = "url";
        file.components[0].components[1].components[1]["defaultValue"] =
            "/API/fileupload";
        Formio.Components.components.file.editForm = () => {
            return file;
        };

        builder.on("change", (e) => {
            if (formId == "draft") {
                $formBuilderDraftData.form = builder.form;
            }
            // console.log(builder.form);
        });
    });

    onDestroy(() => {
        $jq('[data-widget="pushmenu"]').PushMenu("expand");
    });

    async function saveFormToDatabase(requiredField) {
        loading = true;

        if (formId == "draft") {
            const { data, error } = await $globalSupabase
                .from("tasklist")
                .insert({
                    JSON_data: $formBuilderDraftData.form,
                    name: $formBuilderDraftData.formMetadata.name,
                    admin_id: $userData.id,
                    admin_required_field: requiredField.adminRequiredList,
                    verifier_required_field: requiredField.verifierRequiredList,
                });
            if (error) console.log(error);
            else {
                $formBuilderDraftData = false;
                goto("/Admin/Tasklist");
            }
        } else {
            const { error } = await $globalSupabase
                .from("tasklist")
                .update({
                    JSON_data: builder.form,
                    admin_required_field: requiredField.adminRequiredList,
                    verifier_required_field: requiredField.verifierRequiredList,
                })
                .eq("id", formId);

            console.log(error);
        }

        loading = false;
    }

    async function renderForm() {
        var componentList = [];
        var form = await Formio.createForm(
            document.getElementById("formio"),
            builder.form
        );

        form.everyComponent((component) => {
            componentList = [
                ...componentList,
                {
                    label: component.component.title
                        ? component.component.title
                        : component.component.label,
                    key: component.component.key,
                },
            ];
        });

        return componentList;
    }
</script>

<div class="position-reletive">
    <div
        class="d-flex justify-content-between align-items-top"
        style="margin-top: -0.8rem;"
    >
        <button
            on:click={() => {
                $jq("#exitModal").modal("show");
            }}
            type="button"
            aria-pressed="true"
            style="width: fit-content;height: fit-content;"
            class="btn btn-danger font-weight-bold d-flex align-items-center"
        >
            <i class="bi bi-box-arrow-left pr-2" />
            Exit
        </button>
        <h3>{formName}</h3>
        <div>
            <button
                style="width: fit-content;height: fit-content;"
                class="btn btn-primary font-weight-bold"
                on:click={async () => {
                    // await saveFormToDatabase();
                    // await fetchTasklist(true);

                    var componentList = [];
                    componentList = await renderForm();
                    // if (builder.form.display == "wizard") {
                    //     builder.form.components.forEach((page) => {
                    //         page.components.forEach((component) => {
                    //             componentList = [
                    //                 ...componentList,
                    //                 {
                    //                     label: component.label,
                    //                     key: component.key,
                    //                 },
                    //             ];
                    //         });
                    //     });
                    // } else {
                    //     builder.form.components.forEach((component) => {
                    //         componentList = [
                    //             ...componentList,
                    //             { label: component.label, key: component.key },
                    //         ];
                    //     });
                    // }

                    requiredFieldVerifierAdmin = {
                        componentList,
                    };
                }}
            >
                <i class="bi bi-cloud-arrow-up fa-lg" />
                {#if formId != "draft" && mode == "edit"}
                    Update
                {:else}
                    Upload
                {/if}
            </button>
            <button
                on:click={() => {
                    $jq("#deleteModel").modal("show");
                }}
                style="width: fit-content;height: fit-content;"
                class="btn btn-danger font-weight-bold"
            >
                <i class="bi bi-trash" />
                Delete
            </button>
        </div>
    </div>
    <hr class="m-0" />

    <!-- form Builder -->

    <div class="mt-2" id="builder" />
    <div style="display: none" id="formio" />

    <!-- deleteModel -->
    <div
        class="modal fade"
        id="deleteModel"
        data-backdrop="static"
        data-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
    >
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">
                        Delete List
                    </h5>
                </div>
                <div class="modal-body">
                    Do you want to delete this this list
                </div>
                <div class="modal-footer">
                    <button
                        type="button"
                        class="btn btn-secondary"
                        data-dismiss="modal">Cancel</button
                    >
                    <button
                        on:click={async () => {
                            loading = true;
                            $jq("#deleteModel").modal("hide");

                            if (formId == "draft") {
                                $formBuilderDraftData = false;
                            } else {
                                await deleteListFromDataBase(formId);
                                await fetchTasklist(true);
                            }
                            loading = false;
                            goto("/Admin/Tasklist");
                        }}
                        type="button"
                        class="btn btn-danger">Delete</button
                    >
                </div>
            </div>
        </div>
    </div>
    <!-- deleteModel -->
    <!-- exit modal -->
    <div
        class="modal fade"
        id="exitModal"
        data-backdrop="static"
        data-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
    >
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Exit</h5>
                </div>
                <div class="modal-body">Do you want to exit?</div>
                <div class="modal-footer">
                    <button
                        type="button"
                        class="btn btn-secondary"
                        data-dismiss="modal">Cancel</button
                    >
                    <button
                        on:click={() => {
                            $jq("#exitModal").modal("hide");

                            goto("/Admin/Tasklist");
                        }}
                        type="button"
                        class="btn btn-danger">Exit</button
                    >
                </div>
            </div>
        </div>
    </div>
    <!-- exit Modal -->
    {#if loading}
        <div
            class="position-absolute d-flex justify-content-center align-items-center"
            style="width: 100%;height: 100%; top: 0;left: 0; background-color: rgba(255, 255, 255, 0.5);"
        >
            <div class="spinner-border" role="status" />
        </div>
    {/if}

    {#if requiredFieldVerifierAdmin}
        <RequiredFieldVerifierAdmin
            componentList={requiredFieldVerifierAdmin.componentList}
            {previousRequiredField}
            on:close={() => {
                requiredFieldVerifierAdmin = false;
            }}
            on:save={async (e) => {
                console.log(e.detail);
                await saveFormToDatabase(e.detail);
                await fetchTasklist(true);
                goto("/Admin/Tasklist");
            }}
        />
    {/if}
</div>
