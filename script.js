const inputNome = document.querySelector("#nomeId");
const inputTel = document.querySelector("#telefoneId");
const inputEmail = document.querySelector("#emailId");
const btnCadastro = document.querySelector("#botaoCadastroId");

const inputRua = document.querySelector("#ruaId");
const inputNumero = document.querySelector("#numeroId");

const inputCep = document.querySelector("#cepId");
const btnBuscarCep = document.querySelector("#btnBuscarCepId");
const cepMsg = document.querySelector("#cepMsgId");

const inputBairro = document.querySelector("#bairroId");
const inputCidade = document.querySelector("#cidadeId");
const selectUf = document.querySelector("#ufsId");
const btnEndereco = document.querySelector("#botaoEnderecoId");

const listaCadastro = document.querySelector("#lista");
const listaEndereco = document.querySelector("#listaEnde");

let estado = {
  leadId: 1,
  cadastros: [],

  endId: 1,
  enderecos: [],

  editandoLeadId: null,
  editandoEnderecoId: null,

  leadSelecionadoId: null,

  cepLoading: false,
  cepErro: null,
};

const salvarLocalStorage = () => {
  localStorage.setItem("estadoCrud", JSON.stringify(estado));
};

const carregarLocalStorage = () => {
  const bruto = localStorage.getItem("estadoCrud");
  if (!bruto) return;

  try {
    const carregado = JSON.parse(bruto);
    if (!carregado || typeof carregado !== "object") return;

    estado.leadId = carregado.leadId ?? estado.leadId;
    estado.cadastros = carregado.cadastros ?? [];
    estado.endId = carregado.endId ?? estado.endId;
    estado.enderecos = carregado.enderecos ?? [];
    estado.editandoLeadId = null;
    estado.editandoEnderecoId = null;
    estado.leadSelecionadoId = carregado.leadSelecionadoId ?? null;
  } catch (e) {

  }
};
// helpers
const validarEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validarTel = (tel) => {
  if (!tel) return false;
  const digits = tel.replace(/\D/g, "");
  if (!digits) return false;
  if (digits[0] === "0") return false;
  if (digits.length === 11 && digits[2] !== "9") return false;
  return true;
};

const normalizarCep = (valor) => String(valor).replace(/\D/g, "");

const validarCep = (cep) => {
  const limpo = normalizarCep(cep);
  return limpo.length === 8;
};

// ===== Lead =====
const lerFormularioLead = () => {
  return {
    nome: inputNome.value.trim(),
    telefone: inputTel.value.trim(),
    email: inputEmail.value.trim(),
  };
};

const limparFormularioLead = () => {
  inputNome.value = "";
  inputTel.value = "";
  inputEmail.value = "";
};

const iniciarEdicaoLead = (id) => {
  const lead = estado.cadastros.find((c) => c.id === id);
  if (!lead) return;

  estado.editandoLeadId = id;

  inputNome.value = lead.nome;
  inputTel.value = lead.telefone;
  inputEmail.value = lead.email;

  render();
};

const cancelarEdicaoLead = () => {
  estado.editandoLeadId = null;
  limparFormularioLead();
  render();
};

const salvarLead = () => {
  const { nome, telefone, email } = lerFormularioLead();

  if (!nome) return;
  if (!validarEmail(email)) return;
  if (!validarTel(telefone)) return;

  if (estado.editandoLeadId === null) {
    const lead = {
      id: estado.leadId,
      nome,
      telefone,
      email,
    };

    estado.cadastros.push(lead);
    estado.leadId += 1;

    limparFormularioLead();
    salvarLocalStorage();
    render();
    return;
  }

  const lead = estado.cadastros.find((c) => c.id === estado.editandoLeadId);
  if (!lead) return;

  lead.nome = nome;
  lead.telefone = telefone;
  lead.email = email;

  estado.editandoLeadId = null;
  limparFormularioLead();
  salvarLocalStorage();
  render();
};

const selecionarLead = (id) => {
  const existe = estado.cadastros.some((c) => c.id === id);
  if (!existe) return;

  estado.leadSelecionadoId = id;
  salvarLocalStorage();
  render();
};

const excluirLead = (id) => {
  const existe = estado.cadastros.some((c) => c.id === id);
  if (!existe) return;

  estado.cadastros = estado.cadastros.filter((c) => c.id !== id);
  estado.enderecos = estado.enderecos.filter((e) => e.leadId !== id);

  if (estado.leadSelecionadoId === id) estado.leadSelecionadoId = null;
  if (estado.editandoLeadId === id) estado.editandoLeadId = null;

  salvarLocalStorage();
  render();
};

const lerFormularioEndereco = () => {
  return {
    cep: normalizarCep(inputCep.value),
    rua: inputRua.value.trim(),
    numero: inputNumero.value.trim(),
    bairro: inputBairro.value.trim(),
    cidade: inputCidade.value.trim(),
    uf: selectUf.value,
  };
};

const limparFormularioEndereco = () => {
  inputCep.value = "";
  inputRua.value = "";
  inputNumero.value = "";
  inputBairro.value = "";
  inputCidade.value = "";
  selectUf.value = "";
};

const iniciarEdicaoEndereco = (enderecoId) => {
  const end = estado.enderecos.find((e) => e.id === enderecoId);
  if (!end) return;

  estado.editandoEnderecoId = enderecoId;

  inputCep.value = end.cep ?? "";
  inputRua.value = end.rua;
  inputNumero.value = end.numero;
  inputBairro.value = end.bairro;
  inputCidade.value = end.cidade;
  selectUf.value = end.uf;

  render();
};

const cancelarEdicaoEndereco = () => {
  estado.editandoEnderecoId = null;
  limparFormularioEndereco();
  render();
};

const buscarCep = async () => {
  const cep = normalizarCep(inputCep.value);

  if (cep.length !== 8) {
    estado.cepErro = "CEP deve ter 8 dígitos.";
    render();
    return;
  }

  estado.cepLoading = true;
  estado.cepErro = null;
  render();

  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!resp.ok) throw new Error("CEP inválido.");

    const data = await resp.json();
    if (data.erro) {
      estado.cepErro = "CEP não encontrado";
      return;
    }

    inputRua.value = data.logradouro ?? "";
    inputBairro.value = data.bairro ?? "";
    inputCidade.value = data.localidade ?? "";
    selectUf.value = data.uf ?? "";
  } catch (e) {
    estado.cepErro = e.message || "Falha ao consultar o CEP.";
  } finally {
    estado.cepLoading = false;
    render();
  }
};

const salvarEndereco = () => {
  const { cep, rua, numero, bairro, cidade, uf } = lerFormularioEndereco();

  if (!validarCep(cep)) return;
  if (!rua) return;
  if (!numero) return;
  if (!bairro) return;
  if (!cidade) return;
  if (!uf) return;

  if (estado.leadSelecionadoId === null) return;

  if (estado.editandoEnderecoId === null) {
    const endereco = {
      id: estado.endId,
      leadId: estado.leadSelecionadoId,
      cep,
      rua,
      numero,
      bairro,
      cidade,
      uf,
    };

    estado.enderecos.push(endereco);
    estado.endId += 1;

    limparFormularioEndereco();
    salvarLocalStorage();
    render();
    return;
  }

  // modo edição
  const end = estado.enderecos.find((e) => e.id === estado.editandoEnderecoId);
  if (!end) return;

  end.cep = cep;
  end.rua = rua;
  end.numero = numero;
  end.bairro = bairro;
  end.cidade = cidade;
  end.uf = uf;

  estado.editandoEnderecoId = null;
  limparFormularioEndereco();
  salvarLocalStorage();
  render();
};

const excluirEndereco = (enderecoId) => {
  const existe = estado.enderecos.some((e) => e.id === enderecoId);
  if (!existe) return;

  estado.enderecos = estado.enderecos.filter((e) => e.id !== enderecoId);

  if (estado.editandoEnderecoId === enderecoId) estado.editandoEnderecoId = null;

  salvarLocalStorage();
  render();
};

const render = () => {
  // limpa listas
  listaCadastro.innerHTML = "";
  listaEndereco.innerHTML = "";

  // refs de UI
  const statLeads = document.querySelector("#statLeads");
  const statEnderecos = document.querySelector("#statEnderecos");
  const emptyLeads = document.querySelector("#emptyLeads");
  const emptyEnderecos = document.querySelector("#emptyEnderecos");
  const leadHint = document.querySelector("#leadSelecionadoHint");
  const leadModeHint = document.querySelector("#leadModeHint");
  const endModeHint = document.querySelector("#endModeHint");
  const btnCancelarLead = document.querySelector("#btnCancelarLead");
  const btnCancelarEndereco = document.querySelector("#btnCancelarEndereco");

  // stats + empty states
  if (statLeads) statLeads.textContent = estado.cadastros.length;

  const endsCount = estado.enderecos.filter((e) => e.leadId === estado.leadSelecionadoId).length;
  if (statEnderecos) statEnderecos.textContent = estado.leadSelecionadoId === null ? 0 : endsCount;

  if (emptyLeads) emptyLeads.style.display = estado.cadastros.length ? "none" : "block";
  if (emptyEnderecos) {
    emptyEnderecos.style.display =
      estado.leadSelecionadoId === null ? "block" : endsCount ? "none" : "block";
  }

  if (leadModeHint) leadModeHint.textContent = estado.editandoLeadId === null ? "Criando" : "Editando";
  if (endModeHint) endModeHint.textContent = estado.editandoEnderecoId === null ? "Criando" : "Editando";

  if (btnCadastro) btnCadastro.value = estado.editandoLeadId === null ? "Enviar" : "Salvar edição";
  if (btnEndereco) btnEndereco.value = estado.editandoEnderecoId === null ? "Enviar" : "Salvar edição";

  if (btnCancelarLead) btnCancelarLead.style.display = estado.editandoLeadId === null ? "none" : "inline-flex";
  if (btnCancelarEndereco) btnCancelarEndereco.style.display = estado.editandoEnderecoId === null ? "none" : "inline-flex";

  if (leadHint) {
    if (estado.leadSelecionadoId === null) {
      leadHint.textContent = "Selecione um lead para cadastrar endereços.";
    } else {
      const leadSel = estado.cadastros.find((c) => c.id === estado.leadSelecionadoId);
      leadHint.textContent = leadSel ? `Lead selecionado: ${leadSel.nome}` : "Lead selecionado.";
    }
  }

  if (cepMsg) {
    cepMsg.textContent = estado.cepLoading ? "Buscando CEP..." : (estado.cepErro || "");
    cepMsg.classList.toggle("msg--error", Boolean(estado.cepErro));
    cepMsg.style.display = (estado.cepLoading || estado.cepErro) ? "block" : "none";
  }
  if (btnBuscarCep) btnBuscarCep.disabled = estado.cepLoading;
  estado.cadastros.forEach((cadastro) => {
    const li = document.createElement("li");

    if (estado.leadSelecionadoId === cadastro.id) li.classList.add("is-selected");
    if (estado.editandoLeadId === cadastro.id) {
      const inputNomeEdit = document.createElement("input");
      inputNomeEdit.type = "text";
      inputNomeEdit.value = cadastro.nome;

      const inputTelEdit = document.createElement("input");
      inputTelEdit.type = "text";
      inputTelEdit.value = cadastro.telefone;

      const inputEmailEdit = document.createElement("input");
      inputEmailEdit.type = "text";
      inputEmailEdit.value = cadastro.email;

      const actions = document.createElement("div");
      actions.className = "actions";

      const btnSalvar = document.createElement("button");
      btnSalvar.textContent = "Salvar";
      btnSalvar.className = "btn-small btn-small--primary";
      btnSalvar.addEventListener("click", () => {
        inputNome.value = inputNomeEdit.value;
        inputTel.value = inputTelEdit.value;
        inputEmail.value = inputEmailEdit.value;
        salvarLead();
      });

      const btnCancelar = document.createElement("button");
      btnCancelar.textContent = "Cancelar";
      btnCancelar.className = "btn-small";
      btnCancelar.addEventListener("click", cancelarEdicaoLead);

      actions.append(btnSalvar, btnCancelar);

      li.append(inputNomeEdit, inputTelEdit, inputEmailEdit, actions);
      listaCadastro.appendChild(li);
      return;
    }

    const span = document.createElement("span");
    span.textContent = `${cadastro.nome} — ${cadastro.telefone} — ${cadastro.email}`;

    const actions = document.createElement("div");
    actions.className = "actions";

    const btnSelecionarLead = document.createElement("button");
    btnSelecionarLead.textContent = "Selecionar Endereço";
    btnSelecionarLead.className = "btn-small btn-small--primary";
    btnSelecionarLead.addEventListener("click", () => selecionarLead(cadastro.id));

    const btnEditarLead = document.createElement("button");
    btnEditarLead.textContent = "Editar";
    btnEditarLead.className = "btn-small";
    btnEditarLead.addEventListener("click", () => iniciarEdicaoLead(cadastro.id));

    const btnExcluirLead = document.createElement("button");
    btnExcluirLead.textContent = "Excluir";
    btnExcluirLead.className = "btn-small btn-small--danger";
    btnExcluirLead.addEventListener("click", () => excluirLead(cadastro.id));

    actions.append(btnSelecionarLead, btnEditarLead, btnExcluirLead);
    li.append(span, actions);

    listaCadastro.appendChild(li);
  });

  // ===== Lista de endereços do lead selecionado =====
  if (estado.leadSelecionadoId !== null) {
    const ends = estado.enderecos.filter((e) => e.leadId === estado.leadSelecionadoId);

    ends.forEach((endereco) => {
      const li = document.createElement("li");

      // Modo edição (inline)
      if (estado.editandoEnderecoId === endereco.id) {
        const inputCepEdit = document.createElement("input");
        inputCepEdit.type = "text";
        inputCepEdit.value = endereco.cep ?? "";

        const inputRuaEdit = document.createElement("input");
        inputRuaEdit.type = "text";
        inputRuaEdit.value = endereco.rua;

        const inputNumeroEdit = document.createElement("input");
        inputNumeroEdit.type = "text";
        inputNumeroEdit.value = endereco.numero;

        const inputBairroEdit = document.createElement("input");
        inputBairroEdit.type = "text";
        inputBairroEdit.value = endereco.bairro;

        const inputCidadeEdit = document.createElement("input");
        inputCidadeEdit.type = "text";
        inputCidadeEdit.value = endereco.cidade;

        const selectUfEdit = document.createElement("select");
        const option = document.createElement("option");
        option.value = endereco.uf;
        option.textContent = endereco.uf;
        selectUfEdit.appendChild(option);

        const actions = document.createElement("div");
        actions.className = "actions";

        const btnSalvarEnd = document.createElement("button");
        btnSalvarEnd.textContent = "Salvar";
        btnSalvarEnd.className = "btn-small btn-small--primary";
        btnSalvarEnd.addEventListener("click", () => {
          inputCep.value = inputCepEdit.value;
          inputRua.value = inputRuaEdit.value;
          inputNumero.value = inputNumeroEdit.value;
          inputBairro.value = inputBairroEdit.value;
          inputCidade.value = inputCidadeEdit.value;
          selectUf.value = selectUfEdit.value || endereco.uf;
          salvarEndereco();
        });

        const btnCancelarEnd = document.createElement("button");
        btnCancelarEnd.textContent = "Cancelar";
        btnCancelarEnd.className = "btn-small";
        btnCancelarEnd.addEventListener("click", cancelarEdicaoEndereco);

        actions.append(btnSalvarEnd, btnCancelarEnd);

        li.append(
          inputCepEdit,
          inputRuaEdit,
          inputNumeroEdit,
          inputBairroEdit,
          inputCidadeEdit,
          selectUfEdit,
          actions
        );
        listaEndereco.appendChild(li);
        return;
      }

      // modo normal
      const span = document.createElement("span");
      span.textContent = `${endereco.cep} — ${endereco.rua}, ${endereco.numero} — ${endereco.bairro} — ${endereco.cidade}/${endereco.uf}`;

      const actions = document.createElement("div");
      actions.className = "actions";

      const btnEditarEndereco = document.createElement("button");
      btnEditarEndereco.textContent = "Editar";
      btnEditarEndereco.className = "btn-small";
      btnEditarEndereco.addEventListener("click", () => iniciarEdicaoEndereco(endereco.id));

      const btnExcluirEndereco = document.createElement("button");
      btnExcluirEndereco.textContent = "Excluir";
      btnExcluirEndereco.className = "btn-small btn-small--danger";
      btnExcluirEndereco.addEventListener("click", () => excluirEndereco(endereco.id));

      actions.append(btnEditarEndereco, btnExcluirEndereco);
      li.append(span, actions);

      listaEndereco.appendChild(li);
    });
  }
};

// Eventos
if (btnCadastro) btnCadastro.addEventListener("click", salvarLead);
if (btnEndereco) btnEndereco.addEventListener("click", salvarEndereco);
if (btnBuscarCep) btnBuscarCep.addEventListener("click", buscarCep);

const btnCancelarLead = document.querySelector("#btnCancelarLead");
if (btnCancelarLead) btnCancelarLead.addEventListener("click", cancelarEdicaoLead);

const btnCancelarEndereco = document.querySelector("#btnCancelarEndereco");
if (btnCancelarEndereco) btnCancelarEndereco.addEventListener("click", cancelarEdicaoEndereco);

// init
carregarLocalStorage();
render();
