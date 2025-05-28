const APP_CONFIG = {
  GIST_ID: '237f0263b3b32cfb9332a5f63258b0c3',
  GITHUB_USERNAMES: ['joaogabrielsilvarabelo', 'Frozen-Heat'],
  PROFILE_IMAGE_URL: 'assets/images/perfil.png',
  featuredProjectCount: 6,
  animationDelay: 100,
  cacheTTL: 1000 * 60 * 60
};

let cachedData = { curriculoInfo: null, githubProjects: null };
let uiState = { projectsLoaded: false, curriculoLoaded: false };

// Mock data for fallback
const mockCurriculo = {
  nome: "João Gabriel",
  contato: { email: "joaosrabelo@gmail.com", github: "https://github.com/joaogabrielsilvarabelo", telefone: "(00) 1234-5678" },
  bemvindo: "Olá visitante! Se esse texto aparecer, talvez algo ruim aconteceu!",
  sobreMim: "Olá visitante! Se esse texto aparecer, talvez algo ruim aconteceu!",
  objetivos: "Contribuir para projetos inovadores e aprender continuamente.",
  formacao: [{ curso: "Engenharia de Software", periodo: "2024-", instituicao: "Icev" }],
  projetosRelevantes: [{ titulo: "Projeto X", periodo: "2023", organizacao: "Org Y", descricao: "Descrição do projeto." }],
  experiencias: []
};

async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // Optional: Add GitHub token to increase rate limits
          // 'Authorization': 'token YOUR_TOKEN'
        }
      });
      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i < retries - 1 && error.message.includes('Rate limit')) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
}

async function fetchGitHubProjects() {
  try {
    const repos = [];
    for (const username of APP_CONFIG.GITHUB_USERNAMES) {
      const userRepos = await fetchWithRetry(`https://api.github.com/users/${username}/repos?sort=created&direction=desc&per_page=10`);
      repos.push(...userRepos.map(repo => ({ ...repo, username })));
    }
    repos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    cachedData.githubProjects = repos;
    uiState.projectsLoaded = true;
    saveToLocalStorage('githubProjects', repos);
    renderProjects(repos);
  } catch (error) {
    console.error('Erro ao carregar repositórios:', error);
    showErrorMessage('projetos', `Não foi possível carregar os projetos do GitHub: ${error.message}. Usando dados de exemplo.`);
    renderProjects([]); 
  }
}

function renderProjects(repos) {
  const featuredContainer = document.getElementById('featured-projects');
  const projectTrack = document.getElementById('github-projects-track');
  if (!featuredContainer || !projectTrack) return;

  featuredContainer.innerHTML = '';
  projectTrack.innerHTML = '';

  const fragmentFeatured = document.createDocumentFragment();
  const fragmentScroll = document.createDocumentFragment();

  repos.slice(0, APP_CONFIG.featuredProjectCount).forEach(repo => {
    const card = createProjectCard(repo);
    fragmentFeatured.appendChild(card);
  });

  repos.slice(APP_CONFIG.featuredProjectCount, APP_CONFIG.featuredProjectCount + 5).forEach(repo => {
    const card = createProjectCard(repo);
    fragmentScroll.appendChild(card);
  });

  featuredContainer.appendChild(fragmentFeatured);
  projectTrack.appendChild(fragmentScroll);
}

function createProjectCard(repo) {
  const card = document.createElement('div');
  card.className = 'project-card';
  const description = repo.description || 'Sem descrição';
  const language = repo.language || 'Desconhecido';
  const hasHomepage = repo.homepage && repo.homepage !== '';
  card.innerHTML = `
    <div class="card-header">
      <h3>${hasHomepage ? `<a href="${repo.homepage}" target="_blank">${repo.name} 🔗</a>` : repo.name}</h3>
      <div class="creation-date">${formatDate(repo.created_at)}</div>
    </div>
    <div class="card-body">
      <p class="card-description">${description}</p>
      <div class="card-actions">
        <a href="${repo.html_url}" class="card-button" target="_blank">Ver Repositório</a>
        <span class="language-badge">${language}</span>
      </div>
    </div>
  `;
  return card;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

async function fetchGistData() {
  try {
    const response = await fetch(`https://api.github.com/gists/${APP_CONFIG.GIST_ID}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const gist = await response.json();
    const data = JSON.parse(gist.files['curriculo.json']?.content || '{}');
    cachedData.curriculoInfo = data;
    uiState.curriculoLoaded = true;
    saveToLocalStorage('curriculoInfo', data);
    updateCurriculoUI(data);
  } catch (error) {
    console.error('Erro ao carregar Gist:', error);
    updateCurriculoUI(mockCurriculo);
  }
}

function updateCurriculoUI(data) {
  document.title = `Meu Currículo - ${data.nome}`;
  document.getElementById('nome-header').textContent = data.nome;
  document.getElementById('email').innerHTML = `<a href="mailto:${data.contato.email}">${data.contato.email}</a>`;
  document.getElementById('github').href = data.contato.github;
  document.getElementById('github').textContent = data.contato.github.split('/').pop();
  document.getElementById('telefone').textContent = data.contato.telefone || mockCurriculo.contato.telefone;
  
  document.getElementById('welcome-text').textContent = data.bemvindo || mockCurriculo.bemvindo;
  document.getElementById('sobre-mim-text').textContent = data.sobreMim || mockCurriculo.sobreMim;
  document.getElementById('objetivos-text').textContent = data.objetivos || mockCurriculo.objetivos;

  const formacaoList = document.getElementById('formacao-list');
  formacaoList.innerHTML = '';
  data.formacao.forEach(item => {
    const element = document.createElement('div');
    element.className = 'timeline-item';
    element.innerHTML = `
      <div class="timeline-header">
        <span class="timeline-title">${item.curso}</span>
        <span class="timeline-period">${item.periodo}</span>
      </div>
      <div class="timeline-subtitle">${item.instituicao}</div>
    `;
    formacaoList.appendChild(element);
  });

  const projetosRelevantesList = document.getElementById('projetos-relevantes-list');
  projetosRelevantesList.innerHTML = '';
  data.projetosRelevantes.forEach(item => {
    const element = document.createElement('div');
    element.className = 'timeline-item';
    element.innerHTML = `
      <div class="timeline-header">
        <span class="timeline-title">${item.titulo}</span>
        <span class="timeline-period">${item.periodo}</span>
      </div>
      <div class="timeline-subtitle">${item.organizacao}</div>
      <div class="timeline-content">${item.descricao}</div>
    `;
    projetosRelevantesList.appendChild(element);
  });
}

function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
  } catch (error) {
    console.error(`Erro ao salvar ${key}:`, error);
  }
}

function loadFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    const { value, timestamp } = JSON.parse(data);
    if (Date.now() - timestamp > APP_CONFIG.cacheTTL) {
      localStorage.removeItem(key);
      return null;
    }
    return value;
  } catch (error) {
    console.error(`Erro ao carregar ${key}:`, error);
    return null;
  }
}

function showErrorMessage(sectionId, message) {
  const section = document.getElementById(sectionId);
  if (section) section.innerHTML = `<p>${message}</p>`;
}

function setupThemeDetection() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) document.body.classList.add('dark-mode');
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    document.body.classList.toggle('dark-mode', e.matches);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupThemeDetection();

  const cachedCurriculo = loadFromLocalStorage('curriculoInfo');
  const cachedProjects = loadFromLocalStorage('githubProjects');

  if (cachedCurriculo) {
    cachedData.curriculoInfo = cachedCurriculo;
    uiState.curriculoLoaded = true;
    updateCurriculoUI(cachedCurriculo);
  } else {
    fetchGistData();
  }

  if (cachedProjects) {
    cachedData.githubProjects = cachedProjects;
    uiState.projectsLoaded = true;
    renderProjects(cachedProjects);
  } else {
    fetchGitHubProjects();
  }
});