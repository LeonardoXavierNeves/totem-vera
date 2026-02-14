import Database from "better-sqlite3";

const db = new Database("vera.db");

/* ===== TABELA ===== */

db.prepare(`
CREATE TABLE IF NOT EXISTS agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  servico TEXT,
  zona TEXT,
  data TEXT,
  nome TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

export default db;
