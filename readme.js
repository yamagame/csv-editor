const fs = require("fs");

// console.log(process.argv[2]);
console.log(fs.readFileSync("./README.md", "utf-8"));
