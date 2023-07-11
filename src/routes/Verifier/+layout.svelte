<script>
    import { userData } from "../../store";
    import { page } from "$app/stores";
    var selectedSidebarOption;
    $: selectedSidebarOption = $page.url.pathname.split("/").at(-1);
</script>

<div style="display: flex; height: 100%;">
    <div class="card p-3" style="width: 250px;  ">
        <ul class="nav nav-pills flex-column mb-auto">
            <li>
                <a
                    href="/Verifier/Dashboard"
                    class="nav-link Option activeOption"
                    style="display: flex; align-items: center;"
                    class:activeOption={selectedSidebarOption == "Dashboard"}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-house-door mr-2"
                        viewBox="0 0 16 16"
                    >
                        <path
                            d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146ZM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5Z"
                        />
                    </svg>
                    Dashboard
                </a>
            </li>
        </ul>
    </div>
    <div class="p-4 w-100 h-100 overflow-auto">
        <slot />
    </div>
</div>

<style>
    .Option {
        color: black;
    }
    .activeOption {
        background-color: var(--primary);
        color: white;
    }
</style>
