<script>
  import { onMount } from "svelte";
  import { Tasklist, globalSupabase, userData } from "../../../store";

  var totalRequest = null;
  var totalTasklist = null;
  $globalSupabase
    .from("admin")
    .select("tasklist(count),verification_request(count)")
    .eq("id", $userData.id)
    .single()
    .then(({ data }) => {
      totalRequest = data.verification_request[0].count;
      totalTasklist = data.tasklist[0].count;
    });
</script>

<div>
  <h3>Dashboard</h3>
  <hr class="m-0" />

  <div class="d-flex" style="gap: 10px;">
    <div class="mt-2">
      <div class="card" style="width: 300px;">
        <div class="card-header">
          <h6>Total Request</h6>
        </div>
        <div class="card-body">{totalRequest}</div>
      </div>
    </div>
    <div class="mt-2">
      <div class="card" style="width: 300px;">
        <div class="card-header">
          <h6>Total Tasklist</h6>
        </div>
        <div class="card-body">{totalTasklist}</div>
      </div>
    </div>
  </div>
</div>
