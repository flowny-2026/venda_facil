# 📧 Como Receber Informações dos Leads da Landing Page

## ✅ Sistema Implementado

Agora quando alguém preencher o formulário na landing page, as informações serão **automaticamente salvas no Supabase** e você poderá visualizá-las no **Painel Admin**.

---

## 🚀 Passo a Passo para Ativar

### 1️⃣ Criar a Tabela no Supabase

1. Acesse o Supabase: https://supabase.com/dashboard
2. Selecione seu projeto: `responsabilidade_liz`
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `CRIAR_TABELA_LEADS.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Aguarde a mensagem: "Tabela landing_leads criada com sucesso!"

### 2️⃣ Testar o Formulário

1. Abra o arquivo `landing-page.html` no navegador
2. Clique em qualquer botão "Começar Agora" ou "Começar Gratuitamente"
3. Preencha o formulário com dados de teste:
   - Nome da Empresa: Teste Ltda
   - Seu Nome: João Silva
   - Email: teste@email.com
   - Telefone: (11) 99999-9999
   - Tipo de Negócio: Varejo
   - Mensagem: Teste de formulário
4. Clique em "Solicitar Demonstração"
5. Deve aparecer a mensagem de sucesso ✅

### 3️⃣ Visualizar os Leads no Painel Admin

1. Acesse o Painel Admin: http://localhost:5180 (ou 5181/5182)
2. Faça login com suas credenciais de admin
3. Clique no menu **"Leads"** (novo item no menu)
4. Você verá todos os leads recebidos com:
   - Nome da empresa
   - Nome do contato
   - Email (clicável para enviar email)
   - Telefone (clicável para ligar)
   - Status (Novo, Contatado, Convertido, Descartado)
   - Data de recebimento

### 4️⃣ Gerenciar os Leads

No painel de Leads você pode:

- ✅ **Ver estatísticas**: Total, Novos, Contatados, Convertidos
- 🔍 **Filtrar por status**: Mostrar apenas leads novos, contatados, etc.
- 👁️ **Ver detalhes**: Clicar no ícone de olho para ver todas as informações
- 📝 **Atualizar status**: Marcar como contatado, convertido ou descartado
- 📧 **Enviar email**: Clicar no email para abrir seu cliente de email
- 📞 **Ligar**: Clicar no telefone para fazer ligação

---

## 📊 Estrutura da Tabela

A tabela `landing_leads` armazena:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `company_name` | TEXT | Nome da empresa |
| `contact_name` | TEXT | Nome do contato |
| `contact_email` | TEXT | Email do contato |
| `contact_phone` | TEXT | Telefone/WhatsApp |
| `business_type` | TEXT | Tipo de negócio (varejo, restaurante, etc) |
| `message` | TEXT | Mensagem opcional |
| `status` | TEXT | Status: novo, contatado, convertido, descartado |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |

---

## 🔒 Segurança

- ✅ **RLS Habilitado**: Row Level Security ativo
- ✅ **INSERT Público**: Qualquer pessoa pode enviar o formulário (anônimo)
- ✅ **SELECT/UPDATE Restrito**: Apenas admins podem ver e editar leads
- ✅ **Dados Seguros**: Informações protegidas no banco de dados

---

## 📱 Próximas Integrações (Opcional)

Você pode adicionar integrações para receber notificações:

### 1. Email Automático
```javascript
// Usar SendGrid, Mailgun ou Resend
// Enviar email quando novo lead chegar
```

### 2. WhatsApp
```javascript
// Usar WhatsApp Business API
// Enviar mensagem automática para você
```

### 3. Google Sheets
```javascript
// Salvar também em planilha
// Para backup e análise
```

### 4. Webhook/Zapier
```javascript
// Integrar com outras ferramentas
// CRM, Slack, Discord, etc
```

---

## 🐛 Solução de Problemas

### Erro: "Tabela não encontrada"
- Execute o script `CRIAR_TABELA_LEADS.sql` no Supabase

### Erro: "Permission denied"
- Verifique se as políticas RLS foram criadas corretamente
- Execute novamente o script SQL

### Leads não aparecem no painel
- Verifique se você está logado como admin
- Atualize a página (botão "Atualizar" no painel)
- Verifique o console do navegador (F12) para erros

### Formulário não envia
- Abra o console do navegador (F12)
- Verifique se há erros JavaScript
- Confirme que o Supabase Client está carregando

---

## 📞 Contato

Se tiver dúvidas ou problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase
3. Teste com dados diferentes

---

## ✅ Checklist de Ativação

- [ ] Executei o script `CRIAR_TABELA_LEADS.sql` no Supabase
- [ ] Testei o formulário na landing page
- [ ] Vi a mensagem de sucesso após enviar
- [ ] Acessei o Painel Admin
- [ ] Vi o menu "Leads" no painel
- [ ] Visualizei os leads recebidos
- [ ] Consegui atualizar o status de um lead

---

**🎉 Pronto! Agora você está recebendo e gerenciando leads automaticamente!**
