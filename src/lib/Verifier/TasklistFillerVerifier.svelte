<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { jq, globalSupabase, userData } from "../../store";
    // import { decode } from "base64-arraybuffer";
    const dispatch = createEventDispatcher();

    export var id, name, requestName, requestId;
    var loading = true;
    var formData;

    var prefillData;

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
            // console.log(data);
            formData = data;
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
        prefillData = pfd.prefill_data;

        loadform(true);
        loading = false;
    });

    async function loadform(readOnly) {
        var form = await Formio.createForm(
            document.getElementById("formio"),
            formData.JSON_data,

            {
                hooks: {
                    addComponent: (component) => {
                        if (prefillData.hasOwnProperty(component.key)) {
                            component.defaultValue = prefillData[component.key];
                            component.disabled = true;
                        }
                        if (component.type == "file")
                            component.dir = `${requestId}/${id}/${$userData.id}`;
                        return component;
                    },
                },
                noAlerts: true,
                readOnly: readOnly,
            }
        );

        form.on("fileUploadingStart", () => {
            loading = true;
        });
        form.on("fileUploadingEnd", () => {
            loading = false;
        });

        form.on("submit", async () => {
            console.log(form.submission.data);
            loading = true;

            var location = {
                lat: null,
                lon: null,
            };

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (data) => {
                        console.log(data);
                        location.lat = data.coords.latitude;
                        location.lon = data.coords.longitude;
                        await submitData(form.submission.data, location);
                        loading = false;
                    },
                    (error) => {
                        alert(error.message);
                        loading = false;
                    }
                );
            } else {
                alert("error");
                loading = false;
            }

            // var res = await fetch(
            //     `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=22.572646&lon=88.363895`
            // );
            // console.log(await res.json());

            if (formData.JSON_data.display == "form")
                form.currentForm.emit("submitDone");
        });
    }

    async function submitData(submissionData, location) {
        const { data, error } = await $globalSupabase
            .from("verifier_tasklist")
            .update({
                submitted_json_data: submissionData,
                status: "submitted",
                location: { ...location },
            })
            .match({
                request_id: requestId,
                verifier_id: $userData.id,
                tasklist_id: id,
            });

        if (error) {
            console.log(error);
            alert(error.message);
        }
    }
</script>

<div
    class="modal fade"
    id="tasklistFiller"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
    data-backdrop="static"
>
    <div
        class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
    >
        <div class="modal-content">
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
