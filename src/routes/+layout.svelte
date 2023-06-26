<!-- src/routes/+layout.svelte -->
<script>
  import { pwaInfo } from "virtual:pwa-info";
  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";

  import { onMount } from "svelte";
  import { invalidate } from "$app/navigation";
  import { globalSupabase, userData, jq, TasklistkViewer } from "../store";
  import Navbar from "../lib/Navbar.svelte";
  import TasklistViewer from "../lib/TasklistViewer.svelte";
  import { browser } from "$app/environment";

  import { goto } from "$app/navigation";

  export let data;

  let { supabase, session } = data;
  $: ({ supabase, session } = data);
  $: $globalSupabase = supabase;
  // $: console.log($globalSupabase);
  $: $userData = session?.user;
  // $: console.log($userData);

  onMount(async () => {
    $jq = window.$;

    const { data } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate("supabase:auth");
      }
    });

    return () => data.subscription.unsubscribe();
  });

  // function jquery() {
  //   $jq = window.$;
  // }
</script>

<svelte:head>
  {@html webManifestLink}

  <!-- {#if browser} -->
  <!-- {#if browser} -->

  <!-- {#if browser} -->
  <!-- {#if browser} -->
  <!-- <script
    src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js"
    integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj"
    crossorigin="anonymous"
  >
  </script> -->
</svelte:head>

<Navbar />

<div class=" w-100 overflow-auto" style="height: calc(100vh - 56px)">
  <slot />
</div>
<!-- profile -->
<div
  class="modal fade"
  id="exampleModal"
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
            data-toggle="modal"
            data-target="#exampleModal"
          />
          {$userData?.user_metadata.role
            ? $userData?.user_metadata.role
            : "verifier"}
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
            const { error } = await $globalSupabase.auth.signOut();
            if ($userData?.user_metadata.role == "admin") goto("/Login/Admin");
            else goto("/Login/Verifier");
          }}
          type="button"
          class="btn btn-outline-danger">Sign Out</button
        >
      </div>
    </div>
  </div>
</div>
<!-- profile -->

<!-- tasklistViewer -->
{#if $TasklistkViewer}
  <TasklistViewer id={$TasklistkViewer.id} name={$TasklistkViewer.name} />
{/if}
<!-- tasklistViewer -->
