<script>
  import { page } from "$app/stores";
    import { onMount } from "svelte";
  import { globalSupabase } from "../../store";

  var selectedSidebarOption = "";
  $: selectedSidebarOption = $page.url.pathname.split("/")[2];





</script>

<div style="display: flex; height: 100%;">
  <div class="card rounded-0 p-3" style="width: 250px;  ">
    <ul class="nav nav-pills flex-column mb-auto">
      <li>
        <a
          href="/Admin/Dashboard"
          class="nav-link Option activeOption"
          style="display: flex; align-items: center;"
          class:activeOption={selectedSidebarOption == "Dashboard"}
        >
          <i class="bi bi-house-door mr-2" />
          Dashboard
        </a>
      </li>
      <li>
        <a
          href="/Admin/Requests"
          class="nav-link Option activeOption"
          style="display: flex; align-items: center;"
          class:activeOption={selectedSidebarOption == "Requests"}
        >
          <i class="bi bi-file-earmark-bar-graph mr-2" />
          Requests
        </a>
      </li>
      <li>
        <a
          href="/Admin/Tasklist"
          class="nav-link Option"
          style="display: flex; align-items: center;"
          class:activeOption={selectedSidebarOption == "Tasklist"}
        >
          <i class="bi bi-card-list mr-2" />
          Tasklist
        </a>
      </li>
    </ul>
  </div>
  <div class="position-relative p-4 w-100 h-100 overflow-auto">
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
