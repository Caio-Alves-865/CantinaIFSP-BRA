from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


def formatar_moeda_br(valor):
    """Formata um número decimal/float para o padrão do protótipo (ex: 'R$ 6,50')."""
    return f"R$ {float(valor):.2f}".replace(".", ",")


# =====================================================
# 1. MODELO: Usuario (Cliente, Vendedor e Admin)
# =====================================================
class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    senha_hash = db.Column(db.String(500), nullable=False)
    # Perfis: 'cliente' (aluno), 'vendedor' (balcão/cozinha), 'admin' (gerência)
    tipo_usuario = db.Column(db.String(20), nullable=False, default="cliente")
    data_cadastro = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    pedidos = db.relationship("Pedido", back_populates="usuario", lazy=True)

    def definir_senha(self, senha_plana):
        self.senha_hash = generate_password_hash(senha_plana)

    def verificar_senha(self, senha_plana):
        return check_password_hash(self.senha_hash, senha_plana)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "tipo_usuario": self.tipo_usuario,
        }


# =====================================================
# 2. MODELO: Categoria
# Alinhado com os filtros do protótipo ('salgado', 'doce', 'bebida', 'prato')
# =====================================================
class Categoria(db.Model):
    __tablename__ = "categorias"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    slug = db.Column(db.String(45), nullable=False, unique=True)  # Ex: 'salgado'
    nome = db.Column(db.String(60), nullable=False)               # Ex: 'Salgados'
    titulo_secao = db.Column(db.String(80), nullable=False)       # Ex: 'Doces & Sobremesas'

    produtos = db.relationship("Produto", back_populates="categoria_rel", lazy=True)

    def to_dict(self):
        return {
            "id": self.slug,
            "id_banco": self.id,
            "nome": self.nome,
            "tituloSecao": self.titulo_secao,
        }


# =====================================================
# 3. MODELO: Produto
# Alinhado com ProductCard.jsx e ProductModal.jsx
# =====================================================
class Produto(db.Model):
    __tablename__ = "produtos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey("categorias.id"), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.String(255), nullable=False)          # Descrição curta do card
    descricao_detalhada = db.Column(db.Text, nullable=True)        # Texto completo do modal
    ingredientes = db.Column(db.Text, nullable=True)               # Separados por ';' no banco
    imagem = db.Column(db.String(500), nullable=False)             # Foto principal do card
    preco = db.Column(db.Float, nullable=False)
    quantidade_estoque = db.Column(db.Integer, nullable=False, default=50)
    destaque_dia = db.Column(db.Boolean, nullable=False, default=True)   # Prateleira da Home
    em_promocao = db.Column(db.Boolean, nullable=False, default=False)   # Carrossel Lateral
    ativo = db.Column(db.Boolean, nullable=False, default=True)

    categoria_rel = db.relationship("Categoria", back_populates="produtos")
    imagens_galeria = db.relationship(
        "ImagemProduto",
        back_populates="produto",
        cascade="all, delete-orphan",
        order_by="ImagemProduto.ordem",
    )

    def to_dict(self):
        lista_ingredientes = (
            [item.strip() for item in self.ingredientes.split(";") if item.strip()]
            if self.ingredientes
            else []
        )
        lista_imagens = (
            [img.url_imagem for img in self.imagens_galeria]
            if self.imagens_galeria
            else [self.imagem]
        )

        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "descricaoDetalhada": self.descricao_detalhada or self.descricao,
            "ingredientes": lista_ingredientes,
            "preco": formatar_moeda_br(self.preco),
            "precoNumerico": round(float(self.preco), 2),
            "categoria": self.categoria_rel.slug if self.categoria_rel else "salgado",
            "imagem": self.imagem,
            "imagens": lista_imagens,
            "quantidadeEstoque": self.quantidade_estoque,
            "destaqueDia": self.destaque_dia,
            "emPromocao": self.em_promocao,
            "ativo": self.ativo,
        }


# =====================================================
# 4. MODELO: ImagemProduto
# Galeria de fotos exibida no carrossel dentro do ProductModal.jsx
# =====================================================
class ImagemProduto(db.Model):
    __tablename__ = "imagens_produto"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    produto_id = db.Column(db.Integer, db.ForeignKey("produtos.id"), nullable=False)
    url_imagem = db.Column(db.String(500), nullable=False)
    ordem = db.Column(db.Integer, nullable=False, default=1)

    produto = db.relationship("Produto", back_populates="imagens_galeria")


# =====================================================
# 5. MODELO: Pedido (Carrinho e Histórico de Compras)
# Alinhado com Pedidos.jsx e CheckoutModal.jsx
# =====================================================
class Pedido(db.Model):
    __tablename__ = "pedidos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    nome_retirada = db.Column(db.String(100), nullable=True)
    # Métodos do CheckoutModal: 'pix', 'cartao', 'balcao'
    metodo_pagamento = db.Column(db.String(20), nullable=True)
    # Status: 'aberto', 'em_preparo', 'pronto', 'finalizado', 'cancelado'
    status = db.Column(db.String(30), nullable=False, default="em_preparo")
    valor_total = db.Column(db.Float, nullable=False, default=0.0)
    data_criacao = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    data_finalizacao = db.Column(db.DateTime, nullable=True)

    usuario = db.relationship("Usuario", back_populates="pedidos")
    itens = db.relationship(
        "ItemPedido", back_populates="pedido", cascade="all, delete-orphan"
    )

    def to_dict(self):
        mapa_status = {
            "aberto": ("Carrinho Aberto", "status-entregue"),
            "em_preparo": ("Em Preparo", "status-pronto"),
            "pronto": ("Pronto para Retirada", "status-pronto"),
            "finalizado": ("Finalizado", "status-entregue"),
            "cancelado": ("Cancelado", "status-entregue"),
        }
        rotulo_status, classe_status = mapa_status.get(
            self.status, ("Em Preparo", "status-pronto")
        )

        return {
            "id": str(self.id),
            "numero": f"Pedido #{self.id}",
            "nomeRetirada": self.nome_retirada or (self.usuario.nome if self.usuario else ""),
            "metodoPagamento": self.metodo_pagamento,
            "data": self.data_criacao.strftime("%d/%m/%Y às %H:%M"),
            "statusCodigo": self.status,
            "status": rotulo_status,
            "classeStatus": classe_status,
            "itens": [f"{item.quantidade}x {item.produto.nome}" for item in self.itens if item.produto],
            "itensDetalhados": [item.to_dict() for item in self.itens],
            "total": formatar_moeda_br(self.valor_total),
            "totalNumerico": round(float(self.valor_total), 2),
        }


# =====================================================
# 6. MODELO: ItemPedido
# Itens dentro de cada pedido com o preço congelado no momento da compra
# =====================================================
class ItemPedido(db.Model):
    __tablename__ = "itens_pedido"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey("pedidos.id"), nullable=False)
    produto_id = db.Column(db.Integer, db.ForeignKey("produtos.id"), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False, default=1)
    preco_unitario = db.Column(db.Float, nullable=False)

    pedido = db.relationship("Pedido", back_populates="itens")
    produto = db.relationship("Produto")

    def to_dict(self):
        return {
            "id": self.id,
            "produtoId": self.produto_id,
            "nome": self.produto.nome if self.produto else "Produto",
            "imagem": self.produto.imagem if self.produto else "",
            "quantidade": self.quantidade,
            "preco": formatar_moeda_br(self.preco_unitario),
            "precoNumerico": round(float(self.preco_unitario), 2),
        }


# =====================================================
# 7. MODELO: MensagemContato
# Alinhado com o formulário da página Contato.jsx
# =====================================================
class MensagemContato(db.Model):
    __tablename__ = "mensagens_contato"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    assunto = db.Column(db.String(45), nullable=False)  # 'duvida', 'sugestao', 'problema', 'outro'
    mensagem = db.Column(db.Text, nullable=False)
    lida = db.Column(db.Boolean, nullable=False, default=False)
    data_envio = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "assunto": self.assunto,
            "mensagem": self.mensagem,
            "lida": self.lida,
            "dataEnvio": self.data_envio.strftime("%d/%m/%Y às %H:%M"),
        }
