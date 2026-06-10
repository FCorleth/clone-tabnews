const { exec } = require("node:child_process");

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);
  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      console.log("🔴 Não foi possível se conectar ao banco de dados");
      checkPostgres();
      return;
    }

    console.log("🟢 Foi possível se conectar ao banco de dados");
  }
}

console.log("🟡 Aguardando Postgres aceitar conexões");

checkPostgres();
