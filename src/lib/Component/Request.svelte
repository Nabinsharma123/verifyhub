<script>
    export var list;

    import { createEventDispatcher } from "svelte";
    import { userData } from "../../store";
    const dispatch = createEventDispatcher();
</script>

<div class="card">
    <div class="card-body p-0">
        <table class="table table-striped projects">
            <thead>
                <tr>
                    <th style="width: 1%"> No. </th>
                    <th style="width: 20%"> Request Name </th>
                    <th style="width: 20%"> Created At </th>
                    <!-- <th> Requests Progress </th> -->
                    <th style="width: 8%" class="text-center"> Status </th>
                    <th style="width: 20%" />
                </tr>
            </thead>
            <tbody>
                {#each list as { id, name, created_at, status }, index}
                    <tr>
                        <td> {index + 1} </td>
                        <td>
                            <h6 class="m-0">{name}</h6>
                        </td>
                        <td>
                            <ul class="list-inline">
                                <li class="list-inline-item">
                                    <h6>
                                        Date: {created_at.date}
                                    </h6>

                                    <h6 class="m-0">
                                        Time: {created_at.time}
                                    </h6>
                                </li>
                            </ul>
                        </td>
                        <!-- <td class="project_progress">
                            --
                            <div class="progress progress-sm">
                                <div
                                    class="progress-bar bg-green"
                                    role="progressbar"
                                    aria-valuenow="77"
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                    style="width: 77%"
                                />
                            </div>
                            <small> 77% Complete </small>
                        </td> -->
                        <td class="project-state">
                            {#if status == "Active"}
                                <span class="badge badge-success">{status}</span
                                >
                            {:else}
                                <span class="badge badge-warning">{status}</span
                                >
                            {/if}
                        </td>
                        <td class="project-actions text-right">
                            <button
                                on:click={() => {
                                    dispatch("view", {
                                        name: name,
                                        id: id,
                                        status,
                                    });
                                }}
                                class="btn btn-primary btn-sm"
                            >
                                <i class="fas fa-folder" />
                                View
                            </button>

                            {#if $userData.user_metadata.role == "admin"}
                                <button
                                    on:click={() => {
                                        dispatch("delete", {
                                            id,
                                        });
                                    }}
                                    class="btn btn-danger btn-sm"
                                    href="#"
                                >
                                    <i class="fas fa-trash" />
                                    Delete
                                </button>
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <!-- /.card-body -->
</div>
