const API = "https://vera-backend-92jt.onrender.com";

export async function getServicos() {
  const r = await fetch(API + "/servicos");
  return r.json();
}

export async function enviarTriagem(servico, docsOk) {
  const r = await fetch(API + "/triagem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ servico, docsOk })
  });
  return r.json();
}

export async function reagendar(servico, data, hora) {
  const r = await fetch(API + "/reagendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ servico, data, hora })
  });

  return r.json();
}

export async function listarAgendamentos() {
  const r = await fetch(API + "/agendamentos");
  return r.json();
}
export async function horariosOcupados(data, servico) {
  const r = await fetch(
    `http://localhost:3001/horarios-ocupados?data=${data}&servico=${servico}`
  );

  if (!r.ok) return [];
  return r.json();
}