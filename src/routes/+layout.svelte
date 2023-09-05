<!-- src/routes/+layout.svelte -->
<script>
  import "../app.css";
  import { pwaInfo } from "virtual:pwa-info";
  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";

  import { onMount } from "svelte";
  import { invalidate } from "$app/navigation";
  import { globalSupabase, userData, jq, refreshLocalstorage } from "../store";

  export let data;
  var fullLoading = true;

  let { supabase, session } = data;
  $: ({ supabase, session } = data);
  $: $globalSupabase = supabase;
  // $: console.log($globalSupabase);
  $: $userData = session?.user;
  // $: console.log($userData);
  // var loading=true
  onMount(async () => {
    addJquery();

    const { data } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate("supabase:auth");

        refreshLocalstorage();
      }
    });

    return () => data.subscription.unsubscribe();
  });

  function addJquery() {
    let script = document.createElement("script");
    script.src = "/plugins/jquery/jquery.min.js";

    document.body.append(script);
    script.onload = (e) => {
      $jq = window.$;
      addBootstrap();
    };
  }

  function addBootstrap() {
    let script = document.createElement("script");
    script.src = "/plugins/bootstrap/js/bootstrap.bundle.min.js";

    document.body.append(script);
    script.onload = (e) => {
      addAdminlit();
    };
  }

  function addAdminlit() {
    let script = document.createElement("script");
    script.src = "/dist/js/adminlte.min.js";

    document.body.append(script);
    script.onload = (e) => {
      fullLoading = false;
    };
  }
</script>

<svelte:head>
  {@html webManifestLink}
</svelte:head>

{#if fullLoading}
  <div
    style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: white; display: flex;
  justify-content: center; align-items: center;
  "
  >
    <div style="">
      <div class="spinner-border" role="status" />
    </div>
  </div>
{:else}
  <slot />
{/if}

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
