<script>
    import { onMount } from "svelte";
    import { jq, globalSupabase } from "../../store";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export var verifier_tasklist_id,
        verifier_name,
        verifier_id,
        request_id,
        tasklist_id;

    var iframeLoading = true;
    var varifierLocation = {};
    var imageList = [];
    var imageDiv = [];

    onMount(async () => {
        $jq("#submittedDataInfo").modal("show");
        $jq("#submittedDataInfo").on("hidden.bs.modal", () => {
            dispatch("close");
        });
        $jq("#submittedDataInfo").modal("handleUpdate");

        const { data, error } = await $globalSupabase
            .from("verifier_tasklist")
            .select("location")
            .eq("id", verifier_tasklist_id)
            .single();
        varifierLocation = data.location;

        imageList = await getImageList();

        imageDiv.forEach((div, index) => {
            div.children[0].children[0].addEventListener("load", async (e) => {
                var latlong = await getMetadata(e.target);
                div.children[1].children[0].src = `https://google.com/maps?q=${latlong[0]},${latlong[1]}&t=&z=15&ie=UTF8&output=embed`;
            });
            div.children[0].children[0].src = $globalSupabase.storage
                .from("Request")
                .getPublicUrl(imageList[index]).data.publicUrl;
        });
    });

    async function getMetadata(ref) {
        var img1 = ref;
        var latFinal;
        var lonFinal;
        var MetaData;

        await new Promise((resolve) => {
            EXIF.getData(img1, function () {
                MetaData = EXIF.getAllTags(this);

                var latDegree = MetaData.GPSLatitude[0].numerator;
                var latMinute = MetaData.GPSLatitude[1].numerator;
                var latSecond = MetaData.GPSLatitude[2].numerator;
                var latDirection = MetaData.GPSLatitudeRef;
                latFinal = ConvertDMSToDD(
                    latDegree,
                    latMinute,
                    latSecond,
                    latDirection
                );

                var lonDegree = MetaData.GPSLongitude[0].numerator;
                var lonMinute = MetaData.GPSLongitude[1].numerator;
                var lonSecond = MetaData.GPSLongitude[2].numerator;
                var lonDirection = MetaData.GPSLongitudeRef;

                lonFinal = ConvertDMSToDD(
                    lonDegree,
                    lonMinute,
                    lonSecond,
                    lonDirection
                );
                resolve();
            });
        });
        return [latFinal, lonFinal];
    }

    function ConvertDMSToDD(degrees, minutes, seconds, direction) {
        var dd = degrees + minutes / 60 + seconds / 360000;
        if (direction == "S" || direction == "W") {
            dd = dd * -1;
        }
        return dd;
    }

    async function getImageList() {
        const { data, error } = await $globalSupabase.storage
            .from("Request")
            .list(`${request_id}/${tasklist_id}/${verifier_id}`);

        data.forEach((e) => {
            if (e.metadata.mimetype.split("/")[0] == "image")
                imageList = [
                    ...imageList,
                    `${request_id}/${tasklist_id}/${verifier_id}/${e.name}`,
                ];
        });

        return imageList;
    }
</script>

<div
    class="modal fade"
    id="submittedDataInfo"
    data-keyboard="false"
    tabindex="-1"
    aria-labelledby="staticBackdropLabel"
    aria-hidden="true"
>
    <div
        class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"
    >
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">
                    {verifier_name}
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
                <div style="position: relative;">
                    <h4>Form Submission Location</h4>
                    {#if iframeLoading}
                        <div
                            class="d-flex justify-content-center align-items-center w-100 h-100"
                            style="top: 0;left: 0; position: absolute;background-color: rgba(255, 255, 255, 0.8);z-index: 50;"
                        >
                            <div class="spinner-border" role="status" />
                        </div>
                    {/if}

                    <iframe
                        on:load={(e) => {
                            iframeLoading = false;
                        }}
                        src={`https://google.com/maps?q=${varifierLocation.lat},${varifierLocation.lon}&t=&z=15&ie=UTF8&output=embed`}
                        width="100%"
                        height="300px"
                        frameborder="0"
                        style="border:0 ; padding: 0;margin: 0;"
                        title="ok"
                    />
                </div>
                <div class="mt-3">
                    <h4>Picture origine Location</h4>

                    {#each imageList as image, index}
                        <div class="card p-2">
                            <div
                                class="d-flex w-100"
                                style="flex-direction: row; gap: 10px;"
                            >
                                <div style="flex: 1;">
                                    <h5>Image</h5>
                                </div>
                                <div style="flex: 1;">
                                    <h5>Location</h5>
                                </div>
                            </div>
                            <div
                                bind:this={imageDiv[index]}
                                class="d-flex mb-3 p-2"
                                style="height: 200px; flex-direction: row; gap: 10px; "
                            >
                                <div style="flex: 1;  ">
                                    <img
                                        class=" h-100 w-100"
                                        src=""
                                        alt=""
                                        style="object-fit: contain;"
                                    />
                                </div>
                                <div style="flex: 1;">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameborder="0"
                                        style="border:0 ; padding: 0;margin: 0;"
                                        title="ok"
                                    />
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <div class="modal-footer">
                <button
                    type="button"
                    class="btn btn-secondary"
                    data-dismiss="modal">Close</button
                >
            </div>
        </div>
    </div>
</div>
