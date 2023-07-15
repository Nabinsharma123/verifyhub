<!-- src/routes/+layout.svelte -->
<script>
  import "../app.css";
  import { pwaInfo } from "virtual:pwa-info";
  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";

  import { onMount } from "svelte";
  import { invalidate } from "$app/navigation";
  import { globalSupabase, userData, jq } from "../store";
  import Navbar from "../lib/Navbar.svelte";

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
</svelte:head>

<Navbar />

<!-- <button
  on:click={() => {
    $jq("#notification").toast("show");
  }}
>
  click
</button> -->

<div class=" w-100 overflow-auto" style="height: calc(100vh - 56px)">
  <slot />
</div>

<!-- notification -->
<div
  class="position-fixed bottom-0 right-0 p-3"
  style="z-index: 99; right: 0; top: 0;"
>
  <div
    id="notification"
    class="toast fade hide"
    data-autohide="false"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
    data-delay="2000"
  >
    <div class="toast-header">
      <!-- <img src="..." class="rounded mr-2" alt="..." /> -->
      <strong class="mr-auto">Bootstrap</strong>
      <small>11 mins ago</small>
      <button
        type="button"
        class="ml-2 mb-1 close"
        data-dismiss="toast"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="toast-body">Hello, world! This is a toast message.</div>
  </div>
</div>

<!-- notification -->
