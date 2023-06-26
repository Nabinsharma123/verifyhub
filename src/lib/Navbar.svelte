<script>
    import { userData } from "../store";
</script>

<nav class="navbar navbar-light bg-dark shadow-sm" style="z-index: 20;">
    <a href="/">
        <span class="navbar-brand text-white mb-0 h1"
            >Physical verification</span
        >
    </a>

    {#if $userData}
        <img
            class="rounded-circle"
            style="height: 30px;cursor: pointer;"
            src={$userData.user_metadata.avatar_url}
            alt=""
            data-toggle="modal"
            data-target="#exampleModal"
        />
    {/if}
</nav>
