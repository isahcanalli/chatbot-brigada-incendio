const chat = document.getElementById("chat");
const mensagem = document.getElementById("mensagem");
const btnEnviar = document.getElementById("btnEnviar");
const btnLimpar = document.getElementById("btnLimpar");
const btnTema = document.getElementById("btnTema");
const btnExportar = document.getElementById("btnExportar");
const erroVazio = document.getElementById("erroVazio");
const temaIcon = btnTema.querySelector(".tema-icon");

const API_URL = "https://chatbot-brigada-incendio-chpa.onrender.com/chat";
let msgIdCounter = 1;

const mensagemInicial =
  "Olá! Sou um assistente especializado em Brigada de Incêndio em Empresas. Posso ajudar com dúvidas sobre prevenção, evacuação, extintores, classes de incêndio e procedimentos básicos de emergência.";

/* ============================================
   TEMA LIGHT / DARK
   ============================================ */
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  temaIcon.textContent = tema === "dark" ? "☀️" : "🌙";
  btnTema.title = tema === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro";
  localStorage.setItem("chatbot-tema", tema);
}

function toggleTema() {
  const atual = document.documentElement.getAttribute("data-theme");
  aplicarTema(atual === "dark" ? "light" : "dark");
}

// Restaurar tema salvo
const temaSalvo = localStorage.getItem("chatbot-tema") || "dark";
aplicarTema(temaSalvo);

btnTema.addEventListener("click", toggleTema);

/* ============================================
   MENSAGENS
   ============================================ */
function criarElementoMensagem(texto, tipo) {
  const div = document.createElement("div");
  div.classList.add("message", tipo);
  div.dataset.id = msgIdCounter++;

  const content = document.createElement("div");
  content.classList.add("msg-content");
  content.textContent = texto;
  div.appendChild(content);

  // Botão copiar apenas para mensagens do bot
  if (tipo === "bot") {
    const actions = document.createElement("div");
    actions.classList.add("msg-actions");

    const btnCopiar = document.createElement("button");
    btnCopiar.classList.add("btn-copiar");
    btnCopiar.textContent = "📋 Copiar";
    btnCopiar.title = "Copiar resposta para a área de transferência";
    btnCopiar.addEventListener("click", () => copiarTexto(texto, btnCopiar));

    actions.appendChild(btnCopiar);
    div.appendChild(actions);
  }

  return div;
}

function adicionarMensagem(texto, tipo) {
  const msg = criarElementoMensagem(texto, tipo);
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function mostrarCarregando() {
  const div = document.createElement("div");
  div.classList.add("message", "bot");
  div.id = "msg-carregando";

  const content = document.createElement("div");
  content.classList.add("msg-content");

  const typing = document.createElement("div");
  typing.classList.add("typing-indicator");
  typing.innerHTML = "<span></span><span></span><span></span>";

  content.appendChild(typing);
  div.appendChild(content);
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  return div;
}

function removerCarregando() {
  const el = document.getElementById("msg-carregando");
  if (el) el.remove();
}

/* ============================================
   COPIAR PARA ÁREA DE TRANSFERÊNCIA
   ============================================ */
async function copiarTexto(texto, btn) {
  try {
    await navigator.clipboard.writeText(texto);
    const textoOriginal = btn.textContent;
    btn.textContent = "✅ Copiado!";
    btn.classList.add("copiado");

    setTimeout(() => {
      btn.textContent = textoOriginal;
      btn.classList.remove("copiado");
    }, 2000);
  } catch (err) {
    // Fallback para navegadores antigos
    const textarea = document.createElement("textarea");
    textarea.value = texto;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    const textoOriginal = btn.textContent;
    btn.textContent = "✅ Copiado!";
    btn.classList.add("copiado");
    setTimeout(() => {
      btn.textContent = textoOriginal;
      btn.classList.remove("copiado");
    }, 2000);
  }
}

/* ============================================
   EXPORTAR PDF
   ============================================ */
function exportarPDF() {
  const mensagens = document.querySelectorAll(".message");
  if (mensagens.length <= 1) {
    alert("Não há conversa para exportar. Envie pelo menos uma mensagem.");
    return;
  }

  btnExportar.disabled = true;
  btnExportar.textContent = "⏳ Gerando...";

  // Clonar o chat para o PDF
  const clone = document.createElement("div");
  clone.style.padding = "30px";
  clone.style.background = "#ffffff";
  clone.style.color = "#1f2937";
  clone.style.fontFamily = "Segoe UI, sans-serif";
  clone.style.maxWidth = "800px";
  clone.style.margin = "0 auto";

  const titulo = document.createElement("h2");
  titulo.textContent = "📝 Conversa - Chatbot Brigada de Incêndio";
  titulo.style.color = "#991b1b";
  titulo.style.borderBottom = "2px solid #dc2626";
  titulo.style.paddingBottom = "10px";
  titulo.style.marginBottom = "20px";
  clone.appendChild(titulo);

  const data = document.createElement("p");
  data.textContent = `Exportado em: ${new Date().toLocaleString("pt-BR")}`;
  data.style.color = "#6b7280";
  data.style.fontSize = "12px";
  data.style.marginBottom = "20px";
  clone.appendChild(data);

  mensagens.forEach((msg) => {
    const tipo = msg.classList.contains("user") ? "Você" : "Assistente";
    const cor = msg.classList.contains("user") ? "#dc2626" : "#374151";
    const bg = msg.classList.contains("user") ? "#fef2f2" : "#f3f4f6";

    const bloco = document.createElement("div");
    bloco.style.marginBottom = "16px";
    bloco.style.padding = "14px";
    bloco.style.borderRadius = "10px";
    bloco.style.background = bg;
    bloco.style.borderLeft = `4px solid ${cor}`;

    const autor = document.createElement("strong");
    autor.textContent = tipo;
    autor.style.color = cor;
    autor.style.display = "block";
    autor.style.marginBottom = "6px";
    autor.style.fontSize = "13px";

    const texto = document.createElement("div");
    texto.textContent = msg.querySelector(".msg-content").textContent;
    texto.style.lineHeight = "1.6";
    texto.style.fontSize = "14px";
    texto.style.whiteSpace = "pre-wrap";

    bloco.appendChild(autor);
    bloco.appendChild(texto);
    clone.appendChild(bloco);
  });

  document.body.appendChild(clone);

  const opt = {
    margin: [10, 10],
    filename: `chat-brigada-incendio-${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf()
    .set(opt)
    .from(clone)
    .save()
    .then(() => {
      document.body.removeChild(clone);
      btnExportar.disabled = false;
      btnExportar.textContent = "📄 Exportar PDF";
    })
    .catch((err) => {
      console.error(err);
      document.body.removeChild(clone);
      btnExportar.disabled = false;
      btnExportar.textContent = "📄 Exportar PDF";
      alert("Erro ao gerar PDF. Tente novamente.");
    });
}

btnExportar.addEventListener("click", exportarPDF);

/* ============================================
   ENVIO DE MENSAGEM
   ============================================ */
async function enviarMensagem() {
  const texto = mensagem.value.trim();

  // Bloqueio de mensagem vazia com feedback visual
  if (texto === "") {
    erroVazio.classList.add("visivel");
    mensagem.focus();
    mensagem.style.borderColor = "#ef4444";
    setTimeout(() => {
      erroVazio.classList.remove("visivel");
      mensagem.style.borderColor = "";
    }, 2500);
    return;
  }

  erroVazio.classList.remove("visivel");
  mensagem.style.borderColor = "";

  adicionarMensagem(texto, "user");
  mensagem.value = "";
  mensagem.style.height = "auto";

  const carregando = mostrarCarregando();

  try {
    const resposta = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mensagem: texto })
    });

    const dados = await resposta.json();
    removerCarregando();

    if (!resposta.ok) {
      adicionarMensagem(dados.erro || "Erro ao processar a mensagem.", "bot");
      return;
    }

    adicionarMensagem(dados.resposta, "bot");

  } catch (erro) {
    removerCarregando();
    adicionarMensagem(
      "Erro ao conectar com o backend. Verifique se o servidor Python está em execução.",
      "bot"
    );
    console.error(erro);
  }
}

btnEnviar.addEventListener("click", enviarMensagem);

mensagem.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    enviarMensagem();
  }
});

// Auto-resize do textarea
mensagem.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 200) + "px";
});

/* ============================================
   LIMPAR CONVERSA
   ============================================ */
btnLimpar.addEventListener("click", function () {
  chat.innerHTML = "";
  msgIdCounter = 1;
  adicionarMensagem(mensagemInicial, "bot");
});