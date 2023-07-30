import { USER_DATA } from "./entitlement";

export const events = {
    login: "login",
    logout: "logout",
    createCode: "create_code",
    deleteCode: "delete_code",
    copyCodeLink: "copy_code_link",
    updateCodeLink: "edit_code",
    clickUpgrade: "click_upgrade",
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

export function trackEvent(event, data) {
    const globalProperties = {
        plan: USER_DATA.plan,
        userId: USER_DATA.id,
    };
    // merge global properties with event properties (in data)
    data = { ...globalProperties, ...data };

    if (window.gtag) {
        window.gtag("event", event, data);
    }
}
