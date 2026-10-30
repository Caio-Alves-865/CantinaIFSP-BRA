from datetime import datetime
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
)

api_bp = Blueprint("api", __name__, url_prefix="/api")


# =====================================================
# 1. STATUS DA API
# =====================================================
@api_bp.route("/status", methods=["GET"])
def status_api():
    return jsonify({
        "status": "online",
        "projeto": "Cantina Serra e Soares - IFSP",
        "banco": "SQLite + SQLAlchemy ORM",
    })


# =====================================================
# 2. CATEGORIAS
# =====================================================
@api_bp.route("/categorias", methods=["GET"])
def listar_categorias():
    categorias = Categoria.query.order_by(Categoria.id).all()
    lista = [{"id": "todos", "nome": "Todos"}] + [c.to_dict() for c in categorias]
    return jsonify(lista)


# =====================================================
# 3. PRODUTOS (Cardápio, Destaques, Promoções e CRUD Admin)
# =====================================================
@api_bp.route("/produtos", methods=["GET"])
def listar_produtos():
    query = Produto.query.filter_by(ativo=True)

    destaque = request.args.get("destaque")
    promocao = request.args.get("promocao")
    categoria_slug = request.args.get("categoria")

    if destaque is not None:
        query = query.filter_by(destaque_dia=(destaque.lower() == "true"))

    if promocao is not None:
        query = query.filter_by(em_promocao=(promocao.lower() == "true"))

    if categoria_slug and categoria_slug != "todos":
        categoria = Categoria.query.filter_by(slug=categoria_slug).first()
        if categoria:
            query = query.filter_by(categoria_id=categoria.id)

    produtos = query.order_by(Produto.id).all()
    return jsonify([p.to_dict() for p in produtos])


@api_bp.route("/produtos/<int:produto_id>", methods=["GET"])
def obter_produto(produto_id):
    produto = Produto.query.get_or_404(produto_id)
    return jsonify(produto.to_dict())


@api_bp.route("/produtos", methods=["POST"])
def criar_produto():
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

    novo_produto = Produto(
        categoria_id=categoria.id,
        nome=dados.get("nome", "").strip(),
        descricao=dados.get("descricao", "").strip(),
        descricao_detalhada=dados.get("descricaoDetalhada", "").strip(),
        ingredientes=ingredientes_str,
        imagem=dados.get("imagem", "/img/produtos/salgados/coxinha.jpg"),
        preco=float(dados.get("precoNumerico", dados.get("preco", 0.0))),
        quantidade_estoque=int(dados.get("quantidadeEstoque", 50)),
        destaque_dia=bool(dados.get("destaqueDia", True)),
        em_promocao=bool(dados.get("emPromocao", False)),
        ativo=True,
    )
    db.session.add(novo_produto)
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
    produto = Produto.query.get_or_404(produto_id)
    dados = request.get_json() or {}

    if "nome" in dados:
        produto.nome = dados["nome"].strip()
    if "descricao" in dados:
        produto.descricao = dados["descricao"].strip()
    if "descricaoDetalhada" in dados:
        produto.descricao_detalhada = dados["descricaoDetalhada"].strip()
    if "precoNumerico" in dados or "preco" in dados:
        produto.preco = float(dados.get("precoNumerico", dados.get("preco", produto.preco)))
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
    produto = Produto.query.get_or_404(produto_id)
    produto.ativo = False
    db.session.commit()
    return jsonify({"mensagem": "Produto desativado com sucesso."})


# =====================================================
# 4. AUTENTICAÇÃO E USUÁRIOS (Login / Cadastro)
# =====================================================
@api_bp.route("/cadastro", methods=["POST"])
def cadastrar_usuario():
    dados = request.get_json() or {}
    nome = dados.get("nome", "").strip()
    email = dados.get("email", "").strip().lower()
    senha = dados.get("senha", "")

    if not nome or not email or not senha:
        return jsonify({"erro": "Preencha nome, e-mail e senha."}), 400

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


# =====================================================
# 5. PEDIDOS (Cliente e Tela do Vendedor)
# =====================================================
@api_bp.route("/pedidos", methods=["GET"])
def listar_pedidos():
    usuario_id = request.args.get("usuario_id")
    query = Pedido.query

    if usuario_id:
        query = query.filter_by(usuario_id=int(usuario_id))

    pedidos = query.order_by(Pedido.data_criacao.desc()).all()
    return jsonify([p.to_dict() for p in pedidos])


@api_bp.route("/pedidos", methods=["POST"])
def criar_pedido():
    dados = request.get_json() or {}
    usuario_id = dados.get("usuarioId")
    itens_recebidos = dados.get("itens", [])

    if not itens_recebidos:
        return jsonify({"erro": "O pedido precisa ter pelo menos um item."}), 400

    novo_pedido = Pedido(
        usuario_id=usuario_id or 1,
        nome_retirada=dados.get("nomeRetirada", "Aluno IFSP"),
        metodo_pagamento=dados.get("metodoPagamento", "pix"),
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
    pedido = Pedido.query.get_or_404(pedido_id)
    dados = request.get_json() or {}
    novo_status = dados.get("status")

    if novo_status not in ("aberto", "em_preparo", "pronto", "finalizado", "cancelado"):
        return jsonify({"erro": "Status inválido."}), 400

    pedido.status = novo_status
    if novo_status in ("finalizado", "cancelado"):
        pedido.data_finalizacao = datetime.utcnow()

    db.session.commit()
    return jsonify(pedido.to_dict())


# =====================================================
# 6. MENSAGENS DE CONTATO (Fale Conosco)
# =====================================================
@api_bp.route("/contato", methods=["POST"])
def enviar_mensagem_contato():
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
    mensagens = MensagemContato.query.order_by(MensagemContato.data_envio.desc()).all()
    return jsonify([m.to_dict() for m in mensagens])
