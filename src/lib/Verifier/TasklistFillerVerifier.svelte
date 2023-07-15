<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { jq, globalSupabase, userData } from "../../store";
    // import { decode } from "base64-arraybuffer";
    const dispatch = createEventDispatcher();

    export var id, name, requestName, requestId;
    var loading = true;
    var formData;
    var submissionData = {};
    var mode = "read";

    onMount(async () => {
        loading = true;
        $jq("#tasklistFiller").modal("show");
        const { data, error } = await $globalSupabase
            .from("tasklist")
            .select("JSON_data")
            .eq("id", id)
            .limit(1)
            .single();
        if (error) console.log(error);
        else {
            console.log(data);
            formData = data;
            // formData.JSON_data.components.forEach((e) => {
            //     if (e.type == "file") fileType = [...fileType, e.label];
            // });
            // submissionData = formData.JSON_data.components.map((e) => {
            //     return { name: e.label, key: e.key, type: e.type, data: null };
            // });
            if (formData.JSON_data.display == "form") {
                formData.JSON_data.components.forEach((e) => {
                    submissionData[e.key] = {
                        name: e.label,
                        type: e.type,
                        data: null,
                    };
                });
            } else {
                formData.JSON_data.components.forEach((page) => {
                    page.components.forEach((e) => {
                        submissionData[e.key] = {
                            name: e.label,
                            type: e.type,
                            data: null,
                        };
                    });
                });
            }
            console.log(submissionData);
        }

        const { data: pfd, error: err } = await $globalSupabase
            .from("verifier_tasklist")
            .select("prefill_data")
            .match({
                request_id: requestId,
                verifier_id: $userData.id,
                tasklist_id: id,
            })
            .single();

        console.log(pfd.prefill_data, err);

        if (formData.JSON_data.display == "form") {
            for (var key in pfd.prefill_data) {
                console.log(key);
                for (var i = 0; i < formData.JSON_data.components.length; i++) {
                    if (formData.JSON_data.components[i].key == key) {
                        formData.JSON_data.components[i].defaultValue =
                            pfd.prefill_data[key];
                        formData.JSON_data.components[i].disabled = true;
                    }
                }
            }
        } else {
            for (var page in pfd.prefill_data) {
                for (var key in pfd.prefill_data[page]) {
                    console.log(key);

                    for (
                        var i = 0;
                        i <
                        formData.JSON_data.components[
                            Number(page.slice(-1)) - 1
                        ].components.length;
                        i++
                    ) {
                        if (
                            formData.JSON_data.components[
                                Number(page.slice(-1) - 1)
                            ].components[i].key == key
                        ) {
                            formData.JSON_data.components[
                                Number(page.slice(-1) - 1)
                            ].components[i].defaultValue =
                                pfd.prefill_data[page][key];
                            formData.JSON_data.components[
                                Number(page.slice(-1) - 1)
                            ].components[i].disabled = true;
                        }
                    }
                }
            }
        }

        console.log(formData.JSON_data);
        loadform(true);
        loading = false;
    });

    async function loadform(readOnly) {
        var form = await Formio.createForm(
            document.getElementById("formio"),
            formData.JSON_data,
            {
                noAlerts: true,
                readOnly: readOnly,
            }
        );

        form.on("submit", async () => {
            console.log(submissionData);
            console.log(form.submission.data);
            loading = true;
            var res = await fetch("/API/verifier/submitData", {
                method: "POST",
                body: JSON.stringify({
                    submissionData: submissionData,
                    formData: form.submission.data,
                    requestId,
                    userId: $userData.id,
                    tasklistId: id,
                }),
                headers: {
                    "content-type": "application/json",
                },
            });

            console.log(await res.json());
            loading = false;

            //         loading = true;
            //         console.log(form.submission.data);
            //         for (var field in form.submission.data) {
            //             if (submissionData[field].type == "file") {
            //                 if (form.submission.data[field].length != 0) {
            //                     var res = await fileUpload(
            //                         form.submission.data[field][0],
            //                         field
            //                     );
            //                     submissionData[field].data = res.path;
            //                 }
            //             } else {
            //                 submissionData[field].data = form.submission.data[field];
            //             }
            //         }

            //         const { data, error } = await $globalSupabase
            //             .from("verifier_tasklist")
            //             .update({
            //                 submitted_JSON_data: submissionData,
            //                 status: "submitted",
            //             })
            //             .match({
            //                 request_id: requestId,
            //                 verifier_id: $userData.id,
            //                 tasklist_id: id,
            //             });

            //         if (error) console.log(error);

            //         loading = false;
            if (formData.JSON_data.display == "form")
                form.currentForm.emit("submitDone");
        });
    }

    // async function fileUpload(file, name) {
    //     console.log(file);
    //     var extention = file.type.split("/")[1];

    //     const base64Response = await fetch(file.url);
    //     const blob = await base64Response.blob();

    //     const { data, error } = await $globalSupabase.storage
    //         .from("Request")
    //         .upload(`${requestId}/${$userData.id}/${name}.${extention}`, blob, {
    //             upsert: true,
    //         });

    //     console.log(data);
    //     if (error) console.log(error);
    //     else return data;
    // }
</script>

<div
    class="modal fade"
    id="tasklistFiller"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
    data-backdrop="static"
>
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" style="width: 700px;position: relative;">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">
                    {requestName}-{name}
                </h5>
            </div>
            <div
                class="modal-body"
                style="min-height: 100px; position: static;"
            >
                <div id="formio" />
            </div>
            <div class="modal-footer">
                <button
                    on:click={() => {
                        dispatch("close");
                    }}
                    type="button"
                    class="btn btn-secondary"
                    style="z-index: 100;"
                >
                    Close</button
                >
                {#if mode == "read"}
                    <button
                        on:click={() => {
                            loadform(false);
                            mode = "edit";
                        }}
                        type="button"
                        class="btn btn-primary"
                    >
                        <i class="bi bi-pencil-square" /> Fill the form</button
                    >
                {/if}
            </div>

            {#if loading}
                <div
                    class="d-flex justify-content-center align-items-center w-100 h-100"
                    style="position: absolute;top: 0;left: 0; z-index: 60; background-color: rgba(255, 255, 255, 0.5);"
                >
                    <div class="spinner-border" role="status" />
                </div>
            {/if}
        </div>
    </div>
</div>
