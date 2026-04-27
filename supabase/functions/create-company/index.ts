// Edge Function para criar empresa e usuário sem fazer logout do admin
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase com service_role key (admin)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verificar se o usuário que está chamando é admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Não autorizado')
    }

    // Verificar se é admin
    const { data: isAdmin, error: adminError } = await supabaseAdmin
      .rpc('is_admin', { user_uuid: user.id })
    
    if (adminError || !isAdmin) {
      throw new Error('Apenas administradores podem criar empresas')
    }

    // Pegar dados do body
    const { 
      company_name,
      company_email,
      company_phone,
      company_document,
      plan,
      access_type,
      max_users,
      monthly_fee,
      user_name,
      user_email,
      user_password
    } = await req.json()

    // 1. Criar usuário usando Admin API (NÃO faz login automático)
    const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: user_email,
      password: user_password,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        name: user_name
      }
    })

    if (userError) throw userError
    if (!newUser.user) throw new Error('Erro ao criar usuário')

    // 2. Criar empresa
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert([{
        name: company_name,
        email: company_email,
        phone: company_phone,
        document: company_document,
        plan: plan,
        access_type: access_type,
        max_users: max_users,
        monthly_fee: monthly_fee,
        status: 'active'
      }])
      .select()
      .single()

    if (companyError) throw companyError

    // 3. Criar relacionamento usuário-empresa
    const { error: userCompanyError } = await supabaseAdmin
      .from('company_users')
      .insert([{
        company_id: company.id,
        user_id: newUser.user.id,
        role: 'owner',
        active: true,
        can_access_pdv: true,
        can_view_reports: true,
        can_manage_products: true,
        can_manage_sellers: true
      }])

    if (userCompanyError) throw userCompanyError

    return new Response(
      JSON.stringify({ 
        success: true,
        company: company,
        user: {
          email: user_email,
          name: user_name
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
