<!-- src/routes/+layout.svelte -->
<script>
  import "../app.css";
  import { pwaInfo } from "virtual:pwa-info";
  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";

  import { onMount } from "svelte";
  import { invalidate } from "$app/navigation";
  import { globalSupabase, userData, jq, refreshLocalstorage } from "../store";
  import Navbar from "../lib/Navbar.svelte";

  export let data;

  let { supabase, session } = data;
  $: ({ supabase, session } = data);
  $: $globalSupabase = supabase;
  // $: console.log($globalSupabase);
  $: $userData = session?.user;
  // $: console.log($userData);

  onMount(async () => {
    $jq = window.$;
    // addJquery();
    // addBootstrap();

    const { data } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate("supabase:auth");

        refreshLocalstorage();
      }
    });

    return () => data.subscription.unsubscribe();
  });
  var jqueryIsLoaded = false;
  var bootstrapIsLoaded = false;

  // function addBootstrap() {
  //   let script = document.createElement("script");
  //   script.src =
  //     "https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js";
  //   script.integrity =
  //     "sha384-Fy6S3B9q64WdZWQUiU+q4/2Lc9npb8tCaSX9FK7E8HnRr0Jz8D6OP9dO5Vg3Q9ct";
  //   script.crossOrigin = "anonymous";
  //   document.head.append(script);
  //   script.onload = (e) => {
  //     bootstrapIsLoaded = true;
  //   };
  // }

  // function addJquery() {
  //   let script = document.createElement("script");
  //   script.src =
  //     "https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js";
  //   script.integrity =
  //     "sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj";
  //   script.crossOrigin = "anonymous";
  //   document.head.append(script);
  //   script.onload = (e) => {
  //     $jq = window.$;

  //     jqueryIsLoaded = true;
  //   };
  // }
</script>

<svelte:head>
  {@html webManifestLink}
</svelte:head>

<!-- {#if jqueryIsLoaded && bootstrapIsLoaded} -->

<slot />

<!-- notification -->

<!-- <div
    class="position-fixed bottom-0 right-0 p-3"
    style="z-index: 99; right: 0; top: 0;"
  >
    {#if show}
      {#each notification as { text, link, id }}
        <Notification
          {id}
          {text}
          {link}
          on:close={(event) => {
            notification = notification.filter((e) => e.id !== event.detail.id);
            $jq(`#notification${id}`).remove();
          }}
        />
      {/each}
    {/if}
  </div> -->
<!-- {/if} -->

<!-- notification -->
