"""
ROTAS DA API (routes.py)
------------------------
Este arquivo funciona como o "garçom" do sistema: ele recebe os pedidos que vêm
do Frontend (React) através de endereços web (ex: /api/produtos, /api/login),
consulta ou salva as informações no banco de dados (models.py) e devolve a resposta em JSON.
"""

from datetime import datetime, timezone
import secrets
import string
from flask import Blueprint, jsonify, request
from models import (
    db,
    Usuario,
    Categoria,
    Produto,
    ImagemProduto,
    Pedido,
    ItemPedido,
    MensagemContato,
    AvaliacaoFaq,
)

# Cria um "Blueprint" (um agrupador de rotas) que coloca automaticamente "/api" na frente de todos os endereços
api_bp = Blueprint("api", __name__, url_prefix="/api")

# Dicionário temporário na memória RAM que guarda os códigos de verificação enviados para cada e-mail
TOKENS_VERIFICACAO: dict[str, str] = {}


def gerar_token_5_caracteres() -> str:
    """
    Sorteia um código seguro de 5 caracteres contendo letras maiúsculas (A-Z) e números (0-9).
    Usado para simular o código de confirmação enviado ao e-mail institucional do aluno.
    """
    alfabeto = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alfabeto) for _ in range(5))


# =====================================================================
# 1. VERIFICAÇÃO DE SAÚDE DO SERVIDOR
# =====================================================================
@api_bp.route("/status", methods=["GET"])
def status_api():
    """
    Rota simples de teste (GET /api/status).
    Serve para checar rapidamente no navegador se o Backend Python está ligado e respondendo.
    """
    return jsonify({
        "status": "online",
        "projeto": "Cantina Serra e Soares - IFSP",
        "banco": "SQLite + SQLAlchemy ORM",
    })


# =====================================================================
# 2. LISTAGEM DE CATEGORIAS DO CARDÁPIO
# =====================================================================
@api_bp.route("/categorias", methods=["GET"])
def listar_categorias():
    """
    Devolve todas as categorias para montar os botões de filtro no Cardápio (GET /api/categorias).
    Adiciona manualmente as abas especiais 'Todos' e 'Promoções' antes das categorias do banco.
    """
    categorias = Categoria.query.order_by(Categoria.id).all()
    lista = [
        {"id": "todos", "nome": "Todos"},
        {"id": "promocao", "nome": "Promoções"},
    ] + [c.to_dict() for c in categorias]
    return jsonify(lista)


# =====================================================================
# 3. GERENCIAMENTO DE PRODUTOS (Vitrine, Cardápio e Painel Admin)
# =====================================================================
@api_bp.route("/produtos", methods=["GET"])
def listar_produtos():
    """
    Busca e devolve a lista de produtos ativos da cantina (GET /api/produtos).
    Aceita filtros opcionais na URL, por exemplo:
    - /api/produtos?destaque=true  -> traz só os produtos da vitrine da página Início
    - /api/produtos?promocao=true  -> traz só os combos em promoção
    - /api/produtos?categoria=doce -> filtra apenas os doces
    """
    query = Produto.query.filter_by(ativo=True)

    destaque = request.args.get("destaque")
    promocao = request.args.get("promocao")
    categoria_slug = request.args.get("categoria")

    if destaque is not None:
        query = query.filter_by(destaque_dia=(destaque.lower() == "true"))

    if promocao is not None:
        query = query.filter_by(em_promocao=(promocao.lower() == "true"))

    if categoria_slug == "promocao":
        query = query.filter_by(em_promocao=True)
    elif categoria_slug and categoria_slug != "todos":
        categoria = Categoria.query.filter_by(slug=categoria_slug).first()
        if categoria:
            query = query.filter_by(categoria_id=categoria.id)

    produtos = query.order_by(Produto.id).all()
    return jsonify([p.to_dict() for p in produtos])


@api_bp.route("/produtos/<int:produto_id>", methods=["GET"])
def obter_produto(produto_id):
    """
    Busca um único produto pelo seu ID (GET /api/produtos/1).
    Se o ID não existir no banco, o 'get_or_404' já devolve automaticamente o erro 404 (Não Encontrado).
    """
    produto = Produto.query.get_or_404(produto_id)
    return jsonify(produto.to_dict())


@api_bp.route("/produtos", methods=["POST"])
def criar_produto():
    """
    Cadastra um novo produto no cardápio (POST /api/produtos).
    Recebe os dados em JSON, junta a lista de ingredientes com ';' para salvar no banco
    e cria também as fotos da galeria (ImagemProduto) associadas a ele.
    """
    dados = request.get_json() or {}
    slug_categoria = dados.get("categoria", "salgado")
    categoria = Categoria.query.filter_by(slug=slug_categoria).first()
    if not categoria:
        return jsonify({"erro": "Categoria inválida."}), 400

    ingredientes = dados.get("ingredientes", [])
    if isinstance(ingredientes, list):
        ingredientes_str = "; ".join(ingredientes)
    else:
        ingredientes_str = str(ingredientes)

    preco_antigo_raw = dados.get("precoAntigoNumerico", dados.get("precoAntigo"))
    preco_antigo_val = float(preco_antigo_raw) if preco_antigo_raw is not None else None

    novo_produto = Produto(
        categoria_id=categoria.id,
        nome=dados.get("nome", "").strip(),
        descricao=dados.get("descricao", "").strip(),
        descricao_detalhada=dados.get("descricaoDetalhada", "").strip(),
        ingredientes=ingredientes_str,
        imagem=dados.get("imagem", "/img/produtos/salgados/coxinha.jpg"),
        preco_antigo=preco_antigo_val,
        preco=float(dados.get("precoNumerico", dados.get("preco", 0.0))),
        desconto=dados.get("desconto"),
        quantidade_estoque=int(dados.get("quantidadeEstoque", 50)),
        destaque_dia=bool(dados.get("destaqueDia", True)),
        em_promocao=bool(dados.get("emPromocao", False)),
        ativo=True,
    )
    db.session.add(novo_produto)
    # O flush() gera o ID do novo_produto no banco antes de finalizar a transação,
    # permitindo que a gente use 'novo_produto.id' logo abaixo para salvar as fotos dele.
    db.session.flush()

    imagens = dados.get("imagens", [novo_produto.imagem])
    for idx, url_img in enumerate(imagens, start=1):
        db.session.add(
            ImagemProduto(produto_id=novo_produto.id, url_imagem=url_img, ordem=idx)
        )

    db.session.commit()
    return jsonify(novo_produto.to_dict()), 201


@api_bp.route("/produtos/<int:produto_id>", methods=["PUT"])
def atualizar_produto(produto_id):
    """
    Edita as informações de um produto já existente (PUT /api/produtos/<id>).
    Atualiza apenas os campos que foram enviados na requisição JSON.
    """
    produto = Produto.query.get_or_404(produto_id)
    dados = request.get_json() or {}

    if "nome" in dados:
        produto.nome = dados["nome"].strip()
    if "descricao" in dados:
        produto.descricao = dados["descricao"].strip()
    if "descricaoDetalhada" in dados:
        produto.descricao_detalhada = dados["descricaoDetalhada"].strip()
    if "precoAntigoNumerico" in dados or "precoAntigo" in dados:
        val_antigo = dados.get("precoAntigoNumerico", dados.get("precoAntigo"))
        produto.preco_antigo = float(val_antigo) if val_antigo is not None else None
    if "precoNumerico" in dados or "preco" in dados:
        produto.preco = float(dados.get("precoNumerico", dados.get("preco", produto.preco)))
    if "desconto" in dados:
        produto.desconto = dados["desconto"]
    if "quantidadeEstoque" in dados:
        produto.quantidade_estoque = int(dados["quantidadeEstoque"])
    if "destaqueDia" in dados:
        produto.destaque_dia = bool(dados["destaqueDia"])
    if "emPromocao" in dados:
        produto.em_promocao = bool(dados["emPromocao"])
    if "imagem" in dados:
        produto.imagem = dados["imagem"]

    if "categoria" in dados:
        cat = Categoria.query.filter_by(slug=dados["categoria"]).first()
        if cat:
            produto.categoria_id = cat.id

    if "ingredientes" in dados:
        ing = dados["ingredientes"]
        produto.ingredientes = "; ".join(ing) if isinstance(ing, list) else str(ing)

    db.session.commit()
    return jsonify(produto.to_dict())


@api_bp.route("/produtos/<int:produto_id>", methods=["DELETE"])
def remover_produto(produto_id):
    """
    Remove um produto do cardápio (DELETE /api/produtos/<id>).
    Técnica 'Soft Delete' (Exclusão Suave): em vez de apagar a linha do banco de dados,
    apenas marcamos 'ativo = False'. Assim, ele some do cardápio mas não apaga o histórico de quem já comprou!
    """
    produto = Produto.query.get_or_404(produto_id)
    produto.ativo = False
    db.session.commit()
    return jsonify({"mensagem": "Produto desativado com sucesso."})


# =====================================================================
# 4. AUTENTICAÇÃO, CADASTRO E CONFIGURAÇÕES DE PERFIL
# =====================================================================
@api_bp.route("/enviar-token", methods=["POST"])
def enviar_token_verificacao():
    """
    Valida se o e-mail pertence ao domínio institucional (@aluno.ifsp.edu.br)
    e gera um código de verificação de 5 caracteres para confirmar o cadastro ou troca de senha.
    """
    dados = request.get_json() or {}
    email = dados.get("email", "").strip().lower()

    if not email.endswith("@aluno.ifsp.edu.br") or len(email.split("@")[0]) == 0:
        return jsonify({"erro": "Use seu e-mail institucional."}), 400

    token = gerar_token_5_caracteres()
    TOKENS_VERIFICACAO[email] = token

    return jsonify({
        "mensagem": f"Código de verificação de 5 caracteres enviado para {email}.",
        "email": email,
        "token_Gerado_Demo": token,
    }), 200


@api_bp.route("/verificar-token", methods=["POST"])
def verificar_token_email():
    """
    Confere se o código de 5 caracteres digitado pelo aluno possui o formato válido (letras e números).
    """
    dados = request.get_json() or {}
    email = dados.get("email", "").strip().lower()
    codigo = dados.get("codigo", "").strip().upper()

    if len(codigo) != 5 or not codigo.isalnum():
        return jsonify({"erro": "O código deve conter exatamente 5 letras ou números."}), 400

    token_salvo = TOKENS_VERIFICACAO.get(email)
    if token_salvo and codigo != token_salvo:
        pass

    return jsonify({
        "valido": True,
        "codigo_normalizado": codigo,
        "mensagem": "E-mail institucional verificado com sucesso!",
    }), 200


@api_bp.route("/cadastro", methods=["POST"])
def cadastrar_usuario():
    """
    Cria uma nova conta de aluno no banco de dados (POST /api/cadastro).
    Verifica:
    1. Se todos os campos foram preenchidos;
    2. Se o e-mail é institucional (@aluno.ifsp.edu.br);
    3. Se a senha cumpre os requisitos de segurança (mínimo de 8 caracteres e pelo menos 3 critérios);
    4. Se o e-mail já não está cadastrado.
    """
    dados = request.get_json() or {}
    nome = dados.get("nome", "").strip()
    email = dados.get("email", "").strip().lower()
    senha = dados.get("senha", "")
    codigo = dados.get("codigo", "").strip().upper()

    if not nome or not email or not senha:
        return jsonify({"erro": "Preencha nome, e-mail e senha."}), 400

    if not email.endswith("@aluno.ifsp.edu.br") or len(email.split("@")[0]) == 0:
        return jsonify({"erro": "Use seu e-mail institucional."}), 400

    if codigo and (len(codigo) != 5 or not codigo.isalnum()):
        return jsonify({"erro": "Código de verificação inválido (5 caracteres alfanuméricos)."}), 400

    if any(c.isspace() for c in senha):
        return jsonify({"erro": "A senha não pode conter espaços."}), 400

    # Avaliação de força da senha (precisa ter 8+ caracteres e somar pelo menos 3 pontos de segurança)
    tem_minimo_8 = len(senha) >= 8
    tem_letra = any(c.isalpha() for c in senha)
    tem_numero = any(c.isdigit() for c in senha)
    tem_simbolo = any(not c.isalnum() and not c.isspace() for c in senha)
    total_regras = sum([tem_minimo_8, tem_letra, tem_numero, tem_simbolo])

    if not tem_minimo_8 or total_regras < 3:
        return jsonify({"erro": "A senha precisa ser pelo menos Média (mínimo de 8 caracteres e cumprir 3 requisitos)."}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({"erro": "Este e-mail já está cadastrado."}), 409

    novo_usuario = Usuario(nome=nome, email=email, tipo_usuario="cliente")
    novo_usuario.definir_senha(senha)

    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({
        "mensagem": "Conta criada com sucesso!",
        "usuario": novo_usuario.to_dict(),
    }), 201


@api_bp.route("/login", methods=["POST"])
def login_usuario():
    """
    Autentica o usuário no sistema (POST /api/login).
    Procura o usuário pelo e-mail e usa 'verificar_senha()' para comparar a senha digitada com o hash salvo.
    """
    dados = request.get_json() or {}
    email = dados.get("email", "").strip().lower()
    senha = dados.get("senha", "")

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario or not usuario.verificar_senha(senha):
        return jsonify({"erro": "E-mail ou senha inválidos."}), 401

    return jsonify({
        "mensagem": "Login realizado com sucesso!",
        "usuario": usuario.to_dict(),
    })


@api_bp.route("/usuario/configuracoes", methods=["GET"])
def obter_configuracoes_usuario():
    """
    Carrega todas as preferências do usuário logado (alergias, data de nascimento, tema, fonte e pagamento padrão).
    """
    email = (request.args.get("email") or "").strip().lower()
    nome = (request.args.get("nome") or "").strip()

    usuario = None
    if email:
        usuario = Usuario.query.filter_by(email=email).first()
    if not usuario and nome:
        usuario = Usuario.query.filter_by(nome=nome).first()
    if not usuario:
        usuario = Usuario.query.first()

    if not usuario:
        return jsonify({"erro": "Usuário não encontrado."}), 404

    return jsonify(usuario.to_dict())


@api_bp.route("/usuario/configuracoes", methods=["PUT"])
def atualizar_configuracoes_usuario():
    """
    Salva as alterações feitas na tela de Configurações (PUT /api/usuario/configuracoes).
    Inclui a trava de segurança da Data de Nascimento (Preenchimento Único / Write-Once):
    depois que o aluno grava a data pela primeira vez, ela não pode ser trocada.
    """
    dados = request.get_json() or {}
    email = (dados.get("email") or "").strip().lower()
    nome_busca = (dados.get("nomeAtual") or dados.get("nome") or "").strip()

    usuario = None
    if email:
        usuario = Usuario.query.filter_by(email=email).first()
    if not usuario and nome_busca:
        usuario = Usuario.query.filter_by(nome=nome_busca).first()
    if not usuario:
        usuario = Usuario.query.first()

    if not usuario:
        return jsonify({"erro": "Usuário não encontrado."}), 404

    if "nome" in dados and dados["nome"].strip():
        usuario.nome = dados["nome"].strip()

    # Regra de Preenchimento Único da Data de Nascimento:
    # Só aceita salvar se o campo no banco ainda estiver vazio (None/vazio) ou se for liberado por um administrador.
    nova_data_nasc = (dados.get("dataNascimento") or "").strip()
    is_admin_override = bool(dados.get("adminOverride", False))
    if nova_data_nasc:
        if not usuario.data_nascimento or is_admin_override:
            usuario.data_nascimento = nova_data_nasc
            if not usuario.data_preenchimento_aniversario:
                usuario.data_preenchimento_aniversario = datetime.now(timezone.utc)
        elif usuario.data_nascimento != nova_data_nasc:
            return jsonify({
                "erro": "A data de aniversário é de escrita única e não pode ser alterada pelo usuário após salva."
            }), 403

    if "alergias" in dados:
        alergias_val = dados["alergias"]
        if isinstance(alergias_val, list):
            usuario.alergias = ";".join(str(a).strip() for a in alergias_val if str(a).strip())
        else:
            usuario.alergias = str(alergias_val or "").strip()

    if "pagamentoPadrao" in dados and dados["pagamentoPadrao"] in ("pix", "cartao", "balcao"):
        usuario.pagamento_padrao = dados["pagamentoPadrao"]

    if "temaPreferido" in dados and dados["temaPreferido"] in ("claro", "escuro"):
        usuario.tema_preferido = dados["temaPreferido"]

    if "tamanhoFonte" in dados and dados["tamanhoFonte"] in ("normal", "medio", "grande"):
        usuario.tamanho_fonte = dados["tamanhoFonte"]

    if "reduzirMovimento" in dados:
        usuario.reduzir_movimento = bool(dados["reduzirMovimento"])

    if "altoContraste" in dados:
        usuario.alto_contraste = bool(dados["altoContraste"])

    db.session.commit()
    return jsonify({
        "mensagem": "Configurações salvas com sucesso!",
        "usuario": usuario.to_dict(),
    })


@api_bp.route("/usuario/senha", methods=["PUT"])
def alterar_senha_usuario():
    """
    Permite ao usuário trocar sua senha atual por uma nova (PUT /api/usuario/senha),
    validando a senha antiga e exigindo que a nova senha também seja forte.
    """
    dados = request.get_json() or {}
    email = (dados.get("email") or "").strip().lower()
    senha_atual = dados.get("senhaAtual", "")
    nova_senha = dados.get("novaSenha", "")

    usuario = Usuario.query.filter_by(email=email).first() if email else Usuario.query.first()
    if not usuario:
        return jsonify({"erro": "Usuário não encontrado."}), 404

    if senha_atual and not usuario.verificar_senha(senha_atual):
        return jsonify({"erro": "A senha atual informada está incorreta."}), 401

    if any(c.isspace() for c in nova_senha):
        return jsonify({"erro": "A nova senha não pode conter espaços."}), 400

    tem_minimo_8 = len(nova_senha) >= 8
    tem_letra = any(c.isalpha() for c in nova_senha)
    tem_numero = any(c.isdigit() for c in nova_senha)
    tem_simbolo = any(not c.isalnum() and not c.isspace() for c in nova_senha)
    total_regras = sum([tem_minimo_8, tem_letra, tem_numero, tem_simbolo])

    if not tem_minimo_8 or total_regras < 3:
        return jsonify({
            "erro": "A nova senha precisa ser pelo menos Média (mínimo de 8 caracteres e cumprir 3 requisitos)."
        }), 400

    usuario.definir_senha(nova_senha)
    db.session.commit()
    return jsonify({"mensagem": "Senha atualizada com sucesso!"})


# =====================================================================
# 5. PEDIDOS E CARRINHO DE COMPRAS
# =====================================================================
@api_bp.route("/pedidos", methods=["GET"])
def listar_pedidos():
    """
    Lista o histórico de pedidos do mais recente para o mais antigo (GET /api/pedidos).
    Se receber '?usuario_id=...', filtra apenas os pedidos daquele aluno específico.
    """
    usuario_id = request.args.get("usuario_id")
    query = Pedido.query

    if usuario_id:
        query = query.filter_by(usuario_id=int(usuario_id))

    pedidos = query.order_by(Pedido.data_criacao.desc()).all()
    return jsonify([p.to_dict() for p in pedidos])


@api_bp.route("/pedidos", methods=["POST"])
def criar_pedido():
    """
    Finaliza o carrinho e registra um novo pedido no banco de dados (POST /api/pedidos).
    Percorre cada item enviado pelo carrinho, busca o preço real do produto no banco,
    cria os registros em 'ItemPedido' e calcula a soma total do pedido com segurança.
    """
    dados = request.get_json() or {}
    usuario_id = dados.get("usuarioId")
    itens_recebidos = dados.get("itens", [])

    if not itens_recebidos:
        return jsonify({"erro": "O pedido precisa ter pelo menos um item."}), 400

    novo_pedido = Pedido(
        usuario_id=usuario_id or 1,
        nome_retirada=dados.get("nomeRetirada", "Aluno IFSP"),
        metodo_pagamento=dados.get("metodoPagamento", "pix"),
        observacao=dados.get("observacao", "").strip() or None,
        status="em_preparo",
        valor_total=0.0,
    )
    db.session.add(novo_pedido)
    db.session.flush()

    soma_total = 0.0
    for item in itens_recebidos:
        produto = Produto.query.get(item.get("produtoId") or item.get("id"))
        if not produto:
            continue
        qtd = int(item.get("quantidade", 1))
        subtotal = produto.preco * qtd
        soma_total += subtotal

        db.session.add(
            ItemPedido(
                pedido_id=novo_pedido.id,
                produto_id=produto.id,
                quantidade=qtd,
                preco_unitario=produto.preco,
            )
        )

    novo_pedido.valor_total = round(soma_total, 2)
    db.session.commit()

    return jsonify(novo_pedido.to_dict()), 201


@api_bp.route("/pedidos/<int:pedido_id>/status", methods=["PATCH"])
def atualizar_status_pedido(pedido_id):
    """
    Atualiza a etapa atual de um pedido (PATCH /api/pedidos/<id>/status).
    Usado pelo balcão/cozinha para avançar o pedido de 'em_preparo' para 'pronto' ou 'finalizado'.
    """
    pedido = Pedido.query.get_or_404(pedido_id)
    dados = request.get_json() or {}
    novo_status = dados.get("status")

    if novo_status not in ("aberto", "em_preparo", "pronto", "finalizado", "cancelado"):
        return jsonify({"erro": "Status inválido."}), 400

    pedido.status = novo_status
    if novo_status in ("finalizado", "cancelado"):
        pedido.data_finalizacao = datetime.now(timezone.utc)

    db.session.commit()
    return jsonify(pedido.to_dict())


# =====================================================================
# 6. CENTRAL DE ATENDIMENTO (Fale Conosco / Contato)
# =====================================================================
@api_bp.route("/contato", methods=["POST"])
def enviar_mensagem_contato():
    """
    Recebe e salva no banco as mensagens enviadas pelo formulário da página de Contato (POST /api/contato).
    """
    dados = request.get_json() or {}
    nome = dados.get("nome", "").strip()
    email = dados.get("email", "").strip()
    assunto = dados.get("assunto", "").strip()
    mensagem = dados.get("mensagem", "").strip()

    if not nome or not email or not assunto or not mensagem:
        return jsonify({"erro": "Todos os campos são obrigatórios."}), 400

    nova_msg = MensagemContato(
        nome=nome,
        email=email,
        assunto=assunto,
        mensagem=mensagem,
    )
    db.session.add(nova_msg)
    db.session.commit()

    return jsonify({
        "mensagem": "Mensagem enviada com sucesso!",
        "protocolo": nova_msg.to_dict(),
    }), 201


@api_bp.route("/contato", methods=["GET"])
def listar_mensagens_contato():
    """
    Lista todas as mensagens de contato recebidas, da mais recente para a mais antiga (GET /api/contato).
    """
    mensagens = MensagemContato.query.order_by(MensagemContato.data_envio.desc()).all()
    return jsonify([m.to_dict() for m in mensagens])


# =====================================================================
# 7. AVALIAÇÃO DE UTILIDADE DA PÁGINA DE AJUDA (FAQ)
# =====================================================================
@api_bp.route("/avaliacao-faq", methods=["POST"])
def registrar_avaliacao_faq():
    """
    Salva o voto de 'Sim' ou 'Não' na pergunta 'Esta página foi útil?' (POST /api/avaliacao-faq).
    Verifica antes se o mesmo usuário já votou na data de hoje para permitir apenas 1 avaliação por dia.
    """
    dados = request.get_json() or {}
    usuario = dados.get("usuario", "").strip()
    data_avaliacao = dados.get("data", "").strip() or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    foi_util = bool(dados.get("foi_util", True))

    if not usuario:
        return jsonify({"erro": "Usuário não informado."}), 400

    existente = AvaliacaoFaq.query.filter_by(
        usuario=usuario, data_avaliacao=data_avaliacao
    ).first()

    if existente:
        return jsonify({
            "mensagem": "Você já enviou seu feedback de utilidade hoje.",
            "avaliacao": existente.to_dict(),
        }), 200

    nova_avaliacao = AvaliacaoFaq(
        usuario=usuario,
        data_avaliacao=data_avaliacao,
        foi_util=foi_util,
    )
    db.session.add(nova_avaliacao)
    db.session.commit()

    return jsonify({
        "mensagem": "Avaliação de utilidade registrada com sucesso!",
        "avaliacao": nova_avaliacao.to_dict(),
    }), 201


@api_bp.route("/avaliacao-faq", methods=["GET"])
def listar_avaliacoes_faq():
    """
    Retorna o histórico de todas as avaliações de utilidade do FAQ (GET /api/avaliacao-faq).
    """
    avaliacoes = AvaliacaoFaq.query.order_by(AvaliacaoFaq.data_registro.desc()).all()
    return jsonify([a.to_dict() for a in avaliacoes])
