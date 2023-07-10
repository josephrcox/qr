if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const { response } = require("express");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
var parser = require("ua-parser-js");
var getgeoip = require("ip-geoinfo");
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.set("layout", "layouts/layout");

app.use(express.static(path.join(__dirname, "../../../")));
app.set("views", path.join(__dirname, "../../", "/views"));

app.use(expressLayouts);
const bp = require("body-parser");
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(express.json());

const mongoose = require("mongoose");
mongoose.connect(process.env.DATEBASE_URL, {});
const connection = mongoose.connection;

connection.once("open", function (res) {
    console.log("Connected to Mongoose!");
    connectedToDB = true;
});

const User = require("../../models/user");
const Code = require("../../models/code");

// JWT STUFF
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET = process.env.JWT_SECRET;

// QR STUFF

var QRCode = require("qrcode");

function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for (var i = 0; i < len; i++) {
        var item = a[i];
        if (seen[item] !== 1) {
            seen[item] = 1;
            out[j++] = item;
        }
    }
    return out;
}

function isAuth(req, res, next) {
    try {
        let token = req.cookies.token;
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (e) {
        console.log(req.cookies);
        return res.redirect("/login");
    }
}

async function getUserData(req) {
    try {
        let token = req.cookies.token;
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log(verified);
        return verified.email;
    } catch (e) {
        return res.redirect("/login");
    }
}

// ROUTES

//// Takes a code with an ID, looks it up, and redirects to the URL
app.get("/code", async (req, res) => {
    const id = req.query.id;
    if (id == undefined) {
        res.redirect("/");
        return;
    }
    const dbResponse = await Code.findOne({ _id: id });
    if (dbResponse == null) {
        res.redirect("/");
        return;
    }
    dbResponse.visits += 1;
    var ua = parser(req.headers["user-agent"]);
    console.log(ua);
    let user_country = "undefined";
    let user_city = "undefined";
    let user_region = "undefined";
    try {
        let userdata = await getgeoip(req.ip);
        if (userdata.country_name != undefined) {
            user_country = userdata.country_name;
            user_city = userdata.city;
            user_region = userdata.region;
        }
    } catch (e) {
        console.log(e);
    }

    dbResponse.visitor_metadata.push({
        ip: req.ip,
        time: new Date(),
        browser: ua.browser.name,
        os: ua.os.name,
        device: ua.device.model,
        user_country: user_country,
        user_city: user_city,
        user_region: user_region,
    });
    await dbResponse.save();
    res.redirect(dbResponse.redirect_url);
});

//// Takes some new code data, creates a new code, and returns the base64
app.post("/api/post/createcode/", isAuth, async (req, res) => {
    const { redirect_url, name } = req.body;

    const currentUser = await getUserData(req);
    const dbResponse = await Code.create({
        redirect_url: redirect_url,
        name: name,
        owner: currentUser,
    });

    res.json({ status: "ok", code: 200, data: dbResponse.code });
});

//// Takes a code ID and deletes the code if they are the creator
app.post("/api/post/deletecode/", isAuth, async (req, res) => {
    const { id } = req.body;
    const currentUser = await getUserData(req);
    const dbResponse = await Code.findOne({ _id: id });
    if (dbResponse.owner != currentUser) {
        res.json({ status: "error", code: 403, data: "Not your code!" });
        return;
    }
    await Code.deleteOne({ _id: id });
    await res.json({ status: "ok", code: 200, data: "Deleted!" });
});

//// Returns all of the codes created by the current user
app.get("/api/get/codes", isAuth, async (req, res) => {
    const currentUser = await getUserData(req);
    const codes = await Code.find({ owner: currentUser });
    const currentBaseDomain = req.headers.host;

    let cleanCodes = codes;
    for (let i = 0; i < codes.length; i++) {
        cleanCodes[i].code = await QRCode.toDataURL(
            currentBaseDomain + "/code?id=" + cleanCodes[i]._id
        );
    }

    res.json({ status: "ok", code: 200, data: cleanCodes });
});

//// Takes an email + pw and logs in or creates a new user
app.post("/api/post/login", async (req, res) => {
    const { email, plainTextPassword } = req.body;
    const user = await User.findOne({ email: email }).lean();
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

    if (!user) {
        try {
            const response = await User.create({
                password: hashedPassword,
                email: email,
            });
            const token = jwt.sign(
                {
                    id: response._id,
                    email: response.email,
                },
                JWT_SECRET,
                { expiresIn: "30days" }
            );

            res.cookie("token", token, {
                httpOnly: true,
            });

            return res.json({ status: "ok", code: 200, data: token });
        } catch (error) {
            return res.json({
                status: "error",
                code: 400,
                error: "Unknown error code",
            });
        }
    } else {
        if (await bcrypt.compare(plainTextPassword, user.password)) {
            const token = jwt.sign(
                {
                    id: user._id,
                    email: user.email,
                },
                JWT_SECRET,
                { expiresIn: "30days" }
            );

            res.cookie("token", token, {
                httpOnly: true,
            });

            return res.json({ status: "ok", code: 200, data: token });
        } else {
            res.status(500).json({
                status: "error",
                error: "Invalid username/password",
            });
        }
    }
});

//// Takes a code ID and returns the code data
app.get("/explore", isAuth, async (req, res) => {
    const { id } = req.body;
    const currentUser = await getUserData(req);
    const code = await Code.findOne({ id: id });
    if (code == null || code.owner != currentUser) {
        res.redirect("/");
        return;
    }
    res.render("explore.ejs", { code: code });
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/", isAuth, (req, res) => {
    res.render("home.ejs");
});

app.get("*", (req, res) => {
    res.redirect("/");
});

const port = process.env.PORT || 8181;

app.listen(port, () => {
    console.log("Listening on port", port);
});
