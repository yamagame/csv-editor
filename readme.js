const fs = require("fs");

// console.log(process.argv[2]);
const lines = fs.readFileSync("./README.md", "utf-8");
lines.split("\n").forEach(line => {
  console.log(`<p>${line}</p>`);
});
