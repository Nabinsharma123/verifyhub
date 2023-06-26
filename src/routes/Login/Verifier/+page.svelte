<script>
    import AvatarUrl from "$lib/Avatar.js";
    import { globalSupabase, jq } from "../../../store";
    import { goto } from "$app/navigation";

    var selectedOption = "login";
    var authLoading = false;

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
                    role: "verifier",
                },
                emailRedirectTo:
                    "http://localhost:5173/API/auth/callback?type=Verifier",
            },
        });

        authLoading = false;

        if (error) {
            console.log(error);
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
        });

        authLoading = false;

        if (error) {
            console.log(err);
        } else {
            console.log(data);
            goto("/Verifier/Dashboard");
        }
    }

    async function googleAuth() {
        authLoading = true;
        const { data, error } = await $globalSupabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo:
                    "http://localhost:5173/API/auth/callback?type=Verifier",
            },
        });
    }
</script>

<div
    style="height: 100%;display: flex; justify-content: center; align-items: center;flex-direction: column;"
>
    <h3>Verifier login</h3>

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

            <button
                on:click={async () => {
                    googleAuth();
                }}
                type="button"
                style="display: flex;"
                class=" border rounded-lg p-2 bg-white shadow-sm"
            >
                <div style="flex: 1;">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:v="https://vecta.io/nano"
                        width="25px"
                        height="25px"
                        viewBox="0 0 186.69 190.5"
                        ><g transform="translate(1184.583 765.171)"
                            ><path
                                clip-path="none"
                                mask="none"
                                d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z"
                                fill="#4285f4"
                            /><path
                                clip-path="none"
                                mask="none"
                                d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z"
                                fill="#34a853"
                            /><path
                                clip-path="none"
                                mask="none"
                                d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.693-24.592 31.693-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z"
                                fill="#fbbc05"
                            /><path
                                d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z"
                                fill="#ea4335"
                                clip-path="none"
                                mask="none"
                            /></g
                        ></svg
                    >
                </div>
                <h5 class="font-weight-normal text-muted mb-0" style="flex: 3;">
                    Sign in with Google
                </h5>
            </button>
        {:else}
            <form>
                <div class="form-group">
                    <div style="display: flex;">
                        <div class="mb-2" style="flex: 2;">
                            <label for="user_name">User name</label>
                            <input
                                bind:value={userRegister.name}
                                type="text"
                                class="form-control"
                                id="user_name"
                                placeholder="Enter User name"
                            />
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
                    />
                </div>
                <div>
                    <div style="">
                        <button
                            on:click={() => {
                                registerUser();
                            }}
                            type="submit"
                            class="btn btn-success font-weight-bold w-100"
                            >Register</button
                        >
                    </div>
                </div>
            </form>
            <hr />

            <button
                on:click={async () => {
                    googleAuth();
                }}
                type="button"
                style="display: flex;"
                class=" border rounded-lg p-2 bg-white shadow-sm"
            >
                <div style="flex: 1;">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:v="https://vecta.io/nano"
                        width="25px"
                        height="25px"
                        viewBox="0 0 186.69 190.5"
                        ><g transform="translate(1184.583 765.171)"
                            ><path
                                clip-path="none"
                                mask="none"
                                d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z"
                                fill="#4285f4"
                            /><path
                                clip-path="none"
                                mask="none"
                                d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z"
                                fill="#34a853"
                            /><path
                                clip-path="none"
                                mask="none"
                                d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.693-24.592 31.693-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z"
                                fill="#fbbc05"
                            /><path
                                d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z"
                                fill="#ea4335"
                                clip-path="none"
                                mask="none"
                            /></g
                        ></svg
                    >
                </div>
                <h5 class="font-weight-normal text-muted mb-0" style="flex: 3;">
                    Sign in with Google
                </h5>
            </button>
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
