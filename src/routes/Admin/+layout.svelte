<script>
  import { page } from "$app/stores";
  import { onDestroy, onMount } from "svelte";
  import { globalSupabase, jq } from "../../store";
  import Navbar from "../../lib/Navbar.svelte";

  var selectedSidebarOption = "";
  var dropdownOpen = false;
  $: selectedSidebarOption = $page.url.pathname.split("/");
  // onMount(() => {
  //   $jq('[data-widget="treeview"]').each(function () {
  //     $jq(this).Treeview("init");
  //   });
  // });
</script>

<Navbar />

<aside class="main-sidebar sidebar-dark-primary elevation-4">
  <!-- Brand Logo -->

  <a href="/" class="brand-link">
    <img
      src="/favicon.png"
      alt=""
      class="brand-image img-circle elevation-3"
      style="opacity: .8"
    />
    <span class="brand-text font-weight-light">Verifyhub</span>
  </a>

  <!-- Sidebar -->
  <div class="sidebar">
    <!-- Sidebar Menu -->
    <nav class="mt-2">
      <ul
        class="nav nav-pills nav-sidebar flex-column"
        role="menu"
        data-accordion="false"
      >
        <li class="nav-item">
          <a
            href="/Admin/Dashboard"
            class="nav-link"
            class:active={selectedSidebarOption[2] == "Dashboard"}
          >
            <i class="nav-icon fas fa-tachometer-alt" />

            <p>Dashboard</p>
          </a>
        </li>

        <li
          class="nav-item"
          class:menu-is-opening={dropdownOpen}
          class:menu-open={dropdownOpen}
        >
          <a
            on:click={() => {
              dropdownOpen = !dropdownOpen;
            }}
            href="#"
            class="nav-link"
            class:active={selectedSidebarOption[2] == "Requests"}
          >
            <i class="nav-icon fas fa-edit" />
            <p>
              Request
              <i class="fas fa-angle-left right" />
            </p>
          </a>
          <ul id="treeElement" class="nav nav-treeview">
            <li class="nav-item">
              <a
                href="/Admin/Requests"
                class="nav-link"
                class:active={selectedSidebarOption[2] == "Requests" &&
                  !selectedSidebarOption[3]}
              >
                <i class="far fa-circle nav-icon" />
                <p>My Requests</p>
              </a>
            </li>
            <li class="nav-item">
              <a
                href="/Admin/Requests/SharedRequest"
                class="nav-link"
                class:active={selectedSidebarOption[2] == "Requests" &&
                  selectedSidebarOption[3] == "SharedRequest"}
              >
                <i class="far fa-circle nav-icon" />
                <p>Shared Request</p>
              </a>
            </li>
            <li class="nav-item">
              <a
                href="/Admin/Requests/NewRequest"
                class="nav-link"
                class:active={selectedSidebarOption[2] == "Requests" &&
                  selectedSidebarOption[3] == "NewRequest"}
              >
                <i class="far fa-circle nav-icon" />
                <p>New Request</p>
              </a>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <a
            href="/Admin/Tasklist"
            class="nav-link"
            class:active={selectedSidebarOption[2] == "Tasklist"}
          >
            <i class="nav-icon fas fa-tachometer-alt" />

            <p>Tasklist</p>
          </a>
        </li>
      </ul>
    </nav>
    <!-- /.sidebar-menu -->
  </div>
  <!-- /.sidebar -->
</aside>
<div class="content-wrapper p-3">
  <slot />
</div>

<!-- <div style="display: flex; height: 100%;">
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
</div> -->

<style>
  .Option {
    color: black;
  }
  .activeOption {
    background-color: var(--primary);
    color: white;
  }
</style>
