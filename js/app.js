const state={events:[],year:2026,category:"all",selected:null,markers:[],view:"world",query:""};
const views={
  world:{center:[20,0],zoom:2},
  eu:{center:[51,12],zoom:4},
  asia:{center:[30,95],zoom:3.5},
  americas:{center:[15,-75],zoom:3}
};
const categoryClass=c=>{
  const x=Array.isArray(c)?c.join(" "):String(c);
  if(x.includes("war")||x.includes("political-conflict")||x.includes("political-violence"))return"war";
  if(x.includes("pandemic"))return"pandemic";
  if(x.includes("famine"))return"famine";
  if(x.includes("natural-disaster")||x.includes("earthquake")||x.includes("tsunami")||x.includes("cyclone"))return"natural";
  if(x.includes("genocide"))return"genocide";
  return"other";
};
const formatDeaths=e=>{
  const n=e.deaths||{min:0,max:0};
  return n.min===n.max?Intl.NumberFormat("de-DE").format(n.min):Intl.NumberFormat("de-DE").format(n.min)+"–"+Intl.NumberFormat("de-DE").format(n.max);
};
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function matches(e){
  const inTime=Number(e.start)<=state.year&&Number(e.end)>=state.year;
  const inCat=state.category==="all"||String(e.category).includes(state.category)||categoryClass(e.category)===state.category;
  const q=state.query.trim().toLowerCase();
  const inSearch=!q||[e.name,e.region,e.description,...(e.actors||[])].join(" ").toLowerCase().includes(q);
  return inTime&&inCat&&inSearch;
}
function syncYear(value){
  state.year=Number(value);
  document.querySelector("#yearValue").textContent=state.year;
  document.querySelector("#timelineYear").textContent=state.year;
  const active=state.year===2026?"CURRENT":String(state.year);
  document.querySelector("#rangeLabel").textContent=active;
  document.querySelector("#year").value=state.year;
  renderMarkers();
}
function renderMetrics(){
  const visible=state.events.filter(matches);
  document.querySelector("#eventCount").textContent=visible.length;
  document.querySelector("#eventCount2").textContent=visible.length;
  const total=visible.reduce((s,e)=>s+(e.deaths?.max||0),0);
  document.querySelector("#deathMax").textContent=Intl.NumberFormat("de-DE",{notation:"compact",maximumFractionDigits:1}).format(total);
}
function markerFor(e){
  const cls=categoryClass(e.category);
  const icon=L.divIcon({className:"",html:'<div class="marker marker-'+cls+'"></div>',iconSize:[14,14],iconAnchor:[7,7]});
  const m=L.marker([e.lat,e.lng],{icon});
  m.bindPopup("<b>"+escapeHtml(e.name)+"</b><br>"+e.start+(e.end!==e.start?"–"+e.end:"")+"<br>"+formatDeaths(e)+" deaths");
  m.on("click",()=>selectEvent(e.id));
  return m;
}
function renderMarkers(){
  state.markers.forEach(m=>m.remove());
  state.markers=[];
  state.events.filter(matches).forEach(e=>{
    const m=markerFor(e).addTo(map);
    state.markers.push(m);
  });
  renderMetrics();
}
function selectEvent(id){
  const e=state.events.find(x=>x.id===id);
  if(!e)return;
  state.selected=e;
  const details=document.querySelector("#details");
  details.innerHTML=
    '<div class="panel-head"><span>EVENT INSPECTOR</span><button id="closeDetails" class="close" type="button">×</button></div>'+
    '<div class="section"><div class="event-title">'+escapeHtml(e.name)+'</div>'+
    '<div class="event-meta">'+e.start+(e.end!==e.start?" — "+e.end:"")+" · "+escapeHtml(e.region)+"</div>"+
    '<div class="death">'+formatDeaths(e)+'<span style="font-size:9px;color:var(--muted)"> EST. DEATHS</span></div>'+
    '<div class="confidence">CONFIDENCE: '+escapeHtml(e.confidence||"unknown").toUpperCase()+'</div></div>'+
    '<div class="section"><div class="panel-head">DESCRIPTION</div><div class="desc">'+escapeHtml(e.description)+'</div></div>'+
    '<div class="section"><div class="panel-head">ACTORS</div><div class="desc">'+((e.actors||[]).length?e.actors.map(x=>"• "+escapeHtml(x)).join("<br>"):"No actor attribution in this entry.")+'</div></div>'+
    '<div class="section"><div class="panel-head">RELIGIOUS FACTORS</div><div class="stat"><span>RELEVANCE</span><b>'+escapeHtml(e.religious_factors?.relevance||"none").toUpperCase()+'</b></div><div class="desc" style="margin-top:8px">'+escapeHtml(e.religious_factors?.summary||"No specific religious context recorded.")+'</div></div>'+
    '<div class="section"><div class="panel-head">SOURCES</div>'+((e.sources||[]).map(s=>'<a class="source" href="'+escapeHtml(s.url)+'" target="_blank" rel="noopener">'+escapeHtml(s.title)+'</a>').join(""))+'</div>';
  document.querySelector("#right-ui")?.classList.add("has-selection");
  document.querySelector(".right-ui").classList.add("has-selection");
  document.querySelector("#closeDetails").addEventListener("click",clearSelection);
  map.flyTo([e.lat,e.lng],Math.max(map.getZoom(),4),{duration:.7});
}
function clearSelection(){
  state.selected=null;
  document.querySelector(".right-ui").classList.remove("has-selection");
  document.querySelector("#details").innerHTML='<div class="panel-head"><span>EVENT INSPECTOR</span><button id="closeDetails" class="close" type="button">×</button></div><div class="empty">Select a marker to inspect the event, estimated deaths, actors, context and sources.</div>';
  document.querySelector("#closeDetails").addEventListener("click",clearSelection);
}
function renderLayers(){
  document.querySelectorAll("[data-cat]").forEach(b=>b.classList.toggle("active",b.dataset.cat===state.category));
}
function setView(view){
  state.view=view;
  document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  const v=views[view]||views.world;
  map.flyTo(v.center,v.zoom,{duration:.8});
  history.replaceState(null,"","?view="+encodeURIComponent(view)+"&year="+encodeURIComponent(state.year)+"&layer="+encodeURIComponent(state.category));
}
function readUrl(){
  const p=new URLSearchParams(location.search);
  const view=p.get("view");
  const year=Number(p.get("year"));
  const layer=p.get("layer");
  if(view&&views[view])state.view=view;
  if(Number.isFinite(year)&&year>=-500&&year<=2026)state.year=year;
  if(layer&&["all","war","genocide","pandemic","famine","natural"].includes(layer))state.category=layer;
}
async function init(){
  readUrl();
  const r=await fetch("data/events.json");
  if(!r.ok)throw new Error("Could not load event data");
  state.events=await r.json();
  window.map=L.map("map",{worldCopyJump:true,minZoom:2,maxZoom:18,zoomControl:true,tap:true}).setView(views[state.view].center,views[state.view].zoom);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap contributors"}).addTo(map);
  document.querySelector("#year").value=state.year;
  document.querySelector("#yearValue").textContent=state.year;
  document.querySelector("#timelineYear").textContent=state.year;
  document.querySelector("#rangeLabel").textContent=state.year===2026?"CURRENT":state.year;
  renderLayers();
  renderMarkers();
  document.querySelector("#year").addEventListener("input",e=>syncYear(e.target.value));
  document.querySelectorAll("[data-cat]").forEach(b=>b.addEventListener("click",()=>{
    state.category=b.dataset.cat;
    renderLayers();
    renderMarkers();
    history.replaceState(null,"","?view="+encodeURIComponent(state.view)+"&year="+encodeURIComponent(state.year)+"&layer="+encodeURIComponent(state.category));
    document.querySelector("#mobileLayers").classList.remove("open");
  }));
  document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
  document.querySelector("#locWorld").addEventListener("click",()=>setView("world"));
  document.querySelector("#search").addEventListener("input",e=>{
    state.query=e.target.value;
    renderMarkers();
  });
  document.querySelector("#mobilePanel").addEventListener("click",()=>document.querySelector("#mobileLayers").classList.add("open"));
  document.querySelector("#closeMobile").addEventListener("click",()=>document.querySelector("#mobileLayers").classList.remove("open"));
  document.querySelector("#closeDetails").addEventListener("click",clearSelection);
  window.addEventListener("resize",()=>setTimeout(()=>map.invalidateSize(),80));
  window.addEventListener("orientationchange",()=>setTimeout(()=>map.invalidateSize(),250));
  setTimeout(()=>map.invalidateSize(),150);
}
init().catch(e=>{document.querySelector("#details").innerHTML='<div class="panel-head"><span>EVENT INSPECTOR</span></div><div class="empty">DATA ERROR: '+escapeHtml(e.message)+'</div>'});
