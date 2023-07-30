import { events, eventProperties, trackEvent } from "./analytics.js";

export function toast(message, danger) {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "bottom",
        position: "left",
        backgroundColor: danger ? "#e74c3c" : "#2ecc71",
        stopOnFocus: true,
    }).showToast();
    trackEvent(events.showToast, {
        [eventProperties.message]: message,
        [eventProperties.danger]: danger ? "danger" : "success",
    });
}
