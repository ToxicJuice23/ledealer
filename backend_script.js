const express = require('express');
const { Pool } = require('pg');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
nunjucks.configure(__dirname, {
    autoescape: true,
    express: app
});

const db = new Pool ({
    user: "ToxicJuice23",
    host: "db.bit.io",
    database: "ToxicJuice23/Dropshipping",
    password: "v2_3uavV_TFBP3AXFTiiBZ72a3m9dUFL",
    port: 5432,
    ssl: true
});

app.get("/", async(req, res, next) => {
    let result =await db.query("SELECT * FROM inventory WHERE featured = true ORDER BY item_id ASC;");
    res.render(`${__dirname}/home.html`, {items: result.rows});
});

app.get("/all", async(req, res, next) => {
    let result =await db.query("SELECT * FROM inventory;");
    res.render(`${__dirname}/all.html`, {items: result.rows});
});

app.get("/products/:id", async(req, res, next) => {
    const id = req.params.id;
    let result = await db.query(`SELECT * FROM inventory WHERE item_id = ${id};`);
    res.render(`${__dirname}/product.html`, { item: result.rows[0] });
});

app.get("/static/:filename", (req, res, next) => {
    res.sendFile(`${__dirname}/${req.params.filename}`);
});

app.post("/pay", async(req, res, next) => {
    let option = req.body.option;
    let id = req.body.item_id;
    let result = await db.query("SELECT order_id FROM orders ORDER BY order_id DESC LIMIT 1;");
    let qres = result.rows[0];
    console.log(qres);
    db.query(`INSERT INTO orders (order_id, time_ordered, status, item_id, option) VALUES (${qres.order_id + 1}, CURRENT_TIMESTAMP, 'ordered', ${id}, '${option}');`);
    console.log(`INSERT INTO orders (order_id, time_ordered, status, item_id, option) VALUES (${qres.order_id + 1}, CURRENT_TIMESTAMP, 'ordered', ${id}, '${option}');`);
    res.redirect("/");
});

app.post("/order/:item_id", async(req, res, next) => {
    let result = await db.query("SELECT price FROM inventory WHERE item_id = " + req.params.item_id);
    let qres = result.rows[0];
    res.render(`${__dirname}/pay.html`, { item_id : req.params.item_id, price : qres.price, option : req.body.options, id : req.body.item_id});
});

app.listen(PORT, () => {
    console.log(`connected to port ${PORT} in directory ${__dirname}`);
});
