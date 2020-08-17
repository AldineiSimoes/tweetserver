const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
require("dotenv/config");
const router = require("./routes")
const middieware = require("./middieware");
const app = express();

app.use(morgan("common"));
app.use(express.json());

app.use(cors({
    origin: "http://localhost:3333"
}))

const db = require("../config/conect");
app.use(router);

app.use(middieware.notFound);
app.use(middieware.errorHandling);

const PORT = 3333;
app.listen(PORT, () => {
    console.log('Servidor executando na porta: ${PORT}');
})