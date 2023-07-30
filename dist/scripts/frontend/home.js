// This is an authed page.

import {
    USER_DATA,
    loadUserEntitlements,
    accessToPremiumAnalytics,
    canCreateDynamicCodes,
} from "./entitlement.js";
import { toast } from "./toast.js";

document.onload = await loadUserEntitlements();

const upgradeButton = document.getElementById("upgrade");
upgradeButton.style.display = "";

const creationName = document.getElementById("creationName");
const creationUrl = document.getElementById("creationUrl");
const creationSubmit = document.getElementById("creationSubmit");
const creationSubmitLink = document.getElementById("creationSubmitLink");
const message = document.querySelector("#message");
const dynamicToggle = document.getElementById("dynamicToggle");

creationUrl.addEventListener("input", function () {
    if (this.value.trim() !== "") {
        this.classList.add("has-content");
    } else {
        this.classList.remove("has-content");
    }
});

creationUrl.addEventListener("focus", function () {
    document.getElementById("urlHint").classList.add("show");
});

creationUrl.addEventListener("blur", function () {
    document.getElementById("urlHint").classList.remove("show");
});

creationName.addEventListener("focus", function () {
    document.getElementById("nameHint").classList.add("show");
});

creationName.addEventListener("blur", function () {
    document.getElementById("nameHint").classList.remove("show");
});

creationSubmit.addEventListener("click", async (event) => {
    event.preventDefault();
    const redirect_url = creationUrl.value;
    const name = creationName.value;

    if (redirect_url === "") {
        return (message.innerText = "Please enter a redirect URL.");
    }
    if (name === "") {
        return (message.innerText = "Please enter a name.");
    }
    if (!redirect_url.startsWith("http")) {
        return (message.innerText = "Please enter a valid URL.");
    }

    await createCode("qr", name, redirect_url);
});

creationSubmitLink.addEventListener("click", async (event) => {
    event.preventDefault();
    const redirect_url = creationUrl.value;
    const name = creationName.value;

    if (redirect_url === "") {
        return (message.innerText = "Please enter a redirect URL.");
    }
    if (name === "") {
        return (message.innerText = "Please enter a name.");
    }
    if (!redirect_url.startsWith("http")) {
        return (message.innerText = "Please enter a valid URL.");
    }

    await createCode("link", name, redirect_url);
});

async function createCode(type, name, redirect_url) {
    const response = await fetch("/api/post/createcode/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            redirect_url: redirect_url,
            name: name,
            type: type,
            isDynamic: dynamicToggle.checked,
        }),
    });
    const data = await response.json();
    if (data.status === "ok") {
        loadCodes();
    }
    if (data.message) {
        toast(data.message, true);
    }
}

async function loadCodes() {
    const codesList = document.getElementById("codesList");
    codesList.innerHTML = "Loading your codes...";

    const codesResponse = await fetch("/api/get/codes", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const codesData = await codesResponse.json();

    if (codesData.status == "ok") {
        generateCodes(codesData.data);
    }
}

function generateCodes(codes) {
    const codesList = document.getElementById("codesList");
    codesList.innerHTML = "";

    var maxColumns = 4; // Set this to whatever maximum number of columns you want
    var columns = Math.min(codes.length, maxColumns);
    codesList.style.maxWidth = `calc((180px + 10px) * ${columns})`;

    for (const code of codes) {
        const codeDiv = document.createElement("div");
        codeDiv.classList.add("code", "roundedBox");
        codeDiv.id = code._id;

        const name = document.createElement("h3");
        name.innerText = code.name;
        name.classList.add("codeName");

        const visits = document.createElement("p");
        visits.innerText = `Scans: ${code.visits}`;
        visits.classList.add("codeVisits");

        const buttons = document.createElement("div");
        buttons.classList.add("codeButtons");

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger", "deleteButton");
        deleteButton.innerText = "Delete";
        deleteButton.addEventListener("click", async (event) => {});
        buttons.appendChild(deleteButton);

        const copyLinkButton = document.createElement("button");
        copyLinkButton.classList.add("btn", "copyButton");
        copyLinkButton.innerText = "Copy Link";
        copyLinkButton.addEventListener("click", async (event) => {});
        buttons.appendChild(copyLinkButton);

        codeDiv.appendChild(name);
        codeDiv.appendChild(visits);
        codeDiv.appendChild(buttons);

        if (code.type === "qr") {
            const QRcode = document.createElement("img");
            QRcode.src = code.code;
            QRcode.classList.add("card-img-top");
            QRcode.addEventListener("click", async () => {});
            QRcode.classList.add("card-img-top");
            codeDiv.appendChild(QRcode);
        }

        codesList.appendChild(codeDiv);
    }
}

loadCodes();

dynamicToggle.addEventListener("click", async (event) => {
    const value = dynamicToggle.checked;
    if (value) {
        if (!canCreateDynamicCodes()) {
            toast(
                "You have reached your dynamic code limit. Upgrade to create more.",
                true
            );
            dynamicToggle.checked = false;
            return;
        }
    }
});
