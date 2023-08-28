<script>
    import { onMount } from "svelte";
    import { jq } from "../../store";
    import { createEventDispatcher } from "svelte";
    import { page } from "$app/stores";

    const dispatch = createEventDispatcher();
    export var builderForm, previousRequiredField;
    var formId = $page.url.searchParams.get("id");

    console.log(previousRequiredField);

    var adminRequiredList = {};
    var verifierRequiredList = {};
    if (formId != "draft") {
        adminRequiredList = previousRequiredField.admin;
        verifierRequiredList = previousRequiredField.verifier;
    }
    var componentList = [];

    // console.log(builderForm);

    $: console.log(adminRequiredList, verifierRequiredList);

    if (builderForm.display == "wizard") {
        builderForm.components.forEach((page, index) => {
            componentList = [
                ...componentList,
                { name: page.title, components: [] },
            ];
            recursiveform(page, index, true);
        });
    } else {
        componentList = [...componentList, { components: [] }];
        recursiveform(builderForm, 0, true);
    }
    console.log(componentList);

    onMount(async () => {
        $jq("#RequiredFieldVerifierAdmin").modal("show");
        $jq("#RequiredFieldVerifierAdmin").on("hidden.bs.modal", () => {
            dispatch("close");
        });
    });

    function recursiveform(component, index, ignore) {
        if (!ignore) {
            componentList[index].components = [
                ...componentList[index].components,
                {
                    type: "heading",
                    name: component.title,
                },
            ];
        }
        component.components.forEach(async (subComponent) => {
            if (subComponent.type == "panel") {
                recursiveform(subComponent, index, false);
            } else if (subComponent.type == "fieldset") {
                recursiveform(subComponent, index, true);
            } else if (subComponent.type == "columns") {
                subComponent.columns.forEach((column) => {
                    recursiveform(column, index, true);
                });
            } else {
                if (subComponent.type == "htmlelement") return;
                if (subComponent.key == "submit") return;
                componentList[index].components = [
                    ...componentList[index].components,
                    {
                        type: subComponent.type,
                        name: subComponent.label,
                        key: subComponent.key,
                    },
                ];
                if (formId == "draft") {
                    adminRequiredList[subComponent.key] = false;
                    verifierRequiredList[subComponent.key] = false;
                }
            }
        });
    }
</script>

<div
    class="modal fade"
    id="RequiredFieldVerifierAdmin"
    data-keyboard="false"
    data-backdrop="static"
    tabindex="-1"
    aria-labelledby="staticBackdropLabel"
    aria-hidden="true"
>
    <div
        class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
    >
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">
                    Select required fields for verifier & admin
                </h5>
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
                <div>
                    {#each componentList as page}
                        <div style="margin-bottom: 30px;">
                            <table
                                data-pdfmake={`{'dontBreakRows': true}`}
                                style="width: 100%; "
                            >
                                {#if builderForm.display == "wizard"}
                                    <tr>
                                        <td
                                            colspan="2"
                                            style="background-color: #3399ff;border: 1px solid #3399ff;"
                                        >
                                            <h3
                                                style="text-align: center;color: #fff;margin: 2px;"
                                            >
                                                {page.name}
                                            </h3>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            style="height: 20px;border-right: 1px solid #fff;border-left: 1px solid #fff;border-bottom: 1px solid #ddd;"
                                            colspan="2"
                                        />
                                    </tr>
                                {/if}
                                {#each page.components as { type, name, key }}
                                    <tr>
                                        {#if type == "heading"}
                                            <td
                                                colspan="2"
                                                style="background-color: #F5E9DA; text-align: center;border: 1px solid #ddd;border-collapse: collapse;"
                                            >
                                                <h6 style="margin: 10px;">
                                                    {name}
                                                </h6>
                                            </td>
                                        {:else}
                                            <td
                                                style="width: 60%;border: 1px solid #ddd;border-collapse: collapse;"
                                            >
                                                <p style="margin: 10px;">
                                                    {name}
                                                </p>
                                            </td>
                                            <td
                                                class="pl-2"
                                                style="border: 1px solid #ddd;border-collapse: collapse;"
                                            >
                                                <label
                                                    style="margin-right: 10px;"
                                                    for={`AdminId${key}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        id={`AdminId${key}`}
                                                        bind:checked={adminRequiredList[
                                                            key
                                                        ]}
                                                    />
                                                    Admin</label
                                                >
                                                <label for={`VerifierId${key}`}>
                                                    <input
                                                        type="checkbox"
                                                        id={`VerifierId${key}`}
                                                        bind:checked={verifierRequiredList[
                                                            key
                                                        ]}
                                                    />

                                                    Verifier</label
                                                >
                                            </td>
                                        {/if}
                                    </tr>
                                {/each}
                            </table>
                        </div>
                    {/each}
                </div>
            </div>
            <div class="modal-footer">
                <button
                    type="button"
                    class="btn btn-secondary"
                    data-dismiss="modal"
                >
                    Close</button
                >
                <button
                    on:click={() => {
                        dispatch("save", {
                            adminRequiredList,
                            verifierRequiredList,
                        });
                        $jq("#RequiredFieldVerifierAdmin").modal("hide");
                    }}
                    class="btn btn-primary active"
                    type="button"
                >
                    Save</button
                >
            </div>
        </div>
    </div>
</div>
