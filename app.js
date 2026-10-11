/* PelsPlezier Pro — demo frontend
   Data is persisted in localStorage for this browser only.
   Replace the storage adapter with your authenticated backend/Filestore integration for production. */
(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const STORAGE_KEY = "pelsplezier-pro-demo-v1";
  const today = "2026-10-11";
  const initialData = {
    tasks: [
      {id:"PP-1048",client:"Sofie Peeters",pet:"Milo · hond",service:"Hondenuitlaat",date:"2026-10-11",time:"14:00",worker:"Emma Jacobs",status:"Bevestigd",price:24,area:"Willebroek",notes:""},
      {id:"PP-1049",client:"Thomas Vermeulen",pet:"Luna · kat",service:"Huisbezoek",date:"2026-10-11",time:"16:30",worker:"Nog toe te wijzen",status:"Nieuw",price:18,area:"Boom",notes:""},
      {id:"PP-1050",client:"Julie Maes",pet:"Max · hond",service:"Dagoppas",date:"2026-10-12",time:"09:00",worker:"Noah Willems",status:"Bevestigd",price:65,area:"Puurs-Sint-Amands",notes:""},
      {id:"PP-1051",client:"Sarah Jacobs",pet:"Nala · kat",service:"Huisbezoek",date:"2026-10-12",time:"18:00",worker:"Emma Jacobs",status:"In uitvoering",price:22,area:"Willebroek",notes:""},
      {id:"PP-1052",client:"Pieter De Smet",pet:"Oscar · hond",service:"Hondenuitlaat",date:"2026-10-13",time:"11:00",worker:"Lotte Verhaegen",status:"Bevestigd",price:28,area:"Klein-Willebroek",notes:""}
    ],
    workers: [
      {id:"W-01",name:"Emma Jacobs",area:"Willebroek",services:"Hondenuitlaat, huisbezoek",status:"Actief",jobs:18,revenue:620,initials:"EJ",email:"emma@example.be",phone:"0470 12 34 56"},
      {id:"W-02",name:"Noah Willems",area:"Puurs-Sint-Amands",services:"Dagoppas, huisbezoek",status:"Actief",jobs:14,revenue:540,initials:"NW",email:"noah@example.be",phone:"0472 23 45 67"},
      {id:"W-03",name:"Lotte Verhaegen",area:"Boom",services:"Hondenuitlaat, dagoppas",status:"Actief",jobs:11,revenue:395,initials:"LV",email:"lotte@example.be",phone:"0475 34 56 78"},
      {id:"W-04",name:"Milan De Clercq",area:"Willebroek",services:"Huisbezoek",status:"In afwachting",jobs:0,revenue:0,initials:"MD",email:"milan@example.be",phone:""}
    ],
    clients: [
      {id:"C-01",name:"Sofie Peeters",email:"sofie@example.be",phone:"0470 12 34 56",area:"Willebroek",pets:"Milo · hond",jobs:8},
      {id:"C-02",name:"Thomas Vermeulen",email:"thomas@example.be",phone:"0472 23 45 67",area:"Boom",pets:"Luna · kat",jobs:2},
      {id:"C-03",name:"Julie Maes",email:"julie@example.be",phone:"0475 34 56 78",area:"Puurs-Sint-Amands",pets:"Max · hond",jobs:5},
      {id:"C-04",name:"Sarah Jacobs",email:"sarah@example.be",phone:"0478 45 67 89",area:"Willebroek",pets:"Nala · kat",jobs:4}
    ],
    messages: [
      {id:"M-01",title:"Aanvraag ontvangen",channel:"E-mail",text:"Dag {voornaam}, bedankt voor je aanvraag bij PelsPlezier! We bekijken de planning en laten je snel iets weten.",active:true},
      {id:"M-02",title:"Opdracht bevestigd",channel:"WhatsApp",text:"Hey {voornaam}! Je opdracht voor {datum} om {uur} is bevestigd. Je krijgt binnenkort de praktische gegevens.",active:true},
      {id:"M-03",title:"Herinnering aan partner",channel:"E-mail",text:"Dag {partner}, je opdracht bij {klant} staat gepland op {datum} om {uur}. Controleer even de instructies.",active:true},
      {id:"M-04",title:"Update na bezoek",channel:"WhatsApp",text:"Dag {voornaam}, het bezoek aan {dier} is afgerond. De update en foto's worden zo meteen bezorgd.",active:true},
      {id:"M-05",title:"Betaalopvolging",channel:"E-mail",text:"Dag {voornaam}, we sturen je graag een vriendelijke herinnering over de openstaande betaling voor {opdracht}.",active:false}
    ],
    settings: {businessName:"PelsPlezier",region:"Willebroek & omstreken",commission:10}
  };
  let data = loadData();
  let currentPage = "Overzicht";
  let taskFilter = "Alle";
  let taskSearch = "";
  let clientSearch = "";
  let workerSearch = "";
  let messageSearch = "";
  let analyticsPeriod = "Deze maand";
  let calendarDate = new Date(2026,9,11);
  let selectedSettings = "Algemeen";
  let activeMessageId = null;
  let editingTaskId = null;
  let editingMessageId = null;
  let toastTimer;

  function loadData(){
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return structuredClone(initialData);
      const parsed = JSON.parse(saved);
      return {...structuredClone(initialData), ...parsed};
    } catch(e) { return structuredClone(initialData); }
  }
  function saveData(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch(e) { console.warn("Lokale opslag niet beschikbaar", e); }
  }
  function esc(value=""){
    return String(value).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function eur(value){
    return new Intl.NumberFormat("nl-BE",{style:"currency",currency:"EUR",maximumFractionDigits:2}).format(Number(value)||0);
  }
  function shortDate(value){
    if(!value) return "—";
    return new Intl.DateTimeFormat("nl-BE",{day:"2-digit",month:"short"}).format(new Date(value+"T12:00:00")).replace(".","");
  }
  function longDate(value){
    if(!value) return "—";
    return new Intl.DateTimeFormat("nl-BE",{weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(new Date(value+"T12:00:00"));
  }
  function initials(name=""){
    return name.split(/\s+/).filter(Boolean).slice(0,2).map(n=>n[0].toUpperCase()).join("") || "PP";
  }
  function statusClass(status){
    if(status==="Nieuw"||status==="In afwachting") return "badge-amber";
    if(status==="Bevestigd"||status==="Actief"||status==="Afgerond") return "badge-green";
    if(status==="In uitvoering") return "badge-blue";
    if(status==="Geannuleerd"||status==="Gepauzeerd") return "badge-red";
    return "badge-gray";
  }
  function badge(status){return `<span class="badge ${statusClass(status)}">${esc(status)}</span>`;}
  function taskValue(tasks=data.tasks){return tasks.reduce((sum,t)=>sum+(Number(t.price)||0),0);}
  function commission(tasks=data.tasks){return taskValue(tasks)*(Number(data.settings.commission)||10)/100;}
  function showToast(message){
    const el=$("#toast"); el.textContent=message; el.classList.remove("hidden");
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.add("hidden"),3600);
  }
  function go(page){
    currentPage=page;
    $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
    $("#breadcrumbPage").textContent=page;
    $("#pageTitle").textContent=page==="Overzicht"?"Goedemiddag 👋":page;
    const subtitles={
      "Overzicht":"Hier is wat er vandaag speelt binnen jouw regio.",
      "Aanvragen":"Volg nieuwe aanvragen op en wijs ze toe aan de juiste partner.",
      "Opdrachten":"Alle opdrachten op één plek, van aanvraag tot afronding.",
      "Planning":"Bekijk de bezetting en opdrachten per dag.",
      "Partners":"Beheer zelfstandige partners, hun diensten en regio's.",
      "Klanten & dieren":"Alle klantgegevens en praktische dierenfiches bij elkaar.",
      "Berichten & automatisaties":"Bespaar tijd met sjablonen en vaste opvolgmomenten.",
      "Financiën":"Volg opdrachtwaarde en de indicatieve platformbijdrage op.",
      "Analytics":"Bekijk de belangrijkste cijfers van jouw regio.",
      "Instellingen":"Beheer de instellingen en toekomstige integraties."
    };
    $("#pageSubtitle").textContent=subtitles[page]||"";
    $("#newButton").classList.toggle("hidden",!["Overzicht","Aanvragen","Opdrachten","Partners","Klanten & dieren"].includes(page));
    $("#newButton").innerHTML=page==="Partners"?"<span>＋</span> Partner toevoegen":page==="Klanten & dieren"?"<span>＋</span> Klant toevoegen":"<span>＋</span> Nieuwe opdracht";
    $("#pageEyebrow").textContent="ZONDAG 11 OKTOBER 2026 · WILLEBROEK";
    $("#globalSearch").value="";
    render();
    $("#sidebar").classList.remove("open");
  }
  function render(){
    $("#requestCount").textContent=data.tasks.filter(t=>t.status==="Nieuw").length;
    const content=$("#pageContent");
    const pages={
      "Overzicht":renderOverview,
      "Aanvragen":()=>renderTasks(true),
      "Opdrachten":()=>renderTasks(false),
      "Planning":renderCalendar,
      "Partners":renderWorkers,
      "Klanten & dieren":renderClients,
      "Berichten & automatisaties":renderMessages,
      "Financiën":renderFinance,
      "Analytics":renderAnalytics,
      "Instellingen":renderSettings
    };
    content.innerHTML=(pages[currentPage]||renderOverview)();
    bindPageEvents();
  }
  function renderOverview(){
    const newTasks=data.tasks.filter(t=>t.status==="Nieuw");
    const upcoming=data.tasks.filter(t=>["Bevestigd","In uitvoering"].includes(t.status)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,4);
    const completed=data.tasks.filter(t=>t.status==="Afgerond").length;
    return `
      <div class="stats-grid">
        <article class="stat-card"><div class="stat-top"><span class="stat-icon">↳</span><span class="stat-change">${newTasks.length?"Opvolgen":"Alles bijgewerkt"}</span></div><div class="stat-value">${newTasks.length}</div><div class="stat-label">Nieuwe aanvragen</div><div class="stat-foot">Aanvragen die aandacht vragen</div></article>
        <article class="stat-card"><div class="stat-top"><span class="stat-icon">▣</span><span class="stat-change">Planning</span></div><div class="stat-value">${data.tasks.filter(t=>["Bevestigd","In uitvoering"].includes(t.status)).length}</div><div class="stat-label">Geplande opdrachten</div><div class="stat-foot">Bevestigd of in uitvoering</div></article>
        <article class="stat-card"><div class="stat-top"><span class="stat-icon">♧</span><span class="stat-change">${data.workers.filter(w=>w.status==="Actief").length} actief</span></div><div class="stat-value">${data.workers.length}</div><div class="stat-label">Partners in netwerk</div><div class="stat-foot">Zelfstandige dierenzorgpartners</div></article>
        <article class="stat-card"><div class="stat-top"><span class="stat-icon">€</span><span class="stat-change">Indicatief</span></div><div class="stat-value">${eur(commission())}</div><div class="stat-label">Platformbijdrage · 10%</div><div class="stat-foot">Berekend op demo-opdrachtwaarde</div></article>
      </div>
      <div class="dashboard-grid">
        <div class="stack">
          <section class="panel"><div class="panel-head"><div><h2 class="panel-title">Opvolging vereist</h2><p class="panel-subtitle">Nieuwe aanvragen die nog bevestigd moeten worden.</p></div><span class="badge ${newTasks.length?"badge-amber":"badge-green"}">${newTasks.length} open</span></div>
          <div class="request-list">${newTasks.length?newTasks.slice(0,4).map(t=>`
            <div class="request-item"><div class="request-avatar">🐾</div><div class="request-main"><b>${esc(t.client)}</b><small>${esc(t.service)} · ${esc(t.area)} · ${shortDate(t.date)}</small></div><div class="request-price">${eur(t.price)}</div><div class="request-actions"><button class="mini-btn" data-action="confirm-task" data-id="${t.id}">Bevestigen</button><button class="mini-btn" data-action="edit-task" data-id="${t.id}">Openen</button></div></div>`).join(""):`<div class="empty-state">✓<strong>Je bent helemaal bijgewerkt</strong>Er staan geen nieuwe aanvragen open.</div>`}</div>
          <div style="margin-top:13px"><button class="link-button" data-page="Aanvragen">Alle aanvragen bekijken →</button></div></section>
          <section class="panel"><div class="panel-head"><div><h2 class="panel-title">Komende opdrachten</h2><p class="panel-subtitle">De eerstvolgende ingeplande bezoeken.</p></div><button class="link-button" data-page="Planning">Bekijk planning →</button></div>
          <div class="task-list">${upcoming.length?upcoming.map(t=>`<div class="task-item"><div class="task-date"><b>${esc((t.date||"").slice(8,10))}</b><small>${esc((t.date||"").slice(5,7)==="10"?"OKT":"MAA")}</small></div><div class="task-main"><b>${esc(t.client)} <span style="font-weight:400;color:#84907f">· ${esc(t.service)}</span></b><small>${esc(t.time)} · ${esc(t.worker)} · ${esc(t.area)}</small></div>${badge(t.status)}<div class="task-value">${eur(t.price)}</div></div>`).join(""):`<div class="empty-state">Nog geen komende opdrachten.</div>`}</div></section>
        </div>
        <div class="stack">
          <section class="panel"><div class="panel-head"><div><h2 class="panel-title">Regio in cijfers</h2><p class="panel-subtitle">Overzicht op basis van de demo-opdrachten.</p></div><button class="link-button" data-page="Analytics">Analytics →</button></div>
            <div class="region-stats"><div><div class="region-big">${eur(taskValue())}</div><div class="region-label">Totale opdrachtwaarde</div></div><div><div class="region-big">${data.clients.length}</div><div class="region-label">Klanten in overzicht</div></div></div>
            <div style="margin-top:22px"><div class="metric-row"><span>Voltooide opdrachten</span><b>${completed}</b></div><div class="metric-row"><span>Actieve partners</span><b>${data.workers.filter(w=>w.status==="Actief").length}</b></div><div class="metric-row"><span>Platformbijdrage (10%)</span><b>${eur(commission())}</b></div></div>
            <p class="panel-subtitle" style="line-height:1.6;margin-top:13px">Dit zijn voorbeeldgegevens en geen echte omzet- of boekhoudcijfers.</p>
          </section>
          <section class="panel"><div class="panel-head"><div><h2 class="panel-title">Snelle acties</h2><p class="panel-subtitle">Veelgebruikte onderdelen.</p></div></div>
            <div class="quick-action"><span class="quick-icon">＋</span><div><b>Nieuwe opdracht</b><small>Registreer een klantaanvraag</small></div><span>→</span></div>
            <div class="quick-action" data-page="Partners" role="button" tabindex="0"><span class="quick-icon">♧</span><div><b>Partner beheren</b><small>Bekijk regio en beschikbaarheid</small></div><span>→</span></div>
            <div class="quick-action" data-page="Berichten & automatisaties" role="button" tabindex="0"><span class="quick-icon">☷</span><div><b>Bericht klaarzetten</b><small>Gebruik een vooraf gemaakt sjabloon</small></div><span>→</span></div>
            <div class="quick-action" data-page="Financiën" role="button" tabindex="0"><span class="quick-icon">€</span><div><b>Maandafsluiting</b><small>Bekijk de indicatieve bijdrage</small></div><span>→</span></div>
          </section>
        </div>
      </div>
      <div class="overview-bottom"><section class="panel"><div class="panel-head"><div><h2 class="panel-title">Partnernetwerk</h2><p class="panel-subtitle">Status van de zelfstandige partners.</p></div><button class="link-button" data-page="Partners">Alle partners →</button></div>${data.workers.slice(0,3).map(w=>`<div class="task-item"><div class="table-avatar">${esc(w.initials)}</div><div class="task-main"><b>${esc(w.name)}</b><small>${esc(w.area)} · ${esc(w.services)}</small></div>${badge(w.status)}</div>`).join("")}</section>
      <section class="panel"><div class="panel-head"><div><h2 class="panel-title">Automatisaties om te activeren</h2><p class="panel-subtitle">Voorstel voor minder manueel werk.</p></div><button class="link-button" data-page="Berichten & automatisaties">Bekijk →</button></div>
      <div class="quick-action"><span class="quick-icon">✉</span><div><b>Ontvangstbevestiging</b><small>Na het binnenkomen van een aanvraag</small></div><span>↗</span></div><div class="quick-action"><span class="quick-icon">◷</span><div><b>Herinnering aan partner</b><small>Voor de start van een opdracht</small></div><span>↗</span></div><div class="quick-action"><span class="quick-icon">✓</span><div><b>Update na bezoek</b><small>Na afronding van de opdracht</small></div><span>↗</span></div></section></div>`;
  }
  function renderTasks(onlyNew=false){
    const tasks=data.tasks.filter(t=>(!onlyNew||t.status==="Nieuw")&&(taskFilter==="Alle"||t.status===taskFilter)&&[t.id,t.client,t.pet,t.service,t.worker,t.area].join(" ").toLowerCase().includes(taskSearch.toLowerCase())).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
    return `<section class="panel"><div class="panel-head"><div><h2 class="panel-title">${onlyNew?"Aanvragen opvolgen":"Alle opdrachten"}</h2><p class="panel-subtitle">${tasks.length} resultaat/resultaten · beheer opdrachten van aanvraag tot afronding.</p></div><button class="btn btn-primary" data-action="new-task">＋ Nieuwe opdracht</button></div>
      <div class="toolbar"><div class="search-input"><span>⌕</span><input id="taskSearch" value="${esc(taskSearch)}" placeholder="Zoek klant, partner, dienst of regio..."></div><select id="taskFilter" class="filter-select">${["Alle","Nieuw","Bevestigd","In uitvoering","Afgerond","Geannuleerd"].map(s=>`<option ${s===taskFilter?"selected":""}>${s}</option>`).join("")}</select></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Opdracht / klant</th><th>Dienst & dier</th><th>Datum & uur</th><th>Partner</th><th>Status</th><th>Bedrag</th><th>Acties</th></tr></thead><tbody>${tasks.map(t=>`<tr><td><div class="table-person"><div class="table-avatar">${esc(initials(t.client))}</div><div><b>${esc(t.client)}</b><small>${esc(t.id)} · ${esc(t.area)}</small></div></div></td><td>${esc(t.service)}<small style="display:block;color:#8a9486;margin-top:4px">${esc(t.pet||"Nog niet ingevuld")}</small></td><td>${shortDate(t.date)}<small style="display:block;color:#8a9486;margin-top:4px">${esc(t.time||"—")}</small></td><td>${esc(t.worker)}</td><td><select class="filter-select status-select" data-id="${t.id}" aria-label="Status ${esc(t.id)}">${["Nieuw","Bevestigd","In uitvoering","Afgerond","Geannuleerd"].map(s=>`<option ${s===t.status?"selected":""}>${s}</option>`).join("")}</select></td><td><b>${eur(t.price)}</b></td><td><div class="table-actions"><button class="mini-btn" data-action="edit-task" data-id="${t.id}" title="Bewerken">Bewerk</button><button class="mini-btn danger" data-action="delete-task" data-id="${t.id}" title="Verwijderen">×</button></div></td></tr>`).join("")}</tbody></table></div>${tasks.length?"":`<div class="empty-state">⌕<strong>Geen opdrachten gevonden</strong>Pas je zoekterm of filters aan.</div>`}</section>`;
  }
  function renderWorkers(){
    const list=data.workers.filter(w=>[w.name,w.area,w.services,w.status,w.email].join(" ").toLowerCase().includes(workerSearch.toLowerCase()));
    return `<div class="toolbar"><div class="search-input"><span>⌕</span><input id="workerSearch" value="${esc(workerSearch)}" placeholder="Zoek partner of regio..."></div><select class="filter-select" id="workerFilter"><option>Alle statussen</option><option>Actief</option><option>In afwachting</option><option>Gepauzeerd</option></select><button class="btn btn-primary" data-action="new-partner">＋ Partner toevoegen</button></div>
      <div class="worker-grid">${list.map(w=>`<article class="worker-card"><div class="worker-card-top"><div class="worker-avatar">${esc(w.initials||initials(w.name))}</div><div style="flex:1;min-width:0"><h3>${esc(w.name)}</h3><div class="sub">${esc(w.area)}</div></div>${badge(w.status)}</div><div class="worker-meta"><div><small>Opdrachten</small><b>${Number(w.jobs)||0}</b></div><div><small>Opdrachtwaarde</small><b>${eur(w.revenue)}</b></div></div><div class="worker-services">${esc(w.services||"Diensten nog niet ingevuld")}<br>${esc(w.email||"Geen e-mail")}<br>${esc(w.phone||"Geen telefoon")}</div><div class="card-actions"><button class="mini-btn" data-action="worker-details" data-id="${w.id}">Profiel bekijken</button><button class="mini-btn" data-action="toggle-worker" data-id="${w.id}">${w.status==="Actief"?"Pauzeren":"Activeren"}</button></div></article>`).join("")}</div>${list.length?"":`<section class="panel empty-state">♧<strong>Geen partners gevonden</strong>Probeer een andere zoekterm.</section>`}
      <section class="panel" style="margin-top:18px"><div class="panel-head"><div><h2 class="panel-title">Checklist nieuwe partner</h2><p class="panel-subtitle">Aanbevolen controles voor je iemand actief laat starten.</p></div><span class="badge badge-gray">Checklist</span></div><div class="form-grid">${["Kennismakingsgesprek afgerond","Identiteit en zelfstandigenstatuut gecontroleerd","Verzekering en vereiste documenten gecontroleerd","Regio en aangeboden diensten ingesteld","Samenwerkingsafspraken bevestigd"].map((x,i)=>`<label style="display:flex;align-items:center;gap:9px;font-size:11px;color:#586654"><input type="checkbox" class="checklist-item" data-key="${i}" style="accent-color:#527953"> ${x}</label>`).join("")}</div><p class="panel-subtitle" style="margin-top:14px">Deze checklist is lokaal en tijdelijk; voor productie moet de voortgang opgeslagen worden.</p></section>`;
  }
  function renderClients(){
    const list=data.clients.filter(c=>[c.name,c.email,c.area,c.pets,c.phone].join(" ").toLowerCase().includes(clientSearch.toLowerCase()));
    return `<div class="toolbar"><div class="search-input"><span>⌕</span><input id="clientSearch" value="${esc(clientSearch)}" placeholder="Zoek klant, dier of regio..."></div><button class="btn btn-primary" data-action="new-client">＋ Klant toevoegen</button></div>
    <div class="client-grid">${list.map(c=>`<article class="client-card"><div class="client-card-top"><div class="worker-avatar" style="background:#f4e8dc;color:#8e6b52">♡</div><div style="min-width:0;flex:1"><h3>${esc(c.name)}</h3><div class="sub">${esc(c.area)}</div></div></div><div class="client-pet">🐾 &nbsp; ${esc(c.pets||"Dier nog niet ingevuld")}</div><div class="client-details"><span>✉ &nbsp;${esc(c.email||"Geen e-mail")}</span><span>☎ &nbsp;${esc(c.phone||"Geen telefoon")}</span><span>▣ &nbsp;${Number(c.jobs)||0} eerdere opdrachten</span></div><div class="card-actions"><button class="mini-btn" data-action="client-details" data-id="${c.id}">Klantfiche</button><button class="mini-btn" data-action="edit-client" data-id="${c.id}">Bewerken</button></div></article>`).join("")}</div>${list.length?"":`<section class="panel empty-state">♡<strong>Geen klanten gevonden</strong>Pas je zoekterm aan.`}
    <section class="panel" style="margin-top:18px"><div class="panel-head"><div><h2 class="panel-title">Aanbevolen velden voor dierenfiches</h2><p class="panel-subtitle">Praktische informatie die partners nodig kunnen hebben.</p></div></div><div class="form-grid">${["Karakter en omgang","Voeding en dagelijkse routine","Schriftelijke medicatie-instructies","Dierenarts en noodcontact","Toestemming voor foto's","Toegang tot woning en sleutelafspraken"].map(x=>`<div class="quick-action"><span class="quick-icon">♡</span><div><b>${x}</b><small>Alleen delen met bevoegde betrokkenen.</small></div></div>`).join("")}</div><div class="settings-warning">Bewaar klant- en diergegevens alleen wanneer nodig. Gevoelige toegangsinformatie hoort niet zichtbaar te zijn voor alle gebruikers.</div></section>`;
  }
  function renderCalendar(){
    const year=calendarDate.getFullYear(), month=calendarDate.getMonth();
    const first=new Date(year,month,1), start=(first.getDay()+6)%7, days=new Date(year,month+1,0).getDate();
    const prev=new Date(year,month,0).getDate();
    const names=["Ma","Di","Wo","Do","Vr","Za","Zo"];
    let cells=names.map(n=>`<div class="calendar-day header">${n}</div>`).join("");
    for(let i=0;i<42;i++){
      let day, actualMonth=month, muted=false;
      if(i<start){day=prev-start+i+1;actualMonth=month-1;muted=true;}
      else if(i>=start+days){day=i-(start+days)+1;actualMonth=month+1;muted=true;}
      else day=i-start+1;
      const d=new Date(year,actualMonth,day), iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      const todays=data.tasks.filter(t=>t.date===iso);
      cells+=`<div class="calendar-day" style="${muted?"opacity:.42":""}"><div class="day-number">${day}</div>${todays.slice(0,3).map(t=>`<div class="calendar-event" data-action="edit-task" data-id="${t.id}" title="${esc(t.client)}"><b>${esc(t.time||"—")}</b>${esc(t.client.split(" ")[0])} · ${esc(t.service)}</div>`).join("")}${todays.length>3?`<small>+${todays.length-3} meer</small>`:""}</div>`;
    }
    const monthName=new Intl.DateTimeFormat("nl-BE",{month:"long",year:"numeric"}).format(calendarDate);
    return `<section class="panel"><div class="calendar-toolbar"><button class="btn btn-secondary" data-action="calendar-prev">← Vorige</button><h3>${esc(monthName.charAt(0).toUpperCase()+monthName.slice(1))}</h3><button class="btn btn-secondary" data-action="calendar-next">Volgende →</button></div><div class="calendar-grid">${cells}</div><div class="week-note"><b>Planningscontrole:</b> controleer beschikbaarheid, reistijd, regio en overlappende afspraken voordat je een opdracht bevestigt. Klik op een opdracht om details te openen.</div></section>
    <div class="overview-bottom"><section class="panel"><h2 class="panel-title">Opdrachten deze maand</h2><div class="metric-row"><span>Totaal gepland / geregistreerd</span><b>${data.tasks.filter(t=>t.date?.startsWith(`${year}-${String(month+1).padStart(2,"0")}`)).length}</b></div><div class="metric-row"><span>Nog toe te wijzen</span><b>${data.tasks.filter(t=>t.worker==="Nog toe te wijzen").length}</b></div></section><section class="panel"><h2 class="panel-title">Slim plannen</h2><p class="panel-subtitle" style="line-height:1.7">De productieversie kan partners voorstellen op basis van regio, dienst, beschikbaarheid, rijtijd en eerdere afspraken. Conflicten moeten vóór bevestiging worden gesignaleerd.</p></section></div>`;
  }
  function renderMessages(){
    const list=data.messages.filter(m=>[m.title,m.channel,m.text].join(" ").toLowerCase().includes(messageSearch.toLowerCase()));
    return `<section class="panel" style="margin-bottom:18px"><div class="panel-head"><div><h2 class="panel-title">Berichten & automatisaties</h2><p class="panel-subtitle">Herbruikbare communicatie en workflows voor dagelijkse opvolging.</p></div><button class="btn btn-primary" data-action="new-message">＋ Sjabloon toevoegen</button></div><div class="toolbar"><div class="search-input"><span>⌕</span><input id="messageSearch" value="${esc(messageSearch)}" placeholder="Zoek sjabloon..."></div></div><div class="message-grid">${list.map(m=>`<article class="message-card ${activeMessageId===m.id?"selected":""}"><div class="message-card-head"><div><h3>${esc(m.title)}</h3><span class="channel">${esc(m.channel)}</span></div>${badge(m.active?"Actief":"Inactief")}</div><div class="message-preview">${esc(m.text)}</div><div class="message-card-foot"><button class="link-button" data-action="preview-message" data-id="${m.id}">Voorbeeld / bewerken</button><button class="toggle ${m.active?"on":""}" aria-label="Sjabloon activeren" data-action="toggle-message" data-id="${m.id}"></button></div></article>`).join("")}</div></section>
    <section class="panel"><div class="panel-head"><div><h2 class="panel-title">Automatisaties om tijd te besparen</h2><p class="panel-subtitle">Workflow-ideeën — in deze demo worden geen echte berichten verzonden.</p></div><span class="badge badge-amber">Koppeling vereist</span></div><div class="automation-list">${[
      ["01","Nieuwe aanvraag","Maak een ontvangstbevestiging klaar en zet de aanvraag op de opvolglijst."],
      ["02","Opdracht bevestigd","Informeer de gekozen partner en de klant na definitieve bevestiging."],
      ["03","Vooraf herinneren","Herinner de partner aan tijdstip, adres en zorginstructies."],
      ["04","Na het bezoek","Vraag een statusupdate en signaleer ontbrekende informatie."],
      ["05","Maandafsluiting","Bundel voltooide opdrachten per partner en bereid de platformafrekening voor."]
    ].map((a,i)=>`<div class="automation-row"><div class="automation-num">${a[0]}</div><div class="automation-copy"><b>${a[1]}</b><p>${a[2]}</p></div><button class="toggle ${i<3?"on":""}" data-action="toggle-automation" data-id="${i}" aria-label="Automatisatie schakelen"></button></div>`).join("")}</div><div class="settings-warning">Voor echte verzending zijn een e-mailprovider en/of officiële WhatsApp Business-integratie, toestemming, logging en foutafhandeling nodig.</div></section>`;
  }
  function renderFinance(){
    const total=taskValue(), fee=commission();
    const statusCounts=["Nieuw","Bevestigd","In uitvoering","Afgerond","Geannuleerd"].map(s=>({status:s,count:data.tasks.filter(t=>t.status===s).length,value:taskValue(data.tasks.filter(t=>t.status===s))}));
    const partnerRows=data.workers.map(w=>{const jobs=data.tasks.filter(t=>t.worker===w.name);return {name:w.name,jobs:jobs.length,value:taskValue(jobs),fee:commission(jobs)};});
    return `<div class="finance-hero"><div><small>INDICATIEVE PLATFORMBIJDRAGE · ${data.settings.commission}%</small><h2>${eur(fee)}</h2><p>Op basis van alle opdrachtbedragen in deze demodataset.</p></div><div class="hero-icon">€</div></div>
    <div class="stats-grid"><article class="stat-card"><div class="stat-top"><span class="stat-icon">↗</span></div><div class="stat-value">${eur(total)}</div><div class="stat-label">Totale demo-opdrachtwaarde</div><div class="stat-foot">${data.tasks.length} opdrachten in de dataset</div></article><article class="stat-card"><div class="stat-top"><span class="stat-icon">%</span></div><div class="stat-value">${eur(fee)}</div><div class="stat-label">Indicatieve platformbijdrage</div><div class="stat-foot">Geen echte boeking of factuur</div></article><article class="stat-card"><div class="stat-top"><span class="stat-icon">◷</span></div><div class="stat-value">${data.tasks.filter(t=>t.status==="Nieuw").length}</div><div class="stat-label">Nieuwe opdrachten</div><div class="stat-foot">Nog op te volgen</div></article><article class="stat-card"><div class="stat-top"><span class="stat-icon">✓</span></div><div class="stat-value">${data.tasks.filter(t=>t.status==="Afgerond").length}</div><div class="stat-label">Afgerond</div><div class="stat-foot">In demo expliciet als afgerond gemarkeerd</div></article></div>
    <div class="finance-breakdown"><section class="panel"><div class="panel-head"><div><h2 class="panel-title">Opdrachtwaarde per status</h2><p class="panel-subtitle">Alle waarden zijn illustratief.</p></div></div>${statusCounts.map(x=>`<div class="finance-line"><span>${esc(x.status)} <small style="color:#899486">(${x.count})</small></span><b>${eur(x.value)}</b></div>`).join("")}<div class="finance-line"><span>Totale opdrachtwaarde</span><b>${eur(total)}</b></div></section>
    <section class="panel"><div class="panel-head"><div><h2 class="panel-title">Indicatief per partner</h2><p class="panel-subtitle">Toewijzing op basis van de demo-opdrachten.</p></div></div>${partnerRows.map(x=>`<div class="finance-line"><span>${esc(x.name)}<small style="display:block;color:#899486;margin-top:4px">${x.jobs} opdracht(en)</small></span><span style="text-align:right"><b>${eur(x.fee)}</b><small style="display:block;color:#899486;margin-top:4px">${eur(x.value)} opdrachtwaarde</small></span></div>`).join("")}<button class="btn btn-secondary" style="width:100%;margin-top:15px" data-action="export-finance">↓ Exporteer CSV</button></section></div>
    <section class="panel" style="margin-top:18px"><div class="panel-head"><div><h2 class="panel-title">Maandafsluiting</h2><p class="panel-subtitle">Wat de echte financiële module moet ondersteunen.</p></div><span class="badge badge-amber">Nog niet geboekt</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Partner</th><th>Opdrachten</th><th>Opdrachtwaarde</th><th>Bijdrage (${data.settings.commission}%)</th><th>Status</th></tr></thead><tbody>${partnerRows.map(x=>`<tr><td><b>${esc(x.name)}</b></td><td>${x.jobs}</td><td>${eur(x.value)}</td><td><b>${eur(x.fee)}</b></td><td>${badge("Demo")}</td></tr>`).join("")}</tbody></table></div><div class="settings-warning">De definitieve berekeningsbasis, eventuele uitzonderingen en btw-behandeling moeten overeenkomen met de contracten en boekhoudkundige afspraken. Opdrachtwaarde is niet automatisch omzet van PelsPlezier.</div></section>`;
  }
  function renderAnalytics(){
    const total=taskValue(), max=Math.max(...[90,125,105,160,145,190,175,220,185,240,215,260],1);
    const vals=analyticsPeriod==="Dit jaar"?[90,125,105,160,145,190,175,220,185,240,215,260]:analyticsPeriod==="Dit kwartaal"?[150,180,145]:[65,85,70,105];
    const labels=analyticsPeriod==="Dit jaar"?["Jan","Feb","Mrt","Apr","Mei","Jun","Jul","Aug","Sep","Okt","Nov","Dec"]:analyticsPeriod==="Dit kwartaal"?["Aug","Sep","Okt"]:["Wk 1","Wk 2","Wk 3","Wk 4"];
    const regionNames=["Willebroek","Boom","Puurs-Sint-Amands","Klein-Willebroek"];
    const regions=regionNames.map(name=>({name,value:taskValue(data.tasks.filter(t=>t.area===name))}));
    const maxRegion=Math.max(...regions.map(r=>r.value),1);
    const metrics=[["Aanvragen in dataset",data.tasks.length],["Actieve partners",data.workers.filter(w=>w.status==="Actief").length],["Gemiddelde opdrachtwaarde",eur(data.tasks.length?total/data.tasks.length:0)],["Voltooide opdrachten",data.tasks.filter(t=>t.status==="Afgerond").length],["Nog niet toegewezen",data.tasks.filter(t=>t.worker==="Nog toe te wijzen").length]];
    return `<div class="toolbar"><label style="font-size:11px;color:#71806d;font-weight:700">PERIODE</label><select id="analyticsPeriod" class="filter-select">${["Deze maand","Dit kwartaal","Dit jaar"].map(s=>`<option ${s===analyticsPeriod?"selected":""}>${s}</option>`).join("")}</select><span class="badge badge-gray">Demogegevens</span></div>
    <div class="stats-grid"><article class="stat-card"><div class="stat-top"><span class="stat-icon">€</span></div><div class="stat-value">${eur(total)}</div><div class="stat-label">Opdrachtwaarde</div><div class="stat-foot">Som van voorbeeldopdrachten</div></article><article class="stat-card"><div class="stat-top"><span class="stat-icon">↗</span></div><div class="stat-value">${eur(commission())}</div><div class="stat-label">Platformbijdrage</div><div class="stat-foot">Indicatief tarief van ${data.settings.commission}%</div></article><article class="stat-card"><div class="stat-top"><span class="stat-icon">♡</span></div><div class="stat-value">${data.clients.length}</div><div class="stat-label">Klanten</div><div class="stat-foot">In het demo-overzicht</div></article><article class="stat-card"><div class="stat-top"><span class="stat-icon">♧</span></div><div class="stat-value">${data.workers.filter(w=>w.status==="Actief").length}</div><div class="stat-label">Actieve partners</div><div class="stat-foot">Volgens demo-status</div></article></div>
    <div class="dashboard-grid"><section class="panel"><div class="panel-head"><div><h2 class="panel-title">Activiteitstrend</h2><p class="panel-subtitle">Illustratieve index, geen historische omzetdata.</p></div></div><div class="chart-bars">${vals.map((v,i)=>`<div class="chart-column"><small>${v}</small><div class="chart-bar ${i===vals.length-1?"current":""}" style="height:${Math.max(7,v/Math.max(...vals)*145)}px"></div><span>${labels[i]}</span></div>`).join("")}</div><div class="legend"><span><i></i>Voorbeeldactiviteit</span><span><i class="current"></i>Geselecteerde laatste periode</span></div></section>
    <section class="panel"><div class="panel-head"><div><h2 class="panel-title">Opdrachtwaarde per regio</h2><p class="panel-subtitle">Gebaseerd op huidige voorbeeldopdrachten.</p></div></div>${regions.map(r=>`<div style="margin-bottom:16px"><div class="metric-row" style="border:0;padding:0"><span>${esc(r.name)}</span><b>${eur(r.value)}</b></div><div class="progress-line"><span style="width:${r.value/maxRegion*100}%"></span></div></div>`).join("")}</section></div>
    <section class="panel" style="margin-top:18px"><div class="panel-head"><div><h2 class="panel-title">Operationele KPI's</h2><p class="panel-subtitle">Kerncijfers die in de echte versie automatisch gemeten kunnen worden.</p></div></div>${metrics.map(m=>`<div class="metric-row"><span>${esc(m[0])}</span><b>${esc(m[1])}</b></div>`).join("")}<div class="settings-warning">Voor betrouwbare trends zijn tijdstempels, historische statuswijzigingen en echte data nodig. De activiteitgrafiek is bewust als illustratie gelabeld.</div></section>`;
  }
  function renderSettings(){
    const tabs=["Algemeen","Toegang","Integraties","Privacy"];
    let inner="";
    if(selectedSettings==="Algemeen") inner=`<h3>Bedrijfsprofiel</h3><p>Basisinstellingen van de PelsPlezier-werkomgeving.</p><div class="settings-field"><div><b>Bedrijfsnaam</b><small>Naam die in de applicatie wordt getoond.</small></div><span class="setting-value">${esc(data.settings.businessName)}</span></div><div class="settings-field"><div><b>Werkgebied</b><small>Primaire regio voor deze omgeving.</small></div><span class="setting-value">${esc(data.settings.region)}</span></div><div class="settings-field"><div><b>Platformbijdrage</b><small>Demo-instelling; pas aan volgens de overeenkomst.</small></div><div><input id="commissionSetting" type="number" min="0" max="100" value="${Number(data.settings.commission)||10}" style="width:80px;padding:9px;border:1px solid #dfe5da;border-radius:8px"> %</div></div><button class="btn btn-primary" data-action="save-settings">Instellingen bewaren</button>`;
    if(selectedSettings==="Toegang") inner=`<h3>Gebruikers & toegangsrechten</h3><p>Een productieversie hoort elke gebruiker alleen toegang te geven tot wat die nodig heeft.</p>${[["Eigenaar / admin","Volledige toegang tot instellingen, partners, opdrachten en financiële rapportage."],["Regiobeheerder","Aanvragen, planning, klanten en toegewezen partners beheren."],["Zelfstandige partner","Alleen eigen opdrachten, beschikbaarheid en noodzakelijke zorginstructies."]].map(x=>`<div class="settings-field"><div><b>${x[0]}</b><small>${x[1]}</small></div><span class="badge badge-gray">Rolvoorstel</span></div>`).join("")}<div class="settings-warning">Rollen zijn hier informatief. Er is nog geen echte autorisatie of gebruikersbeheer gekoppeld.</div>`;
    if(selectedSettings==="Integraties") inner=`<h3>Integraties</h3><p>Koppelingen die van de demo een dagelijkse werktool maken.</p>${[["Filestore / database","Permanente gegevensopslag met toegangsregels."],["Authenticatie","E-mail/wachtwoord, sessies, wachtwoordherstel en accountbeheer."],["E-mail","Bevestigingen, herinneringen en verzendlogboek."],["WhatsApp Business","Berichten via een officiële provider, waar passend."],["Boekhouding","CSV-export of koppeling met de gekozen boekhoudsoftware."],["Bestanden","Veilige opslag van foto's, documenten en bijlagen."]].map(x=>`<div class="settings-field"><div><b>${x[0]}</b><small>${x[1]}</small></div><span class="badge badge-amber">Nog te koppelen</span></div>`).join("")}`;
    if(selectedSettings==="Privacy") inner=`<h3>Privacy & gegevensbeheer</h3><p>Voor gebruik met echte klanten en partners zijn beveiliging en duidelijke afspraken nodig.</p>${[["Minimale gegevensverwerking","Bewaar alleen gegevens die nodig zijn voor de opdracht."],["Toegangscontrole","Beperk klantgegevens en sleutelafspraken per rol en opdracht."],["Back-ups & herstel","Voorzie herstelprocedures en controleer back-ups."],["Auditlogboek","Registreer belangrijke wijzigingen aan opdrachten en rechten."],["Bewaartermijnen","Leg termijnen en verwijderingsprocessen vast."],["Rechten van betrokkenen","Voorzie procedures voor inzage, correctie en verwijdering."]].map(x=>`<div class="settings-field"><div><b>${x[0]}</b><small>${x[1]}</small></div><span class="badge badge-gray">Te implementeren</span></div>`).join("")}<div class="settings-warning">Gebruik geen echte persoonsgegevens in deze demo. De gegevens zijn fictief en lokale opslag is niet geschikt als beveiligde productieomgeving.</div>`;
    return `<div class="settings-layout"><div class="settings-nav">${tabs.map(t=>`<button class="${selectedSettings===t?"active":""}" data-action="settings-tab" data-id="${t}">${t==="Algemeen"?"⚙":t==="Toegang"?"♧":t==="Integraties"?"⌁":"◇"} &nbsp; ${t}</button>`).join("")}</div><section class="settings-content">${inner}</section></div><section class="panel" style="margin-top:18px"><div class="panel-head"><div><h2 class="panel-title">Demo-gegevens</h2><p class="panel-subtitle">Reset de browserdemo naar de oorspronkelijke voorbeeldgegevens.</p></div></div><button class="btn btn-secondary" data-action="reset-demo">Demo resetten</button><div class="settings-warning">Reset verwijdert alleen de lokaal opgeslagen demo-inhoud in deze browser. Dit is geen verwijderfunctie voor een productieomgeving.</div></section>`;
  }
  function bindPageEvents(){
    $("#pageContent").querySelectorAll("[data-page]").forEach(el=>{
      const act=()=>go(el.dataset.page);
      el.addEventListener("click",act);
      if(el.getAttribute("role")==="button") el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();act();}});
    });
    $("#pageContent").querySelectorAll("[data-action]").forEach(el=>el.addEventListener("click",handleAction));
    const ts=$("#taskSearch"); if(ts) ts.addEventListener("input",e=>{taskSearch=e.target.value;const p=e.target.selectionStart;renderTasks(currentPage==="Aanvragen");const input=$("#taskSearch");input.focus();input.setSelectionRange(p,p);});
    const tf=$("#taskFilter");if(tf)tf.addEventListener("change",e=>{taskFilter=e.target.value;render();});
    const ws=$("#workerSearch");if(ws)ws.addEventListener("input",e=>{workerSearch=e.target.value;render();const i=$("#workerSearch");i.focus();i.setSelectionRange(i.value.length,i.value.length);});
    const wf=$("#workerFilter");if(wf)wf.addEventListener("change",e=>{const val=e.target.value;workerSearch=val==="Alle statussen"?"":val;render();});
    const cs=$("#clientSearch");if(cs)cs.addEventListener("input",e=>{clientSearch=e.target.value;render();const i=$("#clientSearch");i.focus();i.setSelectionRange(i.value.length,i.value.length);});
    const ms=$("#messageSearch");if(ms)ms.addEventListener("input",e=>{messageSearch=e.target.value;render();const i=$("#messageSearch");i.focus();i.setSelectionRange(i.value.length,i.value.length);});
    $$(".status-select").forEach(sel=>sel.addEventListener("change",e=>updateTaskStatus(e.target.dataset.id,e.target.value)));
    const ap=$("#analyticsPeriod");if(ap)ap.addEventListener("change",e=>{analyticsPeriod=e.target.value;render();});
  }
  function handleAction(e){
    const el=e.currentTarget, action=el.dataset.action, id=el.dataset.id;
    if(action==="new-task")openTask();
    else if(action==="edit-task")openTask(id);
    else if(action==="confirm-task")updateTaskStatus(id,"Bevestigd");
    else if(action==="delete-task"){if(confirm("Deze demo-opdracht verwijderen?")){data.tasks=data.tasks.filter(t=>t.id!==id);saveData();render();showToast("Opdracht verwijderd uit de demo.");}}
    else if(action==="new-partner")openPartner();
    else if(action==="toggle-worker"){const w=data.workers.find(x=>x.id===id);if(w){w.status=w.status==="Actief"?"Gepauzeerd":"Actief";saveData();render();showToast("Partnerstatus aangepast.");}}
    else if(action==="worker-details"){const w=data.workers.find(x=>x.id===id);if(w)alert(`${w.name}\nRegio: ${w.area}\nDiensten: ${w.services}\nE-mail: ${w.email||"—"}\nTelefoon: ${w.phone||"—"}\nStatus: ${w.status}\n\nIn productie kan deze fiche documenten, beschikbaarheid en samenwerkingsafspraken bevatten.`);}
    else if(action==="new-client")openClient();
    else if(action==="client-details"||action==="edit-client"){const c=data.clients.find(x=>x.id===id);if(c){if(action==="edit-client")openClient(c);else alert(`${c.name}\nRegio: ${c.area}\nDier(en): ${c.pets||"—"}\nE-mail: ${c.email||"—"}\nTelefoon: ${c.phone||"—"}\nOpdrachten: ${c.jobs}\n\nProductievelden kunnen o.a. noodcontact, dierenarts en zorginstructies omvatten.`);}}
    else if(action==="preview-message")openMessage(id);
    else if(action==="toggle-message"){const m=data.messages.find(x=>x.id===id);if(m){m.active=!m.active;saveData();render();showToast("Sjabloonstatus aangepast.");}}
    else if(action==="new-message")openMessage();
    else if(action==="toggle-automation"){el.classList.toggle("on");showToast("Alleen de visuele demo-status is gewijzigd; er draait geen automatisatie.");}
    else if(action==="calendar-prev"){calendarDate=new Date(calendarDate.getFullYear(),calendarDate.getMonth()-1,1);render();}
    else if(action==="calendar-next"){calendarDate=new Date(calendarDate.getFullYear(),calendarDate.getMonth()+1,1);render();}
    else if(action==="settings-tab"){selectedSettings=id;render();}
    else if(action==="save-settings"){const v=Number($("#commissionSetting").value);if(!Number.isFinite(v)||v<0||v>100){showToast("Vul een percentage tussen 0 en 100 in.");return;}data.settings.commission=v;saveData();render();showToast("Instellingen bewaard in deze browser.");}
    else if(action==="reset-demo"){if(confirm("Alle demo-wijzigingen resetten naar de startgegevens?")){localStorage.removeItem(STORAGE_KEY);data=structuredClone(initialData);taskSearch="";taskFilter="Alle";workerSearch="";clientSearch="";messageSearch="";saveData();render();showToast("Demo teruggezet naar de startgegevens.");}}
    else if(action==="export-finance")exportFinance();
  }
  function updateTaskStatus(id,status){
    const t=data.tasks.find(x=>x.id===id);if(!t)return;t.status=status;saveData();render();showToast(`${t.id} bijgewerkt naar ‘${status}’.`);
  }
  function fillWorkerOptions(selected="Nog toe te wijzen"){
    $("#taskWorker").innerHTML=`<option>Nog toe te wijzen</option>`+data.workers.map(w=>`<option ${selected===w.name?"selected":""}>${esc(w.name)}</option>`).join("");
  }
  function openTask(id=null){
    editingTaskId=id;
    const t=id?data.tasks.find(x=>x.id===id):null;
    $("#taskDialogTitle").textContent=t?"Opdracht bewerken":"Nieuwe opdracht";
    $("#taskId").value=t?.id||"";
    $("#taskClient").value=t?.client||"";
    $("#taskPet").value=t?.pet||"";
    $("#taskService").value=t?.service||"Huisbezoek";
    $("#taskDate").value=t?.date||"2026-10-15";
    $("#taskTime").value=t?.time&&t.time!=="Nog te bepalen"?t.time:"14:00";
    fillWorkerOptions(t?.worker||"Nog toe te wijzen");
    $("#taskArea").value=t?.area||"Willebroek";
    $("#taskPrice").value=t?.price??35;
    $("#taskStatus").value=t?.status||"Nieuw";
    $("#taskNotes").value=t?.notes||"";
    $("#taskDialog").showModal();
  }
  function openPartner(){ $("#partnerForm").reset();$("#partnerDialog").showModal(); }
  function openClient(c=null){
    $("#clientForm").reset();
    $("#clientName").value=c?.name||"";$("#clientEmail").value=c?.email||"";$("#clientPhone").value=c?.phone||"";
    $("#clientArea").value=c?.area||"Willebroek";$("#clientPets").value=c?.pets||"";
    $("#clientDialog").dataset.editId=c?.id||"";$("#clientDialog").showModal();
  }
  function openMessage(id=null){
    const m=id?data.messages.find(x=>x.id===id):null;editingMessageId=id;
    $("#messageTitle").value=m?.title||"";$("#messageChannel").value=m?.channel||"E-mail";$("#messageText").value=m?.text||"";
    $("#messageDialog").showModal();
  }
  $("#taskForm").addEventListener("submit",e=>{
    e.preventDefault();
    const id=editingTaskId||`PP-${1053+data.tasks.length}`;
    const record={id,client:$("#taskClient").value.trim(),pet:$("#taskPet").value.trim(),service:$("#taskService").value,date:$("#taskDate").value,time:$("#taskTime").value,worker:$("#taskWorker").value,status:$("#taskStatus").value,price:Math.max(0,Number($("#taskPrice").value)||0),area:$("#taskArea").value,notes:$("#taskNotes").value.trim()};
    if(!record.client||!record.date){showToast("Vul minstens een klantnaam en datum in.");return;}
    if(editingTaskId)data.tasks=data.tasks.map(t=>t.id===editingTaskId?record:t);else data.tasks.unshift(record);
    saveData();$("#taskDialog").close();go("Opdrachten");showToast(editingTaskId?"Opdracht bijgewerkt.":"Nieuwe opdracht toegevoegd aan de demo.");
  });
  $("#partnerForm").addEventListener("submit",e=>{
    e.preventDefault();const name=$("#partnerName").value.trim();if(!name)return;
    data.workers.push({id:`W-${String(Date.now()).slice(-5)}`,name,area:$("#partnerArea").value,services:$("#partnerServices").value.trim(),status:$("#partnerStatus").value,jobs:0,revenue:0,initials:initials(name),email:$("#partnerEmail").value.trim(),phone:$("#partnerPhone").value.trim()});
    saveData();$("#partnerDialog").close();go("Partners");showToast("Partner toegevoegd aan de demo.");
  });
  $("#clientForm").addEventListener("submit",e=>{
    e.preventDefault();const name=$("#clientName").value.trim();if(!name)return;
    const editId=$("#clientDialog").dataset.editId;
    const record={id:editId||`C-${String(Date.now()).slice(-5)}`,name,email:$("#clientEmail").value.trim(),phone:$("#clientPhone").value.trim(),area:$("#clientArea").value,pets:$("#clientPets").value.trim(),jobs:editId?(data.clients.find(c=>c.id===editId)?.jobs||0):0};
    if(editId)data.clients=data.clients.map(c=>c.id===editId?record:c);else data.clients.unshift(record);
    saveData();$("#clientDialog").close();go("Klanten & dieren");showToast(editId?"Klant bijgewerkt.":"Klant toegevoegd aan de demo.");
  });
  $("#messageForm").addEventListener("submit",e=>{
    e.preventDefault();const record={id:editingMessageId||`M-${String(Date.now()).slice(-5)}`,title:$("#messageTitle").value.trim(),channel:$("#messageChannel").value,text:$("#messageText").value.trim(),active:true};
    if(editingMessageId)data.messages=data.messages.map(m=>m.id===editingMessageId?{...m,...record,active:m.active}:m);else data.messages.unshift(record);
    saveData();$("#messageDialog").close();go("Berichten & automatisaties");showToast("Berichtsjabloon lokaal bewaard.");
  });
  $$("[data-close-dialog]").forEach(btn=>btn.addEventListener("click",()=>$("#"+btn.dataset.closeDialog).close()));
  $("#newButton").addEventListener("click",()=>{
    if(currentPage==="Partners")openPartner();
    else if(currentPage==="Klanten & dieren")openClient();
    else openTask();
  });
  $("#loginForm").addEventListener("submit",e=>{
    e.preventDefault();
    // Demo login intentionally skips credential verification. Add real authentication before production.
    $("#loginView").classList.add("hidden");$("#appView").classList.remove("hidden");
    go("Overzicht");showToast("Welkom in de interactieve demoversie.");
  });
  $("#togglePassword").addEventListener("click",()=>{const p=$("#password");p.type=p.type==="password"?"text":"password";$("#togglePassword").textContent=p.type==="password"?"Tonen":"Verbergen";});
  $("#logoutButton").addEventListener("click",()=>{if(confirm("Terugkeren naar het inlogscherm?")){$("#appView").classList.add("hidden");$("#loginView").classList.remove("hidden");}});
  $("#navigation").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b)go(b.dataset.page);});
  $("#globalSearch").addEventListener("input",e=>{
    const q=e.target.value.trim();if(!q)return;
    if(["Aanvragen","Opdrachten"].includes(currentPage)){taskSearch=q;render();}
    else if(currentPage==="Partners"){workerSearch=q;render();}
    else if(currentPage==="Klanten & dieren"){clientSearch=q;render();}
    else {taskSearch=q;go("Opdrachten");}
  });
  $("#globalSearch").addEventListener("keydown",e=>{if(e.key==="Escape"){e.target.value="";taskSearch="";workerSearch="";clientSearch="";render();}});
  $("#notificationButton").addEventListener("click",()=>showToast(`${data.tasks.filter(t=>t.status==="Nieuw").length} nieuwe aanvraag/aanvragen vragen opvolging. Open ‘Aanvragen’ om ze te bekijken.`));
  $("#openSidebar").addEventListener("click",()=>$("#sidebar").classList.add("open"));
  $("#closeSidebar").addEventListener("click",()=>$("#sidebar").classList.remove("open"));
  document.addEventListener("keydown",e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("#globalSearch").focus();}
    if(e.key==="Escape")$("#sidebar").classList.remove("open");
  });
  // Keep all data in local browser storage during the demo.
  saveData();
})();