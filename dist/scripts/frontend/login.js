import { trackEvent, events, eventProperties } from "./analytics.js";

// import {
//     getAuth,
//     signInWithPopup,
//     GoogleAuthProvider,
// } from "/firebase/auth.js";

// Import the functions you need from the SDKs you need

const email = document.querySelector('input[name="email"]');
const password = document.querySelector('input[name="password"]');
const submit = document.querySelector('input[type="submit"]');
const message = document.querySelector("#message");

import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/contacts.readonly");
const auth = getAuth();

const googleButton = document.querySelector("#google");
googleButton.addEventListener("click", (e) => {
    e.preventDefault();
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // IdP data available using getAdditionalUserInfo(result)
            // ...
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
});

password.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
        submit.click();
    }
});

submit.addEventListener("click", (e) => {
    e.preventDefault();
    fetch("/api/post/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email.value,
            plainTextPassword: password.value,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            if (data.code === 200) {
                if (data.newAccount == false) {
                    trackEvent(events.login, {});
                } else {
                    trackEvent(events.register, {});
                }
                window.location.href = "/";
            } else {
                message.innerHTML = data.error;
            }
        })
        .catch((err) => console.log(err));
});
