require('./src/configs/dotenv.config.js'); // Load environment variables
const express = require('express');
const router = require('./src/routes/index.js');
const { ConnectDBMySQL } = require('./src/configs/database.config.js');

const app = express();
// => [Middleware]
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
}); //Another option to handle CORS

app.use(express.json());

// => [Routes]
app.use("/api", router);

app.listen(process.env.PORT, process.env.HOST, (req, res) => {
    console.log(`Connected to ${process.env.PORT}`);

    ConnectDBMySQL();
    // ConnectDBRedis();
});