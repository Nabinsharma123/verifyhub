<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export var name;
    function truncateText(str) {
        if (str.length > 25) {
            return str.slice(0, 29) + "...";
        } else return str;
    }
</script>

<button
    on:click={() => {
        dispatch("click");
    }}
    class="border-0 bg-white"
    title={name}
>
    <div
        class="card px-2 pt-2"
        style=" width: 150px;border-radius: 10px;border:0;"
    >
        <div
            style="background-color: #fff;border-radius: 10px;"
            class="h-100 py-3 d-flex justify-content-center align-items-center"
        >
            <img style="width: 90px;" src="/documentIcon.svg" alt="" />
        </div>

        <h5 class="font-weight-normal">
            {truncateText(name)}
        </h5>
    </div>
</button>

<style>
    .card {
        background-color: #e7f0ff;
    }
    .card:hover {
        background-color: #c2e7ff !important;
        border-color: #c2e7ff !important;
    }
    img {
        transition: all 0.5s ease-out;
    }

    button:hover img {
        scale: 1.2;
    }
</style>
