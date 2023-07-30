import { trackEvent, events, eventProperties } from "./analytics.js";

const email = document.querySelector('input[name="email"]');
const password = document.querySelector('input[name="password"]');
const submit = document.querySelector('input[type="submit"]');
const message = document.querySelector("#message");

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
