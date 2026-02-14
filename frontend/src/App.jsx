import { useEffect, useState } from "react";
import { getServicos, enviarTriagem, reagendar, horariosOcupados } from "./services";


speechSynthesis.onvoiceschanged = () => {};

/* ========= VOZ ========= */

function falar(texto, onEnd) {
  const utter = new SpeechSynthesisUtterance(texto);
  utter.lang = "pt-BR";

  const vozes = speechSynthesis.getVoices();
  const voz =
    vozes.find(v => v.lang === "pt-BR" && /maria|ana|female/i.test(v.name)) ||
    vozes.find(v => v.lang === "pt-BR") ||
    vozes[0];

  if (voz) utter.voice = voz;

  utter.pitch = 1.15;
  utter.rate = 0.9;
  utter.volume = 1;

  utter.onend = () => {
    if (onEnd) onEnd();
  };

  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

function iniciarEscuta(onResult, onStart, onEnd) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.log("Reconhecimento não suportado");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    const texto = event.results[0][0].transcript.toLowerCase();
    onResult(texto);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  recognition.start();
}
/* ================= APP ================= */

export default function App() {

  const [modo, setModo] = useState("espera");
  const [servicos, setServicos] = useState({});
  const [servicoKey, setServicoKey] = useState(null);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    getServicos().then(setServicos);
    falar("Olá. Sou a Vera. Toque na tela para começar.");
  }, []);

  const servico = servicoKey ? servicos[servicoKey] : null;

  function iniciar() {
    setModo("servicos");
    falar("Escolha o tipo de atendimento.");
  }

  function escolherServico(k) {
    setServicoKey(k);
    setModo("checklist");
    falar("Confira os documentos necessários.");
  }

  async function confirmarDocs(ok) {
    const r = await enviarTriagem(servicoKey, ok);
    setResultado(r);

    if (r.status === "senha_emitida") {
      setModo("senha");
      falar(`Senha ${r.senha}. Dirija-se à zona ${r.zona}`);
    } else {
      setModo("reagendar");
    }
  }

  function resetar() {
    setModo("espera");
    setServicoKey(null);
    setResultado(null);
  }

  /* ========= RENDER ========= */

  if (modo === "espera") return <TelaEspera onStart={iniciar} />;
  if (modo === "servicos") return <TelaServicos servicos={servicos} onEscolher={escolherServico} />;
  if (modo === "checklist") return <TelaChecklist servico={servico} onConfirmar={confirmarDocs} />;
  if (modo === "senha") return <TelaSenha resultado={resultado} onReset={resetar} />;
  if (modo === "reagendar") 
  return <TelaReagendar 
           servicoKey={servicoKey}
           servicos={servicos}
           onDone={resetar} 
         />;


  return null;
}

/* ================= TELAS ================= */

function TelaEspera({ onStart }) {
  return (
    <div style={ui.fundoAzul}>
      <div style={ui.cardBoasVindas}>
        <div style={ui.topoBarra}>TELA INICIAL – ACOLHIMENTO</div>

        <div style={ui.conteudoBoasVindas}>
          <div style={ui.textos}>
            <h1 style={ui.h1}>Vamos começar?</h1>
            <h2>Olá! Sou a VERA.</h2>
            <p>Fale comigo ou toque no botão abaixo.</p>

            <button style={ui.botaoPrincipal} onClick={onStart}>
              Vamos começar
            </button>
          </div>

          <div style={ui.mascote}>🤖</div>
        </div>
      </div>
    </div>
  );
}

function TelaServicos({ servicos, onEscolher }) {

  const [escutando, setEscutando] = useState(false);
  const [tentativas, setTentativas] = useState(0);

  useEffect(() => {

    perguntar();

  }, []);

  function perguntar() {

    falar("Qual serviço você deseja?", () => {

      iniciarEscuta(
        (texto) => processarTexto(texto),
        () => setEscutando(true),
        () => setEscutando(false)
      );

    });

  }

  function processarTexto(texto) {

    const entrada = texto.toLowerCase();

    const encontrado = Object.entries(servicos).find(([k, s]) =>
      entrada.includes(s.nome.toLowerCase()) ||
      entrada.includes(k.toLowerCase())
    );

    if (encontrado) {
      falar(`Você escolheu ${encontrado[1].nome}`);
      onEscolher(encontrado[0]);
      return;
    }

    // Não entendeu
    if (tentativas < 1) {
      setTentativas(t => t + 1);
      falar("Não entendi. Pode repetir o serviço desejado?", perguntar);
    } else {
      falar("Não consegui identificar o serviço. Toque na tela para escolher.");
    }
  }

  return (
    <div style={ui.fundo}>

      <h1>Escolha o serviço</h1>

      {escutando && (
        <div style={ui.microfone}>
          🎤
        </div>
      )}

      <div style={ui.grid}>
        {Object.entries(servicos).map(([k, s]) => (
          <button
            key={k}
            style={ui.botaoServico}
            onClick={() => onEscolher(k)}
          >
            {s.nome}
          </button>
        ))}
      </div>
    </div>
  );
}

function TelaChecklist({ servico, onConfirmar }) {
  if (!servico) return null;

  return (
    <div style={ui.fundo}>
      <h1>Documentos necessários</h1>

      <div style={ui.badge(servico.zona)}>
        {servico.zona === "azul" ? "🔵 Atendimento Rápido" : "🟢 Atendimento Analítico"}
      </div>

      <div style={ui.card}>
        <h2>Obrigatórios</h2>
        {servico.docsBasicos.map(d => <div key={d}>✔ {d}</div>)}

        {servico.docsExtras && (
          <>
            <h3>Complementares</h3>
            {servico.docsExtras.map(d => <div key={d}>▫ {d}</div>)}
          </>
        )}
      </div>

      <div style={ui.linha}>
        <button style={ui.btnSim} onClick={() => onConfirmar(true)}>Tenho todos</button>
        <button style={ui.btnNao} onClick={() => onConfirmar(false)}>Falta documento</button>
      </div>
    </div>
  );
}

function TelaSenha({ resultado, onReset }) {
  if (!resultado) return null;

  if (resultado.status !== "senha_emitida") {
    return (
      <div style={ui.fundo}>
        <h1>⚠️ Reagendamento necessário</h1>
        <button style={ui.botaoPrincipal} onClick={onReset}>
          Novo atendimento
        </button>
      </div>
    );
  }

  return (
    <div style={ui.fundo}>
      <div style={ui.cardSenha(resultado.zona)}>
        <h2>Sua senha</h2>
        <div style={ui.senha}>{resultado.senha}</div>
        <p>Dirija-se à zona {resultado.zona.toUpperCase()}</p>

        <button style={ui.botaoPrincipal} onClick={onReset}>
          Encerrar
        </button>
      </div>
    </div>
  );
}

/* ================= REAGENDAMENTO ================= */

function TelaReagendar({ servicoKey, servicos, onDone }) {

  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [ocupados, setOcupados] = useState([]);
  const [protocolo, setProtocolo] = useState(null);

  const dias = proximosDias();
  const horas = ["09:00","10:00","11:00","13:00","14:00","15:00"];

  useEffect(() => {
    falar("Escolha nova data e horário.");
  }, []);

  useEffect(() => {
  if (data) {
    horariosOcupados(data, servicoKey).then(setOcupados);
  }
}, [data]);


  async function confirmar() {
    if (!data || !hora) {
      falar("Selecione data e horário.");
      return;
    }

    const r = await reagendar(servicoKey, data, hora);

    if (r.erro) {
      falar("Horário já ocupado.");
      return;
    }

    setProtocolo(r.protocolo);
    falar("Reagendamento confirmado.");
  }

  if (protocolo) {
    return (
  <TelaComprovante
    protocolo={protocolo}
    data={data}
    hora={hora}
    zona={servicos[servicoKey]?.zona}
    onDone={onDone}
  />
);

  }

  return (
    <div style={ag.fundo}>
      <div style={ag.card}>

        <h2>📅 Reagendamento</h2>

        <div style={ag.gridDias}>
          {dias.map(d => (
            <button key={d}
              onClick={() => setData(d)}
              style={data===d ? ag.diaSel : ag.dia}>
              {formatarDia(d)}
            </button>
          ))}
        </div>

        {data && (
          <>
            <h3>Horários</h3>

            <div style={ag.gridHoras}>
              {horas.map(h => {
                const bloqueado = ocupados.includes(h);

                return (
                  <button key={h}
                    disabled={bloqueado}
                    onClick={() => setHora(h)}
                    style={
                      bloqueado
                        ? ag.horaBloq
                        : hora===h ? ag.horaSel : ag.hora
                    }>
                    {h}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <button style={ag.confirmar} onClick={confirmar}>
          Confirmar
        </button>

      </div>
    </div>
  );
}

function TelaComprovante({ protocolo, data, hora, zona, onDone }) {

  const corZona = zona === "azul" ? "#1c7ed6" : "#16a34a";
  const nomeZona = zona === "azul"
    ? "🔵 Setor Azul - Atendimento Rápido"
    : "🟢 Setor Verde - Atendimento Analítico";

  return (
    <div style={ag.fundo}>
      <div style={ag.card}>

        <h2>🧾 Comprovante de Reagendamento</h2>

        <div style={{
          background: "#f8fafc",
          padding: 20,
          borderRadius: 12,
          marginTop: 20
        }}>

          <p><b>Protocolo:</b> {protocolo}</p>
          <p><b>Data:</b> {formatarDia(data)}</p>
          <p><b>Hora:</b> {hora}</p>

          <div style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 12,
            background: corZona,
            color: "white",
            fontSize: 18,
            fontWeight: "bold"
          }}>
            {nomeZona}
          </div>

        </div>

        <button style={ag.confirmar} onClick={onDone}>
          Finalizar
        </button>

      </div>
    </div>
  );
}


/* ================= HELPERS ================= */

function proximosDias() {
  const arr = [];
  const hoje = new Date();
  for (let i=1;i<=7;i++){
    const d = new Date(hoje);
    d.setDate(d.getDate()+i);
    arr.push(d.toISOString().slice(0,10));
  }
  return arr;
}

function formatarDia(d) {
  return new Date(d).toLocaleDateString("pt-BR", {
    weekday:"short", day:"2-digit", month:"2-digit"
  });
}


/* ================= ESTILOS UI ================= */

const ui = {

  fundo: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#e3f2fd,#f5f7fa)",
    padding: 30,
    fontFamily: "Arial, sans-serif",
    textAlign: "center"
  },

  fundoAzul: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0d47a1,#1976d2)",
    padding: 30,
    fontFamily: "Arial, sans-serif"
  },

  cardBoasVindas: {
    background: "white",
    borderRadius: 16,
    maxWidth: 900,
    margin: "auto",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    overflow: "hidden"
  },

  topoBarra: {
    background: "#0d47a1",
    color: "white",
    padding: 14,
    fontWeight: "bold",
    letterSpacing: 1
  },

  conteudoBoasVindas: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 40
  },

  textos: {
    textAlign: "left"
  },

  h1: {
    fontSize: 36,
    marginBottom: 10
  },

  mascote: {
    fontSize: 120
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))",
    gap: 16,
    marginTop: 30
  },

  botaoServico: {
    padding: 20,
    borderRadius: 12,
    border: "none",
    background: "#1976d2",
    color: "white",
    fontSize: 16,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
  },

  botaoPrincipal: {
    padding: "14px 26px",
    borderRadius: 10,
    border: "none",
    background: "#1976d2",
    color: "white",
    fontSize: 16,
    cursor: "pointer",
    marginTop: 20
  },

  card: {
    background: "white",
    padding: 24,
    borderRadius: 12,
    maxWidth: 600,
    margin: "20px auto",
    textAlign: "left",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)"
  },

  linha: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    marginTop: 20
  },

  btnSim: {
    padding: "12px 20px",
    borderRadius: 10,
    border: "none",
    background: "#2e7d32",
    color: "white",
    cursor: "pointer"
  },

  btnNao: {
    padding: "12px 20px",
    borderRadius: 10,
    border: "none",
    background: "#c62828",
    color: "white",
    cursor: "pointer"
  },

microfone: {
  fontSize: 36,
  marginBottom: 12,
  animation: "pulse 1.2s infinite",
  opacity: 0.9
},

  badge: (zona) => ({
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: 20,
    background: zona === "azul" ? "#bbdefb" : "#c8e6c9",
    color: "#0d47a1",
    fontWeight: "bold",
    marginBottom: 16
  }),

  cardSenha: (zona) => ({
    background: zona === "azul" ? "#e3f2fd" : "#e8f5e9",
    padding: 40,
    borderRadius: 16,
    maxWidth: 500,
    margin: "auto",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
  }),

  senha: {
    fontSize: 56,
    fontWeight: "bold",
    letterSpacing: 3,
    margin: "20px 0"
  }

};



/* ================= ESTILOS REAGENDAMENTO ================= */

const ag = {

  fundo: {
    minHeight: "100vh",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial"
  },

  card: {
    background: "white",
    width: 920,
    padding: 40,
    borderRadius: 20,
    textAlign: "center",
    boxShadow: "0 15px 40px rgba(0,0,0,0.1)"
  },

  topo: {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 10
  },

  mascote: {
    fontSize: 56,
    marginBottom: 10
  },

  titulo: {
    marginTop: 20,
    marginBottom: 10
  },

  gridDias: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 12,
    marginBottom: 20
  },

  btnDia: {
    height: 70,
    fontSize: 18,
    borderRadius: 12,
    border: "1px solid #cbd5f1",
    background: "white",
    cursor: "pointer"
  },

  btnDiaSel: {
    height: 70,
    fontSize: 18,
    borderRadius: 12,
    background: "#1c7ed6",
    color: "white",
    border: "none",
    cursor: "pointer"
  },

  gridHoras: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 12,
    marginBottom: 20
  },

  btnHora: {
    height: 64,
    fontSize: 18,
    borderRadius: 12,
    border: "1px solid #cbd5f1",
    background: "white",
    cursor: "pointer"
  },

  btnHoraSel: {
    height: 64,
    fontSize: 18,
    borderRadius: 12,
    background: "#16a34a",
    color: "white",
    border: "none",
    cursor: "pointer"
  },

  btnHoraOff: {
    height: 64,
    fontSize: 18,
    borderRadius: 12,
    background: "#e5e7eb",
    color: "#9ca3af",
    border: "none",
    cursor: "not-allowed"
  },

  confirmar: {
    marginTop: 20,
    width: 380,
    height: 70,
    fontSize: 22,
    borderRadius: 16,
    border: "none",
    background: "#0ea5e9",
    color: "white",
    cursor: "pointer"
  }

};

const style = document.createElement("style");
style.innerHTML = `
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.6; }
}
`;
document.head.appendChild(style);

