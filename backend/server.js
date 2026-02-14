import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Database from "better-sqlite3";
import { SERVICOS } from "./servicos.js";

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(bodyParser.json());

/* ================= BANCO ================= */

const db = new Database("agenda.db");

db.prepare(`
CREATE TABLE IF NOT EXISTS reagendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  servico TEXT,
  data TEXT,
  hora TEXT
)
`).run();

/* ================= HELPERS ================= */

function gerarSenha(zona) {
  const n = Math.floor(Math.random() * 900 + 100);
  return zona === "azul" ? `A${n}` : `V${n}`;
}

/* ================= SERVIÇOS ================= */

app.get("/servicos", (req, res) => {
  res.json(SERVICOS);
});

/* ================= TRIAGEM ================= */

app.post("/triagem", (req, res) => {
  const { servico, docsOk } = req.body;

  const s = SERVICOS[servico];

  if (!s) {
    return res.status(400).json({ erro: "Serviço inválido" });
  }

  if (!docsOk) {
    return res.json({
      status: "reagendar",
      zona: s.zona,
      servico: s.nome
    });
  }

  const senha = gerarSenha(s.zona);

  res.json({
    status: "senha_emitida",
    senha,
    zona: s.zona,
    servico: s.nome
  });
});

/* ================= HORÁRIOS OCUPADOS ================= */

app.get("/horarios-ocupados", (req, res) => {
  const { data } = req.query;

  if (!data) {
    return res.json([]);
  }

  const rows = db.prepare(
    "SELECT hora FROM reagendamentos WHERE data = ?"
  ).all(data);

  res.json(rows.map(r => r.hora));
});

/* ================= REAGENDAR ================= */

app.post("/reagendar", (req, res) => {
  const { servico, data, hora } = req.body;

  const existe = db.prepare(
    "SELECT 1 FROM reagendamentos WHERE data=? AND hora=? AND servico=?"
  ).get(data, hora, servico);

  if (existe) {
    return res.status(400).json({
      erro: "Horário já ocupado"
    });
  }

  db.prepare(`
    INSERT INTO reagendamentos (servico,data,hora)
    VALUES (?,?,?)
  `).run(servico, data, hora);

  res.json({
    ok: true,
    protocolo: "AG-" + Date.now()
  });
});

/* ================= LISTAR AGENDAMENTOS ================= */

app.get("/horarios-ocupados", (req, res) => {
  const { data, servico } = req.query;

  const rows = db.prepare(
    "SELECT hora FROM reagendamentos WHERE data=? AND servico=?"
  ).all(data, servico);

  res.json(rows.map(r => r.hora));
});


/* ================= START ================= */

app.listen(3001, () => {
  console.log("✅ Vera backend ativo com agenda persistente");
});
