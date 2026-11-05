"""
MODELOS DO BANCO DE DADOS (models.py)
-------------------------------------
Aqui definimos as tabelas do nosso banco de dados usando SQLAlchemy (ORM).
Em vez de escrever comandos SQL puros (como CREATE TABLE ou SELECT), criamos
classes em Python: cada classe vira uma tabela e cada atributo vira uma coluna.
"""

from datetime import datetime, timezone
from typing import Any, List
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# Instância global do banco de dados (será conectada ao Flask lá no app.py)
db = SQLAlchemy()


def agora_utc():
    """
    Retorna a data e a hora exatas deste momento no fuso horário universal (UTC).
    Usada como valor automático (default) quando um registro é criado no banco.
    """
    return datetime.now(timezone.utc)


def formatar_moeda_br(valor):
    """
    Transforma um número comum do Python (ex: 6.5) em texto formatado em Reais (ex: 'R$ 6,50').
    Isso facilita para o React exibir os preços diretamente na tela sem precisar formatar toda vez.
    """
    return f"R$ {float(valor):.2f}".replace(".", ",")


class BaseModel(db.Model):
    """
    Classe base de apoio que todas as nossas tabelas herdam.
    Ela não cria uma tabela própria (__abstract__ = True), mas serve para que o VS Code
    entenda os parâmetros passados ao criar registros (ex: Usuario(nome="...", email="...")).
    """

    __abstract__ = True
    __allow_unmapped__ = True

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)


# =====================================================================
# TABELA 1: Usuario ("usuarios")
# Guarda os dados de quem usa o sistema (alunos/clientes, vendedores e admins),
# além das configurações pessoais de alergia, aniversário e acessibilidade.
# =====================================================================
class Usuario(BaseModel):
    __tablename__ = "usuarios"

    # Dados básicos da conta
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    senha_hash = db.Column(db.String(500), nullable=False)
    tipo_usuario = db.Column(db.String(20), nullable=False, default="cliente")
    data_cadastro = db.Column(db.DateTime, nullable=False, default=agora_utc)

    # Controle da Data de Nascimento (Preenchimento Único):
    # Salva a data ('YYYY-MM-DD') e o dia em que foi preenchida para evitar fraudes em promoções de aniversário
    data_nascimento = db.Column(db.String(10), nullable=True)
    data_preenchimento_aniversario = db.Column(db.DateTime, nullable=True)
    ultimo_resgate_aniversario = db.Column(db.DateTime, nullable=True)

    # Preferências de saúde e pagamento:
    # As alergias são salvas como um texto único separado por ';' (ex: "lactose;gluten")
    alergias = db.Column(db.Text, nullable=True, default="")
    pagamento_padrao = db.Column(db.String(20), nullable=False, default="pix")

    # Preferências visuais e de acessibilidade salvas no perfil do usuário
    tema_preferido = db.Column(db.String(15), nullable=False, default="claro")
    tamanho_fonte = db.Column(db.String(15), nullable=False, default="normal")
    reduzir_movimento = db.Column(db.Boolean, nullable=False, default=False)
    alto_contraste = db.Column(db.Boolean, nullable=False, default=False)

    # Relacionamento 1-para-Muitos: um usuário pode ter vários pedidos registrados
    pedidos: List["Pedido"] = db.relationship(
        "Pedido", back_populates="usuario", lazy=True
    )

    def definir_senha(self, senha_plana: str) -> None:
        """
        Recebe a senha digitada pelo usuário e a transforma em um código embaralhado (hash).
        Assim, nunca salvamos a senha real em texto puro no banco por questão de segurança.
        """
        self.senha_hash = generate_password_hash(senha_plana)

    def verificar_senha(self, senha_plana: str) -> bool:
        """
        Compara a senha digitada na tela de Login com o hash salvo no banco.
        Retorna True se a senha estiver correta, ou False se estiver errada.
        """
        return check_password_hash(self.senha_hash, senha_plana)

    def to_dict(self):
        """
        Converte o objeto Usuario do banco para um dicionário Python (que vira JSON para o React).
        Repare que não incluímos 'senha_hash' aqui para nunca expor a senha na internet,
        e já transformamos o texto de alergias ("gluten;lactose") em uma lista (["gluten", "lactose"]).
        """
        lista_alergias = (
            [item.strip() for item in self.alergias.split(";") if item.strip()]
            if self.alergias
            else []
        )
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "tipo_usuario": self.tipo_usuario,
            "dataCadastro": self.data_cadastro.strftime("%Y-%m-%d") if self.data_cadastro else None,
            "dataNascimento": self.data_nascimento,
            "dataPreenchimentoAniversario": (
                self.data_preenchimento_aniversario.strftime("%Y-%m-%d")
                if self.data_preenchimento_aniversario
                else None
            ),
            "ultimoResgateAniversario": (
                self.ultimo_resgate_aniversario.strftime("%Y-%m-%d")
                if self.ultimo_resgate_aniversario
                else None
            ),
            "alergias": lista_alergias,
            "pagamentoPadrao": self.pagamento_padrao or "pix",
            "temaPreferido": self.tema_preferido or "claro",
            "tamanhoFonte": self.tamanho_fonte or "normal",
            "reduzirMovimento": bool(self.reduzir_movimento),
            "altoContraste": bool(self.alto_contraste),
        }


# =====================================================================
# TABELA 2: Categoria ("categorias")
# Organiza os produtos do cardápio em abas (Salgados, Doces, Bebidas, Pratos).
# =====================================================================
class Categoria(BaseModel):
    __tablename__ = "categorias"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    slug = db.Column(db.String(45), nullable=False, unique=True)  # Código curto usado nos filtros (ex: 'salgado')
    nome = db.Column(db.String(60), nullable=False)               # Nome no botão de filtro (ex: 'Salgados')
    titulo_secao = db.Column(db.String(80), nullable=False)       # Título grande da seção (ex: 'Doces & Sobremesas')

    # Relacionamento 1-para-Muitos: uma categoria agrupa vários produtos
    produtos: List["Produto"] = db.relationship(
        "Produto", back_populates="categoria_rel", lazy=True
    )

    def to_dict(self):
        """Transforma a categoria em dicionário para montar os botões de filtro no Frontend."""
        return {
            "id": self.slug,
            "id_banco": self.id,
            "nome": self.nome,
            "tituloSecao": self.titulo_secao,
        }


# =====================================================================
# TABELA 3: Produto ("produtos")
# Guarda cada item vendido na cantina (preço, ingredientes, fotos e promoções).
# =====================================================================
class Produto(BaseModel):
    __tablename__ = "produtos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey("categorias.id"), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.String(255), nullable=False)          # Resumo curto que aparece no card
    descricao_detalhada = db.Column(db.Text, nullable=True)        # Explicação completa que abre no modal
    ingredientes = db.Column(db.Text, nullable=True)               # Lista de ingredientes separados por ';'
    imagem = db.Column(db.String(500), nullable=False)             # Foto de capa do produto
    preco_antigo = db.Column(db.Float, nullable=True)              # Preço riscado quando está em promoção
    preco = db.Column(db.Float, nullable=False)                    # Preço real cobrado na venda
    desconto = db.Column(db.String(20), nullable=True)             # Etiqueta visual do desconto (ex: '-20%')
    quantidade_estoque = db.Column(db.Integer, nullable=False, default=50)
    destaque_dia = db.Column(db.Boolean, nullable=False, default=True)   # Define se aparece na vitrine da página Início
    em_promocao = db.Column(db.Boolean, nullable=False, default=False)   # Define se aparece na área de Promoções
    ativo = db.Column(db.Boolean, nullable=False, default=True)          # Se False, o produto fica oculto sem quebrar pedidos antigos

    # Conexão com a tabela Categoria e com a galeria de fotos extras do produto
    categoria_rel: "Categoria" = db.relationship("Categoria", back_populates="produtos")
    imagens_galeria: List["ImagemProduto"] = db.relationship(
        "ImagemProduto",
        back_populates="produto",
        cascade="all, delete-orphan",
        order_by="ImagemProduto.ordem",
    )

    def obter_desconto_formatado(self):
        """
        Retorna o texto do selo de desconto (ex: '-20%').
        Se o produto estiver em promoção e não tiver um selo manual cadastrado,
        calcula automaticamente a porcentagem comparando o preço antigo com o preço novo.
        """
        if not self.em_promocao:
            return None
        if self.desconto:
            return self.desconto
        if self.preco_antigo and self.preco and self.preco_antigo > self.preco:
            pct = round(((float(self.preco_antigo) - float(self.preco)) / float(self.preco_antigo)) * 100)
            return f"-{pct}%"
        return None

    def to_dict(self):
        """
        Prepara todos os dados do produto para o React.
        Transforma os ingredientes em uma lista, reúne as fotos do carrossel
        e envia os preços tanto formatados ('R$ 6,00') quanto numéricos (6.0) para contas no carrinho.
        """
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

        tem_preco_antigo = bool(self.em_promocao and self.preco_antigo is not None)

        return {
            "id": self.id,
            "nome": self.nome,
            "alt": self.nome,
            "descricao": self.descricao,
            "descricaoDetalhada": self.descricao_detalhada or self.descricao,
            "ingredientes": lista_ingredientes,
            "precoAntigo": formatar_moeda_br(self.preco_antigo) if tem_preco_antigo else None,
            "precoAntigoNumerico": round(float(self.preco_antigo), 2) if tem_preco_antigo else None,
            "preco": formatar_moeda_br(self.preco),
            "precoNumerico": round(float(self.preco), 2),
            "desconto": self.obter_desconto_formatado(),
            "categoria": self.categoria_rel.slug if self.categoria_rel else "salgado",
            "imagem": self.imagem,
            "imagens": lista_imagens,
            "quantidadeEstoque": self.quantidade_estoque,
            "destaqueDia": self.destaque_dia,
            "emPromocao": self.em_promocao,
            "ativo": self.ativo,
        }


# =====================================================================
# TABELA 4: ImagemProduto ("imagens_produto")
# Guarda as fotos extras de cada produto para o carrossel do modal de detalhes.
# =====================================================================
class ImagemProduto(BaseModel):
    __tablename__ = "imagens_produto"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    produto_id = db.Column(db.Integer, db.ForeignKey("produtos.id"), nullable=False)
    url_imagem = db.Column(db.String(500), nullable=False)
    ordem = db.Column(db.Integer, nullable=False, default=1)  # Define a sequência das fotos (1ª, 2ª, 3ª...)

    produto: "Produto" = db.relationship("Produto", back_populates="imagens_galeria")


# =====================================================================
# TABELA 5: Pedido ("pedidos")
# Representa uma compra feita por um aluno, com status, forma de pagamento e valor total.
# =====================================================================
class Pedido(BaseModel):
    __tablename__ = "pedidos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    nome_retirada = db.Column(db.String(100), nullable=True)     # Nome que o atendente chama no balcão
    metodo_pagamento = db.Column(db.String(20), nullable=True)   # 'pix', 'cartao' ou 'balcao'
    observacao = db.Column(db.Text, nullable=True)               # Ex: "Sem cebola", "Coca bem gelada"
    status = db.Column(db.String(30), nullable=False, default="em_preparo")
    valor_total = db.Column(db.Float, nullable=False, default=0.0)
    data_criacao = db.Column(db.DateTime, nullable=False, default=agora_utc)
    data_finalizacao = db.Column(db.DateTime, nullable=True)

    # Relacionamentos: conecta o pedido ao dono (Usuario) e à lista de produtos comprados (ItemPedido)
    usuario: "Usuario" = db.relationship("Usuario", back_populates="pedidos")
    itens: List["ItemPedido"] = db.relationship(
        "ItemPedido", back_populates="pedido", cascade="all, delete-orphan"
    )

    def to_dict(self):
        """
        Formata o pedido para a tela 'Meus Pedidos'.
        Traduz o código interno do status (ex: 'em_preparo') para um texto amigável ('Em Preparo')
        e já indica qual classe CSS de cor o React deve usar na etiqueta de status.
        """
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
            "observacao": self.observacao or "",
            "data": self.data_criacao.strftime("%d/%m/%Y às %H:%M"),
            "statusCodigo": self.status,
            "status": rotulo_status,
            "classeStatus": classe_status,
            "itens": [f"{item.quantidade}x {item.produto.nome}" for item in self.itens if item.produto],
            "itensDetalhados": [item.to_dict() for item in self.itens],
            "total": formatar_moeda_br(self.valor_total),
            "totalNumerico": round(float(self.valor_total), 2),
        }


# =====================================================================
# TABELA 6: ItemPedido ("itens_pedido")
# Tabela intermediária que guarda cada produto dentro de um pedido e sua quantidade.
# =====================================================================
class ItemPedido(BaseModel):
    __tablename__ = "itens_pedido"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey("pedidos.id"), nullable=False)
    produto_id = db.Column(db.Integer, db.ForeignKey("produtos.id"), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False, default=1)
    # Detalhe importante: salvamos o 'preco_unitario' no momento da compra.
    # Assim, se o preço da coxinha subir amanhã, o histórico de pedidos antigos não muda de valor!
    preco_unitario = db.Column(db.Float, nullable=False)

    pedido: "Pedido" = db.relationship("Pedido", back_populates="itens")
    produto: "Produto" = db.relationship("Produto")

    def to_dict(self):
        """Retorna os dados detalhados do item comprado para exibir no modal de recibo do pedido."""
        return {
            "id": self.id,
            "produtoId": self.produto_id,
            "nome": self.produto.nome if self.produto else "Produto",
            "imagem": self.produto.imagem if self.produto else "",
            "quantidade": self.quantidade,
            "preco": formatar_moeda_br(self.preco_unitario),
            "precoNumerico": round(float(self.preco_unitario), 2),
        }


# =====================================================================
# TABELA 7: MensagemContato ("mensagens_contato")
# Armazena dúvidas, sugestões ou problemas enviados na página de Contato.
# =====================================================================
class MensagemContato(BaseModel):
    __tablename__ = "mensagens_contato"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    assunto = db.Column(db.String(45), nullable=False)
    mensagem = db.Column(db.Text, nullable=False)
    lida = db.Column(db.Boolean, nullable=False, default=False)
    data_envio = db.Column(db.DateTime, nullable=False, default=agora_utc)

    def to_dict(self):
        """Converte a mensagem de contato para JSON."""
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "assunto": self.assunto,
            "mensagem": self.mensagem,
            "lida": self.lida,
            "dataEnvio": self.data_envio.strftime("%d/%m/%Y às %H:%M"),
        }


# =====================================================================
# TABELA 8: AvaliacaoFaq ("avaliacoes_faq")
# Registra se a página de Ajuda/FAQ foi útil ("Sim" ou "Não"), limitando a 1 voto por dia por usuário.
# =====================================================================
class AvaliacaoFaq(BaseModel):
    __tablename__ = "avaliacoes_faq"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario = db.Column(db.String(100), nullable=False)
    data_avaliacao = db.Column(db.String(10), nullable=False)  # Data no formato 'YYYY-MM-DD'
    foi_util = db.Column(db.Boolean, nullable=False)            # True = "Sim, ajudou", False = "Não"
    data_registro = db.Column(db.DateTime, nullable=False, default=agora_utc)

    def to_dict(self):
        """Converte o registro de avaliação do FAQ para JSON."""
        return {
            "id": self.id,
            "usuario": self.usuario,
            "dataAvaliacao": self.data_avaliacao,
            "foiUtil": self.foi_util,
            "dataRegistro": self.data_registro.strftime("%d/%m/%Y às %H:%M"),
        }
