# 🗑️ **Guia: Excluir Empresas no Painel Admin**

## ✅ **Nova Funcionalidade Adicionada!**

Agora você tem **3 botões** na coluna "Ações" de cada empresa:

### 👁️ **Ver Detalhes** (Azul)
- **O que faz**: Mostra informações completas da empresa
- **Quando usar**: Consultar dados, histórico, usuários

### ⏸️ **Suspender/Ativar** (Amarelo/Verde)
- **Amarelo**: Suspende empresa (bloqueia temporariamente)
- **Verde**: Reativa empresa (libera acesso)
- **Quando usar**: Cliente não pagou, quer bloquear/desbloquear

### 🗑️ **Excluir** (Vermelho) - **NOVO!**
- **O que faz**: **REMOVE COMPLETAMENTE** a empresa do sistema
- **⚠️ CUIDADO**: **NÃO PODE SER DESFEITO!**

---

## 🚨 **ATENÇÃO: Como Funciona a Exclusão**

### **O que é excluído**:
- ✅ **Empresa** (dados cadastrais)
- ✅ **Usuários** da empresa
- ✅ **Todas as vendas** da empresa
- ✅ **Produtos** cadastrados
- ✅ **Vendedores** cadastrados
- ✅ **Formas de pagamento** personalizadas
- ✅ **TODO o histórico** da empresa

### **Proteções de Segurança**:
1. **Confirmação dupla**: Pergunta 2 vezes se tem certeza
2. **Digite "EXCLUIR"**: Precisa digitar exatamente para confirmar
3. **Mostra o que será perdido**: Lista tudo que será excluído

---

## 🎯 **Quando Usar Cada Opção**

### 💡 **Cliente não pagou há 1-2 meses**
**Use**: **Suspender** (botão amarelo)
- **Por quê**: Cliente pode voltar a pagar
- **Resultado**: Dados ficam salvos, acesso bloqueado

### 💡 **Cliente cancelou definitivamente**
**Use**: **Suspender** primeiro, **Excluir** depois de 6+ meses
- **Por quê**: Cliente pode mudar de ideia
- **Resultado**: Dados ficam salvos por um tempo

### 💡 **Empresa teste/demonstração**
**Use**: **Excluir** (botão vermelho)
- **Por quê**: Não precisa manter dados de teste
- **Resultado**: Limpa o sistema

### 💡 **Cliente inadimplente há 1+ ano**
**Use**: **Excluir** (botão vermelho)
- **Por quê**: Não vai voltar, limpa espaço no banco
- **Resultado**: Remove dados antigos

---

## 📋 **Passo a Passo para Excluir**

### **1. Clique no botão vermelho** (🗑️)
### **2. Leia o aviso** que aparece:
```
⚠️ ATENÇÃO: Excluir empresa "Nome da Empresa"?

Esta ação irá:
• Excluir TODOS os dados da empresa
• Remover usuários, vendas, produtos  
• NÃO PODE SER DESFEITA

Digite "EXCLUIR" para confirmar:
```

### **3. Clique "OK"** se tem certeza
### **4. Digite exatamente**: `EXCLUIR`
### **5. Clique "OK"** novamente
### **6. Empresa será removida** da lista

---

## ⚠️ **IMPORTANTE: Backup Antes de Excluir**

### **Para empresas importantes**:
1. **Exporte dados** antes de excluir
2. **Salve relatórios** importantes
3. **Confirme com o cliente** que não quer mais

### **Para empresas teste**:
- Pode excluir sem backup

---

## 🎯 **Resumo das Ações**

| Situação | Ação Recomendada | Botão |
|----------|------------------|-------|
| Cliente não pagou (1-30 dias) | **Suspender** | 🟡 Amarelo |
| Cliente cancelou (recente) | **Suspender** | 🟡 Amarelo |
| Cliente inadimplente (6+ meses) | **Excluir** | 🔴 Vermelho |
| Empresa teste/demo | **Excluir** | 🔴 Vermelho |
| Cliente quer reativar | **Ativar** | 🟢 Verde |

**Agora você tem controle total sobre as empresas no seu sistema!** 🎉