
const express = require("express");
const colorRoutes = require("./src/routes/colorRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(colorRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Color Extractor running on port ${PORT}`);
});
