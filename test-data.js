const row = process.argv[2] || 50;
const col = process.argv[3] || 50;

for (let y = 0; y < col; y++) {
  let s = "";
  for (let x = 0; x < row; x++) {
    s += `${x}-${y},`;
  }
  console.log(s);
}
