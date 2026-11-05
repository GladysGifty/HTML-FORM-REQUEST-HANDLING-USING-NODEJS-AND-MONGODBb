
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    age: Number,
    mobile: String,
    gender: String,
    state: String
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/server", async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();

        console.log("User saved successfully!");
        console.log("User ID:", savedUser._id);

        res.redirect("/users");
    } catch (error) {
        console.log("Registration Error:", error);
        res.status(500).send("Registration Failed!");
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password");

        let rows = "";

        users.forEach(user => {
            rows += `
                <tr>
                    <td>${user.name || ""}</td>
                    <td>${user.email || ""}</td>
                    <td>${user.age || ""}</td>
                    <td>${user.mobile || ""}</td>
                    <td>${user.gender || ""}</td>
                    <td>${user.state || ""}</td>
                </tr>
            `;
        });

        res.send(`
            <html>
            <head>
                <title>Registered Users</title>
                <style>
                    body {
                        font-family: Arial;
                        background: #f3eaff;
                        padding: 30px;
                    }
                    h1 {
                        color: #7138a8;
                        text-align: center;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        background: white;
                    }
                    th, td {
                        border: 1px solid #ccc;
                        padding: 12px;
                        text-align: center;
                    }
                    th {
                        background: #8146b5;
                        color: white;
                    }
                    a {
                        color: #7138a8;
                    }
                </style>
            </head>
            <body>
                <h1>Registered Users</h1>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Age</th>
                        <th>Mobile</th>
                        <th>Gender</th>
                        <th>State</th>
                    </tr>
                    ${rows}
                </table>
                <br>
                <a href="/">Back to Registration</a>
            </body>
            </html>
        `);
    } catch (error) {
        console.log(error);
        res.status(500).send("Unable to display users.");
    }
});

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("MongoDB connected successfully!");
    console.log("Database:", mongoose.connection.name);
    console.log("Collection:", User.collection.name);

    app.listen(process.env.PORT || 6001, () => {
        console.log("Server running at http://localhost:6001");
    });
})
.catch(error => {
    console.log("MongoDB connection error:", error);
});
