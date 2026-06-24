document.addEventListener('DOMContentLoaded', () => {
    const listaItensCarrinho = document.getElementById('lista-itens-carrinho');
    const totalCarrinho = document.getElementById('total-carrinho');
    const conteudoCarrinho = document.getElementById('conteudo-carrinho');
    const carrinhoVazio = document.getElementById('carrinho-vazio');
    
    const btnFinalizar = document.getElementById('btn-finalizar');
    const modalSucesso = document.getElementById('modal-sucesso');
    const btnModalFechar = document.getElementById('btn-modal-fechar');

    renderizarCarrinho();

    async function renderizarCarrinho() {
        try {
            const resposta = await fetch('/api/carrinho/itens');
            const itens = await resposta.json();

            if (itens.length === 0) {
                conteudoCarrinho.classList.add('escondido');
                carrinhoVazio.classList.remove('escondido');
                return;
            }

            conteudoCarrinho.classList.remove('escondido');
            carrinhoVazio.classList.add('escondido');

            listaItensCarrinho.innerHTML = '';
            let valorTotal = 0;

            itens.forEach(item => {
                const divItem = document.createElement('div');
                divItem.className = 'item-carrinho';
                divItem.innerHTML = `
                    <div class="item-carrinho-info">
                        <h4>${item.nome}</h4>
                        <p class="artista">${item.artista}</p>
                    </div>
                    <div class="preco">R$ ${item.preco.toFixed(2)}</div>
                `;
                listaItensCarrinho.appendChild(divItem);
                valorTotal += item.preco;
            });

            totalCarrinho.textContent = `R$ ${valorTotal.toFixed(2)}`;

        } catch (erro) {
            console.error('Erro ao renderizar o carrinho:', erro);
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