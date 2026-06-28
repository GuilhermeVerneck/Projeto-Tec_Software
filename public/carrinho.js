document.addEventListener('DOMContentLoaded', () => {
    const listaItensCarrinho = document.getElementById('lista-itens-carrinho');
    const totalCarrinho = document.getElementById('total-carrinho');
    const conteudoCarrinho = document.getElementById('conteudo-carrinho');
    const carrinhoVazio = document.getElementById('carrinho-vazio');

    const btnFinalizar = document.getElementById('btn-finalizar');
    const modalSucesso = document.getElementById('modal-sucesso');
    const btnModalFechar = document.getElementById('btn-modal-fechar');

    renderizarCarrinho();

    function atualizarBadgeCarrinho(totalItens) {
        const cartContador = document.getElementById('cart-contador');
        if (cartContador) {
            cartContador.textContent = totalItens;
        }
        localStorage.setItem('totalCarrinho', totalItens);
    }

    async function renderizarCarrinho() {
        try {
            const resposta = await fetch('/api/carrinho/itens');
            const itens = await resposta.json();

            // Total de unidades no carrinho (soma das quantidades), usado no badge do header
            const totalItens = itens.reduce((acc, item) => acc + (item.quantidade || 1), 0);
            atualizarBadgeCarrinho(totalItens);

            if (itens.length === 0) {
                conteudoCarrinho.classList.add('escondido');
                carrinhoVazio.classList.remove('escondido');
                totalCarrinho.textContent = 'R$ 0,00';
                return;
            }

            conteudoCarrinho.classList.remove('escondido');
            carrinhoVazio.classList.add('escondido');

            listaItensCarrinho.innerHTML = '';
            let valorTotal = 0;

            itens.forEach(item => {
                const quantidade = item.quantidade || 1;
                const subtotal = item.preco * quantidade;

                const divItem = document.createElement('div');
                divItem.className = 'item-carrinho';
                divItem.innerHTML = `
                    <div class="item-carrinho-principal">
                        <img
                            class="capa-item-carrinho"
                            src="${item.capa}"
                            alt="${item.nome}"
                        >
                        <div class="item-carrinho-info">
                            <h4>${item.nome}</h4>
                            <p class="artista">${item.artista}</p>
                        </div>
                    </div>

                    <div class="item-carrinho-controles">
                        <div class="controle-quantidade" data-disco-id="${item.discoId}">
                            <button
                                class="btn-qtd btn-diminuir"
                                aria-label="Diminuir quantidade"
                            >−</button>
                            <span class="quantidade-valor">${quantidade}</span>
                            <button class="btn-qtd btn-aumentar" aria-label="Aumentar quantidade">+</button>
                        </div>
                        <div class="preco">R$ ${subtotal.toFixed(2)}</div>
                    </div>
                `;
                listaItensCarrinho.appendChild(divItem);
                valorTotal += subtotal;
            });

            totalCarrinho.textContent = `R$ ${valorTotal.toFixed(2)}`;

        } catch (erro) {
            console.error('Erro ao renderizar o carrinho:', erro);
        }
    }

    listaItensCarrinho.addEventListener('click', (evento) => {
        const botao = evento.target.closest('.btn-qtd');
        if (!botao || botao.disabled) return;

        const controle = botao.closest('.controle-quantidade');
        const discoId = controle.dataset.discoId;
        const valorAtual = parseInt(controle.querySelector('.quantidade-valor').textContent, 10);

        const novaQuantidade = botao.classList.contains('btn-aumentar')
            ? valorAtual + 1
            : valorAtual - 1;

        if (novaQuantidade < 0) return;

        atualizarQuantidade(discoId, novaQuantidade);

    });

    async function atualizarQuantidade(discoId, quantidade) {
        try {
            await fetch('/api/carrinho/atualizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discoId, quantidade })
            });

            // renderizarCarrinho() busca o carrinho atualizado e já recalcula
            // o badge do header a partir da lista real de itens
            renderizarCarrinho();
        } catch (erro) {
            console.error('Erro ao atualizar quantidade:', erro);
        }

    }

    btnFinalizar.addEventListener('click', async () => {
        try {
            const resposta = await fetch('/api/carrinho/finalizar', { method: 'POST' });
            const resultado = await resposta.json();

            if (resultado.success) {
                modalSucesso.classList.remove('escondido');
            }
        } catch (erro) {
            console.error('Erro ao finalizar compra:', erro);
        }
    });

    btnModalFechar.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});