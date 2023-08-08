<script>
    import { userData, globalSupabase } from "../store";
    import { goto } from "$app/navigation";
</script>

<nav class="main-header navbar navbar-expand navbar-white navbar-light">
    <!-- Left navbar links -->
    <ul class="navbar-nav">
        <li class="nav-item">
            <a class="nav-link" data-widget="pushmenu" href="#" role="button"
                ><i class="fas fa-bars" /></a
            >
        </li>
    </ul>

    <!-- Right navbar links -->
    <ul class="navbar-nav ml-auto">
        {#if $userData}
            <li
                class="nav-item ml-1"
                style="display: flex; align-items: center;"
            >
                <div
                    data-toggle="modal"
                    data-target="#profileModal"
                    style="height: 30px;width: 30px;cursor: pointer;"
                >
                    <img
                        class="rounded-circle"
                        style="height: 30px;cursor: pointer;"
                        src={$userData.user_metadata.avatar_url}
                        alt=""
                        referrerpolicy="no-referrer"
                    />
                </div>
            </li>
        {/if}
    </ul>
</nav>

<!-- <nav class="navbar navbar-light bg-dark shadow-sm" style="z-index: 20;">
    <a href="/">
        <span class="navbar-brand text-white mb-0 h1"
            >Physical verification</span
        >
    </a>

    {#if $userData}
        <div
            data-toggle="modal"
            data-target="#profileModal"
            style="height: 30px;width: 30px;cursor: pointer;"
        >
            <img
                class="rounded-circle"
                style="height: 30px;cursor: pointer;"
                src={$userData.user_metadata.avatar_url}
                alt=""
                referrerpolicy="no-referrer"
            />
        </div>
    {/if}
</nav> -->

<!-- profile -->
<div
    class="modal fade"
    id="profileModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Profile</h5>
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
                <div
                    style="display: flex; justify-content: center;align-items: center;gap: 10px;"
                >
                    <img
                        class="rounded-circle"
                        style="height: 80px;cursor: pointer;"
                        src={$userData?.user_metadata.avatar_url}
                        alt=""
                        referrerpolicy="no-referrer"
                    />
                    {$userData?.user_metadata.role}
                </div>
                <p>
                    {$userData?.user_metadata.name}
                </p>
                <p>
                    {$userData?.email}
                </p>
                <button
                    data-dismiss="modal"
                    on:click={async () => {
                        await $globalSupabase.auth.signOut();
                        goto("/Login");
                    }}
                    type="button"
                    class="btn btn-outline-danger">Sign Out</button
                >
            </div>
        </div>
    </div>
</div>
<!-- profile -->
