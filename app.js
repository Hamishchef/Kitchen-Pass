{
const kpEl=document.createElement("div");kpEl.id="kp";
kpEl.innerHTML=`<header><div class="wrap">
  <div class="top"><h1 class="wm" aria-label="PASS"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 134 92" width="134" height="92" role="img" aria-label="PASS"><rect width="134" height="92" rx="3" fill="#14213d"/><g transform="translate(4,0) scale(1)" fill="none" stroke="#f6f1e7" stroke-width="10.0" stroke-linecap="round" stroke-linejoin="round"><path d="M5.0 69.0V19.0A10.0 10.0 0 0 1 25.0 19.0V38.0A10.0 10.0 0 0 1 5.0 38.0M5.0 83.0h0M37.0 69.0V19.0A10.0 10.0 0 0 1 57.0 19.0V69.0M37.0 48.0H57.0M37.0 83.0h0M57.0 83.0h0M89.0 22.0V19.0A10.0 10.0 0 0 0 69.0 19.0V38.0C69.0 45.0 89.0 47.0 89.0 54.0V73.0A10.0 10.0 0 0 1 69.0 73.0V70.0M121.0 22.0V19.0A10.0 10.0 0 0 0 101.0 19.0V38.0C101.0 45.0 121.0 47.0 121.0 54.0V73.0A10.0 10.0 0 0 1 101.0 73.0V70.0"/></g></svg></h1><span class="sub"><span class="dot off" id="dot"></span><span id="sub">Loading\u2026</span><button class="more" id="moreBtn" type="button">More</button></span></div>
  <div class="ksearch"><input id="q" type="search" placeholder="Search recipes" aria-label="Search"><button class="add" id="addBtn" hidden>+ Add</button></div>
</div></header>
<div class="wrap"><div class="kmain" id="view"></div></div>
<nav class="tabs" aria-label="Sections"><div class="wrap">
  <a href="#recipes" data-t="recipes"><svg viewBox="0 0 24 24"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/></svg>Recipes</a>
  <a href="#residences" data-t="residences"><svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/></svg>Residences &amp; Yachts</a>
  <a href="#preferences" data-t="people"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4.5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 6"/></svg>Preferences</a>
</div></nav>
<div class="sheet" id="sheet" hidden><div class="kcard" role="dialog" aria-modal="true" aria-labelledby="sheetT">
  <div class="grab"><span></span><button type="button" id="closeBtn">Close</button></div><div id="sheetBody"></div>
</div></div>`;
document.getElementById("root").appendChild(kpEl);
{const hd=kpEl.querySelector("header"),fit=()=>kpEl.style.setProperty("--hdr",hd.offsetHeight+"px");new ResizeObserver(fit).observe(hd);fit();}

const $=s=>document.getElementById(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const fmtDate=s=>{if(!s)return"";const d=new Date(s+"T12:00:00");return isNaN(d)?s:d.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short",year:"numeric"});};
const monthOf=s=>{const d=new Date((s||"")+"T12:00:00");return isNaN(d)?"No date":d.toLocaleDateString(undefined,{month:"long",year:"numeric"});};
const dbl=v=>{const s=String(v??"").trim().replace(",",".");return s===""||isNaN(+s)?"":String(Math.round(+s*2000)/1000);};
const lines=s=>String(s||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const COLS=["recipes","menus","contacts","orders","residences","people"];
const FOLDERS=["Meat & Poultry","Fish & Seafood","Vegetarian & Vegan","Soups & Salads","Pasta, Grains & Breads","Breakfast & Brunch","Baking & Patisserie","Desserts","Ice Creams","Stocks & Sauces","Pickles & Preserves"];
const lsk=k=>"kp_"+k+"_"+((S.user&&S.user.email)||"me");
const lsGet=k=>{try{return JSON.parse(localStorage.getItem(lsk(k))||"[]");}catch(e){return [];}};
const lsSet=(k,v)=>{try{localStorage.setItem(lsk(k),JSON.stringify(v));}catch(e){}};
const isFav=id=>lsGet("fav").includes(id);
const toggleFav=id=>{const f=lsGet("fav");lsSet("fav",f.includes(id)?f.filter(x=>x!==id):[id,...f]);};
const addRecent=id=>lsSet("recent",[id,...lsGet("recent").filter(x=>x!==id)].slice(0,8));
const REVIEW="__review",FAVS="__favs";
const fOrder=f=>{const i=FOLDERS.indexOf(f);return i<0?99:i;};
const SUBS={menus:"Menus",contacts:"Phone",orders:"Orders"};
const PH={recipes:"Search recipes or ingredients",residences:"Search residences and yachts",people:"Search names, allergies, likes",menus:"Search dishes and notes",contacts:"Search names and numbers",orders:"Search suppliers, restaurants, items"};
const S={db:null,data:{recipes:{},menus:{},contacts:{},orders:{},residences:{},people:{}},view:"recipes",res:null,sub:"menus",q:"",otype:"supplier",write:true,loaded:false,open:null};
const FORMS={
 menus:[{k:"date",l:"Date",t:"date"},{k:"location",l:"Residence or yacht",list:"locs"},{k:"meal",l:"Meal",opts:["Breakfast","Lunch","Dinner","Event"]},{k:"guests",l:"Guests"},{k:"courses",l:"Dishes, one per line (a recipe name links to the card)",t:"area"},{k:"notes",l:"Notes (allergies, feedback, what to change)",t:"area"}],
 contacts:[{k:"name",l:"Name"},{k:"category",l:"Category",opts:["Supplier","Restaurant","Household","Maintenance","Emergency","Other"]},{k:"phone",l:"Phone",t:"tel"},{k:"alt",l:"Second number",t:"tel"},{k:"email",l:"Email",t:"email"},{k:"location",l:"Residence or yacht (blank shows it everywhere)",list:"locs"},{k:"notes",l:"Notes (account number, order cut-off, usual order)",t:"area"}],
 orders:[{k:"type",l:"Type",opts:["supplier","restaurant"],lab:["Supplier order","Restaurant takeaway"]},{k:"vendor",l:"Supplier or restaurant",list:"vendors"},{k:"location",l:"Residence or yacht",list:"locs"},{k:"date",l:"For date",t:"date"},{k:"status",l:"Status",opts:["Draft","Sent","Delivered"]},{k:"items",l:"Items, one per line",t:"area"},{k:"notes",l:"Notes",t:"area"}],
 recipes:[{k:"title",l:"Recipe title"},{k:"section",l:"Folder",list:"sections"},{k:"kitchen",l:"Kitchen"},{k:"yieldSingle",l:"Yield (single)"},{k:"yieldDouble",l:"Yield (double, blank = single x 2)"},{k:"cooking",l:"Cooking / \u00b0C"},{k:"ing",l:"Ingredients, one per line: single | ingredient | double. A line in CAPITALS on its own is a heading.",t:"area",big:1},{k:"method",l:"Method",t:"area",big:1},{k:"notes",l:"Important notes",t:"area"},{k:"review",l:"Needs review: notes for Hamish. Clear this box once fixed.",t:"area"}],
 people:[{k:"name",l:"Name"},{k:"group",l:"Group",opts:["Family","Guest","Staff"]},{k:"allergies",l:"Allergies (shown in red everywhere)",t:"area"},{k:"dietary",l:"Dietary requirements (e.g. vegetarian, no pork, low sugar)",t:"area"},{k:"likes",l:"Likes and favourite dishes",t:"area"},{k:"dislikes",l:"Dislikes",t:"area"},{k:"notes",l:"Other notes (portion size, drinks, how they take coffee)",t:"area"}],
 residences:[{k:"name",l:"Name"},{k:"kind",l:"Type",opts:["Residence","Yacht"]},{k:"place",l:"Town or home port"},{k:"order",l:"Position in list (1 = top)",t:"number"},{k:"notes",l:"Notes (address, gate codes kept elsewhere, kitchen kit)",t:"area"}]};

function toast(t){const e=document.createElement("div");e.className="toast";e.textContent=t;$("kp").appendChild(e);setTimeout(()=>e.remove(),2200);}
async function copy(t){try{await navigator.clipboard.writeText(t);toast("Copied");}catch(e){toast("Copy isn't available here");}}
const resList=()=>Object.entries(S.data.residences).sort((a,b)=>(+a[1].order||99)-(+b[1].order||99)||(a[1].name||"").localeCompare(b[1].name||""));
const locs=()=>resList().map(([,r])=>r.name).filter(Boolean);
const curRes=()=>S.res&&S.data.residences[S.res];
const recipeByTitle=()=>{const m={};for(const[id,r]of Object.entries(S.data.recipes))if(r.title)m[r.title.trim().toLowerCase()]=id;return m;};
const has=(o,keys)=>{const q=S.q.trim().toLowerCase();return !q||keys.some(k=>String(o[k]||"").toLowerCase().includes(q));};
const atRes=(o,blankOk)=>{const r=curRes();const l=(o.location||"").trim().toLowerCase();return r&&(l===(r.name||"").trim().toLowerCase()||(blankOk&&!l));};
const empty=(t,s)=>`<div class="empty"><b>${esc(t)}</b>${esc(s)}</div>`;
const telLink=p=>`<a class="tel" href="tel:${esc(String(p).replace(/[^\d+]/g,""))}">${esc(p)}</a>`;

/* ---------- views ---------- */
function renderRecipes(){
  const q=S.q.trim().toLowerCase(),g={},all=Object.entries(S.data.recipes).filter(([,r])=>r.title);
  const card=([id,r])=>{const ing=(r.ingredients||[]).filter(i=>i.name&&(i.single||i.double)).map(i=>i.name.replace(/\s*\(.*?\)/g,"")).slice(0,4).join(", ");
    return `<button class="tk" data-o="recipes:${esc(id)}"><h3>${isFav(id)?"\u2605 ":""}${esc(r.title)}${r.review&&S.role==="admin"?` <span class="flag">Check</span>`:""}</h3><p>${esc(S.folder===REVIEW&&r.review?r.review:(ing||r.cooking||""))}</p></button>`;};
  const fold=r=>(r.section||"").trim()||"Other";
  if(!all.length)return empty("No recipes yet","Recipes added here will show for every chef.");
  if(!q&&!S.folder){
    for(const e of all)(g[fold(e[1])]=g[fold(e[1])]||[]).push(e);
    const names=Object.keys(g).sort((a,b)=>fOrder(a)-fOrder(b)||a.localeCompare(b));
    const pick=ids=>ids.map(id=>[id,S.data.recipes[id]]).filter(([,r])=>r&&r.title);
    const favs=pick(lsGet("fav")),rec=pick(lsGet("recent")).slice(0,5),nrev=all.filter(([,r])=>r.review).length;
    const chips=l=>`<div class="chips">${l.map(([id,r])=>`<button class="chip" data-o="recipes:${esc(id)}">${esc(r.title)}</button>`).join("")}</div>`;
    return (favs.length?`<div class="gh"><span>\u2605 Favourites</span><a class="ghl" href="#f-${FAVS}">See all ${favs.length}</a></div>`+chips(favs.slice(0,6)):"")
      +(rec.length?`<div class="gh"><span>Recently viewed</span><span></span></div>`+chips(rec):"")
      +`<div class="gh"><span>Recipe folders</span><span>${all.length} recipes</span></div><div class="folders">`+names.map(f=>`<a class="fold" href="#f-${encodeURIComponent(f)}"><b>${esc(f)}</b><small>${g[f].length} recipe${g[f].length===1?"":"s"}</small></a>`).join("")
      +(S.role==="admin"&&nrev?`<a class="fold rev" href="#f-${REVIEW}"><b>Needs review</b><small>${nrev} recipe${nrev===1?"":"s"} flagged</small></a>`:"")+`</div>`;
  }
  const favSet=new Set(lsGet("fav"));
  for(const[id,r]of all){
    if(S.folder===REVIEW){if(!r.review)continue;}else if(S.folder===FAVS){if(!favSet.has(id))continue;}else if(S.folder&&fold(r)!==S.folder)continue;
    if(q&&!(has(r,["title","section","dish","kitchen"])||(r.ingredients||[]).some(i=>(i.name||"").toLowerCase().includes(q))))continue;
    (g[fold(r)]=g[fold(r)]||[]).push([id,r]);
  }
  const back=S.folder?`<a class="back" href="#recipes">\u2039 All folders</a>`:"";
  const names=Object.keys(g).sort((a,b)=>fOrder(a)-fOrder(b)||a.localeCompare(b));
  if(!names.length)return back+empty("Nothing matches","Try an ingredient, like \u201cshallot\u201d.");
  return back+names.map(f=>`<div class="gh"><span>${esc(f)}</span><span>${g[f].length}</span></div>`+g[f].sort((a,b)=>a[1].title.localeCompare(b[1].title)).map(card).join("")).join("");
}
function renderResidences(){
  const all=resList().filter(([,r])=>has(r,["name","place","kind"]));
  if(!all.length)return empty(resList().length?"Nothing matches":"No residences yet","Press + Add to add a residence or yacht.");
  const count=(c,n)=>Object.values(S.data[c]).filter(o=>(o.location||"").trim().toLowerCase()===(n||"").trim().toLowerCase()).length;
  const group=k=>{const g=all.filter(([,r])=>(r.kind||"Residence")===k);return g.length?`<div class="gh"><span>${k==="Yacht"?"Yachts":"Residences"}</span><span>${g.length}</span></div>`+g.map(([id,r])=>{
    const m=count("menus",r.name),o=count("orders",r.name),c=count("contacts",r.name);
    return `<a class="tk" href="#r-${esc(id)}"><div class="row"><h3>${esc(r.name)}</h3>${r.place?`<span class="pill">${esc(r.place)}</span>`:""}</div><p>${m} menu${m===1?"":"s"} \u00b7 ${c} number${c===1?"":"s"} \u00b7 ${o} order${o===1?"":"s"}</p></a>`;}).join(""):"";};
  return group("Residence")+group("Yacht");
}
function renderRes(){
  const r=curRes();if(!r)return empty("Not found","This residence may have been removed.");
  const seg=`<a class="back" href="#residences">\u2039 All residences &amp; yachts</a><div class="rhead"><h2>${esc(r.name)}</h2>${S.write?`<button class="kbtn" data-act="editres">Edit</button>`:""}</div>
   <p class="kmeta">${esc([r.kind,r.place].filter(Boolean).join(" \u00b7 "))}</p>${r.notes?`<div class="note" style="margin-bottom:12px">${esc(r.notes)}</div>`:""}
   <div class="seg">${Object.entries(SUBS).map(([k,l])=>`<button data-sub="${k}" class="${S.sub===k?"on":""}">${l}</button>`).join("")}</div>`;
  return seg+({menus:resMenus,contacts:resContacts,orders:resOrders})[S.sub]();
}
function resMenus(){
  const all=Object.entries(S.data.menus).filter(([,m])=>atRes(m)&&has(m,["courses","notes","meal","guests"])).sort((a,b)=>(b[1].date||"").localeCompare(a[1].date||""));
  if(!all.length)return empty("No menus here yet","Press + Add to record a menu after service.");
  let out="",cur="";
  for(const[id,m]of all){const mo=monthOf(m.date);if(mo!==cur){cur=mo;out+=`<div class="gh"><span>${esc(mo)}</span></div>`;}
    out+=`<button class="tk" data-o="menus:${esc(id)}"><div class="row"><h3>${esc(fmtDate(m.date))} \u00b7 ${esc(m.meal||"Menu")}</h3>${m.guests?`<span class="pill">${esc(m.guests)} guests</span>`:""}</div><p>${esc(lines(m.courses).join(" \u00b7 "))}</p></button>`;}
  return out;
}
function resContacts(){
  const g={};
  for(const[id,c]of Object.entries(S.data.contacts)){if(!atRes(c,true)||!has(c,["name","category","phone","alt","notes","email"]))continue;const k=c.category||"Other";(g[k]=g[k]||[]).push([id,c]);}
  const order=["Emergency","Supplier","Restaurant","Household","Maintenance","Other"];
  const names=Object.keys(g).sort((a,b)=>order.indexOf(a)-order.indexOf(b));
  if(!names.length)return empty("No numbers here yet","Add suppliers, restaurants, house staff and emergency numbers for this property.");
  return names.map(n=>`<div class="gh"><span>${esc(n)}</span><span>${g[n].length}</span></div>`+g[n].sort((a,b)=>(a[1].name||"").localeCompare(b[1].name||"")).map(([id,c])=>
    `<div class="tk call"><button class="tk" style="border:0;padding:0;margin:0;background:none" data-o="contacts:${esc(id)}"><h3>${esc(c.name)}</h3><p>${esc([c.location?"":"All properties",c.notes].filter(Boolean).join(" \u00b7 "))}</p></button>${c.phone?telLink(c.phone):""}</div>`).join("")).join("");
}
function resOrders(){
  const all=Object.entries(S.data.orders).filter(([,o])=>(o.type||"supplier")===S.otype&&atRes(o)&&has(o,["vendor","items","notes","status"]))
    .sort((a,b)=>(b[1].date||"").localeCompare(a[1].date||""));
  const seg=`<div class="seg sm"><button data-ot="supplier" class="${S.otype==="supplier"?"on":""}">Suppliers</button><button data-ot="restaurant" class="${S.otype==="restaurant"?"on":""}">Restaurants</button></div>`;
  if(!all.length)return seg+empty("No orders here yet",S.otype==="supplier"?"Add a supplier order, then copy it into a text or email.":"Save the family's favourite takeaway orders so anyone can re-order.");
  return seg+all.map(([id,o])=>`<button class="tk" data-o="orders:${esc(id)}"><div class="row"><h3>${esc(o.vendor||"Order")}</h3><span class="pill ${esc(o.status||"")}">${esc(o.status||"")}</span></div><p>${esc(fmtDate(o.date))}</p><p>${esc(lines(o.items).join(", "))}</p></button>`).join("");
}

function renderPeople(){
  const all=Object.entries(S.data.people).filter(([,p])=>has(p,["name","group","allergies","dietary","likes","dislikes","notes"])).sort((a,b)=>(a[1].name||"").localeCompare(b[1].name||""));
  if(!all.length)return empty(Object.keys(S.data.people).length?"Nothing matches":"No preferences yet","Press + Add to record a family member or guest, their allergies, dietary needs, likes and dislikes.");
  return ["Family","Guest","Staff"].map(gname=>{const g=all.filter(([,p])=>(p.group||"Family")===gname);return g.length?`<div class="gh"><span>${gname==="Guest"?"Guests":gname}</span><span>${g.length}</span></div>`+g.map(([id,p])=>
    `<button class="tk" data-o="people:${esc(id)}"><h3>${esc(p.name)}</h3>${p.allergies?`<p class="alg">Allergies: ${esc(lines(p.allergies).join(", "))}</p>`:""}<p>${esc(lines(p.dietary).join(", ")||lines(p.likes).join(", "))}</p></button>`).join(""):"";}).join("");
}
function render(){
  const v=S.view,key=v==="res"?S.sub:v;
  document.querySelectorAll("#kp nav.tabs a").forEach(a=>a.classList.toggle("on",a.dataset.t===(v==="res"?"residences":v)));
  $("q").placeholder=PH[key];
  $("addBtn").hidden=!(S.write&&S.ready);
  const n=Object.values(S.data.recipes).filter(r=>r.title).length;
  $("sub").textContent=S.loaded?`${n} recipe${n===1?"":"s"}`:"Loading\u2026";
  $("view").innerHTML=!S.loaded?`<div class="empty">Opening the kitchen book\u2026</div>`:v==="recipes"?renderRecipes():v==="residences"?renderResidences():v==="people"?renderPeople():renderRes();
  if(S.open)openItem(S.open,true);
}

/* ---------- detail sheets ---------- */
let mult=1;
function sheet(html){$("sheetBody").innerHTML=html;$("sheet").hidden=false;document.body.style.overflow="hidden";}
function closeSheet(){$("sheet").hidden=true;S.open=null;document.body.style.overflow="";}
function openItem(key,refresh){
  const i=key.indexOf(":"),col=key.slice(0,i),id=key.slice(i+1),o=S.data[col][id];
  if(!o){if(refresh)closeSheet();return;}
  if(refresh&&$("sheetBody").querySelector("form"))return;
  S.open=key;
  const edit=S.write?`<button class="kbtn" data-act="edit">Edit</button>`:"";
  if(col==="recipes"){
    const ings=(o.ingredients||[]).filter(x=>x.single||x.name||x.double);
    const isH=x=>!String(x.single||"").trim()&&!String(x.double||"").trim()&&/[A-Z]/.test(x.name||"")&&x.name===x.name.toUpperCase();
    const amt=x=>mult===2?(x.double||dbl(x.single)||x.single||""):(x.single||"");
    const y=mult===2?(o.yieldDouble||dbl(o.yieldSingle)):o.yieldSingle;
    if(!refresh)addRecent(id);
    const ph=o.photos||[];
    sheet(`<div class="shd"><h2 id="sheetT">${esc(o.title)}</h2><button class="fav${isFav(id)?" on":""}" data-act="fav" aria-label="${isFav(id)?"Remove from favourites":"Add to favourites"}">${isFav(id)?"\u2605":"\u2606"}</button></div>
     ${o.review&&S.role==="admin"?`<div class="review"><b>Needs review</b><ul>${o.review.split("; ").map(x=>`<li>${esc(x)}</li>`).join("")}</ul><small>Fix the recipe with Edit card, then clear the \u201cNeeds review\u201d box.</small></div>`:""}<p class="kmeta">${esc([o.section,o.kitchen&&("Kitchen "+o.kitchen),y&&("Yield "+y)].filter(Boolean).join(" \u00b7 "))}</p>
     <div class="seg"><button data-m="1" class="${mult===1?"on":""}">Single</button><button data-m="2" class="${mult===2?"on":""}">Double</button></div>
     ${ings.length?`<table class="king"><tbody>${ings.map(x=>isH(x)?`<tr class="h"><td colspan="2">${esc(x.name)}</td></tr>`:`<tr><td class="q">${esc(amt(x))}</td><td>${esc(x.name)}</td></tr>`).join("")}</tbody></table>`:""}
     ${o.cooking?`<div class="blk"><h4>Cooking / \u00b0C</h4><div class="txt">${esc(o.cooking)}</div></div>`:""}
     ${o.method?`<div class="blk"><h4>Method</h4><div class="txt">${esc(o.method)}</div></div>`:""}
     ${o.notes?`<div class="blk"><h4>Important notes</h4><div class="note">${esc(o.notes)}</div></div>`:""}
     ${ph.length||S.write?`<div class="blk"><h4>Photos &amp; steps</h4>${ph.map((p,n)=>`<figure class="ph"><img src="${esc(p.url)}" alt="${esc(p.caption||o.title)}" loading="lazy">${p.caption?`<figcaption>${n+1}. ${esc(p.caption)}</figcaption>`:""}${S.write?`<span id="phd${n}"><button class="kbtn del sm" data-act="phdel" data-n="${n}">Remove</button></span>`:""}</figure>`).join("")}
       ${S.write?`<div id="phAdd"><button class="kbtn" data-act="phnew">+ Add photo</button></div>`:""}</div>`:""}
     ${S.write?`<div class="acts"><button class="kbtn" data-act="rbedit">Edit card</button></div>`:""}`);
  }else if(col==="menus"){
    const map=recipeByTitle();
    sheet(`<h2 id="sheetT">${esc(o.meal||"Menu")}, ${esc(fmtDate(o.date))}</h2><p class="kmeta">${esc([o.location,o.guests&&(o.guests+" guests")].filter(Boolean).join(" \u00b7 "))}</p>
     <ul class="lines">${lines(o.courses).map(l=>{const r=map[l.replace(/^[^:]{1,20}:\s*/,"").toLowerCase()]||map[l.toLowerCase()];return `<li>${r?`<a data-o="recipes:${esc(r)}">${esc(l)}</a>`:esc(l)}</li>`;}).join("")}</ul>
     ${o.notes?`<div class="blk"><h4>Notes</h4><div class="note">${esc(o.notes)}</div></div>`:""}
     <div class="acts">${edit}<button class="kbtn" data-act="copy">Copy menu</button>${S.write?`<button class="kbtn" data-act="repeat">Reuse for a new date</button>`:""}</div>`);
  }else if(col==="contacts"){
    sheet(`<h2 id="sheetT">${esc(o.name)}</h2><p class="kmeta">${esc([o.category,o.location||"All properties"].filter(Boolean).join(" \u00b7 "))}</p>
     <div class="acts">${o.phone?telLink(o.phone):""}${o.alt?telLink(o.alt):""}</div>
     ${o.email?`<div class="blk"><h4>Email</h4><div class="txt">${esc(o.email)}</div></div>`:""}
     ${o.notes?`<div class="blk"><h4>Notes</h4><div class="note">${esc(o.notes)}</div></div>`:""}
     <div class="acts">${edit}${o.phone?`<button class="kbtn" data-act="copynum">Copy number</button>`:""}</div>`);
  }else if(col==="people"){
    const blk=(h,v)=>v?`<div class="blk"><h4>${h}</h4><div class="txt">${esc(v)}</div></div>`:"";
    sheet(`<h2 id="sheetT">${esc(o.name)}</h2><p class="kmeta">${esc(o.group||"Family")}</p>
     <div class="algbox"><h4>Allergies</h4><div class="txt">${esc(o.allergies||"None recorded")}</div></div>
     ${blk("Dietary requirements",o.dietary)}${blk("Likes",o.likes)}${blk("Dislikes",o.dislikes)}${blk("Notes",o.notes)}
     <div class="acts">${edit}</div>`);
  }else if(col==="orders"){
    const c=Object.values(S.data.contacts).find(c=>(c.name||"").trim().toLowerCase()===(o.vendor||"").trim().toLowerCase());
    const next={Draft:"Sent",Sent:"Delivered"}[o.status];
    sheet(`<h2 id="sheetT">${esc(o.vendor||"Order")}</h2><p class="kmeta">${esc([o.type==="restaurant"?"Restaurant takeaway":"Supplier order",fmtDate(o.date),o.location,o.status].filter(Boolean).join(" \u00b7 "))}</p>
     ${c&&c.phone?`<div class="acts">${telLink(c.phone)}</div>`:""}
     <ul class="lines">${lines(o.items).map(l=>`<li>${esc(l)}</li>`).join("")}</ul>
     ${o.notes?`<div class="blk"><h4>Notes</h4><div class="note">${esc(o.notes)}</div></div>`:""}
     <div class="acts">${S.write&&next?`<button class="kbtn pri" data-act="status" data-v="${next}">Mark ${next.toLowerCase()}</button>`:""}<button class="kbtn" data-act="copy">Copy order</button>${S.write?`<button class="kbtn" data-act="repeat">Order again</button>`:""}${edit}</div>`);
  }
}
function orderText(o){return [`${o.vendor||"Order"}${o.date?" for "+fmtDate(o.date):""}${o.location?" ("+o.location+")":""}`,"",...lines(o.items),...(o.notes?["",o.notes]:[])].join("\n");}
function menuText(o){return [`${o.meal||"Menu"}, ${fmtDate(o.date)}${o.location?", "+o.location:""}`,"",...lines(o.courses)].join("\n");}

/* ---------- forms ---------- */
function form(col,id,seed){
  const o={...(seed||(id?S.data[col][id]:{})||{})};const r=curRes();if(col==="recipes")o.ing=(o.ingredients||[]).map(x=>(x.single||x.double)?[x.single||"",x.name||"",x.double||""].join(" | ").replace(/ \| $/,""):(x.name||"")).join("\n");
  const vendors=Object.values(S.data.contacts).filter(c=>c.category==="Supplier"||c.category==="Restaurant").map(c=>c.name);
  const field=f=>{const v=o[f.k]??(f.t==="date"?today():f.k==="type"?S.otype:f.k==="status"?"Draft":f.k==="location"&&r?r.name:"");
    if(f.opts)return `<label for="kf_${f.k}">${f.l}</label><select id="kf_${f.k}" data-k="${f.k}">${f.opts.map((x,i)=>`<option value="${esc(x)}" ${x===v?"selected":""}>${esc(f.lab?f.lab[i]:x)}</option>`).join("")}</select>`;
    if(f.t==="area")return `<label for="kf_${f.k}">${f.l}</label><textarea id="kf_${f.k}" data-k="${f.k}"${f.big?' style="min-height:240px"':""}>${esc(v)}</textarea>`;
    return `<label for="kf_${f.k}">${f.l}</label><input id="kf_${f.k}" data-k="${f.k}" type="${f.t||"text"}" value="${esc(v)}" ${f.list?`list="dl_${f.list}"`:""} ${f.k==="name"||f.k==="vendor"?"required":""}>`;};
  const title={menus:"menu",contacts:"number",orders:"order",residences:"residence or yacht",people:"person",recipes:"recipe"}[col];
  sheet(`<h2 id="sheetT">${id?"Edit":"New"} ${title}</h2><form id="frm" data-col="${col}" data-id="${esc(id||"")}">${FORMS[col].map(field).join("")}
    <datalist id="dl_locs">${locs().map(l=>`<option value="${esc(l)}">`).join("")}</datalist><datalist id="dl_sections">${[...new Set([...FOLDERS,...Object.values(S.data.recipes).map(r=>r.section).filter(Boolean)])].map(l=>`<option value="${esc(l)}">`).join("")}</datalist><datalist id="dl_vendors">${vendors.map(l=>`<option value="${esc(l)}">`).join("")}</datalist>
    <div class="acts"><button class="kbtn pri" type="submit">Save</button>${id?`<span id="delW"><button class="kbtn del" type="button" data-act="del">Delete</button></span>`:""}</div></form>`);
}
async function save(e){
  e.preventDefault();const f=e.target,col=f.dataset.col;let id=f.dataset.id;const d={...((id&&S.data[col][id])||{})};
  f.querySelectorAll("[data-k]").forEach(x=>d[x.dataset.k]=x.value.trim());if(col==="recipes"&&!d.review)delete d.review;d.savedAt=Date.now();
  if(col==="recipes"){d.ingredients=lines(d.ing).map(l=>{const p=l.split("|").map(x=>x.trim());return p.length===1?{single:"",name:p[0],double:""}:{single:p[0],name:p[1]||"",double:p[2]||""};});delete d.ing;d.titleLower=(d.title||"").toLowerCase();d.updated=today();}
  const rid=id||newId();
  try{await store.put(col,rid,d);
    if(col==="residences"){closeSheet();if(!id)location.hash="r-"+rid;else render();}
    else{S.open=col+":"+rid;$("sheetBody").innerHTML="";openItem(S.open);render();}
    toast("Saved");}
  catch(err){toast("Couldn't save on this phone.");}
}

async function shrink(file){
  const img=await createImageBitmap(file);const m=1600,k=Math.min(1,m/Math.max(img.width,img.height));
  const c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext("2d").drawImage(img,0,0,c.width,c.height);
  return await new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("Couldn't read that photo")),"image/jpeg",.82));
}
/* ---------- events ---------- */
document.addEventListener("click",async e=>{
  if(!e.target.closest("#kp"))return;
  const t=e.target.closest("[data-o],[data-ot],[data-m],[data-act],[data-sub]");if(!t)return;
  if(t.dataset.o){openItem(t.dataset.o);return;}
  if(t.dataset.sub){S.sub=t.dataset.sub;S.q="";$("q").value="";render();return;}
  if(t.dataset.ot){S.otype=t.dataset.ot;render();return;}
  if(t.dataset.m){mult=+t.dataset.m;openItem(S.open);return;}
  const a=t.dataset.act;
  if(a==="editres"){form("residences",S.res);return;}
  const[col,id]=(S.open||":").split(/:(.*)/),o=S.data[col]?.[id];
  if(a==="rbedit"){form("recipes",id);}
  else if(a==="fav"){toggleFav(id);openItem(S.open);render();toast(isFav(id)?"Added to favourites":"Removed from favourites");}
  else if(a==="phnew"){$("phAdd").innerHTML=`<div class="phform"><label for="phF">Photo</label><input type="file" id="phF" accept="image/*"><label for="phC">Step or caption (optional)</label><input id="phC" placeholder="e.g. Fold the pastry like this"><div class="acts"><button class="kbtn pri" data-act="phup">Upload</button><button class="kbtn" data-act="phcancel">Cancel</button></div></div>`;}
  else if(a==="phcancel"){openItem(S.open);}
  else if(a==="phup"){const file=$("phF").files[0];if(!file)return toast("Choose a photo first.");if(!navigator.onLine||!sb)return toast("You need a connection to add photos.");
    t.disabled=true;t.textContent="Uploading\u2026";
    try{const blob=await shrink(file);const path=`recipes/${id}/${Date.now()}.jpg`;
      const{error}=await sb.storage.from("photos").upload(path,blob,{contentType:"image/jpeg",upsert:false});if(error)throw error;
      const url=sb.storage.from("photos").getPublicUrl(path).data.publicUrl;
      const cur=S.data.recipes[id];await store.put("recipes",id,{...cur,photos:[...(cur.photos||[]),{url,path,caption:$("phC").value.trim()}],savedAt:Date.now()});
      openItem(S.open);toast("Photo added");}
    catch(err){toast("Couldn't upload: "+(err.message||err));openItem(S.open);}}
  else if(a==="phdel"){const n=+t.dataset.n;$("phd"+n).innerHTML=`<button class="kbtn del sm" data-act="phdel2" data-n="${n}">Yes, remove</button>`;}
  else if(a==="phdel2"){const n=+t.dataset.n,cur=S.data.recipes[id];const photos=(cur.photos||[]).filter((_,k)=>k!==n);
    await store.put("recipes",id,{...cur,photos,savedAt:Date.now()});openItem(S.open);toast("Photo removed");}
  else if(a==="edit")form(col,id);
  else if(a==="copy")copy(col==="orders"?orderText(o):menuText(o));
  else if(a==="copynum")copy(o.phone);
  else if(a==="repeat"){const s={...o,date:today()};if(col==="orders")s.status="Draft";form(col,null,s);}
  else if(a==="status"){try{await store.put(col,id,{...o,status:t.dataset.v,savedAt:Date.now()});openItem(S.open);render();}catch(err){toast("Couldn't update the order.");}}
  else if(a==="del"){$("delW").innerHTML=`<button class="kbtn del" type="button" data-act="del2">Yes, delete</button> <button class="kbtn" type="button" data-act="keep">Keep</button>`;}
  else if(a==="keep"){$("delW").innerHTML=`<button class="kbtn del" type="button" data-act="del">Delete</button>`;}
  else if(a==="del2"){const f=$("frm");try{await store.del(f.dataset.col,f.dataset.id);closeSheet();if(f.dataset.col==="residences")location.hash="residences";render();toast("Deleted");}catch(err){toast("Couldn't delete.");}}
});
document.addEventListener("submit",e=>{if(e.target.id==="frm")save(e);});
$("closeBtn").onclick=closeSheet;
$("sheet").addEventListener("click",e=>{if(e.target.id==="sheet")closeSheet();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("sheet").hidden)closeSheet();});
$("addBtn").onclick=()=>{if(S.view==="recipes")form("recipes",null,S.folder?{section:S.folder}:undefined);else if(S.view==="residences")form("residences",null);else if(S.view==="people")form("people",null);else form(S.sub,null);};
let qt;$("q").addEventListener("input",e=>{clearTimeout(qt);qt=setTimeout(()=>{S.q=e.target.value;render();},120);});
function route(){
  const h=location.hash.slice(1);
  let v="recipes",res=null;
  S.folder=h.startsWith("f-")?decodeURIComponent(h.slice(2)):null;if(h==="residences")v="residences";else if(h==="preferences")v="people";else if(h.startsWith("r-")){v="res";res=h.slice(2);}
  if(v!==S.view||res!==S.res||S.folder!==S.lastFolder){S.lastFolder=S.folder;S.view=v;S.res=res;S.q="";$("q").value="";closeSheet();window.scrollTo(0,0);}
  render();
}
window.addEventListener("hashchange",route);

/* ---------- local store (IndexedDB) + sync (Supabase) ---------- */
const CFG=window.KP_CONFIG||{};
const sb=(CFG.url&&CFG.anonKey&&window.supabase)?window.supabase.createClient(CFG.url,CFG.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}):null;
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const idb={db:null,
  open(){return this.db||(this.db=new Promise((res,rej)=>{const r=indexedDB.open("kitchen-pass",1);r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore("items",{keyPath:"id"});d.createObjectStore("outbox",{keyPath:"id"});d.createObjectStore("meta");};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}));},
  async tx(name,mode,fn){const d=await this.open();return new Promise((res,rej)=>{const t=d.transaction(name,mode),st=t.objectStore(name);const out=fn(st);t.oncomplete=()=>res(out instanceof IDBRequest?out.result:out);t.onerror=()=>rej(t.error);});},
  all(name){return this.tx(name,"readonly",st=>st.getAll());},
  putMany(name,rows){return this.tx(name,"readwrite",st=>{rows.forEach(r=>st.put(r));});},
  delMany(name,ids){return this.tx(name,"readwrite",st=>{ids.forEach(i=>st.delete(i));});},
  get(key){return this.tx("meta","readonly",st=>st.get(key));},
  set(key,v){return this.tx("meta","readwrite",st=>{st.put(v,key);});},
  clear(){return Promise.all(["items","outbox","meta"].map(n=>this.tx(n,"readwrite",st=>{st.clear();})));}
};
const split=id=>{const i=id.indexOf("/");return [id.slice(0,i),id.slice(i+1)];};
function apply(row){const[col,id]=split(row.id);if(!S.data[col])return;if(row.deleted)delete S.data[col][id];else S.data[col][id]=row.data||{};}
const store={
  async put(col,id,data){const row={id:col+"/"+id,collection:col,data,deleted:false};apply(row);await idb.putMany("items",[row]);await idb.putMany("outbox",[row]);sync();},
  async del(col,id){const row={id:col+"/"+id,collection:col,data:{},deleted:true};apply(row);await idb.putMany("items",[row]);await idb.putMany("outbox",[row]);sync();}
};
let syncing=false,lastSync=null,syncErr="";
function status(){
  const on=navigator.onLine,d=$("dot");if(!d)return;
  d.className="dot"+(!on?" off":syncErr?" err":"");
  d.title=!on?"Offline: changes are kept on this phone and sync later":syncErr||"Synced";
}
async function sync(){
  if(!sb||syncing||!navigator.onLine||!S.user)return;syncing=true;
  try{
    const out=await idb.all("outbox");
    for(let i=0;i<out.length;i+=200){const chunk=out.slice(i,i+200);const{error}=await sb.from("items").upsert(chunk.map(r=>({id:r.id,collection:r.collection,data:r.data,deleted:r.deleted})));if(error)throw error;await idb.delMany("outbox",chunk.map(r=>r.id));}
    const pending=new Set((await idb.all("outbox")).map(r=>r.id));
    let since=(await idb.get("lastSync"))||"1970-01-01T00:00:00Z",max=since,from=0;
    const sinceQ=new Date(new Date(since).getTime()-10000).toISOString();
    for(;;){const{data,error}=await sb.from("items").select("id,collection,data,deleted,updated_at").gt("updated_at",sinceQ).order("updated_at").range(from,from+999);
      if(error)throw error;const rows=data.filter(r=>!pending.has(r.id));rows.forEach(apply);if(rows.length)await idb.putMany("items",rows);
      data.forEach(r=>{if(r.updated_at>max)max=r.updated_at;});if(data.length<1000)break;from+=1000;}
    await idb.set("lastSync",max);lastSync=new Date();syncErr="";
  }catch(e){syncErr="Couldn't sync: "+(e.message||e);}
  syncing=false;status();render();
}

/* ---------- sign in ---------- */
const SITE=location.origin+location.pathname;
function authScreen(step,msg){
  $("kp").hidden=true;let a=$("auth");if(!a){a=document.createElement("div");a.id="auth";a.className="auth";$("root").appendChild(a);}a.hidden=false;
  const tab=step==="join"?"join":step==="claim"?"claim":step==="newpw"?"newpw":"in";
  a.innerHTML=!sb?`<h2 class="wm" aria-label="PASS"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 134 92" width="134" height="92" role="img" aria-label="PASS"><rect width="134" height="92" rx="3" fill="#14213d"/><g transform="translate(4,0) scale(1)" fill="none" stroke="#f6f1e7" stroke-width="10.0" stroke-linecap="round" stroke-linejoin="round"><path d="M5.0 69.0V19.0A10.0 10.0 0 0 1 25.0 19.0V38.0A10.0 10.0 0 0 1 5.0 38.0M5.0 83.0h0M37.0 69.0V19.0A10.0 10.0 0 0 1 57.0 19.0V69.0M37.0 48.0H57.0M37.0 83.0h0M57.0 83.0h0M89.0 22.0V19.0A10.0 10.0 0 0 0 69.0 19.0V38.0C69.0 45.0 89.0 47.0 89.0 54.0V73.0A10.0 10.0 0 0 1 69.0 73.0V70.0M121.0 22.0V19.0A10.0 10.0 0 0 0 101.0 19.0V38.0C101.0 45.0 121.0 47.0 121.0 54.0V73.0A10.0 10.0 0 0 1 101.0 73.0V70.0"/></g></svg></h2><p>This copy isn't connected to its database yet.</p>`
   :tab==="newpw"?`<h2>Choose a new password</h2><p>Set the password you'll use to sign in to PASS.</p><form id="npF"><label for="np">New password (8+ characters)</label><input id="np" type="password" autocomplete="new-password" minlength="8" required><button class="kbtn pri">Save password</button></form><p class="err">${esc(msg||"")}</p>`
   :tab==="claim"?`<h2>Enter your invite code</h2><p>You're signed in, but your account isn't linked to the team yet. Enter the 6-letter code Hamish sent you.</p><form id="claimF"><label for="cc">Invite code</label><input id="cc" autocapitalize="characters" autocomplete="off" required><button class="kbtn pri">Join the team</button></form><p class="err">${esc(msg||"")}</p><p><a href="#" data-auth="out">Sign out</a></p>`
   :tab==="join"?`<h2>First time here</h2><p>Use the email and invite code Hamish sent you, and choose a password.</p><form id="joinF"><label for="je">Email</label><input id="je" type="email" autocomplete="email" required><label for="jc">Invite code</label><input id="jc" autocapitalize="characters" autocomplete="off" required><label for="jp">Choose a password (8+ characters)</label><input id="jp" type="password" autocomplete="new-password" minlength="8" required><button class="kbtn pri">Create my account</button></form><p class="err">${esc(msg||"")}</p><p><a href="#" data-auth="in">I already have a password</a></p>`
   :`<h2 class="wm" aria-label="PASS"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 134 92" width="134" height="92" role="img" aria-label="PASS"><rect width="134" height="92" rx="3" fill="#14213d"/><g transform="translate(4,0) scale(1)" fill="none" stroke="#f6f1e7" stroke-width="10.0" stroke-linecap="round" stroke-linejoin="round"><path d="M5.0 69.0V19.0A10.0 10.0 0 0 1 25.0 19.0V38.0A10.0 10.0 0 0 1 5.0 38.0M5.0 83.0h0M37.0 69.0V19.0A10.0 10.0 0 0 1 57.0 19.0V69.0M37.0 48.0H57.0M37.0 83.0h0M57.0 83.0h0M89.0 22.0V19.0A10.0 10.0 0 0 0 69.0 19.0V38.0C69.0 45.0 89.0 47.0 89.0 54.0V73.0A10.0 10.0 0 0 1 69.0 73.0V70.0M121.0 22.0V19.0A10.0 10.0 0 0 0 101.0 19.0V38.0C101.0 45.0 121.0 47.0 121.0 54.0V73.0A10.0 10.0 0 0 1 101.0 73.0V70.0"/></g></svg></h2><p>Recipes, residences and family preferences for the kitchen team.</p><form id="inF"><label for="ie">Email</label><input id="ie" type="email" autocomplete="email" required><label for="ip">Password</label><input id="ip" type="password" autocomplete="current-password" required><button class="kbtn pri">Sign in</button></form><p class="err">${esc(msg||"")}</p><p><a href="#" data-auth="join">First time? I have an invite code</a></p><p><a href="#" id="forgot">Forgotten your password?</a></p>`;
  a.querySelectorAll("[data-auth]").forEach(l=>l.onclick=async e=>{e.preventDefault();if(l.dataset.auth==="out"){await sb.auth.signOut();authScreen("in");}else authScreen(l.dataset.auth);});
  const busy=f=>{const b=f.querySelector("button");b.disabled=true;b.textContent="Please wait\u2026";};
  const inF=$("inF"),joinF=$("joinF"),claimF=$("claimF"),npF=$("npF"),fg=$("forgot");
  if(fg)fg.onclick=async e=>{e.preventDefault();const email=$("ie").value.trim().toLowerCase();
    if(!email)return authScreen("in","Type your email above first, then tap \u201cForgotten your password?\u201d again.");
    const{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:SITE});
    authScreen("in",error?"We couldn't send a reset email to that address. Ask Hamish for a new invite code.":"If that email is on the team, a reset link is on its way. Open it on this phone.");};
  if(npF)npF.onsubmit=async e=>{e.preventDefault();busy(npF);const{error}=await sb.auth.updateUser({password:$("np").value});
    if(error)return authScreen("newpw",error.message);const{data}=await sb.auth.getSession();start(data.session);};
  if(inF)inF.onsubmit=async e=>{e.preventDefault();busy(inF);const{data,error}=await sb.auth.signInWithPassword({email:$("ie").value.trim().toLowerCase(),password:$("ip").value});
    if(error)return authScreen("in",error.message==="Invalid login credentials"?"That email and password don't match. Tap \u201cForgotten your password?\u201d below.":error.message);start(data.session);};
  if(joinF)joinF.onsubmit=async e=>{e.preventDefault();busy(joinF);const email=$("je").value.trim().toLowerCase(),password=$("jp").value,code=$("jc").value;
    let{data,error}=await sb.auth.signUp({email,password});
    if(error&&/already/i.test(error.message)){({data,error}=await sb.auth.signInWithPassword({email,password}));}
    if(error)return authScreen("join",/signups not allowed/i.test(error.message)?"New accounts are switched off. In Supabase, turn on 'Allow new users to sign up'.":error.message);
    if(!data.session)return authScreen("join","Account created but not signed in. Ask Hamish to switch off 'Confirm email' in Supabase.");
    const{data:role,error:ce}=await sb.rpc("claim_invite",{code});
    if(ce||!role){await sb.auth.signOut();return authScreen("join","That invite code doesn't match this email, or has already been used.");}
    start(data.session);};
  if(claimF)claimF.onsubmit=async e=>{e.preventDefault();busy(claimF);const{data:role}=await sb.rpc("claim_invite",{code:$("cc").value});
    if(!role)return authScreen("claim","That code doesn't match your email, or has already been used.");const{data}=await sb.auth.getSession();start(data.session);};
}
async function start(session){
  S.user=session.user;const a=$("auth");if(a)a.hidden=true;$("kp").hidden=false;
  const cached=await idb.get("user");
  if(cached&&cached!==S.user.email){await idb.clear();for(const c of COLS)S.data[c]={};}
  await idb.set("user",S.user.email);
  if(navigator.onLine){const{data,error}=await sb.rpc("my_role");if(!error){S.role=data;await idb.set("role",data);}}else S.role=await idb.get("role");
  if(!S.role&&navigator.onLine)return authScreen("claim");
  S.ready=true;render();await sync();
}

/* ---------- more menu: team, import, sign out ---------- */
async function moreSheet(){
  let team="";
  if(S.role==="admin"&&navigator.onLine){const{data}=await sb.from("members").select("email,role,invite_code,claimed_by").order("email");
    team=`<div class="blk"><h4>Team</h4>${(data||[]).map(m=>`<div class="mrow"><span>${esc(m.email)}${m.role==="admin"?" (admin)":""}<br><small class="kmeta">${m.claimed_by?"Active":"Waiting \u00b7 code "+esc(m.invite_code||"")}</small></span>${m.email!==S.user.email?`<span><button class="kbtn" data-reset="${esc(m.email)}" data-role="${esc(m.role)}">${m.claimed_by?"Reset":"New code"}</button> <button class="kbtn del" data-rm="${esc(m.email)}">Remove</button></span>`:""}</div>`).join("")}
     <div id="invOut"></div>
     <form id="addM"><label for="nm">Add a chef by email</label><input id="nm" type="email" required><div class="acts"><button class="kbtn pri">Add and get invite code</button></div></form></div>
     <div class="blk"><h4>Import from the Recipe Book</h4><p class="kmeta">Choose the file from "Export everything" on the old page. Existing items with the same id are replaced.</p><input type="file" id="imp" accept="application/json,.json"></div>`;}
  sheet(`<h2 id="sheetT">PASS</h2><p class="kmeta">Signed in as ${esc(S.user?.email||"")}${S.role?" \u00b7 "+esc(S.role):""}</p>
   <p>${navigator.onLine?(syncErr?esc(syncErr):"Online. "+(lastSync?"Last synced "+lastSync.toLocaleTimeString():"")):"Offline. Changes are saved on this phone and sync when you're back online."}</p>
   <div class="acts"><button class="kbtn" data-act="syncnow">Sync now</button><button class="kbtn del" data-act="signout">Sign out</button></div>${team}`);
  const invite=async(email,role)=>{const{data:code,error}=await sb.rpc("invite_member",{p_email:email,p_role:role||"chef"});
    if(error)return toast("Couldn't add: "+error.message);await moreSheet();
    const msg=`You're invited to PASS, the kitchen team's recipe and residence app.\n\n1. Open ${SITE}\n2. Tap "First time? I have an invite code"\n3. Email: ${email}\n   Invite code: ${code}\n4. Choose a password.\n\nOn iPhone: Share > Add to Home Screen. On Android: menu > Add to Home screen.`;
    $("invOut").innerHTML=`<div class="note">Invite code for ${esc(email)}: <b>${esc(code)}</b></div><div class="acts"><button class="kbtn pri" id="cpInv">Copy invite message</button></div>`;
    $("cpInv").onclick=()=>copy(msg);};
  const am=$("addM");if(am)am.onsubmit=async e=>{e.preventDefault();invite($("nm").value.trim().toLowerCase(),"chef");};
  document.querySelectorAll("[data-reset]").forEach(b=>b.onclick=()=>invite(b.dataset.reset,b.dataset.role));
  document.querySelectorAll("[data-rm]").forEach(b=>b.onclick=async()=>{if(b.textContent!=="Sure?"){b.textContent="Sure?";return;}const{error}=await sb.rpc("remove_member",{p_email:b.dataset.rm});toast(error?"Couldn't remove":"Removed");moreSheet();});
  const imp=$("imp");if(imp)imp.onchange=async()=>{
    try{const j=JSON.parse(await imp.files[0].text());const rows=[];
      for(const col of COLS)for(const[id,d]of Object.entries(j[col]||{}))rows.push({id:col+"/"+id,collection:col,data:d,deleted:false});
      rows.forEach(apply);await idb.putMany("items",rows);await idb.putMany("outbox",rows);toast(`Importing ${rows.length} items\u2026`);render();await sync();toast(syncErr||`Imported ${rows.length} items`);
    }catch(e){toast("That file couldn't be read.");}};
}
$("moreBtn").onclick=()=>{if(S.user)moreSheet();};
document.addEventListener("click",async e=>{const a=e.target.closest("#kp [data-act]")?.dataset.act;
  if(a==="syncnow"){await sync();moreSheet();}
  if(a==="signout"){await sb.auth.signOut();await idb.clear();location.reload();}
});
window.addEventListener("online",()=>{status();sync();});
window.addEventListener("offline",status);
setInterval(()=>{if(document.visibilityState==="visible")sync();},60000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")sync();});

/* ---------- boot ---------- */
route();
(async()=>{
  try{for(const r of await idb.all("items"))apply(r);}catch(e){}
  S.loaded=true;status();render();
  if(!sb)return authScreen();
  const hp=new URLSearchParams(location.hash.slice(1));
  if(hp.get("error_description")){history.replaceState(null,"",SITE);route();return authScreen("in","That reset link has expired or was already used. Tap \u201cForgotten your password?\u201d to get a new one.");}
  if(hp.get("type")==="recovery"&&hp.get("access_token")){
    const{error}=await sb.auth.setSession({access_token:hp.get("access_token"),refresh_token:hp.get("refresh_token")});
    history.replaceState(null,"",SITE);route();
    return authScreen(error?"in":"newpw",error?"That reset link didn't work. Tap \u201cForgotten your password?\u201d to get a new one.":"");}
  const{data}=await sb.auth.getSession();
  if(data&&data.session)start(data.session);
  else if(!navigator.onLine&&await idb.get("user")){S.user={email:await idb.get("user")};S.role=await idb.get("role");S.ready=!!S.role;render();}
  else authScreen("in");
})();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
}
