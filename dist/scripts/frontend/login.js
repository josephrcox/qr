import { trackEvent, events, eventProperties } from "./analytics.js";

import { toast } from "./toast.js";

import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/contacts.readonly");
const auth = getAuth();

const googleButton = document.querySelector("#google");
googleButton.addEventListener("click", (e) => {
    e.preventDefault();
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const user = result.user;

            result.user.getIdToken().then(async (idToken) => {
                const response = await fetch("/api/post/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: user.email,
                        authToken: idToken,
                    }),
                });
                const data = await response.json();
                if (data.status === "ok") {
                    if (data.newAccount == false) {
                        trackEvent(events.login, {});

                        window.location.href = "/";
                    } else {
                        trackEvent(events.register, {});
                        window.location.href = "/";
                    }
                }
            });
        })
        .catch((error) => {
            toast(error, true);
        });
});
