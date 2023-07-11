<!-- src/routes/+layout.svelte -->
<script>
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
