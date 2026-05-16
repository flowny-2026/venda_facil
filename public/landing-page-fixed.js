// ========================================
// LANDING PAGE - SCRIPT EXTERNO - VERSÃO 2.0
// ========================================
console.log('✅ SCRIPT CARREGADO - VERSÃO 2.0 - ' + new Date().toLocaleTimeString());

// Abrir modal de contato
function openContactModal() {
    console.log('📋 Abrindo modal de contato...');
    
    const modal = document.getElementById('contactModal');
    const form = document.getElementById('contactForm');
    const success = document.getElementById('successMessage');
    
    if (!modal) {
        console.error('❌ Modal não encontrado!');
        return;
    }
    
    modal.style.display = 'block';
    if (form) form.style.display = 'block';
    if (success) success.style.display = 'none';
    console.log('✅ Modal aberto com sucesso!');
}

// Menu mobile
function openMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const overlay = document.getElementById('mobileNavOverlay');
    const menuBtn = document.getElementById('mobileMenuBtn');

    if (!mobileNav || !overlay) return;

    mobileNav.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('menu-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    if (menuBtn) {
        menuBtn.setAttribute('aria-expanded', 'true');
        menuBtn.textContent = '✕';
    }
}

function closeMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const overlay = document.getElementById('mobileNavOverlay');
    const menuBtn = document.getElementById('mobileMenuBtn');

    if (!mobileNav || !overlay) return;

    mobileNav.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('menu-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    if (menuBtn) {
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.textContent = '☰';
    }
}

function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    if (mobileNav?.classList.contains('open')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

// Fechar modal
function closeModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'none';
    }
    const form = document.getElementById('contactForm');
    if (form) {
        form.reset();
    }
}

// Enviar formulário de contato
async function submitContactForm(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    // Coletar dados do formulário
    const formData = {
        company_name: document.getElementById('companyName').value,
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value,
        business_type: document.getElementById('businessType').value || null,
        message: document.getElementById('message').value || null
    };
    
    console.log('📤 Enviando solicitação de contato:', formData);
    
    try {
        // Verificar se o Supabase está configurado
        if (typeof window.supabaseClient === 'undefined') {
            console.warn('⚠️ Supabase não configurado. Dados salvos apenas no console.');
            throw new Error('SUPABASE_NOT_CONFIGURED');
        }
        
        // Salvar no Supabase
        const { error } = await window.supabaseClient
            .from('landing_leads')
            .insert([formData]);
        
        if (error) {
            console.error('❌ Erro ao salvar no Supabase:', error);
            throw error;
        }
        
        console.log('✅ Lead salvo com sucesso no Supabase!');
        
        // Mostrar mensagem de sucesso
        document.getElementById('contactForm').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        
    } catch (error) {
        if (error.message === 'SUPABASE_NOT_CONFIGURED') {
            // Modo demonstração - apenas mostra no console
            console.log('📋 MODO DEMONSTRAÇÃO - Dados do lead:', formData);
            alert('✅ Formulário enviado!\n\n📋 Sistema em modo demonstração.\n\nPara receber os leads:\n1. Execute o script CRIAR_TABELA_LEADS.sql no Supabase\n2. Adicione o Supabase Client na landing page\n3. Os leads serão salvos automaticamente no banco');
            
            document.getElementById('contactForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
        } else {
            // Erro real do Supabase
            console.error('❌ Erro ao enviar:', error);
            alert('❌ Erro ao enviar formulário: ' + (error.message || 'Tente novamente.'));
        }
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('contactModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Landing Page carregada!');
    
    // Adicionar listener ao botão "Começar Agora"
    const btnComecarAgora = document.getElementById('btnComecarAgora');
    if (btnComecarAgora) {
        btnComecarAgora.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Botão clicado via addEventListener!');
            openContactModal();
        });
        console.log('✅ Listener adicionado ao botão "Começar Agora"');
    } else {
        console.error('❌ Botão "Começar Agora" não encontrado!');
    }
    
    // Menu hambúrguer
    const menuBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('mobileNavClose');
    const overlay = document.getElementById('mobileNavOverlay');

    menuBtn?.addEventListener('click', toggleMobileMenu);
    closeBtn?.addEventListener('click', closeMobileMenu);
    overlay?.addEventListener('click', closeMobileMenu);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });

    // Smooth scroll para links âncora
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Ignorar links vazios ou apenas "#"
            if (!href || href === '#' || href === '#!') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                closeMobileMenu();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Animate on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animar cards quando aparecerem na tela
    document.querySelectorAll('.benefit-card, .step, .feature-item, .testimonial-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
});
