const fs = require("fs");
const CSV = require("./csv-parser");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

if (require.main === module) {
  const csvFilePath = process.argv[2];
  const csvData = CSV.parse(fs.readFileSync(csvFilePath, "utf-8"));
  const xPos = now => parseInt(now.getTime() / (24 * 60 * 60 * 1000)) * 24 + 15;
  const yPos = y => y * 24;
  const draData = csvData
    .filter(v => v[0].value !== "")
    .map((data, i) => {
      return {
        uuid: uuidv4(),
        x: xPos(moment().startOf("day").toDate()),
        y: yPos(i),
        width: 24,
        height: 24,
        title: data[0].value,
        text: data[1].value,
        type: "roundrect",
        rgba: "#00FF00FF",
        titlePos: {
          x: 1,
          y: 0,
        },
      };
    });
  console.log(JSON.stringify(draData, null, "  "));
}
