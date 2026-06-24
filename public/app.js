document.addEventListener('DOMContentLoaded', () => {
    const vitrinePrincipal = document.getElementById('vitrine-principal');
    const painelDetalhe = document.getElementById('painel-detalhe');
    const gridRecomendacoes = document.getElementById('grid-recomendacoes');

    const detalheTitulo = document.getElementById('detalhe-titulo');
    const detalheArtista = document.getElementById('detalhe-artista');
    const detalhePreco = document.getElementById('detalhe-preco');
    const detalheTags = document.getElementById('detalhe-tags');
    const containerIframe = document.getElementById('container-iframe');
    const btnFechar = document.getElementById('btn-fechar-detalhe');

    let idDiscoAtivo = null;

    carregarVitrine();

    async function carregarVitrine() {
        try {
            const resposta = await fetch('/api/discos');
            const discos = await resposta.json();

            vitrinePrincipal.innerHTML = '';

            discos.forEach(disco => {
                const card = criarCardDisco(disco);

                card.addEventListener('click', () => {
                    carregarDetalhesDisco(disco.id);
                });

                vitrinePrincipal.appendChild(card);
            });
        } catch (erro) {
            console.error('Erro ao carregar vitrine:', erro);
        }
    }

    async function carregarDetalhesDisco(id) {
        try {
            idDiscoAtivo = id;
            const resposta = await fetch(`/api/discos/${id}`);
            const dados = await resposta.json();

            const disco = dados.disco;
            const recomendacoes = dados.recomendacoes;

            detalheTitulo.textContent = disco.nome;
            detalheArtista.textContent = `Por ${disco.artista}`;
            detalhePreco.textContent = `R$ ${disco.preco.toFixed(2)}`;

            detalheTags.innerHTML = '';

            disco.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = `#${tag}`;
                detalheTags.appendChild(span);
            });

            containerIframe.innerHTML = `
                <iframe
                    src="https://open.spotify.com/embed/album/${disco.spotifyId}"
                    width="100%"
                    height="380"
                    frameborder="0"
                    allowfullscreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy">
                </iframe>
            `;

            gridRecomendacoes.innerHTML = '';

            if (recomendacoes.length === 0) {
                gridRecomendacoes.innerHTML = `
                    <p class="artista">
                        Nenhuma recomendação disponível.
                    </p>
                `;
            } else {
                recomendacoes.forEach(rec => {
                    const cardRec = criarCardDisco(rec);

                    cardRec.addEventListener('click', () => {
                        carregarDetalhesDisco(rec.id);
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    });

                    gridRecomendacoes.appendChild(cardRec);
                });
            }

            painelDetalhe.className = '';
        } catch (erro) {
            console.error('Erro ao carregar detalhes:', erro);
        }

        btnFechar.addEventListener('click', () => {

        painelDetalhe.className = 'escondido';

        containerIframe.innerHTML = '';

        idDiscoAtivo = null;

});

    }

    function criarCardDisco(disco) {
         const div = document.createElement('div');

    div.className = 'card-disco';

    div.innerHTML = `

        <img
            class="capa-disco"
            src="${disco.capa}"
            alt="${disco.nome}"
        >

        <div class="conteudo-card">

            <h3>${disco.nome}</h3>

            <p class="artista">
                ${disco.artista}
            </p>

            <p class="preco">
                R$ ${disco.preco.toFixed(2)}
            </p>

        </div>
    `;

    return div;
}

    const btnComprar = document.querySelector('.btn-comprar');
    const cartContador = document.getElementById('cart-contador');

    const modalAdicionado = document.getElementById('modal-adicionado');
    const btnContinuar = document.getElementById('btn-continuar');

    btnComprar.addEventListener('click', async () => {
        if (!idDiscoAtivo) return;

        try {
            const resposta = await fetch('/api/carrinho', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discoId: idDiscoAtivo })
            });

            const dados = await resposta.json();
            cartContador.textContent = dados.totalItens;

            modalAdicionado.classList.remove('escondido');

        } catch (erro) {
            console.error('Erro ao adicionar ao carrinho:', erro);
        }
    });

    btnContinuar.addEventListener('click', () => {
        modalAdicionado.classList.add('escondido');
    });
});