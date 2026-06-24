const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        secret: 'chave-vinil-token-2026',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

const lerDiscos = () => {
    const dados = fs.readFileSync(
        path.join(__dirname, 'data', 'discos.json'),
        'utf-8'
    );

    return JSON.parse(dados);
};

app.get('/api/discos', (req, res) => {
    try {
        const discos = lerDiscos();
        res.json(discos);
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao carregar o catálogo.'
        });
    }
});

app.get('/api/discos/:id', (req, res) => {
    try {
        const discos = lerDiscos();

        const discoAtual = discos.find(
            d => d.id === req.params.id
        );

        if (!discoAtual) {
            return res.status(404).json({
                error: 'Disco não encontrado.'
            });
        }

        if (!req.session.tagsVistas) {
            req.session.tagsVistas = [];
        }

        discoAtual.tags.forEach(tag => {
            if (!req.session.tagsVistas.includes(tag)) {
                req.session.tagsVistas.push(tag);
            }
        });

        const recomendacoes = discos
            .filter(d => d.id !== discoAtual.id)
            .map(d => {
                const afinidadeDireta =
                    d.tags.filter(tag => discoAtual.tags.includes(tag)).length * 2;

                const afinidadeHistorico =
                    d.tags.filter(tag => req.session.tagsVistas.includes(tag)).length * 1;

                return {
                    ...d,
                    score: afinidadeDireta + afinidadeHistorico
                };
            })
            .filter(d => d.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        res.json({
            disco: discoAtual,
            recomendacoes
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao processar recomendações.'
        });
    }
});

app.use(express.json());

app.post('/api/carrinho', (req, res) => {
    const { discoId } = req.body;

    if (!req.session.carrinho) {
        req.session.carrinho = [];
    }

    req.session.carrinho.push(discoId);

    res.json({ totalItens: req.session.carrinho.length });
});

app.get('/api/carrinho/total', (req, res) => {
    const total = req.session.carrinho ? req.session.carrinho.length : 0;
    res.json({ totalItens: total });
});

app.get('/api/carrinho/itens', (req, res) => {
    try {
        const idsNoCarrinho = req.session.carrinho || [];
        const discos = lerDiscos();

        const itensDetalhados = idsNoCarrinho.map(id => {
            return discos.find(d => d.id === id);
        }).filter(Boolean);

        res.json(itensDetalhados);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar itens do carrinho.' });
    }
});

app.post('/api/carrinho/finalizar', (req, res) => {
    try {
        req.session.carrinho = [];
        res.json({ success: true, message: 'Compra processada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao finalizar a compra.' });
    }
});

app.listen(PORT, () => {
    console.log(
        `Servidor rodando em http://localhost:${PORT}`
    );
});