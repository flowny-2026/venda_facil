# 🧪 COMO TESTAR A EXCLUSÃO NO PAINEL ADMIN

## ✅ ALTERAÇÃO JÁ FEITA

A alteração que você pediu **JÁ FOI IMPLEMENTADA** no arquivo `admin-system/src/pages/Clientes.tsx`.

O código agora usa a função SQL `delete_company_cascade` que funciona perfeitamente.

## 🔧 PASSOS PARA TESTAR

### 1. Acessar o Painel Admin
```
http://localhost:5173
```

### 2. Fazer Login
- Email: `edicharlesbrito2009@hotmail.com`
- Senha: (sua senha de admin)

### 3. Ir para "Gerenciar Clientes"

### 4. Testar Exclusão
- Procure a empresa **"lojaabcd"** (empresa de teste)
- Clique no ícone da lixeira (🗑️)
- Confirme a exclusão digitando "EXCLUIR"

### 5. Verificar Resultado
- A empresa deve sumir da lista IMEDIATAMENTE
- Ao recarregar a página, ela NÃO deve voltar
- Deve aparecer mensagem de sucesso

## 🐛 SE AINDA NÃO FUNCIONAR

### Possível Causa 1: Cache do Navegador
```bash
# Limpar cache do navegador
Ctrl + Shift + R (ou Cmd + Shift + R no Mac)
```

### Possível Causa 2: Servidor não reiniciado
```bash
# No terminal do admin-system:
npm run dev
```

### Possível Causa 3: Build não atualizado
```bash
# Já fizemos o build, mas se precisar:
cd admin-system
npm run build
npm run dev
```

## 📊 VERIFICAR NO BANCO DE DADOS

Execute este SQL para confirmar que a função funciona:

```sql
-- Testar a função diretamente
SELECT delete_company_cascade('lojaabcd');

-- Verificar se a empresa sumiu
SELECT name, email FROM companies WHERE name = 'lojaabcd';
```

## 🎯 RESULTADO ESPERADO

- ✅ Empresa deletada com sucesso
- ✅ Não volta ao recarregar a página  
- ✅ Mensagem de confirmação aparece
- ✅ Lista atualizada automaticamente

## 📝 CÓDIGO IMPLEMENTADO

O arquivo `admin-system/src/pages/Clientes.tsx` agora usa:

```typescript
const { data: deleteResult, error: deleteError } = await supabase
  .rpc('delete_company_cascade', { 
    company_name: companyName 
  });
```

Esta função SQL resolve todas as dependências automaticamente e é muito mais confiável que o DELETE manual.