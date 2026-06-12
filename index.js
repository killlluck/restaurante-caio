const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();

const dbConfig = {
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'marmitadb'
};

let pool;

async function connectWithRetry() {
    console.log('[INFRA] Tentando conectar ao MySQL...');
    for (let i = 1; i <= 10; i++) {
        try {
            pool = mysql.createPool(dbConfig);
            await pool.query('SELECT 1');
            console.log('[DATABASE] Conectado ao MySQL com sucesso!');
            return;
        } catch {
            console.log(`[DATABASE] Tentativa ${i}/10 falhou. Aguardando...`);
            await new Promise(res => setTimeout(res, 3000));
        }
    }
    process.exit(1);
}

async function passwordMatches(inputPassword, storedPassword) {
    if (inputPassword === storedPassword) {
        return true;
    }

    try {
        return await bcrypt.compare(inputPassword, storedPassword);
    } catch {
        return false;
    }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/logo.png', (_req, res) => {
    res.sendFile(path.join(__dirname, 'logo.png'));
});

app.get('/', (_req, res) => {
    res.render('login');
});

app.get('/register', (_req, res) => {
    res.render('register', { error: null, success: null });
});

app.post('/register', async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    const normalizedUsername = (username || '').trim();

    if (!normalizedUsername || !password || !confirmPassword) {
        return res.status(400).render('register', {
            error: 'Preencha todos os campos.',
            success: null
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).render('register', {
            error: 'As senhas nao conferem.',
            success: null
        });
    }

    if (password.length < 6) {
        return res.status(400).render('register', {
            error: 'A senha deve ter pelo menos 6 caracteres.',
            success: null
        });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [normalizedUsername, passwordHash]
        );

        return res.status(201).render('register', {
            error: null,
            success: 'Cadastro realizado com sucesso. Voce ja pode entrar.'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).render('register', {
                error: 'Este usuario ja existe.',
                success: null
            });
        }

        return res.status(500).render('register', {
            error: 'Erro ao cadastrar usuario.',
            success: null
        });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).send('<h1>Login invalido</h1><a href="/">Voltar</a>');
        }

        const user = rows[0];
        if (await passwordMatches(password, user.password)) {
            return res.redirect('/dashboard');
        }

        return res.status(401).send('<h1>Login invalido</h1><a href="/">Voltar</a>');
    } catch {
        return res.status(500).send('Erro no banco.');
    }
});

app.get('/dashboard', async (_req, res) => {
    const [items] = await pool.query('SELECT * FROM items');
    const [orders] = await pool.query('SELECT * FROM orders');
    res.render('dashboard', { items, orders });
});

connectWithRetry().then(() => {
    app.listen(3000, () => console.log('MARMITATECH PRO ONLINE NA PORTA 3000'));
});
