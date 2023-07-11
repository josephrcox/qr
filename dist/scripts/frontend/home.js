// This is an authed page.

const creationName = document.getElementById("creationName");
const creationUrl = document.getElementById("creationUrl");
const creationSubmit = document.getElementById("creationSubmit");
const message = document.querySelector("#message");

const creationNameLink = document.getElementById("creationNameLink");
const creationUrlLink = document.getElementById("creationUrlLink");
const creationSubmitLink = document.getElementById("creationSubmitLink");

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
    const redirect_url = creationUrlLink.value;
    const name = creationNameLink.value;

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
        window.location.reload();
    }
}

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
        for (const code of codesData.data) {
            const card = document.createElement("div");
            card.id = code._id;
            card.classList.add("card");

            const cardBody = document.createElement("div");
            cardBody.classList.add("card-body");

            const cardTitleDiv = document.createElement("div");
            cardTitleDiv.style.display = "flex";
            cardTitleDiv.style.flexDirection = "row";
            cardTitleDiv.style.alignItems = "center";
            cardTitleDiv.style.gap = "5px";
            const name = document.createElement("h5");
            name.innerText = code.name;
            name.classList.add("card-title");

            const redirectUrl = document.createElement("a");
            redirectUrl.classList.add("card-link");
            redirectUrl.innerText =
                new URL(code.redirect_url).hostname + "/...";
            redirectUrl.href = code.redirect_url;

            const currentBaseURL = window.location.href.split("/")[2];
            const visits = document.createElement("p");
            visits.innerHTML = `Visits: <a href='/explore/${code.short_id}'>${code.visits}</a>`;
            visits.classList.add("card-text");

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("btn", "btn-danger");
            deleteButton.innerText = "Delete";
            deleteButton.addEventListener("click", async (event) => {
                if (!confirm("Are you sure you want to delete this code?")) {
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

            const testLinkButton = document.createElement("button");
            testLinkButton.classList.add("btn", "btn-primary");
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
                const dialog = document.createElement("dialog");
                dialog.id = "dialog";
                dialog.classList.add("dialog");
                const dialogContent = document.createElement("div");
                dialogContent.classList.add("dialogContent");
                const dialogHTML = document.createElement("div");
                dialogHTML.innerHTML = `
                    <p> Copied to clipboard </p>
                    <button onclick="this.parentElement.parentElement.parentElement.close()">Close</button>
                `;
                dialogContent.appendChild(dialogHTML);
                dialog.appendChild(dialogContent);
                document.body.appendChild(dialog);
                dialog.showModal();
            });

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
                cardTitleDiv.appendChild(img);
            }

            cardTitleDiv.appendChild(name);
            cardBody.appendChild(cardTitleDiv);
            cardBody.appendChild(redirectUrl);
            cardBody.appendChild(visits);

            cardBody.appendChild(deleteButton);
            cardBody.appendChild(testLinkButton);
            card.appendChild(cardBody);

            codesList.appendChild(card);
            setTimeout(function () {
                card.classList.add("card-show");
            }, 100);
        }
    }
}
