
const API = 'http://localhost:3000';
const $ = id => document.getElementById(id);

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;'
}[c]));

let db = {
    clientes: [],
    agentes: [],
    automoveis: [],
    pedidos: [],
    contratos: []
};

let usuario = null;
let modal = null;
let edicao = null;

const CHAVE_SESSAO = 'autorent_usuario';

// API
async function req(recurso, metodo = 'GET', dados = null, id = '') {
    const resposta = await fetch(
        `${API}/${recurso}${id !== '' ? '/' + id : ''}`,
        {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            ...(dados !== null ? { body: JSON.stringify(dados) } : {})
        }
    );

    if (!resposta.ok) {
        throw Error(`HTTP ${resposta.status} em ${recurso}`);
    }

    return metodo === 'DELETE' ? null : resposta.json();
}

// MENSAGENS
function aviso(msg, erro = false) {
    $('alertas').innerHTML = `
        <div class="alert alert-${erro ? 'danger' : 'success'}
                    alert-dismissible fade show" role="alert">
            ${esc(msg)}
            <button class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// SESSÃO
function guardarSessao() {
    if (usuario) {
        sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify({
            papel: usuario.papel,
            id: usuario.id
        }));
    }
}

function encerrarSessao() {
    sessionStorage.removeItem(CHAVE_SESSAO);
    usuario = null;
    $('areaPrivada').hidden = true;
    $('sessaoInfo').textContent = '';
    $('usuarioAtual').value = '';
}

function restaurarSessao() {
    const salva = sessionStorage.getItem(CHAVE_SESSAO);

    if (!salva) return;

    try {
        const { papel, id } = JSON.parse(salva);

        if (papel !== 'cliente' && papel !== 'agente') {
            encerrarSessao();
            return;
        }

        const registros = papel === 'cliente'
            ? db.clientes : db.agentes;

        const registro = registros.find(
            x => String(x.id) === String(id)
        );

        if (!registro) {
            encerrarSessao();
            return;
        }

        usuario = { ...registro, papel };
        $('areaPrivada').hidden = false;
        $('sessaoInfo').textContent =
            `Sessão de demonstração: ${registro.nome} (${papel})`;

    } catch (erro) {
        encerrarSessao();
    }
}

// CARREGAR DADOS
async function atualizar() {
    try {
        const recursos = Object.keys(db);
        const resultados = await Promise.all(
            recursos.map(recurso => req(recurso))
        );

        recursos.forEach((recurso, i) => {
            db[recurso] = resultados[i];
        });

        restaurarSessao();
        atualizarUsuarios();
        renderizar();

    } catch (erro) {
        aviso(
            'Não foi possível acessar a API. ' +
            'Inicie o JSON Server na porta 3000. ' +
            erro.message,
            true
        );
    }
}

// USUÁRIOS
function atualizarUsuarios() {
    const antigo = $('usuarioAtual').value;

    $('usuarioAtual').innerHTML =
        '<option value="">Selecione...</option>' +
        db.clientes.map(c => `
            <option value="cliente:${c.id}">
                Cliente: ${esc(c.nome)}
            </option>
        `).join('') +
        db.agentes.map(a => `
            <option value="agente:${a.id}">
                Agente: ${esc(a.nome)} (${esc(a.tipo)})
            </option>
        `).join('');

    $('usuarioAtual').value = usuario
        ? `${usuario.papel}:${usuario.id}` : antigo;
}

function entrar() {
    const [papel, id] = $('usuarioAtual').value.split(':');

    const registros = papel === 'cliente'
        ? db.clientes : db.agentes;

    const reg = registros.find(x => String(x.id) === id);

    if (!reg) {
        aviso('Selecione um usuário cadastrado.', true);
        return;
    }

    usuario = { ...reg, papel };
    guardarSessao();

    $('areaPrivada').hidden = false;
    $('sessaoInfo').textContent =
        `Sessão de demonstração: ${reg.nome} (${papel})`;

    renderizar();
    aviso(`Acesso liberado para ${reg.nome}.`);
}

function sair() {
    encerrarSessao();
    aviso('Você saiu do sistema.');
}

// FUNÇÕES AUXILIARES
function nomeCliente(id) {
    return db.clientes.find(
        c => String(c.id) === String(id)
    )?.nome || 'Cliente removido';
}

function nomeCarro(id) {
    const c = db.automoveis.find(
        x => String(x.id) === String(id)
    );

    return c
        ? `${c.marca} ${c.modelo} (${c.placa})`
        : 'Automóvel removido';
}

function badge(status) {
    return `<span class="badge-status status-${esc(status)}">
        ${esc(status)}
    </span>`;
}

function botoes(acoes) {
    return `<div class="acoes">${acoes.join('')}</div>`;
}

function btn(texto, acao, id, classe = 'outline-primary') {
    return `<button type="button"
        class="btn btn-sm btn-${classe}"
        data-acao="${acao}" data-id="${id}">
        ${texto}
    </button>`;
}

// RENDERIZAR TELAS
function renderizar() {
    if (!usuario) return;

    const cliente = usuario.papel === 'cliente';
    const agente = usuario.papel === 'agente';

    document.querySelector('[data-tela="agentes"]').hidden = cliente;
    document.querySelector('[data-tela="contratos"]').hidden = cliente;

    $('novoCliente').hidden = cliente;
    $('novoCarro').hidden = cliente;
    $('novoContrato').hidden = cliente;
    $('novoPedido').hidden = !cliente;

    const meus = db.pedidos.filter(p =>
        !cliente || String(p.clienteId) === String(usuario.id)
    );

    // INDICADORES
    $('indicadores').innerHTML = [
        ['Clientes', db.clientes.length],
        ['Automóveis', db.automoveis.length],
        ['Meus pedidos / pedidos', meus.length],
        ['Pendentes', meus.filter(p => p.status === 'pendente').length]
    ].map(([nome, valor]) => `
        <div class="col-sm-6 col-lg-3">
            <div class="stat-card">
                <span>${nome}</span>
                <strong>${valor}</strong>
            </div>
        </div>
    `).join('');

    // CLIENTES
    $('listaClientes').innerHTML = db.clientes
        .filter(c => agente || String(c.id) === String(usuario.id))
        .map(c => `
            <tr>
                <td>${esc(c.nome)}</td>
                <td>${esc(c.cpf)}</td>
                <td>${esc(c.profissao)}</td>
                <td>${c.empregadores?.length || 0}</td>
                <td>${botoes([
                    btn('Editar', 'editarCliente', c.id),
                    btn('Excluir', 'excluirCliente', c.id, 'outline-danger')
                ])}</td>
            </tr>
        `).join('') ||
        '<tr><td colspan="5">Nenhum cliente cadastrado.</td></tr>';

    // AUTOMÓVEIS
    $('listaCarros').innerHTML = db.automoveis.map(c => `
        <div class="col-md-6 col-xl-4">
            <div class="car-card">
                <div class="car-icon">🚗</div>
                <h3 class="h5 mt-3">
                    ${esc(c.marca)} ${esc(c.modelo)}
                </h3>
                <p class="text-secondary">
                    ${esc(c.ano)} • Placa ${esc(c.placa)}<br>
                    Matrícula: ${esc(c.matricula)}<br>
                    Proprietário: ${esc(c.proprietarioTipo)}
                </p>
                ${agente ? botoes([
                    btn('Editar', 'editarCarro', c.id),
                    btn('Excluir', 'excluirCarro', c.id, 'outline-danger')
                ]) : ''}
            </div>
        </div>
    `).join('');

    // PEDIDOS
    $('listaPedidos').innerHTML = meus.map(p => `
        <tr>
            <td>#${p.id}</td>
            <td>${esc(nomeCliente(p.clienteId))}</td>
            <td>${esc(nomeCarro(p.automovelId))}</td>
            <td>${esc(p.dataInicio)} a ${esc(p.dataFim)}</td>
            <td>${badge(p.status)}</td>
            <td>${botoes([
                ...(p.status === 'pendente'
                    ? [btn('Editar', 'editarPedido', p.id)] : []),
                ...(cliente && p.status !== 'cancelado'
                    ? [btn('Cancelar', 'cancelarPedido', p.id, 'outline-danger')]
                    : [])
            ])}</td>
        </tr>
    `).join('') ||
        '<tr><td colspan="6">Nenhum pedido.</td></tr>';

    // ANÁLISES FINANCEIRAS
    $('listaAnalises').innerHTML = db.pedidos.map(p => `
        <div class="card panel mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <h3 class="h5">
                        Pedido #${p.id} — ${esc(nomeCliente(p.clienteId))}
                    </h3>
                    ${badge(p.status)}
                </div>
                <p class="mb-1">
                    ${esc(nomeCarro(p.automovelId))}
                    • ${esc(p.dataInicio)} até ${esc(p.dataFim)}
                </p>
                <p class="small text-secondary">
                    Observação: ${esc(p.observacao || '—')}
                    • Parecer: ${esc(p.parecer || '—')}
                </p>
                ${p.status === 'pendente'
                    ? botoes([btn('Avaliar', 'avaliarPedido', p.id, 'primary')])
                    : ''}
            </div>
        </div>
    `).join('') || '<p>Nenhum pedido para analisar.</p>';

    // CONTRATOS
    $('listaContratos').innerHTML = db.contratos.map(c => `
        <tr>
            <td>#${c.id}</td>
            <td>#${c.pedidoId}</td>
            <td>${esc(c.tipo)}</td>
            <td>${esc(
                db.agentes.find(
                    a => String(a.id) === String(c.bancoId)
                )?.nome || '—'
            )}</td>
            <td>
                R$ ${Number(c.valor || 0).toLocaleString(
                    'pt-BR', { minimumFractionDigits: 2 }
                )}
            </td>
            <td>${botoes([
                btn('Excluir', 'excluirContrato', c.id, 'outline-danger')
            ])}</td>
        </tr>
    `).join('') ||
        '<tr><td colspan="6">Nenhum contrato registrado.</td></tr>';
}

// FORMULÁRIOS
function campo(nome, label, valor = '', tipo = 'text', obrigatorio = true) {
    return `<div class="col-md-6">
        <label class="form-label" for="f-${nome}">${label}</label>
        <input class="form-control" id="f-${nome}" name="${nome}"
            type="${tipo}" value="${esc(valor)}"
            ${obrigatorio ? 'required' : ''}>
    </div>`;
}

function select(nome, label, opcoes, valor = '') {
    return `<div class="col-md-6">
        <label class="form-label" for="f-${nome}">${label}</label>
        <select class="form-select" name="${nome}" id="f-${nome}" required>
            ${opcoes.map(([v, texto]) => `
                <option value="${esc(v)}"
                    ${String(v) === String(valor) ? 'selected' : ''}>
                    ${esc(texto)}
                </option>
            `).join('')}
        </select>
    </div>`;
}

function abrir(titulo, tipo, id = null) {
    edicao = { tipo, id };
    $('tituloModal').textContent = titulo;

    const c = db.clientes.find(x => String(x.id) === String(id));
    const a = db.automoveis.find(x => String(x.id) === String(id));
    const p = db.pedidos.find(x => String(x.id) === String(id));

    let html = '';

    if (tipo === 'cliente') {
        const emp = c?.empregadores || [];

        html = `<div class="row g-3">
            ${campo('nome', 'Nome', c?.nome)}
            ${campo('cpf', 'CPF', c?.cpf)}
            ${campo('rg', 'RG', c?.rg)}
            ${campo('profissao', 'Profissão', c?.profissao)}
            <div class="col-12">
                ${campo('endereco', 'Endereço', c?.endereco)
                    .replace('col-md-6', 'col-12')}
            </div>
            <div class="col-12">
                <h6>Empregadores e rendimentos (máximo 3)</h6>
                <p class="hint">Preencha somente os vínculos existentes.</p>
            </div>
            ${[0, 1, 2].map(i =>
                campo(
                    `empregador${i}`,
                    `Empregador ${i + 1}`,
                    emp[i]?.entidade || '', 'text', false
                ) +
                campo(
                    `rendimento${i}`,
                    `Rendimento ${i + 1} (R$)`,
                    emp[i]?.rendimento || '', 'number', false
                )
            ).join('')}
        </div>`;
    }

    if (tipo === 'carro') {
        html = `<div class="row g-3">
            ${campo('matricula', 'Matrícula', a?.matricula)}
            ${campo('placa', 'Placa', a?.placa)}
            ${campo('marca', 'Marca', a?.marca)}
            ${campo('modelo', 'Modelo', a?.modelo)}
            ${campo('ano', 'Ano', a?.ano || 2024, 'number')}
            ${select('proprietarioTipo', 'Tipo de proprietário', [
                ['cliente', 'Cliente'],
                ['empresa', 'Empresa'],
                ['banco', 'Banco']
            ], a?.proprietarioTipo)}
            ${campo(
                'proprietarioId', 'ID do proprietário',
                a?.proprietarioId || 1, 'number'
            )}
        </div>`;
    }

    if (tipo === 'pedido') {
        html = `<div class="row g-3">
            ${select(
                'clienteId', 'Cliente',
                db.clientes.filter(c =>
                    usuario.papel === 'agente' ||
                    String(c.id) === String(usuario.id)
                ).map(c => [c.id, c.nome]),
                p?.clienteId || usuario.id
            )}
            ${select(
                'automovelId', 'Automóvel',
                db.automoveis.map(c => [
                    c.id, `${c.marca} ${c.modelo} (${c.placa})`
                ]),
                p?.automovelId
            )}
            ${campo('dataInicio', 'Início', p?.dataInicio || '', 'date')}
            ${campo('dataFim', 'Fim', p?.dataFim || '', 'date')}
            <div class="col-12">
                <label class="form-label">Observação</label>
                <textarea name="observacao" class="form-control">${esc(
                    p?.observacao || ''
                )}</textarea>
            </div>
        </div>`;
    }

    if (tipo === 'avaliacao') {
        html = `<div class="row g-3">
            ${select('status', 'Decisão', [
                ['aprovado', 'Aprovar'],
                ['rejeitado', 'Rejeitar']
            ])}
            <div class="col-12">
                <label class="form-label">Parecer financeiro</label>
                <textarea name="parecer"
                    class="form-control" required></textarea>
            </div>
        </div>`;
    }

    if (tipo === 'contrato') {
        const disponiveis = db.pedidos.filter(p =>
            p.status === 'aprovado' &&
            !db.contratos.some(
                c => String(c.pedidoId) === String(p.id)
            )
        );

        if (!disponiveis.length) {
            aviso('Não há pedidos aprovados sem contrato.', true);
            return;
        }

        html = `<div class="row g-3">
            ${select(
                'pedidoId', 'Pedido aprovado',
                disponiveis.map(p => [
                    p.id, `#${p.id} - ${nomeCliente(p.clienteId)}`
                ])
            )}
            ${select('tipo', 'Tipo de contrato', [
                ['aluguel', 'Aluguel'],
                ['credito', 'Crédito bancário']
            ])}
            ${select('bancoId', 'Banco (se houver)', [
                ['', 'Nenhum'],
                ...db.agentes.filter(a => a.tipo === 'banco')
                    .map(a => [a.id, a.nome])
            ])}
            ${campo('valor', 'Valor do contrato (R$)', 0, 'number')}
        </div>`;
    }

    $('camposFormulario').innerHTML = html;
    modal.show();
}

// SALVAR
async function salvar(evento) {
    evento.preventDefault();

    const formulario = new FormData($('formulario'));
    const get = chave => String(formulario.get(chave) || '').trim();
    const { tipo, id } = edicao;

    let recurso;
    let dados;
    let metodo = id !== null ? 'PATCH' : 'POST';

    try {
        if (tipo === 'cliente') {
            if (
                id !== null &&
                usuario?.papel === 'cliente' &&
                String(usuario.id) !== String(id)
            ) {
                throw Error('Você só pode editar seu cadastro.');
            }

            recurso = 'clientes';
            const empregadores = [];

            for (let i = 0; i < 3; i++) {
                const entidade = get('empregador' + i);
                const rendimento = get('rendimento' + i);

                if (entidade) {
                    empregadores.push({
                        entidade,
                        rendimento: Number(rendimento || 0)
                    });
                }
            }

            dados = {
                nome: get('nome'),
                cpf: get('cpf').replace(/\D/g, ''),
                rg: get('rg'),
                endereco: get('endereco'),
                profissao: get('profissao'),
                empregadores
            };

            if (!/^\d{11}$/.test(dados.cpf)) {
                throw Error('CPF deve ter 11 dígitos.');
            }

            if (db.clientes.some(c =>
                c.cpf === dados.cpf &&
                String(c.id) !== String(id)
            )) {
                throw Error('CPF já cadastrado.');
            }

        } else if (tipo === 'carro') {
            recurso = 'automoveis';

            dados = {
                matricula: get('matricula'),
                placa: get('placa'),
                marca: get('marca'),
                modelo: get('modelo'),
                ano: Number(get('ano')),
                proprietarioTipo: get('proprietarioTipo'),
                proprietarioId: Number(get('proprietarioId'))
            };

            if (db.automoveis.some(c =>
                c.placa === dados.placa &&
                String(c.id) !== String(id)
            )) {
                throw Error('Placa já cadastrada.');
            }

        } else if (tipo === 'pedido') {
            recurso = 'pedidos';

            dados = {
                clienteId: Number(get('clienteId')),
                automovelId: Number(get('automovelId')),
                dataInicio: get('dataInicio'),
                dataFim: get('dataFim'),
                observacao: get('observacao')
            };

            if (dados.dataFim < dados.dataInicio) {
                throw Error(
                    'Data final deve ser posterior ou igual à inicial.'
                );
            }

            if (id === null) {
                Object.assign(dados, {
                    status: 'pendente',
                    agenteId: null,
                    parecer: ''
                });
            }

        } else if (tipo === 'avaliacao') {
            if (usuario?.papel !== 'agente') {
                throw Error('Apenas agentes podem avaliar pedidos.');
            }

            recurso = 'pedidos';
            metodo = 'PATCH';

            dados = {
                status: get('status'),
                parecer: get('parecer'),
                agenteId: usuario.id
            };

        } else if (tipo === 'contrato') {
            if (usuario?.papel !== 'agente') {
                throw Error('Apenas agentes podem criar contratos.');
            }

            recurso = 'contratos';

            dados = {
                pedidoId: Number(get('pedidoId')),
                tipo: get('tipo'),
                bancoId: get('bancoId')
                    ? Number(get('bancoId')) : null,
                valor: Number(get('valor'))
            };

            if (dados.tipo === 'credito' && !dados.bancoId) {
                throw Error('Contrato de crédito exige banco.');
            }

            if (dados.valor < 0) {
                throw Error('Valor inválido.');
            }
        }

        await req(recurso, metodo, dados, id ?? '');
        modal.hide();

        await atualizar();

        aviso('Registro salvo com sucesso.');

    } catch (erro) {
        aviso(erro.message, true);
    }
}

// AÇÕES DOS BOTÕES
async function executarAcao(acao, id) {
    if (acao === 'editarCliente') {
        abrir('Editar cliente', 'cliente', id);
        return;
    }

    if (acao === 'editarCarro') {
        abrir('Editar automóvel', 'carro', id);
        return;
    }

    if (acao === 'editarPedido') {
        abrir('Modificar pedido', 'pedido', id);
        return;
    }

    if (acao === 'avaliarPedido') {
        if (usuario?.papel !== 'agente') {
            aviso('Apenas agentes podem avaliar.', true);
            return;
        }

        abrir('Avaliação financeira', 'avaliacao', id);
        return;
    }

    const mapa = {
        excluirCliente: 'clientes',
        excluirCarro: 'automoveis',
        excluirContrato: 'contratos'
    };

    try {
        if (acao === 'cancelarPedido') {
            const pedido = db.pedidos.find(
                p => String(p.id) === String(id)
            );

            if (!pedido) {
                throw Error('Pedido não encontrado.');
            }

            if (
                usuario?.papel !== 'cliente' ||
                String(pedido.clienteId) !== String(usuario.id)
            ) {
                throw Error('Você não pode cancelar este pedido.');
            }

            if (!confirm('Cancelar este pedido?')) return;

            await req('pedidos', 'PATCH', {
                status: 'cancelado'
            }, id);

        } else if (mapa[acao]) {
            if (acao === 'excluirCliente') {
                const ehAgente = usuario?.papel === 'agente';

                const ehProprioCliente =
                    usuario?.papel === 'cliente' &&
                    String(usuario.id) === String(id);

                if (!ehAgente && !ehProprioCliente) {
                    throw Error(
                        'Você só pode excluir seu próprio cadastro.'
                    );
                }

                if (db.pedidos.some(
                    p => String(p.clienteId) === String(id)
                )) {
                    throw Error(
                        'Este cliente possui pedidos associados. ' +
                        'A exclusão foi bloqueada para preservar o histórico.'
                    );
                }

                if (!confirm(
                    'Tem certeza que deseja excluir este cliente? ' +
                    'Essa ação não poderá ser desfeita.'
                )) return;

                await req('clientes', 'DELETE', null, id);

                if (ehProprioCliente) {
                    encerrarSessao();
                }

            } else {
                if (usuario?.papel !== 'agente') {
                    throw Error('Operação reservada a agentes.');
                }

                if (
                    acao === 'excluirCarro' &&
                    db.pedidos.some(
                        p => String(p.automovelId) === String(id)
                    )
                ) {
                    throw Error('Automóvel possui pedidos associados.');
                }

                if (!confirm('Excluir este registro?')) return;

                await req(mapa[acao], 'DELETE', null, id);
            }
        }

        await atualizar();
        aviso('Operação concluída com sucesso.');

    } catch (erro) {
        aviso(erro.message, true);
    }
}

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    modal = new bootstrap.Modal($('modalFormulario'));

    $('entrar').addEventListener('click', entrar);

    $('cadastroPublico').addEventListener('click', () => {
        abrir('Cadastrar novo cliente', 'cliente');
    });

    $('formulario').addEventListener('submit', salvar);

    $('novoCliente').addEventListener('click', () => {
        abrir('Novo cliente', 'cliente');
    });

    $('novoCarro').addEventListener('click', () => {
        abrir('Novo automóvel', 'carro');
    });

    $('novoPedido').addEventListener('click', () => {
        abrir('Novo pedido', 'pedido');
    });

    $('novoContrato').addEventListener('click', () => {
        abrir('Novo contrato', 'contrato');
    });

    document.addEventListener('click', evento => {
        const botao = evento.target.closest('[data-acao]');

        if (botao) {
            executarAcao(
                botao.dataset.acao,
                Number(botao.dataset.id)
            );
        }

        const nav = evento.target.closest('[data-tela]');

        if (nav) {
            document.querySelectorAll('[data-tela]').forEach(x => {
                x.classList.toggle('active', x === nav);
            });

            document.querySelectorAll('.tela').forEach(x => {
                x.hidden = x.id !== `tela-${nav.dataset.tela}`;
            });
        }
    });

    atualizar();
});
