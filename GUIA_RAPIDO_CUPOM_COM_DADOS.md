# Guia Rápido: Cupom com Dados da Empresa

## ✅ O Que Foi Feito

1. ✅ Adicionado campo **"Endereço Completo"** no formulário de criar empresa
2. ✅ Campo **CNPJ** já existia no formulário
3. ✅ Criado script SQL para adicionar colunas no banco
4. ✅ Cupom busca dados automaticamente da empresa logada

---

## 🚀 Como Usar (Passo a Passo)

### **Passo 1: Executar Script SQL**

1. Abra o **Supabase** → **SQL Editor**
2. Cole o conteúdo do arquivo `ADICIONAR_CAMPOS_EMPRESA.sql`
3. Clique em **Run**
4. Verifique se apareceu: "Coluna address adicionada com sucesso!"

### **Passo 2: Atualizar Empresas Existentes**

Se você já tem empresas cadastradas, precisa adicionar os dados:

```sql
-- Listar empresas existentes
SELECT id, name, email FROM companies;

-- Atualizar dados da empresa
UPDATE companies 
SET 
  cnpj = '12.345.678/0001-90',
  document = '12.345.678/0001-90',
  address = 'Rua Exemplo, 123 - Centro - São Paulo/SP - CEP 01234-567',
  phone = '(11) 98765-4321'
WHERE id = 'COLE_O_ID_AQUI';
```

### **Passo 3: Criar Novas Empresas**

Agora quando criar uma nova empresa no **Admin System**, você verá:

- ✅ Nome da Empresa
- ✅ Email da Empresa
- ✅ Telefone
- ✅ CNPJ
- ✅ **Endereço Completo** (NOVO!)

Preencha todos os campos e os dados aparecerão automaticamente no cupom!

### **Passo 4: Testar**

1. Faça login no **Cliente System**
2. Vá no **PDV**
3. Finalize uma venda
4. Clique em **"Imprimir Cupom"**
5. **Verifique se aparece**:
   - Nome da empresa
   - CNPJ
   - Endereço completo
   - Telefone

---

## 📋 Exemplo de Cupom Completo

```
========================================
   LOJA ABC - MODA FEMININA
    CNPJ: 12.345.678/0001-90
Rua das Flores, 456 - Centro
    São Paulo/SP - CEP 01234-567
        Tel: (11) 98765-4321
========================================
       CUPOM NÃO FISCAL
  (Não válido como documento fiscal)
========================================
Data: 30/04/2026
Hora: 15:30:45
Cupom: #A1B2C3D4
Vendedor: Maria Silva
========================================
              PRODUTOS
----------------------------------------
Item                    Qtd    Valor
Vestido Floral           1   R$ 89.90
Subtotal:                    R$ 89.90
========================================
TOTAL:                       R$ 89.90
========================================
Forma de Pagamento: Cartão de Débito
========================================
    Obrigado pela preferência!
           Volte sempre!

   VendaFácil - Sistema PDV
         30/04/2026
```

---

## 🔧 Solução de Problemas

### Problema: "Endereço não aparece no cupom"

**Solução:**
1. Verifique se executou o script SQL
2. Verifique se preencheu o endereço ao criar a empresa
3. Faça logout e login novamente
4. Tente imprimir o cupom novamente

### Problema: "CNPJ não aparece no cupom"

**Solução:**
1. Verifique se preencheu o CNPJ ao criar a empresa
2. Execute este SQL para verificar:
```sql
SELECT id, name, cnpj, document FROM companies WHERE id = 'SEU_ID';
```
3. Se estiver vazio, atualize:
```sql
UPDATE companies 
SET cnpj = '00.000.000/0000-00', document = '00.000.000/0000-00'
WHERE id = 'SEU_ID';
```

### Problema: "Telefone não aparece no cupom"

**Solução:**
1. Verifique se preencheu o telefone ao criar a empresa
2. Execute este SQL:
```sql
UPDATE companies 
SET phone = '(11) 99999-9999'
WHERE id = 'SEU_ID';
```

---

## 📊 Verificação Rápida

Execute este SQL para ver todos os dados da empresa:

```sql
SELECT 
  id,
  name,
  cnpj,
  document,
  address,
  phone,
  email
FROM companies
WHERE id = 'SEU_COMPANY_ID';
```

**Resultado esperado:**
```
id       | a1b2c3d4-...
name     | Loja ABC
cnpj     | 12.345.678/0001-90
document | 12.345.678/0001-90
address  | Rua Exemplo, 123 - Centro - São Paulo/SP
phone    | (11) 98765-4321
email    | contato@lojaabc.com
```

---

## ✅ Checklist

- [ ] Executei o script `ADICIONAR_CAMPOS_EMPRESA.sql`
- [ ] Atualizei os dados das empresas existentes
- [ ] Testei criar uma nova empresa com todos os campos
- [ ] Fiz uma venda no PDV
- [ ] Imprimi o cupom
- [ ] Verifiquei que todos os dados aparecem

---

## 🎉 Pronto!

Agora o cupom mostra **automaticamente**:
- ✅ Nome da empresa
- ✅ CNPJ
- ✅ Endereço completo
- ✅ Telefone

**Não precisa configurar nada no código!**  
**Só preencher os dados ao criar a empresa!**

---

**Commit**: `b3c12d5`  
**Data**: 30/04/2026  
**Status**: ✅ PRONTO
