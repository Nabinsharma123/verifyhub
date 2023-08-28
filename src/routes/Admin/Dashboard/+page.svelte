<script>
  import { onMount } from "svelte";
  import {
    dashboardAdmin,
    fetchDashboardAdmin,
    globalSupabase,
    jq,
  } from "../../../store";

  var lat, long;

  onMount(async () => {
    await fetchDashboardAdmin();

    console.log($dashboardAdmin);

    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(
    //     (data) => {
    //       console.log(data);
    //       lat = data.coords.latitude;
    //       long = data.coords.longitude;
    //     },
    //     (error) => {
    //       console.log(error);
    //     }
    //   );
    // } else console.log("no");

    // var res = await fetch(
    //   `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=22.572646&lon=88.363895`
    // );
    // console.log(await res.json());
  });
</script>

<div>
  <div class="content-header pb-4 pt-0 pl-0">
    <h1 class="m-0">Dashboard</h1>
  </div>

  <section class="content">
    <div class="row">
      <div class="col-lg-3 col-6">
        <div class="small-box bg-info">
          <div class="inner">
            <h3>{$dashboardAdmin.totalRequest}</h3>

            <p>Total Request</p>
          </div>
          <div class="icon">
            <i class="fas fa-ticket-alt" />
          </div>
          <a href="/Admin/Requests" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right" />
          </a>
        </div>
      </div>
      <div class="col-lg-3 col-6">
        <div class="small-box bg-success">
          <div class="inner">
            <h3>
              {$dashboardAdmin.totalTasklist}<sup style="font-size: 20px" />
            </h3>

            <p>Total Tasklists</p>
          </div>
          <div class="icon">
            <i class="fas fa-file-alt" />
          </div>
          <a href="/Admin/Tasklist" class="small-box-footer"
            >More info <i class="fas fa-arrow-circle-right" /></a
          >
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="small-box bg-warning">
          <div class="inner">
            <h3>{$dashboardAdmin.assigned_request_to_admin}</h3>

            <p>Total Shared Request</p>
          </div>
          <div class="icon">
            <i class="ion ion-person-add" />
          </div>
          <a href="/Admin/Requests/SharedRequest" class="small-box-footer"
            >More info <i class="fas fa-arrow-circle-right" /></a
          >
        </div>
      </div>
    </div>

    <!-- <button
      on:click={() => {
        $jq(document).Toasts("create", {
          icon: "bi bi-envelope fa-lg",
          title: "Toast Title",
          body: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr.",
        });
      }}>click</button
    > -->

    <!-- <div class="d-flex" style="gap: 10px;">
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
    </div> -->
  </section>
</div>

<!-- <iframe
  src={`https://google.com/maps?q=${lat},${long}&t=&z=15&ie=UTF8&output=embed`}
  width="100%"
  height="450"
  frameborder="0"
  allowfullscreen
  style="border:0"
  title="ok"
/> -->
