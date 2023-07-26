<script>
    import { onMount } from "svelte";
    import { fetchDashboardVerifier, dashboardVerifier } from "../../../store";
    onMount(async () => {
        await fetchDashboardVerifier();
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
                        <h3>{$dashboardVerifier.totalRequest}</h3>

                        <p>Total Request</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-shopping-cart" />
                    </div>
                    <a href="/Admin/Requests" class="small-box-footer">
                        More info <i class="fas fa-arrow-circle-right" />
                    </a>
                </div>
            </div>
        </div>
    </section>
</div>
