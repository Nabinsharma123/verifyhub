<script>
    import { fade, fly } from "svelte/transition";
    import { globalSupabase, userData } from "../../store";
    import { createEventDispatcher, onMount } from "svelte";
    const dispatch = createEventDispatcher();

    export var verifier_tasklist_id, verifier_name, requestName;
    var loading = true;
    var submissionData = [];
    console.log(verifier_tasklist_id);

    onMount(async () => {
        const { data, error } = await $globalSupabase
            .from("verifier_tasklist")
            .select("submitted_JSON_data")
            .eq("id", verifier_tasklist_id)
            .single();

        if (error) console.log(error);
        else {
            console.log(data);
            for (var key in data.submitted_JSON_data) {
                if (data.submitted_JSON_data[key].type == "file") {
                    const { data: data1 } = $globalSupabase.storage
                        .from("Request")
                        .getPublicUrl(data.submitted_JSON_data[key].data);

                    // var res = await fetch(data1.publicUrl);
                    // var blob = await res.blob();
                    // var objectURL = URL.createObjectURL(blob);
                    submissionData = [
                        ...submissionData,
                        {
                            key: data.submitted_JSON_data[key].name,
                            value: `<a  href=${data1.publicUrl} target="_blank" >${key}</a> `,
                        },
                    ];
                    console.log(data1);
                } else {
                    submissionData = [
                        ...submissionData,
                        {
                            key: data.submitted_JSON_data[key].name,
                            value: data.submitted_JSON_data[key].data,
                        },
                    ];
                }
            }
        }

        loading = false;
    });

    function exportSheet() {
        var wb = XLSX.utils.table_to_book(
            document.getElementById("TableToExport")
        );

        XLSX.writeFile(wb, `${verifier_name}.xlsx`);
    }
</script>

<div
    transition:fade
    style=" position: absolute;top: 0;left: 0;width: 100%;height: 100%; display: flex; justify-content: center; align-items: center;
                    background-color: rgba(0, 0, 0, 0.2); "
>
    <div transition:fly={{ y: -50, duration: 500 }} class="modal-dialog">
        <div class="modal-content" style="width: 500px;position: relative;">
            <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">
                    {requestName}-{verifier_name}
                </h5>
            </div>
            <div
                class="modal-body"
                style="min-height: 100px; max-height: 400px;overflow: auto;"
            >
                {#if loading}
                    <div
                        class="d-flex justify-content-center align-items-center w-100 h-100"
                        style="top: 0;left: 0; position: absolute;background-color: rgba(255, 255, 255, 0.8);z-index: 50;"
                    >
                        <div class="spinner-border" role="status" />
                    </div>
                {:else}
                    <table id="TableToExport" class="table table-striped">
                        <tbody>
                            {#each submissionData as { key, value }}
                                <tr>
                                    <td>{key}</td>
                                    <td> {@html value}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
            </div>

            <div class="modal-footer">
                <button
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
            </div>
        </div>
    </div>
</div>
