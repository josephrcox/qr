import {
    USER_DATA,
    loadUserEntitlements,
    accessToPremiumAnalytics,
    canCreateDynamicCodes,
} from "./entitlement.js";
import { toast } from "./toast.js";
import { trackEvent, events, eventProperties } from "./analytics.js";

const upgradeButton = document.getElementById("youUpgrade");
upgradeButton.addEventListener("click", async () => {
    window.location.href = "/payment";
});

const manageButton = document.getElementById("youManage");
manageButton.addEventListener("click", async () => {
    window.location.href =
        "https://billing.stripe.com/p/login/28oeZ10HDe0Y4mccMM";
});

const youContainer = document.getElementById("youContainer");
const email = document.getElementById("youEmail");
const signupDate = document.getElementById("youSignupDate");
const plan = document.getElementById("youPlan");
const dynamicCodeCount = document.getElementById("youDynamicCodeCount");

await loadUserEntitlements();
email.innerText = USER_DATA.email;
signupDate.innerText = USER_DATA.signup;
plan.innerText = USER_DATA.prettyPlan;
dynamicCodeCount.innerText =
    USER_DATA.dynamicCodeCount + "/" + USER_DATA.dynamicCodeMax;
youContainer.style.display = "";

const logout = document.getElementById("youLogout");
logout.addEventListener("click", async () => {
    const response = await fetch("/api/logout", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    if (data.status === "ok") {
        trackEvent(events.logout, {});
        window.location.href = "/login";
    } else {
        toast("Error logging out");
    }
});
