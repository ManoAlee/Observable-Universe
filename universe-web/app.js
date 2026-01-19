async function loadManifest(){
  try{
    const res = await fetch('../universe/manifest.json');
    if(!res.ok) throw new Error('Não foi possível carregar manifest.json');
    const manifest = await res.json();
    renderOverview(manifest);
    renderClusters(manifest.clusters || []);
    renderFrontendTech();
  }catch(e){
    document.getElementById('overview-body').innerText = e.message;
    document.getElementById('clusters-list').innerText = 'Erro ao carregar clusters.';
  }
}

function renderOverview(m){
  const el = document.getElementById('overview-body');
  el.innerHTML = `
    <p><strong>Universo:</strong> ${m.universe}</p>
    <p><strong>Princípios:</strong> reversibilidade, conservação de informação, sincronização global.</p>
    <p><strong>Boot sequence:</strong> ${m.boot_sequence.join(', ')}</p>
  `;
}

function renderClusters(clusters){
  const list = document.getElementById('clusters-list');
  list.innerHTML = '';
  clusters.forEach(c=>{
    const div = document.createElement('div');
    div.className = 'cluster-card';
    const techs = c.technologies? Object.entries(c.technologies).flatMap(([k,v])=>v) : [];
    div.innerHTML = `
      <h3>${c.name} <small style="color:#94a3b8">(${c.root})</small></h3>
      <p>${c.notes || ''}</p>
      <div><strong>Foco:</strong> ${ (c.focus||[]).join(', ') }</div>
      <div style="margin-top:8px"><strong>Tecnologias:</strong></div>
      <div class="tech-list">${techs.map(t=>`<span class="chip">${t}</span>`).join('')}</div>
    `;
    list.appendChild(div);
  });
}

function renderFrontendTech(){
  const el = document.getElementById('frontend-body');
  const frontend = {
    agents:[
      {name:'React',why:'Component model, vasta comunidade, SSR/SSG com Next.js'},
      {name:'Vue',why:'API reativa, ótimo DX, Nuxt para SSR'},
      {name:'Svelte',why:'compilação a build-time, bundles pequenos'},
      {name:'Solid',why:'reatividade fina e alto desempenho'}
    ],
    tools:['TypeScript','Vite','Webpack','Tailwind CSS','PostCSS','ESLint','Prettier','Cypress','Playwright','Storybook'],
    patterns:['Atomic Design','Design Tokens','Accessible-first (WCAG)','i18n','Progressive Enhancement','Microfrontends']
  };

  el.innerHTML = `
    <p>Lista recomendada de frameworks/agents para front-end e suas vantagens.</p>
    <h4>Agents</h4>
    <div class="tech-list">${frontend.agents.map(a=>`<span class="chip">${a.name} — ${a.why}</span>`).join('')}</div>
    <h4 style="margin-top:12px">Ferramentas</h4>
    <div class="tech-list">${frontend.tools.map(t=>`<span class="chip">${t}</span>`).join('')}</div>
    <h4 style="margin-top:12px">Padrões</h4>
    <div class="tech-list">${frontend.patterns.map(p=>`<span class="chip">${p}</span>`).join('')}</div>
    <p style="margin-top:12px;color:#94a3b8">Sugestão de stack inicial: <strong>React + TypeScript + Vite + Tailwind + Storybook + Playwright</strong>.</p>
  `;
}

// Iniciar
loadManifest();
