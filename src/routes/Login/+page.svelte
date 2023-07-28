<script>
    import AvatarUrl from "$lib/Avatar.js";
    import { globalSupabase, jq } from "../../store";
    import { goto } from "$app/navigation";
    import { PUBLIC_SITE_URL } from "$env/static/public";

    var selectedOption = "login";
    var authLoading = false;
    var registerType = "verifier";
    var inputTimeout;
    var isSearchLoading = false;
    var nameSearchResult = { error: true, message: "" };

    var userLogin = {
        email: "",
        password: "",
    };

    var userRegister = {
        name: "",
        email: "",
        password: "",
        avatar_url: "",
        gender: "F",
    };
    $: userRegister.avatar_url = AvatarUrl(
        userRegister.name,
        userRegister.gender
    );

    async function registerUser() {
        authLoading = true;
        const { data, error } = await $globalSupabase.auth.signUp({
            email: userRegister.email,
            password: userRegister.password,
            options: {
                data: {
                    avatar_url: userRegister.avatar_url,
                    name: userRegister.name,
                    role: registerType,
                },
                emailRedirectTo: `${PUBLIC_SITE_URL}API/auth/callback?type=${registerType}`,
            },
        });

        authLoading = false;

        if (error) {
            alert(error);
        } else {
            console.log(data);
            $jq("#popupMoldel").modal("show");
        }
    }

    async function logInUser() {
        authLoading = true;
        const { data, error } = await $globalSupabase.auth.signInWithPassword({
            email: userLogin.email,
            password: userLogin.password,
            redirectTo: { PUBLIC_SITE_URL },
        });

        authLoading = false;

        if (error) {
            alert(error);
        } else {
            console.log(data);
            if (data.user.user_metadata.role == "admin") {
                goto("/Admin/Dashboard");
            } else {
                goto("/Verifier/Dashboard");
            }
        }
    }

    async function searchName() {
        if (userRegister.name.length > 4) {
            const { count, error } = await $globalSupabase
                .from(registerType)
                .select("*", { count: "exact", head: true })
                .eq("name", userRegister.name);

            if (count > 0)
                nameSearchResult = {
                    error: true,
                    message: "name already exists",
                };

            console.log(count, error);
        } else {
            nameSearchResult = {
                error: true,
                message: "name should be atleast 5 characters",
            };
        }

        isSearchLoading = false;
    }
</script>

<div
    style="height: 100vh;display: flex; justify-content: center; align-items: center;flex-direction: column; background-color: #f4f6f9;"
>
    <div
        class="card shadow-sm rounded-lg pt-0 pb-4 pl-4 pr-4 mx-2"
        style="position: relative; width: 400px;"
    >
        {#if authLoading}
            <div
                class="h-100 w-100"
                style="position: absolute; background-color: rgba(255, 255, 255, 0.7);top: 0;left: 0;
      display: flex; justify-content: center; align-items: center;
      "
            >
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        {/if}

        <div
            class="mb-4"
            style="height: 50px;  display: flex;  margin-left: -1.5rem;margin-right:-1.5rem ;"
        >
            <button
                on:click={() => {
                    selectedOption = "login";
                }}
                class="pl-4 border-0 font-weight-bold"
                style={`flex: 1;${
                    selectedOption == "login"
                        ? "background-color:white;border-left:2px solid black"
                        : "background-color: rgba(0,0,0,0.2);color:rgba(0,0,0,0.5)"
                }`}>Log in</button
            >
            <button
                on:click={() => {
                    selectedOption = "register";
                }}
                class="font-weight-bold border-0"
                style={`flex: 1;${
                    selectedOption == "register"
                        ? "background-color:white"
                        : "background-color: rgba(0,0,0,0.2);color:rgba(0,0,0,0.5)"
                }`}>Register</button
            >
        </div>
        {#if selectedOption == "login"}
            <form>
                <div class="form-group">
                    <label for="exampleInputEmail1">Email address</label>
                    <input
                        bind:value={userLogin.email}
                        type="email"
                        class="form-control"
                        id="exampleInputEmail1"
                        aria-describedby="emailHelp"
                        placeholder="Enter email"
                    />
                </div>
                <div class="form-group">
                    <label for="exampleInputPassword1">Password</label>
                    <input
                        bind:value={userLogin.password}
                        type="password"
                        class="form-control"
                        id="exampleInputPassword1"
                        placeholder="Password"
                    />
                </div>
                <div>
                    <div style="">
                        <button
                            on:click={() => {
                                logInUser();
                            }}
                            type="submit"
                            class="btn btn-primary w-100 font-weight-bold"
                            >Log in</button
                        >
                    </div>
                </div>
            </form>
            <hr />
        {:else}
            <form
                on:submit|preventDefault={() => {
                    registerUser();
                }}
            >
                <div class="form-group">
                    <div class="d-flex my-4" style="gap:20px">
                        <h6>Register a :-</h6>
                        <label class="m-0 d-flex" style="gap: 5px;">
                            <input
                                bind:group={registerType}
                                type="radio"
                                name="FormType"
                                value="verifier"
                            />
                            Verifier
                        </label>

                        <label class="m-0 d-flex" style="gap: 5px;">
                            <input
                                bind:group={registerType}
                                type="radio"
                                name="FormType"
                                value="admin"
                            />
                            Admin
                        </label>
                    </div>
                    <div style="display: flex;">
                        <div class="mb-2" style="flex: 2;">
                            <label for="user_name">User name</label>
                            {#if isSearchLoading}
                                <div
                                    class="spinner-border spinner-border-sm"
                                    role="status"
                                />
                            {/if}
                            <input
                                bind:value={userRegister.name}
                                on:keydown={() => {
                                    nameSearchResult.error = false;
                                    isSearchLoading = true;
                                    clearTimeout(inputTimeout);
                                }}
                                on:keyup={() => {
                                    clearTimeout(inputTimeout);
                                    inputTimeout = setTimeout(searchName, 300);
                                }}
                                required
                                type="text"
                                class="form-control"
                                id="user_name"
                                placeholder="Enter User name"
                            />
                            {#if nameSearchResult.error}
                                <h6 class="text-danger">
                                    {nameSearchResult.message}
                                </h6>
                            {/if}
                        </div>

                        <div
                            style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;"
                        >
                            <img
                                class="mb-1"
                                style="height: 50px;"
                                src={userRegister.avatar_url}
                                alt=""
                            />
                            <select
                                bind:value={userRegister.gender}
                                style=""
                                class="rounded-lg"
                                name=""
                                id=""
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                            </select>
                        </div>
                    </div>
                    <label for="exampleInputEmail1">Email address</label>
                    <input
                        bind:value={userRegister.email}
                        type="email"
                        class="form-control"
                        id="exampleInputEmail1"
                        aria-describedby="emailHelp"
                        placeholder="Enter email"
                        required
                    />
                </div>
                <div class="form-group">
                    <label for="exampleInputPassword1">Password</label>
                    <input
                        bind:value={userRegister.password}
                        type="password"
                        class="form-control"
                        id="exampleInputPassword1"
                        placeholder="Password"
                        required
                    />
                </div>
                <div>
                    <div style="">
                        <button
                            disabled={nameSearchResult.error}
                            type="submit"
                            class="btn btn-success font-weight-bold w-100"
                            >Register</button
                        >
                    </div>
                </div>
            </form>
            <hr />
        {/if}
    </div>
</div>

<div
    class="modal fade"
    id="popupMoldel"
    data-backdrop="static"
    data-keyboard="false"
    tabindex="-1"
    aria-labelledby="staticBackdropLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">
                    Email Verification
                </h5>
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
                we send a verification mail at

                <span class="font-weight-bold">{userRegister.email}</span>

                please verify your mail
            </div>
        </div>
    </div>
</div>
