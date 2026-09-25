const state={layer:"all",view:"world",query:"",quakes:[],markers:[]};
const views={world:{c:[20,0],z:2},eu:{c:[51,12],z:4},mena:{c:[28,42],z:4},asia:{c:[30,100],z:3},americas:{c:[15,-80],z:3},africa:{c:[3,20],z:3.5}};
const map=L.map("map",{worldCopyJump:true,minZoom:2,maxZoom:18,zoomControl:true}).setView(views.world.c,views.world.z);
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{maxZoom:20,attribution:"© OpenStreetMap © CARTO"}).addTo(map);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function addMarker(lat,lng,type,title,body){
 const icon=L.divIcon({className:"",html:'<div class="marker marker-'+type+'"></div>',iconSize:[12,12],iconAnchor:[6,6]});
 const m=L.marker([lat,lng],{icon}).addTo(map);
 m.on("click",()=>showEvent(title,body,lat,lng));
 state.markers.push(m);return m;
}
function clearMarkers(){state.markers.forEach(m=>m.remove());state.markers=[]}
function showEvent(title,body,lat,lng){
 const box=document.querySelector("#inspector"),content=document.querySelector("#inspectorBody");
 box.classList.remove("hidden");
 content.innerHTML='<div class="event-name">'+esc(title)+'</div><div class="event-meta">'+lat.toFixed(2)+'° · '+lng.toFixed(2)+'°</div><div class="event-copy">'+esc(body)+'</div>';
 map.flyTo([lat,lng],Math.max(map.getZoom(),4),{duration:.7});
}
function seedConflicts(){
 const data=[
  [31.5,34.8,"Gaza / Israel-Palestine","Conflict signal — monitor current reporting and official sources."],
  [48.4,37.8,"Eastern Ukraine","Conflict signal — monitor current reporting and official sources."],
  [15.5,32.5,"Sudan","Conflict signal — monitor current reporting and official sources."],
  [34.5,69.2,"Afghanistan","Security signal — monitor current reporting and official sources."],
  [33.3,44.4,"Iraq","Security signal — monitor current reporting and official sources."],
  [15.3,44.2,"Yemen","Conflict signal — monitor current reporting and official sources."],
  [36.2,37.1,"Syria","Conflict signal — monitor current reporting and official sources."]
 ];
 data.forEach(d=>addMarker(d[0],d[1],"conflict",d[2],d[3]));
}
function render(){
 clearMarkers();
 if(state.layer==="all"||state.layer==="conflicts")seedConflicts();
 if(state.layer==="all"||state.layer==="earthquakes")state.quakes.forEach(q=>addMarker(q.lat,q.lng,"quake",q.title,"Magnitude "+q.mag.toFixed(1)+" · "+q.place));
 updateCounts();
}
function updateCounts(){
 document.querySelector("#quakes").textContent=state.quakes.length||"0";
 document.querySelector("#quakeCount").textContent=state.quakes.length||"0";
 document.querySelector("#activeEvents").textContent=state.markers.length;
 document.querySelector("#hotspots").textContent=state.layer==="wildfires"?"—":"—";
}
async function loadEarthquakes(){
 try{
  const r=await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
  const j=await r.json();
  state.quakes=j.features.map(f=>({lat:f.geometry.coordinates[1],lng:f.geometry.coordinates[0],mag:f.properties.mag||0,place:f.properties.place||"Unknown",title:f.properties.title||"Earthquake"})).filter(q=>q.mag>=4).slice(0,300);
  document.querySelector("#updated").textContent="UPDATED "+new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
  render();
 }catch(e){document.querySelector("#updated").textContent="DEMO MODE";render()}
}
function setLayer(layer){state.layer=layer;document.querySelectorAll("[data-layer]").forEach(b=>b.classList.toggle("active",b.dataset.layer===layer));render()}
function setView(v){state.view=v;map.flyTo(views[v].c,views[v].z,{duration:.8});document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===v))}
document.querySelectorAll("[data-layer]").forEach(b=>b.addEventListener("click",()=>{setLayer(b.dataset.layer);document.querySelector("#mobileSheet").classList.remove("open")}));
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
document.querySelector("#locate").addEventListener("click",()=>setView("world"));
document.querySelector("#menu").addEventListener("click",()=>document.querySelector("#mobileSheet").classList.add("open"));
document.querySelector("#closeMenu").addEventListener("click",()=>document.querySelector("#mobileSheet").classList.remove("open"));
document.querySelector("#closeInspector").addEventListener("click",()=>document.querySelector("#inspector").classList.add("hidden"));
document.querySelector("#search").addEventListener("input",e=>{state.query=e.target.value.trim().toLowerCase();const q=state.quakes.find(x=>(x.title+" "+x.place).toLowerCase().includes(state.query));if(q)showEvent(q.title,q.place,q.lat,q.lng)});
document.querySelectorAll("[data-range]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-range]").forEach(x=>x.classList.remove("active"));b.classList.add("active")}));
map.on("mousemove",e=>{document.querySelector("#coords").textContent=e.latlng.lat.toFixed(1)+"°"+(e.latlng.lat>=0?"N":"S")+" "+Math.abs(e.latlng.lng).toFixed(1)+"°"+(e.latlng.lng>=0?"E":"W")+" · Z"+map.getZoom().toFixed(1)});
loadEarthquakes();
setInterval(loadEarthquakes,5*60*1000);
