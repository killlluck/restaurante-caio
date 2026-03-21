const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();

// 🔐 Segurança
app.disable('x-powered-by');

// 🔧 Substitui body-parser
app.use(express.urlencoded({ extended: true }));

const dbConfig = {
    host: process.env.DB_HOST || 'db', // Docker
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'marmitadb'
};

let pool;

async function connectWithRetry() {
    console.log('🔍 Tentando conectar ao MySQL...');
    for (let i = 1; i <= 10; i++) {
        try {
            pool = mysql.createPool(dbConfig);
            await pool.query('SELECT 1');
            console.log('✅ Conectado ao MySQL!');
            return;
        } catch (err) {
            console.log(`⚠️ Tentativa ${i}/10 falhou...`);
            await new Promise(res => setTimeout(res, 3000));
        }
    }
    process.exit(1);
}

// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rota inicial
app.get('/', (req, res) => res.render('login'));


// 🔐 LOGIN CORRIGIDO
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        // usuário não existe
        if (!rows || rows.length === 0) {
            return res.send('<h1>Usuário não encontrado</h1><a href="/">Voltar</a>');
        }

        const user = rows[0];

        // proteção extra
        if (!user.password) {
            return res.send('<h1>Erro interno: senha inválida</h1>');
        }

        // 🔥 comparação segura
        const senhaValida = await bcrypt.compare(password, user.password);

        if (senhaValida) {
            res.redirect('/dashboard');
        } else {
            res.send('<h1>Senha incorreta</h1><a href="/">Voltar</a>');
        }

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro no login");
    }
});


// 🆕 CADASTRO (opcional, mas correto)
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const senhaHash = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, senhaHash]
        );

        res.send('Usuário cadastrado com sucesso');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao cadastrar');
    }
});


// Dashboard
app.get('/dashboard', async (req, res) => {
    const [items] = await pool.query('SELECT * FROM items');
    const [orders] = await pool.query('SELECT * FROM orders');
    res.render('dashboard', { items, orders });
});


// Inicialização
connectWithRetry().then(() => {
    app.listen(3000, () => console.log('🚀 Servidor rodando na porta 3000'));
});
