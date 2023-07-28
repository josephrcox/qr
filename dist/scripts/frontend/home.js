// This is an authed page.

const upgradeButton = document.getElementById("upgrade");
upgradeButton.style.display = "";

const creationName = document.getElementById("creationName");
const creationUrl = document.getElementById("creationUrl");
const creationSubmit = document.getElementById("creationSubmit");
const message = document.querySelector("#message");

const creationNameLink = document.getElementById("creationNameLink");
const creationUrlLink = document.getElementById("creationUrlLink");
const creationSubmitLink = document.getElementById("creationSubmitLink");

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
        }),
    });
    const data = await response.json();
    if (data.status === "ok") {
        loadCodes();
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

    if (codesData.status === "ok") {
        codesList.innerHTML = "";
        if (codesData.data.length === 0) {
            const noCodes = document.createElement("p");
            noCodes.innerText = "No codes yet! Try creating one :)";
            codesList.appendChild(noCodes);
        } else {
            const headerRow = document.createElement("tr");
            headerRow.id = "headerRow";
            headerRow.insertCell(0).outerHTML = "<th>Name</th>";
            headerRow.insertCell(1).outerHTML = "<th>Visits</th>";
            headerRow.insertCell(2).outerHTML = "<th>Actions</th>";
            headerRow.insertCell(3).outerHTML = "<th>QR Code</th>";
            codesList.appendChild(headerRow);

            for (const code of codesData.data) {
                const tableRow = document.createElement("tr");
                tableRow.id = code._id;
                tableRow.className = "codeRow";

                // Create table data elements
                const nameTd = document.createElement("td");
                nameTd.classList.add("name");
                nameTd.innerHTML = `<a href="${code.redirect_url}"> ${code.name}</a>`;

                const currentBaseURL = window.location.href.split("/")[2];
                const visitsTd = document.createElement("td");
                visitsTd.classList.add("visits");
                visitsTd.innerHTML = `<a href='/explore/${code.short_id}'>${code.visits}</a>`;

                const buttonsTd = document.createElement("td");
                buttonsTd.classList.add("codeButtons");

                const deleteButton = document.createElement("button");
                deleteButton.classList.add("btn", "btn-danger", "deleteButton");
                deleteButton.innerText = "Delete";
                deleteButton.addEventListener("click", async (event) => {
                    if (
                        !confirm("Are you sure you want to delete this code?")
                    ) {
                        return;
                    }
                    event.preventDefault();
                    const response = await fetch("/api/post/deletecode/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            id: code._id,
                        }),
                    });
                    const data = await response.json();
                    if (data.status === "ok") {
                        document.getElementById(code._id).remove();
                    }
                });
                buttonsTd.appendChild(deleteButton);

                const testLinkButton = document.createElement("button");
                testLinkButton.classList.add(
                    "btn",
                    "btn-primary",
                    "testButton"
                );
                testLinkButton.innerText = "Copy Link";
                testLinkButton.addEventListener("click", async (event) => {
                    event.preventDefault();
                    let url;
                    if (code.type == "qr") {
                        url = `${currentBaseURL}/code?id=${code._id}`;
                    } else {
                        url = url = `${currentBaseURL}/link/${code.short_id}`;
                    }
                    navigator.clipboard.writeText(url);
                    testLinkButton.innerText = "Copied!";
                    setTimeout(() => {
                        testLinkButton.innerText = "Copy Link";
                    }, 2000);
                });
                buttonsTd.appendChild(testLinkButton);

                const updateLinkButton = document.createElement("button");
                updateLinkButton.classList.add(
                    "btn",
                    "btn-primary",
                    "updateButton"
                );
                updateLinkButton.innerText = "Update link";
                updateLinkButton.dataset.id = code._id;
                updateLinkButton.addEventListener("click", async (event) => {
                    event.preventDefault();
                    const newURL = prompt("Enter a new URL:");
                    if (newURL === null) {
                        return;
                    }
                    const response = await fetch("/api/post/updatecode/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            id: updateLinkButton.dataset.id,
                            newURL: newURL,
                        }),
                    });
                    const data = await response.json();
                    if (data.status === "ok") {
                        window.location.reload();
                    }
                });
                buttonsTd.appendChild(updateLinkButton);

                // Append created table data elements to the row
                tableRow.append(nameTd, visitsTd, buttonsTd);
                const qrCodeTd = document.createElement("td");
                qrCodeTd.classList.add("qrCode");
                if (code.type === "qr") {
                    const img = document.createElement("img");
                    img.src = code.code;
                    img.classList.add("card-img-top");
                    const pngImg = await fetch(code.code);
                    const pngBlob = await pngImg.blob();
                    const qrCodeImageFile = new File([pngBlob], "qr.png", {
                        type: "image/png",
                    });
                    img.addEventListener("click", async () => {
                        const url = window.URL.createObjectURL(qrCodeImageFile);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "qualitycodesQR.png";
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                    });
                    qrCodeTd.appendChild(img);
                } else {
                    qrCodeTd.innerHTML =
                        "<span style='color: gray;'>N/A</span>";
                }
                tableRow.appendChild(qrCodeTd);

                codesList.appendChild(tableRow);
            }
        }
    }
}

loadCodes();
