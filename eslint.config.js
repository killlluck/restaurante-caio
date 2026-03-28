- name: Criar configuração temporária do ESLint
  run: |
    cat > eslint.config.js <<'EOF'
    module.exports = [
      {
        files: ["**/*.js"],
        ignores: ["node_modules/**"],
        languageOptions: {
          ecmaVersion: 2021,
          sourceType: "commonjs"
        },
        env: {
          node: true,
          es2021: true
        },
        rules: {
          "no-unused-vars": "warn",
          "no-undef": "error"
        }
      }
    ];
    EOF
