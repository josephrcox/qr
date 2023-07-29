export let USER_DATA = {};

const PLANS = ["Basic", "Premium", "Business", "Pro"];

export async function loadUserEntitlements() {
    const response = await fetch("/api/get/user", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    if (data.status === "ok") {
        USER_DATA = data.data;
        console.log(USER_DATA);
        return USER_DATA;
    } else {
        return (window.location.href = "/login");
    }
}

//// Paywalls

export function accessToPremiumAnalytics() {
    return USER_DATA.plan >= 3;
}

export function canCreateDynamicCodes() {
    return USER_DATA.dynamicCodeCount < USER_DATA.dynamicCodeMax;
}
