# 🧪 TESTE PRÁTICO DE LOGIN - NICOLLY E AMANDA

## ✅ DIAGNÓSTICO ATUAL
- Emails confirmados: ✅
- Vendedores ativos: ✅
- **Próximo passo**: Identificar problema específico

## 🔍 TESTE PASSO A PASSO

### PASSO 1: Verificar URLs
Confirme que você está usando as URLs corretas:

- **❌ ADMIN (não usar para vendedores)**: http://localhost:5173
- **✅ CLIENTE (usar para vendedores)**: http://localhost:3000

### PASSO 2: Teste de Login Detalhado

1. **Abra aba privada** no navegador
2. **Acesse**: http://localhost:3000
3. **Abra console** (F12 → Console)
4. **Tente login da Nicolly**:
   - Email: nicolly@empresa.com
   - Senha: (a que você definiu)

### PASSO 3: Anotar Resultados

**O que acontece ao tentar login?**

- [ ] Aparece erro na tela?
- [ ] Login "carrega" mas não entra?
- [ ] Redireciona para alguma página?
- [ ] Aparece mensagem no console (F12)?
- [ ] Fica na tela de login?

### PASSO 4: Verificar Console

No console do navegador (F12), procure por:
- ❌ Erros em vermelho
- ⚠️ Warnings em amarelo
- 📝 Logs de autenticação

## 🔧 POSSÍVEIS PROBLEMAS

### PROBLEMA 1: URL Errada
- **Sintoma**: Login funciona mas vai para tela errada
- **Solução**: Usar http://localhost:3000

### PROBLEMA 2: Políticas RLS
- **Sintoma**: Login funciona mas não carrega dados
- **Solução**: Verificar permissões no banco

### PROBLEMA 3: Sessão Conflitante
- **Sintoma**: Login não funciona por cache
- **Solução**: Usar aba privada ou limpar cache

### PROBLEMA 4: Servidor não rodando
- **Sintoma**: Página não carrega
- **Solução**: Verificar se servidor está rodando

## 🚀 VERIFICAR SERVIDORES

### Sistema Cliente (onde vendedores fazem login)
```bash
cd cliente-system
npm run dev
```
Deve rodar em: http://localhost:3000

### Sistema Admin (onde você gerencia)
```bash
cd admin-system  
npm run dev
```
Deve rodar em: http://localhost:5173

## 📝 INFORMAÇÕES PARA ENVIAR

Após o teste, me envie:

1. **URL que você está usando** para login
2. **O que acontece** ao tentar login
3. **Mensagens de erro** (se houver)
4. **Console do navegador** (F12 → Console)
5. **Screenshot** da tela de login

## 🎯 PRÓXIMOS PASSOS

Com essas informações, posso identificar se é:
- Problema de URL
- Problema de servidor
- Problema de configuração
- Problema de políticas RLS

Execute o teste e me envie os resultados!