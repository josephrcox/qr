import { USER_DATA, loadUserEntitlements } from "./entitlement.js";

export const events = {
    login: "login",
    register: "register",
    logout: "logout",
    createCode: "create_code",
    deleteCode: "delete_code",
    copyCodeLink: "copy_code_link",
    updateCodeLink: "edit_code",
    visitUpgradePage: "visit_upgrade_page",
    downloadQR: "download_qr",
    toggleDynamic: "toggle_dynamic",
    showToast: "show_toast",
};

export const eventProperties = {
    plan: "plan",
    type: "type",
    message: "message",
    danger: "danger",
    isDynamic: "is_dynamic",
};

export async function trackEvent(event, data) {
    let user = USER_DATA;
    if (user.plan == undefined || user.plan == null) {
        user = await loadUserEntitlements();
    }
    const globalProperties = {
        plan: user.plan,
        email: user.email,
    };
    data = { ...globalProperties, ...data };
    console.info("🛤️ Tracking event", event, data, globalProperties);
    if (window.gtag) {
        window.gtag("event", event, data, globalProperties);
    }
}
