// This is an authed page.

const creationName = document.getElementById("creationName");
const creationUrl = document.getElementById("creationUrl");
const creationSubmit = document.getElementById("creationSubmit");

creationSubmit.addEventListener("click", async (event) => {
    console.log("test 2");
    // prevent
    event.preventDefault();
    // api/post/createcode
    const redirect_url = creationUrl.value;
    const name = creationName.value;

    const response = await fetch("/api/post/createcode/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            redirect_url: redirect_url,
            name: name,
        }),
    });
    const data = await response.json();
    if (data.status === "ok") {
        window.location.reload();
    }
});

const codesList = document.getElementById("codesList");

const codesResponse = await fetch("/api/get/codes", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
});
const codesData = await codesResponse.json();
if (codesData.status === "ok") {
    if (codesData.data.length === 0) {
        const noCodes = document.createElement("p");
        noCodes.innerText = "No codes yet!";
        codesList.appendChild(noCodes);
    } else {
        const table = document.createElement("table");
        // columns for name, redirect_url, visits, and qr code image
        const headerRow = document.createElement("tr");
        const nameHeader = document.createElement("th");
        nameHeader.innerText = "Name";
        const redirectUrlHeader = document.createElement("th");
        redirectUrlHeader.innerText = "Redirect URL";
        const visitsHeader = document.createElement("th");
        visitsHeader.innerText = "Visits";
        const qrCodeHeader = document.createElement("th");
        qrCodeHeader.innerText = "QR Code";
        headerRow.appendChild(nameHeader);
        headerRow.appendChild(redirectUrlHeader);
        headerRow.appendChild(visitsHeader);
        headerRow.appendChild(qrCodeHeader);
        table.appendChild(headerRow);
        table.classList.add("table-responsive");
        for (const code of codesData.data) {
            const row = document.createElement("tr");
            row.id = code._id;
            const name = document.createElement("td");
            name.innerText = code.name;
            name.classList.add("name");
            const redirectUrl = document.createElement("a");
            const redirectTD = document.createElement("td");
            redirectUrl.classList.add("redirectUrl");
            // prettify the url and just show the domain and a few characters
            redirectUrl.innerText =
                new URL(code.redirect_url).hostname + "/...";
            redirectUrl.href = code.redirect_url;
            redirectTD.appendChild(redirectUrl);
            const visits = document.createElement("a");
            const visitsTD = document.createElement("td");
            visits.innerText = code.visits;
            visits.classList.add("visits");
            visitsTD.appendChild(visits);
            visits.href = `/explore?id=${code._id}`;
            const qrCode = document.createElement("td");
            const img = document.createElement("img");
            img.classList.add("qrCode");
            img.src = code.code;
            // tapping on img should open share
            const pngImg = await fetch(code.code);
            const pngBlob = await pngImg.blob();
            const file = new File([pngBlob], "qr.png", {
                type: "image/png",
            });
            // on tap or click
            const shareButton = document.createElement("button");
            shareButton.innerText = "Share";
            shareButton.classList.add("shareButton");
            shareButton.addEventListener("click", async (event) => {
                event.preventDefault();
                if (
                    navigator.canShare &&
                    navigator.canShare({ files: [file] })
                ) {
                    navigator.share({
                        files: [file],
                        title: "QR Code for " + code.name,
                        text: "QR Code for " + code.name,
                    });
                } else {
                    alert("fallback");
                    // fallback
                    const shareData = {
                        title: "QR Code for " + code.name,
                        text: "QR Code for " + code.name,
                        url: code.code,
                    };
                    navigator.share(shareData);
                }
            });
            qrCode.appendChild(img);
            const deleteButton = document.createElement("button");
            const deleteTD = document.createElement("td");
            deleteButton.classList.add("deleteButton");
            deleteButton.innerText = "Delete";
            deleteButton.addEventListener("click", async (event) => {
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
            deleteTD.appendChild(deleteButton);

            row.appendChild(name);
            row.appendChild(redirectTD);
            row.appendChild(visitsTD);
            row.appendChild(qrCode);
            row.appendChild(deleteTD);

            table.appendChild(row);
        }
        codesList.appendChild(table);
    }
}
