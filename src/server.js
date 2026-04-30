require("dotenv/config");

const app = require("./app");

app.listen(6500, () => {
  console.log("Servidor em pé na porta 6500");
});