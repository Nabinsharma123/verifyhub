<!-- src/routes/+layout.svelte -->
<script>
  import "../app.css";
  import { pwaInfo } from "virtual:pwa-info";
  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";

  import { onMount } from "svelte";
  import { invalidate } from "$app/navigation";
  import { globalSupabase, userData, jq, refreshLocalstorage } from "../store";

  export let data;

  let { supabase, session } = data;
  $: ({ supabase, session } = data);
  $: $globalSupabase = supabase;
  // $: console.log($globalSupabase);
  $: $userData = session?.user;
  // $: console.log($userData);

  onMount(async () => {
    // $jq = window.$;
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

  function addBootstrap() {
    let script = document.createElement("script");
    script.src = "/plugins/bootstrap/js/bootstrap.bundle.min.js";

    document.body.append(script);
    script.onload = (e) => {
      bootstrapIsLoaded = true;
      addAdminlte();
    };
  }

  function addJquery() {
    let script = document.createElement("script");
    script.src = "/plugins/jquery/jquery.min.js";

    document.body.append(script);
    script.onload = (e) => {
      $jq = window.$;

      jqueryIsLoaded = true;
      addBootstrap();
    };
  }

  function addAdminlte() {
    let script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/admin-lte@3.1/dist/js/adminlte.min.js";

    document.body.append(script);
    script.onload = (e) => {
      console.log("ok");
    };
  }
</script>

<svelte:head>
  {@html webManifestLink}
</svelte:head>

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
