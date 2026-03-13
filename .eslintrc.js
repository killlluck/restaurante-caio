module.exports = {
  env: {
    node: true,       // permite variáveis globais do Node
    es2021: true,     // permite recursos modernos do JS
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // suas regras customizadas
  },
};
