  const deleteCompany = async (companyId: string, companyName: string) => {
    const confirmMessage = `⚠️ ATENÇÃO: Excluir empresa "${companyName}"?\n\n` +
      `Esta ação irá:\n` +
      `• Excluir TODOS os dados da empresa\n` +
      `• Remover usuários, vendas, produtos\n` +
      `• Deletar usuários do Supabase Auth\n` +
      `• NÃO PODE SER DESFEITA\n\n` +
      `Tem certeza que deseja continuar?`;

    if (!confirm(confirmMessage)) return;

    const confirmation = prompt('Digite "EXCLUIR" para confirmar:');
    if (confirmation !== 'EXCLUIR') {
      alert('Exclusão cancelada. Texto não confere.');
      return;
    }

    try {
      console.log(`🗑️ Iniciando exclusão da empresa: ${companyName} (${companyId})`);
      console.log(`📊 Estado atual: ${companies.length} empresas na lista`);
      
      // USAR A FUNÇÃO SQL ESPECÍFICA PARA DELETAR EMPRESA
      console.log('🔍 Usando função delete_company_cascade...');
      const { data: deleteResult, error: deleteError } = await supabase
        .rpc('delete_company_cascade', { 
          company_name: companyName 
        });

      if (deleteError) {
        console.error('❌ Erro ao executar delete_company_cascade:', deleteError);
        throw deleteError;
      }
      
      console.log('✅ Resultado da função:', deleteResult);
      
      // Verificar se a função retornou sucesso
      if (deleteResult && deleteResult.includes('❌')) {
        console.error('❌ Função retornou erro:', deleteResult);
        throw new Error(deleteResult);
      }
      
      if (deleteResult && deleteResult.includes('✅')) {
        console.log('✅ Empresa deletada com sucesso pela função SQL');
        
        // Verificar se realmente foi deletada
        console.log('🔍 Verificando se empresa foi realmente deletada...');
        const { data: checkCompany } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', companyId)
          .maybeSingle();
        
        if (checkCompany) {
          console.warn('⚠️ Empresa ainda existe, tentando por ID...');
          
          // Se ainda existir, tentar deletar por ID usando a mesma lógica da função
          const { error: manualDeleteError } = await supabase
            .from('sellers')
            .delete()
            .eq('company_id', companyId);
          
          const { error: usersDeleteError } = await supabase
            .from('company_users')
            .delete()
            .eq('company_id', companyId);
          
          const { error: companyDeleteError } = await supabase
            .from('companies')
            .delete()
            .eq('id', companyId);
          
          if (companyDeleteError) {
            throw companyDeleteError;
          }
          
          console.log('✅ Empresa deletada manualmente após função');
        } else {
          console.log('✅ Confirmado: Empresa não existe mais no banco');
        }
        
        // Atualizar estado local
        console.log('🔍 Atualizando estado local...');
        const oldCount = companies.length;
        setCompanies(prev => prev.filter(company => company.id !== companyId));
        console.log(`📊 Estado atualizado: ${oldCount} → ${oldCount - 1} empresas`);
        
        alert(`✅ ${deleteResult}`);
      } else {
        throw new Error('Função executada mas resultado inesperado: ' + deleteResult);
      }
      
    } catch (error: any) {
      console.error('❌ ERRO GERAL na exclusão:', error);
      console.error('❌ Stack trace:', error.stack);
      
      // Recarregar a lista para garantir consistência
      console.log('🔄 Recarregando lista para garantir consistência...');
      await loadCompanies();
      
      alert(`❌ Erro ao excluir empresa: ${error.message}\n\nA lista foi recarregada para garantir consistência.`);
    }
  };