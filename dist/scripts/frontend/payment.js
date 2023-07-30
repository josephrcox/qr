import { trackEvent, events, eventProperties } from "./analytics.js";

let tracked = false;
if (!tracked) {
    tracked = true;
    trackEvent(events.visitUpgradePage, {});
}
