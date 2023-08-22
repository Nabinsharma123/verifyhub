<script>
    import { fade, fly } from "svelte/transition";
    import { globalSupabase, jq, userData } from "../../store";
    import { createEventDispatcher, onMount } from "svelte";
    import { saveAs } from "file-saver";
    import { comment } from "svelte/internal";

    const dispatch = createEventDispatcher();

    export var verifier_tasklist_id,
        verifier_id,
        verifier_name,
        requestId,
        tasklistId;
    console.log(tasklistId);
    var loading = true;

    var formData, formSubmittedData;
    var formName;
    var form;

    onMount(async () => {
        $jq("#printableFormat").modal("show");

        $jq("#printableFormat").on("hidden.bs.modal", () => {
            dispatch("close");
        });
        const { data, error } = await $globalSupabase
            .from("verifier_tasklist")
            .select("submitted_json_data,tasklist(JSON_data,name)")
            .eq("id", verifier_tasklist_id)
            .single();

        if (error) console.log(error);
        else {
            console.log(data);

            formData = data.tasklist.JSON_data;
            formName = data.tasklist.name;

            formSubmittedData = data.submitted_json_data;
        }

        console.log(formSubmittedData);

        loadform();

        loading = false;
    });

    var printableFormat = [];

    async function loadform() {
        console.log(formData);
        if (formData.display == "wizard") {
            formData.components.forEach((page, index) => {
                printableFormat = [
                    ...printableFormat,
                    { name: page.title, components: [] },
                ];
                recursiveform(page, index, true);
            });
        } else {
            printableFormat = [...printableFormat, { components: [] }];
            recursiveform(formData, 0, true);
        }
        console.log(printableFormat);
    }

    function recursiveform(component, index, ignore) {
        if (!ignore) {
            printableFormat[index].components = [
                ...printableFormat[index].components,
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
                if (subComponent.type == "file") {
                    if (formSubmittedData[subComponent.key]) {
                        let res = await fetch(
                            formSubmittedData[subComponent.key][0].url
                        );
                        let blob = await res.blob();
                        let dataUrl = await new Promise((resolve) => {
                            let reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });

                        printableFormat[index].components = [
                            ...printableFormat[index].components,
                            {
                                type: subComponent.type,
                                name: subComponent.label,
                                value: dataUrl,
                            },
                        ];
                    } else {
                        printableFormat[index].components = [
                            ...printableFormat[index].components,
                            {
                                type: subComponent.type,
                                name: subComponent.label,
                                value: formSubmittedData[subComponent.key]
                                    ? formSubmittedData[subComponent.key]
                                    : `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==`,
                            },
                        ];
                    }
                } else {
                    printableFormat[index].components = [
                        ...printableFormat[index].components,
                        {
                            type: subComponent.type,
                            name: subComponent.label,
                            value: formSubmittedData[subComponent.key]
                                ? formSubmittedData[subComponent.key]
                                : "--",
                        },
                    ];
                }
            }
        });
    }

    function pdf() {
        var val = htmlToPdfmake(document.getElementById("pdf").outerHTML, {
            tableAutoSize: true,
            dontBreakRows: true,
        });
        var dd = { content: val };
        console.log(dd);
        pdfMake.createPdf(dd).download(`${formName} - ${verifier_name}`);
    }

    async function exportSheet() {
        const workbook = new ExcelJS.Workbook();

        for (var page of printableFormat) {
            if (formData.display == "wizard") {
                var worksheet = workbook.addWorksheet(
                    page.name.replace(/\//g, "|")
                );
            } else {
                var worksheet = workbook.addWorksheet(verifier_name);
            }

            worksheet.properties.defaultRowHeight = 30;

            worksheet.columns = [
                { key: "num", width: 5 },
                { key: "name", width: 40 },
                { key: "value", width: 40 },
            ];

            worksheet.mergeCells("A1:H1");
            if (formData.display == "wizard") {
                worksheet.getCell("A1").value = page.name;
            } else {
                worksheet.getCell(
                    "A1"
                ).value = `${formName} - ${verifier_name}`;
            }
            worksheet.getCell("A1").alignment = {
                vertical: "middle",
                horizontal: "center",
            };
            worksheet.getCell("A1").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "3399FF" },
            };
            worksheet.getCell("A1").font = {
                name: "Arial Black",
                color: { argb: "FFFFFFFF" },
                family: 4,
                size: 20,
            };

            worksheet.getRow(2).values = ["", "", ""];

            for (var [index, component] of page.components.entries()) {
                var { type, name, value } = component;
                var newRow = worksheet.addRow({
                    num: index + 1,
                    name: name,
                    value: "",
                });

                [
                    newRow.getCell("A"),
                    newRow.getCell("B"),
                    newRow.getCell("C"),
                ].forEach((cell) => {
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                    cell.alignment = {
                        vertical: "top",
                        horizontal: "left",
                        wrapText: true,
                    };
                });

                if (type == "heading") {
                    worksheet.mergeCells(
                        `B${newRow._number}:C${newRow._number}`
                    );
                    newRow.getCell("C").value = name;
                    newRow.getCell("C").alignment = {
                        vertical: "middle",
                        horizontal: "center",
                        wrapText: true,
                    };
                    newRow.getCell("C").fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "F5E9DA" },
                    };
                    newRow.getCell("C").font = {
                        bold: true,
                    };
                } else if (type == "file" || type == "signature") {
                    const imageId = workbook.addImage({
                        base64: value,
                    });
                    var { w, h } = await getImageDimensions(value);
                    newRow.height = h;

                    worksheet.addImage(imageId, {
                        tl: { col: 2.5, row: newRow._number - 1 + 0.5 },
                        ext: { width: w, height: h },
                        editAs: "absolute",
                    });
                } else {
                    newRow.getCell("C").value = value;
                }
            }
        }

        const xls64 = await workbook.xlsx.writeBuffer({ base64: true });
        saveAs(
            new Blob([xls64], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            `${formName} - ${verifier_name}`
        );
    }

    function getImageDimensions(file) {
        return new Promise(function (resolved, rejected) {
            var i = new Image();
            i.onload = function () {
                resolved({ w: i.naturalWidth, h: i.naturalHeight });
            };
            i.src = file;
        });
    }
</script>

<div
    class="modal fade"
    id="printableFormat"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
>
    <div
        class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
    >
        <div class="modal-content" style="position: relative;">
            <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">
                    {formName} - {verifier_name}
                </h5>
            </div>
            <div class="modal-body" style="min-height: 100px; ">
                {#if loading}
                    <div
                        class="d-flex justify-content-center align-items-center w-100 h-100"
                        style="top: 0;left: 0;bottom: 0; position: absolute;background-color: rgba(255, 255, 255, 0.8);z-index: 50;"
                    >
                        <div class="spinner-border" role="status" />
                    </div>
                {/if}
                <!-- <div id="formio" /> -->
                <div id="pdf">
                    {#if !loading}
                        <h1 style="text-align: center;margin-bottom: 40px;">
                            {formName} - {verifier_name}
                        </h1>
                    {/if}
                    {#each printableFormat as page}
                        <div style="margin-bottom: 30px;">
                            <table
                                data-pdfmake={`{'dontBreakRows': true}`}
                                style="width: 100%; "
                            >
                                {#if formData.display == "wizard"}
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
                                {#each page.components as { type, name, value }}
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
                                                style="width: 200px;border: 1px solid #ddd;border-collapse: collapse;"
                                            >
                                                <p style="margin: 10px;">
                                                    {name}
                                                </p>
                                            </td>
                                            <td
                                                style="border: 1px solid #ddd;border-collapse: collapse;"
                                            >
                                                {#if type == "file" || type == "signature"}
                                                    <img
                                                        style="margin: 10px;"
                                                        src={value}
                                                        alt=""
                                                    />
                                                {:else}
                                                    <p style="margin: 10px;">
                                                        {value}
                                                    </p>
                                                {/if}
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
                    disabled={loading}
                    on:click={() => {
                        exportSheet();
                    }}
                    type="button"
                    class="btn btn-success"
                >
                    <i class="bi bi-download" />
                    Export as Excel</button
                >
                <button
                    on:click={() => {
                        // exporter.toPdf(options.config).then((pdf) => {
                        //     pdf.save();
                        // });
                        pdf();
                    }}
                    disabled={loading}
                    type="button"
                    class="btn btn-danger"
                >
                    <i class="bi bi-download" />
                    Export as PDF</button
                >
                <button
                    data-dismiss="modal"
                    type="button"
                    class="btn btn-secondary">Close</button
                >
            </div>
        </div>
    </div>
</div>

<style>
</style>
