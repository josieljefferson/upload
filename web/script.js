// ============================================
// Sistema IPTV - Script Principal
// ============================================

// Configurações
const API_BASE_URL = window.location.origin;
let currentUser = null;

// ============================================
// Funções Utilitárias
// ============================================

// Mostrar mensagem de feedback
function showMessage(message, type = 'error') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        
        // Auto-esconder após 5 segundos
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = 'message';
                messageDiv.style.opacity = '1';
            }, 300);
        }, 5000);
    } else {
        alert(message);
    }
}

// Validar email
function validateEmail(email) {
    const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return re.test(email);
}

// Validar senha
function validatePassword(password) {
    return password.length >= 6;
}

// Validar usuário
function validateUsername(username) {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
}

// Mostrar loading
function showLoading(button) {
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Carregando...';
    return originalText;
}

// Esconder loading
function hideLoading(button, originalText) {
    button.disabled = false;
    button.textContent = originalText;
}

// ============================================
// Página de Cadastro
// ============================================

if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        const terms = document.getElementById('terms').checked;
        
        // Validações
        if (!validateUsername(username)) {
            showMessage('Usuário deve ter no mínimo 3 caracteres e apenas letras, números e underscore');
            return;
        }
        
        if (!validateEmail(email)) {
            showMessage('Por favor, insira um e-mail válido');
            return;
        }
        
        if (!validatePassword(password)) {
            showMessage('Senha deve ter no mínimo 6 caracteres');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('As senhas não conferem');
            return;
        }
        
        if (!terms) {
            showMessage('Você deve aceitar os termos de uso');
            return;
        }
        
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = showLoading(submitBtn);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Cadastro realizado com sucesso! Redirecionando...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showMessage(data.error || 'Erro ao realizar cadastro');
            }
        } catch (error) {
            console.error('Erro:', error);
            showMessage('Erro de conexão. Tente novamente.');
        } finally {
            hideLoading(submitBtn, originalText);
        }
    });
    
    // Validação em tempo real
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm_password');
    
    usernameInput.addEventListener('input', () => {
        const username = usernameInput.value.trim();
        if (username && !validateUsername(username)) {
            usernameInput.style.borderColor = '#e74c3c';
        } else {
            usernameInput.style.borderColor = '#2ecc71';
        }
    });
    
    emailInput.addEventListener('input', () => {
        const email = emailInput.value.trim();
        if (email && !validateEmail(email)) {
            emailInput.style.borderColor = '#e74c3c';
        } else {
            emailInput.style.borderColor = '#2ecc71';
        }
    });
    
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        if (password && !validatePassword(password)) {
            passwordInput.style.borderColor = '#e74c3c';
        } else {
            passwordInput.style.borderColor = '#2ecc71';
        }
    });
    
    confirmInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        if (confirm && password !== confirm) {
            confirmInput.style.borderColor = '#e74c3c';
        } else {
            confirmInput.style.borderColor = '#2ecc71';
        }
    });
}

// ============================================
// Página de Login
// ============================================

if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    
    // Verificar se já está logado
    const token = localStorage.getItem('token');
    if (token) {
        // Verificar se token ainda é válido
        fetch(`${API_BASE_URL}/api/validate`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            if (response.ok) {
                window.location.href = 'dashboard.html';
            } else {
                localStorage.clear();
            }
        });
    }
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showMessage('Preencha todos os campos');
            return;
        }
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = showLoading(submitBtn);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('expires', data.expires);
                
                showMessage('Login realizado com sucesso!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showMessage(data.error || 'Credenciais inválidas');
            }
        } catch (error) {
            console.error('Erro:', error);
            showMessage('Erro de conexão. Tente novamente.');
        } finally {
            hideLoading(submitBtn, originalText);
        }
    });
}

// ============================================
// Página do Dashboard
// ============================================

if (document.querySelector('.dashboard')) {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (!token) {
        window.location.href = 'login.html';
    }
    
    // Mostrar nome do usuário
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        userGreeting.textContent = `Olá, ${username}!`;
    }
    
    
    // Botão do player
    const openPlayerBtn = document.getElementById('openPlayerBtn');
    if (openPlayerBtn) {
        openPlayerBtn.addEventListener('click', () => {
            window.location.href = 'player.html';
        });
    }
    
    // Construir URLs
    const baseUrl = window.location.origin;
    const playlistUrl = `${baseUrl}/api/playlist`;
    const apiUrl = `${baseUrl}/api/get.php?username=${username}&password=********&type=m3u_plus&output=ts`;
    
    const playlistUrlInput = document.getElementById('playlistUrl');
    const apiUrlInput = document.getElementById('apiUrl');
    
    if (playlistUrlInput) playlistUrlInput.value = playlistUrl;
    if (apiUrlInput) apiUrlInput.value = apiUrl;
    
    // Função de cópia
    function copyToClipboard(elementId) {
        const input = document.getElementById(elementId);
        if (!input) return;
        
        input.select();
        input.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            const button = document.getElementById(`copy${elementId.charAt(0).toUpperCase() + elementId.slice(1)}Btn`);
            if (button) {
                const originalText = button.textContent;
                button.textContent = '✓ Copiado!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            }
            showMessage('URL copiada com sucesso!', 'success');
        } catch (err) {
            showMessage('Erro ao copiar', 'error');
        }
    }
    
    // Adicionar eventos de cópia
    const copyUrlBtn = document.getElementById('copyUrlBtn');
    const copyApiBtn = document.getElementById('copyApiBtn');
    
    if (copyUrlBtn) {
        copyUrlBtn.addEventListener('click', () => copyToClipboard('playlistUrl'));
    }
    
    if (copyApiBtn) {
        copyApiBtn.addEventListener('click', () => copyToClipboard('apiUrl'));
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch(`${API_BASE_URL}/api/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('Erro no logout:', error);
            }
            
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
    
    // Validar token periodicamente
    setInterval(async () => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/validate`, {
                    headers: {
                        'Authorization': `Bearer ${currentToken}`
                    }
                });
                
                if (!response.ok) {
                    localStorage.clear();
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error('Erro na validação:', error);
            }
        }
    }, 60000); // Validar a cada minuto
}

// ============================================
// Página Inicial (Index)
// ============================================

// Animação suave para links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Adicionar efeito de fade-in nos elementos
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .step, .player-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Adicionar classe fade-in quando elemento aparece
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// ============================================
// Funções Globais
// ============================================

// Verificar conexão com a API
async function checkAPIStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/status`);
        const data = await response.json();
        console.log('API Status:', data);
        return data.status === 'online';
    } catch (error) {
        console.error('API offline:', error);
        return false;
    }
}

// Formatar data
function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Salvar preferências do usuário
function saveUserPreference(key, value) {
    localStorage.setItem(`pref_${key}`, JSON.stringify(value));
}

// Carregar preferências do usuário
function loadUserPreference(key) {
    const value = localStorage.getItem(`pref_${key}`);
    return value ? JSON.parse(value) : null;
}

// ============================================
// Proteção de Rotas
// ============================================

// Lista de páginas que requerem autenticação
const protectedPages = ['dashboard.html'];

// Verificar proteção de página
const currentPage = window.location.pathname.split('/').pop();
if (protectedPages.includes(currentPage)) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// ============================================
// Inicialização
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sistema IPTV - Inicializado');
    checkAPIStatus();
});

// ADICIONADO

// Adicionar ao final do script.js existente

// Função para carregar estatísticas na página inicial
async function loadHomeStats() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        const channelCount = document.getElementById('channel-count');
        if (channelCount) {
            // Simular número de canais (pode ser obtido do arquivo stats.json)
            channelCount.textContent = '500+';
        }
        
        const userCount = document.getElementById('user-count');
        if (userCount) {
            userCount.textContent = '1000+';
        }
        
        const apiStatus = document.getElementById('apiStatus');
        if (apiStatus) {
            apiStatus.innerHTML = '🟢 Sistema Online';
            apiStatus.classList.add('online');
        }
    } catch (error) {
        console.error('Erro ao carregar stats:', error);
    }
}

// Chamar no DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.hero')) {
        loadHomeStats();
    }
});

// Função para abrir o player
function openPlayer() {
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Faça login para acessar o player', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return false;
    }
    window.location.href = 'player.html';
    return true;
}

// ADICIONADO

// Adicionar ao final do script.js existente

// Loader
window.addEventListener('load', () => {
    const loader = document.querySelector('.page-loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 500);
    }
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar && window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else if (navbar) {
        navbar.classList.remove('scrolled');
    }
});

// Animação de números (counter)
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateNumber = () => {
            current += step;
            if (current < target) {
                stat.textContent = Math.floor(current);
                requestAnimationFrame(updateNumber);
            } else {
                stat.textContent = target;
            }
        };
        
        updateNumber();
    });
}

// Intersection Observer para animações
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            
            // Se for seção de estatísticas, animar números
            if (entry.target.classList.contains('stats')) {
                animateNumbers();
            }
            
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar elementos para fade-in
document.querySelectorAll('.feature-card, .step, .player-card, .tip-card, .testimonial-card, .stats').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Adicionar classe fade-in
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Tooltips dinâmicos
document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.textContent = element.getAttribute('data-tooltip');
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 5px 10px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            white-space: nowrap;
            font-family: 'Inter', sans-serif;
        `;
        document.body.appendChild(tooltip);
        
        const updatePosition = (e) => {
            tooltip.style.left = e.pageX + 15 + 'px';
            tooltip.style.top = e.pageY - 25 + 'px';
        };
        
        updatePosition(e);
        
        element.addEventListener('mousemove', updatePosition);
        
        element.addEventListener('mouseleave', () => {
            tooltip.remove();
            element.removeEventListener('mousemove', updatePosition);
        }, { once: true });
    });
});

// Efeito de partículas (opcional - para o hero)
function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: linear-gradient(135deg, #6366f1, #ec4899);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatParticle ${3 + Math.random() * 5}s linear infinite;
            opacity: ${0.3 + Math.random() * 0.5};
        `;
        hero.appendChild(particle);
    }
}

// Adicionar animação de partículas
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes floatParticle {
        0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyle);

// Iniciar partículas após o load
window.addEventListener('load', () => {
    createParticles();
});

// Efeito de hover em cards
document.querySelectorAll('.feature-card, .player-card, .info-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// Smooth scroll para links âncora
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});