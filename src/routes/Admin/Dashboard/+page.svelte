<script>
  import { onMount } from "svelte";
  import { dashboardAdmin, fetchDashboardAdmin } from "../../../store";

  onMount(async () => {
    await fetchDashboardAdmin();
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
        <div class="card-body">
          {$dashboardAdmin.totalRequest === null
            ? "..."
            : $dashboardAdmin.totalRequest}
        </div>
      </div>
    </div>
    <div class="mt-2">
      <div class="card" style="width: 300px;">
        <div class="card-header">
          <h6>Total Tasklist</h6>
        </div>
        <div class="card-body">
          {$dashboardAdmin.totalTasklist === null
            ? "..."
            : $dashboardAdmin.totalTasklist}
        </div>
      </div>
    </div>
  </div>
</div>
