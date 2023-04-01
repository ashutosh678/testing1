const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const mongoose = require("mongoose");
const ejs = require("ejs");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
// app.set('views', path.join(__dirname, 'views'));
// app.set('views', __dirname + '/views');

dotenv.config();

mongoose
  .connect("mongodb://localhost/wazirx", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// mongoose
//  .connect(process.env.MONGO_URL, {
//         useNewUrlParser: true })
//  .then(() => console.log("MongoDB connected!"))
//  .catch(err => console.log(err));

const tickerSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String,
});

const Ticker = mongoose.model("Ticker", tickerSchema);

// const newTicker = new Ticker({
//     name : "ashu",
//     last : 3000,
//     buy : 4000,
//     sell : 5000,
//     volume : 6000,
//     base_unit : " ok "
//   });
// newTicker.save();

app.get("/fetch-tickers", async (req, res) => {
  try {
    const response = await axios.get("https://api.wazirx.com/api/v2/tickers");

    const tickers = Object.values(response.data)
      .sort((a, b) => b.quote_unit_volume - a.quote_unit_volume)
      .slice(0, 10);

    await Promise.all(
      tickers.map(async (ticker) => {
        const { name, last, buy, sell, volume, base_unit } = ticker;
        const newTicker = new Ticker({
          name,
          last,
          buy,
          sell,
          volume,
          base_unit,
        });
        await newTicker.save();
      })
    );

    res.send("Tickers stored successfully in Database");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching and storing tickers");
  }
});

app.get("/tickers", async (req, res) => {
  try {
    const tickers = await Ticker.find().sort({ name: 1 });
    res.render("index", { tickers });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.listen(3000, () => {
  console.log("app is running on port 3000");
});
