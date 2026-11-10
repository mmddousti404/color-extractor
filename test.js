
const fs = require("fs");
const extractColors = require("./src/services/colorExtractor");

async function main() {
  try {
    const imageBuffer = fs.readFileSync("./test.jpg");

    const colors = await extractColors(imageBuffer);

    console.log("\n🎨 Extracted Colors:");
    console.log(colors);

    console.log("\nTotal colors:", colors.length);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main();
