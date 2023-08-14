<script>
    import { onMount } from "svelte";
    import { jq, verifierRequestlist } from "../../store";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export var componentList, previousRequiredField;

    var adminCheckList = [];
    var verifierCheckList = [];
    console.log(previousRequiredField);

    console.log(componentList);

    onMount(() => {
        $jq("#RequiredFieldVerifierAdmin").modal("show");
        $jq("#RequiredFieldVerifierAdmin").on("hidden.bs.modal", () => {
            dispatch("close");
        });
        componentList.forEach((e) => {
            if (previousRequiredField.admin.includes(e.key)) {
                adminCheckList = [...adminCheckList, true];
            } else {
                adminCheckList = [...adminCheckList, false];
            }
            if (previousRequiredField.verifier.includes(e.key)) {
                verifierCheckList = [...verifierCheckList, true];
            } else {
                verifierCheckList = [...verifierCheckList, false];
            }
        });
    });
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
                <div class="d-flex">
                    <div
                        class="mr-2 pr-2"
                        style="flex: 1;border-right: 1px solid gray;"
                    >
                        <h5>Admin</h5>
                        <hr />
                        {#each componentList as { label, key }, index}
                            <div
                                class="card d-flex justify-content-between align-items-center p-2"
                                style="flex-direction: row;"
                            >
                                <div>
                                    <p>{label}</p>
                                </div>
                                <div>
                                    <input
                                        bind:checked={adminCheckList[index]}
                                        type="checkbox"
                                        name=""
                                        id=""
                                    />
                                </div>
                            </div>
                        {/each}
                    </div>
                    <div style="flex: 1;">
                        <h5>Verifier</h5>
                        <hr />
                        {#each componentList as { label, key }, index}
                            <div
                                class="card d-flex justify-content-between align-items-center p-2"
                                style="flex-direction: row;"
                            >
                                <div>
                                    <p>{label}</p>
                                </div>
                                <div>
                                    <input
                                        bind:checked={verifierCheckList[index]}
                                        type="checkbox"
                                        name=""
                                        id=""
                                    />
                                </div>
                            </div>
                        {/each}
                    </div>
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
                        var adminRequiredList = [];
                        var verifierRequiredList = [];
                        componentList.forEach((component, index) => {
                            if (verifierCheckList[index]) {
                                verifierRequiredList = [
                                    ...verifierRequiredList,
                                    component.key,
                                ];
                            }

                            if (adminCheckList[index]) {
                                adminRequiredList = [
                                    ...adminRequiredList,
                                    component.key,
                                ];
                            }
                        });
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
