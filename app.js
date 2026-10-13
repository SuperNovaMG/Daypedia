/* Daypedia — discovery UI, local date data and sharing */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const COPY = {
  hi: {
    navHome:"Home",navToday:"Aaj",navSearch:"Search",navCategories:"Categories",navUpcoming:"Aane wale",
    eyebrow:"EXPLORE · DISCOVER · CELEBRATE",heroFirst:"Har din",heroSecond:"ek kahani.",tagline:"Roz ek naya din, roz ek nayi kahani.",
    heroDescription:"Festivals, awareness days, history aur duniya bhar ke special days ko discover karo.",
    searchPlaceholder:"Koi day, festival ya topic search karo...",todayDate:"Aaj ki date",upcoming:"Aane wale highlights",
    todayKicker:"AAJ KI KHOJ",featuredTitle:"Featured day",viewDetails:"Date explore karo",moreKicker:"AUR BHI KHAAS DIN",
    todayOthers:"Aaj ke aur days",browseKicker:"APNI PASAND KA DIN DHOONDO",browseTitle:"Category ke hisaab se dekho",
    viewAll:"Sab dekho",catFestival:"Festivals & celebrations",catAwareness:"Awareness days",catHistory:"Historic & world days",
    catNational:"National days",catFun:"Fun & quirky days",catFood:"Food days",exploreKicker:"CALENDAR, TUMHARI CURIOSITY",
    exploreTitle:"Koi bhi date explore karo",pickDate:"Date choose karo",goBtn:"Date dekho →",
    midnightKicker:"AGLI KAHANI",midnightTitle:"Naya din aane wala hai.",midnightText:"Kal ki discoveries ke liye countdown shuru.",
    countdownCaption:"MIDNIGHT TAK · IST",footer:"Curious minds ke liye. Har din ki apni ek kahani hai.",share:"Share",
    learnMore:"Puri story →",noData:"Is date ke liye data abhi available nahi hai.",noSearch:"Is search mein koi day nahi mila.",
    tomorrow:"Kal",today:"Aaj",popular:"Popular",week:"Is hafte",festival:"Festival",awareness:"Awareness",why:"Kyun manaya jata hai",
    fact:"Fun fact",dateRequired:"Pehle date choose karo.",shareDone:"Share card download ho gaya.",shareError:"Share karne mein problem hui."
  },
  en: {
    navHome:"Home",navToday:"Today",navSearch:"Search",navCategories:"Categories",navUpcoming:"Upcoming",
    eyebrow:"EXPLORE · DISCOVER · CELEBRATE",heroFirst:"Every day",heroSecond:"has a story.",tagline:"A new day, a new story, every day.",
    heroDescription:"Discover festivals, awareness days, historic moments and little-known reasons to celebrate the world around you.",
    searchPlaceholder:"Search a day, festival or topic...",todayDate:"Today's date",upcoming:"Upcoming highlights",
    todayKicker:"TODAY'S DISCOVERY",featuredTitle:"Featured day",viewDetails:"Explore dates",moreKicker:"MORE TO CELEBRATE",
    todayOthers:"More days today",browseKicker:"FIND YOUR KIND OF DAY",browseTitle:"Browse by category",viewAll:"View all",
    catFestival:"Festivals & celebrations",catAwareness:"Awareness days",catHistory:"Historic & world days",catNational:"National days",
    catFun:"Fun & quirky days",catFood:"Food days",exploreKicker:"YOUR CALENDAR, YOUR CURIOSITY",exploreTitle:"Explore any date",
    pickDate:"Pick a date",goBtn:"Explore date →",midnightKicker:"THE NEXT CHAPTER",midnightTitle:"A new day is almost here.",
    midnightText:"The countdown to tomorrow's discoveries starts now.",countdownCaption:"UNTIL MIDNIGHT · IST",
    footer:"Made for curious minds. Every day has a story.",share:"Share",learnMore:"Full story →",
    noData:"No days are listed for this date yet.",noSearch:"No days matched that search.",tomorrow:"Tomorrow",today:"Today",
    popular:"Popular",week:"This week",festival:"Festivals",awareness:"Awareness",why:"Why it's celebrated",fact:"Fun fact",
    dateRequired:"Please choose a date first.",shareDone:"Share card downloaded.",shareError:"Could not share this day."
  }
};
let lang = localStorage.getItem("aksd-lang") || "hi";
let theme = localStorage.getItem("aksd-theme") || "dark";
let DAYS = [];
let activeFilter = "popular";
let lastRendered = [];
const t = (key) => COPY[lang][key] || COPY.en[key] || key;
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const categoryLabel = (cat) => ({festival:lang==="hi"?"Festival":"Festival",awareness:"Awareness",international:lang==="hi"?"International":"International",national:"National",fun:lang==="hi"?"Fun":"Fun",food:"Food"}[cat] || cat || "Day");
const field = (entry,key) => entry[key+"_"+(lang==="hi"?"hi":"en")] || entry[key+"_en"] || "";
const monthDayKey = (date) => new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",month:"2-digit",day:"2-digit"}).format(date).replace("/","-");
function istDate(offset=0) {
  const parts = new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(p=>[p.type,p.value]));
  const date = new Date(Date.UTC(Number(values.year),Number(values.month)-1,Number(values.day)+offset,6));
  return date;
}
function dateKey(date) {
  const p = new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",month:"2-digit",day:"2-digit"}).formatToParts(date);
  const v=Object.fromEntries(p.map(x=>[x.type,x.value]));
  return v.month+"-"+v.day;
}
function todayKey(offset=0){return dateKey(istDate(offset));}
function niceDate(date,opts={}){return new Intl.DateTimeFormat(lang==="hi"?"en-IN":"en-US",{timeZone:"Asia/Kolkata",day:"numeric",month:"long",year:"numeric",...opts}).format(date);}
function localDateFromInput(value){const [y,m,d]=value.split("-").map(Number);return new Date(Date.UTC(y,m-1,d,6));}
function daysFor(key){return DAYS.filter(item=>item.d===key);}
function dayDate(entry,year=new Date().getFullYear()){const [m,d]=entry.d.split("-").map(Number);return new Date(Date.UTC(year,m-1,d,6));}
function nextOccurrence(entry){const today=istDate(0);let date=dayDate(entry,today.getUTCFullYear());if(date<today)date=dayDate(entry,today.getUTCFullYear()+1);return date;}
function dateDistance(date){return Math.round((date-istDate(0))/86400000);}
function shortDate(date){const dist=dateDistance(date);if(dist===0)return t("today");if(dist===1)return t("tomorrow");return new Intl.DateTimeFormat(lang==="hi"?"en-IN":"en-US",{timeZone:"Asia/Kolkata",weekday:"short",day:"numeric",month:"short"}).format(date);}
function dayImage(entry){
  const cat=entry.cat;
  const imgs={
    festival:"https://images.unsplash.com/photo-1604608672516-8f4f1d3b9d3a?auto=format&fit=crop&w=900&q=80",
    awareness:"https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80",
    international:"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80",
    national:"https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80",
    food:"https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80",
    fun:"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80"
  };
  return imgs[cat] || imgs.international;
}
function applyLanguage(){
  document.documentElement.dataset.lang=lang;
  document.querySelectorAll("[data-i18n]").forEach(el=>{const key=el.dataset.i18n;if(t(key)!==key){if(key==="featuredTitle")el.innerHTML=esc(t(key))+' <span>· '+esc(t("today"))+'</span>';else el.textContent=t(key);}});
  const search=$("#searchInput");if(search)search.placeholder=t("searchPlaceholder");
  $("#langToggle").innerHTML=(lang==="hi"?"HI":"EN")+' <span>⌄</span>';
  $("#themeToggle").textContent=theme==="dark"?"☾":"☀";
  document.title=lang==="hi"?"Daypedia — Har din ek nayi kahani":"Daypedia — Every Day Has a Story";
}
function applyTheme(){document.documentElement.dataset.theme=theme;$("#themeToggle").textContent=theme==="dark"?"☾":"☀";localStorage.setItem("aksd-theme",theme);}
function cardHTML(entry){
 const date=nextOccurrence(entry);
 const key=entry.d;
 return '<article class="day-card" role="button" tabindex="0" data-day-key="'+esc(key)+'" aria-label="'+esc("Open "+entry.name)+'"><div class="day-card-media" style="background-image:linear-gradient(0deg,rgba(6,9,27,.58),rgba(6,9,27,.08)),url(&quot;'+dayImage(entry)+'&quot;);background-size:cover;background-position:center"><span class="card-emoji">'+esc(entry.emoji||"✦")+'</span></div><div class="day-card-body"><span class="category-badge">'+esc(categoryLabel(entry.cat))+'</span><h3>'+esc(entry.name)+'</h3><p>'+esc(field(entry,"why"))+'</p><div class="day-card-meta"><span>'+esc(shortDate(date))+'</span><span class="card-arrow">↗</span></div><div class="day-card-actions"><button type="button" class="card-open-btn" data-open-day="'+esc(key)+'">'+esc(t("learnMore"))+'</button><button type="button" class="card-share-btn" data-share-day="'+esc(key)+'" aria-label="'+esc("Share "+entry.name)+'">↗ '+esc(t("share"))+'</button></div></div></article>';
}
function closeDayModal(){const modal=$("#dayModalBackdrop");if(modal)modal.remove();}
function openDayModal(entry){
 closeDayModal();
 const date=nextOccurrence(entry);
 const backdrop=document.createElement("div");backdrop.id="dayModalBackdrop";backdrop.className="day-modal-backdrop";backdrop.innerHTML='<article class="day-modal" role="dialog" aria-modal="true" aria-labelledby="dayModalTitle"><div class="day-modal-cover" style="background-image:linear-gradient(0deg,rgba(5,8,23,.3),rgba(5,8,23,.1)),url(&quot;'+dayImage(entry)+'&quot;);background-size:cover;background-position:center"><span>'+esc(entry.emoji||"✦")+'</span><button class="day-modal-close" type="button" aria-label="Close">×</button></div><div class="day-modal-content"><span class="category-badge">'+esc(categoryLabel(entry.cat))+'</span><h2 id="dayModalTitle">'+esc(entry.name)+'</h2><p class="day-modal-date">▦ '+esc(niceDate(date))+'</p><section class="day-modal-section"><h3>'+esc(t("why"))+'</h3><p>'+esc(field(entry,"why"))+'</p></section><section class="day-modal-section"><h3>'+esc(t("who"))+'</h3><p>'+esc(field(entry,"who"))+'</p></section><section class="day-modal-section"><h3>'+esc(t("fact"))+'</h3><p>'+esc(field(entry,"fact"))+'</p></section><div class="day-modal-actions"><button class="primary-btn" id="modalShareDay">'+esc(t("share"))+' ↗</button><button class="secondary-btn" id="modalCopyDay">Copy details</button></div></div></article>';
 document.body.appendChild(backdrop);
 backdrop.addEventListener("click",event=>{if(event.target===backdrop||event.target.closest(".day-modal-close"))closeDayModal();});
 backdrop.querySelector("#modalShareDay").addEventListener("click",()=>shareDay(entry));
 backdrop.querySelector("#modalCopyDay").addEventListener("click",async()=>{const text=entry.name+"\n"+field(entry,"why")+"\n"+t("fact")+": "+field(entry,"fact")+"\n"+location.href;try{await navigator.clipboard.writeText(text);showToast("Details copied!");}catch(error){downloadShareCard(entry);} });
 const onKey=event=>{if(event.key==="Escape"){closeDayModal();document.removeEventListener("keydown",onKey);}};
 document.addEventListener("keydown",onKey);
}
function bindDayCards(root=document){
 root.querySelectorAll("[data-day-key]").forEach(card=>{
  const open=()=>{const entry=DAYS.find(x=>x.d===card.dataset.dayKey&&x.name===card.querySelector("h3")?.textContent);if(entry)openDayModal(entry);};
  card.addEventListener("click",event=>{if(event.target.closest("[data-share-day]"))return;open();});
  card.addEventListener("keydown",event=>{if((event.key==="Enter"||event.key===" ")&&!event.target.closest("button")){event.preventDefault();open();}});
 });
 root.querySelectorAll("[data-share-day]").forEach(button=>button.addEventListener("click",event=>{event.stopPropagation();const card=button.closest("[data-day-key]");const entry=DAYS.find(x=>x.d===card?.dataset.dayKey&&x.name===card.querySelector("h3")?.textContent);if(entry)shareDay(entry);}));
}
function renderFeatured(){
 const list=daysFor(todayKey());
 const box=$("#featuredCard");
 if(!list.length){box.innerHTML='<p class="empty">'+esc(t("noData"))+'</p>';return;}
 const e=list[0];
 box.innerHTML='<img class="featured-image" src="'+dayImage(e)+'" alt="" loading="eager" onerror="this.style.display=\'none\'"><div class="featured-content"><span class="category-badge">'+esc(categoryLabel(e.cat))+'</span><h3>'+esc(e.name)+'</h3><p class="feature-date">▦ '+esc(niceDate(istDate()))+'</p><p class="feature-why">'+esc(field(e,"why"))+'</p><div class="feature-fact">✧ <b>'+esc(t("fact"))+':</b> '+esc(field(e,"fact"))+'</div><button class="primary-btn" id="featuredShare">'+esc(t("share"))+' ↗</button></div>';
 $("#featuredShare").addEventListener("click",()=>shareDay(e));
}
function renderToday(){
 let list=daysFor(todayKey()).slice(1);
 if(activeFilter==="festival"||activeFilter==="awareness")list=list.filter(x=>x.cat===activeFilter);
 if(activeFilter==="popular")list=list.length?list:daysFor(todayKey());
 $("#todayCount").textContent=String(list.length);
 $("#todayGrid").innerHTML=list.length?list.slice(0,6).map(cardHTML).join(""):'<p class="empty">'+esc(t("noData"))+'</p>';
 bindDayCards($("#todayGrid"));
 lastRendered=list;
}
function renderUpcoming(){
 const upcoming=DAYS.map(entry=>({entry,date:nextOccurrence(entry)})).filter(x=>dateDistance(x.date)>=0).sort((a,b)=>a.date-b.date).slice(0,4);
 $("#upcomingList").innerHTML=upcoming.length?upcoming.map(({entry,date})=>'<div class="upcoming-item"><span class="upcoming-emoji">'+esc(entry.emoji||"✦")+'</span><span class="upcoming-name">'+esc(entry.name)+'</span><span class="upcoming-date">'+esc(shortDate(date))+'</span></div>').join(""):'<p class="muted">'+esc(t("noData"))+'</p>';
}
function renderResults(list,container=$("#searchResults")){
 container.innerHTML=list.length?list.slice(0,12).map(cardHTML).join(""):'<p class="empty">'+esc(t("noSearch"))+'</p>';
 bindDayCards(container);
}
function runSearch(){
 const q=$("#searchInput").value.trim().toLocaleLowerCase();
 if(!q){showToast(t("noSearch"));return;}
 const found=DAYS.filter(e=>[e.name,e.cat,field(e,"why"),field(e,"who"),field(e,"fact")].join(" ").toLocaleLowerCase().includes(q));
 $("#searchResults").innerHTML="";
 $("#dateInput").value="";
 renderResults(found);
 $("#searchResults").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function runDateSearch(){
 const value=$("#dateInput").value;
 if(!value){showToast(t("dateRequired"));return;}
 const key=value.slice(5).replace("-","-");
 renderResults(daysFor(key));
 $("#searchResults").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function applyQuickFilter(filter){
 activeFilter=filter;
 $$(".quick-filter").forEach(btn=>btn.classList.toggle("active",btn.dataset.filter===filter));
 if(filter==="today"){renderResults(daysFor(todayKey()));}
 else if(filter==="tomorrow"){renderResults(daysFor(todayKey(1)));}
 else if(filter==="festival"||filter==="awareness"){const found=daysFor(todayKey()).filter(x=>x.cat===filter);renderResults(found.length?found:DAYS.filter(x=>x.cat===filter).slice(0,9));renderToday();}
 else if(filter==="week"){const keys=new Set(Array.from({length:7},(_,i)=>todayKey(i)));renderResults(DAYS.filter(x=>keys.has(x.d)));}
 else{renderResults(DAYS.slice(0,9));renderToday();}
}
function showToast(message){const toast=$("#toast");toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2400);}
function shareDay(entry){
 const title=entry.name+" — Daypedia";
 const text=field(entry,"why")+"\n\n"+location.href;
 if(navigator.share){navigator.share({title,text,url:location.href}).catch(()=>{});return;}
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(title+"\n"+text).then(()=>showToast("Link copied!")).catch(()=>downloadShareCard(entry));}
 else downloadShareCard(entry);
}
function downloadShareCard(entry){
 const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1350;
 const c=canvas.getContext("2d");const g=c.createLinearGradient(0,0,1080,1350);g.addColorStop(0,"#171039");g.addColorStop(1,"#050817");c.fillStyle=g;c.fillRect(0,0,1080,1350);
 c.strokeStyle="#8d5cff";c.lineWidth=3;c.strokeRect(38,38,1004,1274);c.textAlign="center";c.fillStyle="#d6b3ff";c.font="700 48px sans-serif";c.fillText("▣ Daypedia",540,145);
 c.font="150px sans-serif";c.fillText(entry.emoji||"✦",540,390);c.fillStyle="#fff";c.font="800 62px sans-serif";wrapCanvas(c,entry.name,540,510,850,78);
 c.fillStyle="#da9bff";c.font="700 30px sans-serif";c.fillText(categoryLabel(entry.cat).toUpperCase(),540,730);
 c.fillStyle="#c5c9e7";c.font="34px sans-serif";wrapCanvas(c,field(entry,"why"),540,810,830,52);
 c.fillStyle="#6ee7ff";c.font="700 30px sans-serif";c.fillText(niceDate(istDate()),540,1170);c.fillStyle="#d6b3ff";c.font="700 28px sans-serif";c.fillText("Every day has a story.",540,1230);
 const a=document.createElement("a");a.download="daypedia-"+entry.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")+".png";a.href=canvas.toDataURL("image/png");a.click();showToast(t("shareDone"));
}
function wrapCanvas(ctx,text,x,y,maxWidth,lineHeight){let line="",yy=y;for(const word of String(text).split(/\s+/)){const test=line+word+" ";if(ctx.measureText(test).width>maxWidth&&line){ctx.fillText(line,x,yy);line=word+" ";yy+=lineHeight;}else line=test;}ctx.fillText(line,x,yy);}
function tickCountdown(){
 const now=new Date();const ist=new Date(now.toLocaleString("en-US",{timeZone:"Asia/Kolkata"}));const midnight=new Date(ist);midnight.setHours(24,0,0,0);
 let s=Math.max(0,Math.floor((midnight-ist)/1000));const h=String(Math.floor(s/3600)).padStart(2,"0");const m=String(Math.floor(s%3600/60)).padStart(2,"0");const sec=String(s%60).padStart(2,"0");$("#countdown").textContent=h+":"+m+":"+sec;
 const today=istDate();$("#weekdayLabel").textContent=new Intl.DateTimeFormat(lang==="hi"?"en-IN":"en-US",{timeZone:"Asia/Kolkata",weekday:"long"}).format(today);
 $("#heroDate").textContent=niceDate(today);
 const start=new Date(Date.UTC(today.getUTCFullYear(),0,1,6));const day=Math.floor((today-start)/86400000)+1;const leap=new Date(today.getUTCFullYear(),1,29).getMonth()===1;const total=leap?366:365;
 $("#yearDay").textContent=day+"th day of the year";$("#daysLeft").textContent=(total-day)+" days left";
}
async function loadDays(){
 for(const url of ["days.json","https://raw.githubusercontent.com/SuperNovaMG/Daypedia/main/days.json"]){
  try{const response=await fetch(url,{cache:"no-cache"});if(response.ok){const data=await response.json();if(Array.isArray(data))return data;}}catch(error){}
 }
 throw new Error("Day data could not be loaded");
}
function bindEvents(){
 $("#langToggle").addEventListener("click",()=>{lang=lang==="hi"?"en":"hi";localStorage.setItem("aksd-lang",lang);applyLanguage();renderAll();});
 $("#themeToggle").addEventListener("click",()=>{theme=theme==="dark"?"light":"dark";applyTheme();});
 $("#searchForm").addEventListener("submit",event=>{event.preventDefault();runSearch();});
 $("#dateGo").addEventListener("click",runDateSearch);
 $("#dateInput").addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();runDateSearch();}});
 $("#navShare").addEventListener("click",()=>{const first=daysFor(todayKey())[0];if(first)shareDay(first);else showToast(t("noData"));});
 $$(".quick-filter").forEach(btn=>btn.addEventListener("click",()=>applyQuickFilter(btn.dataset.filter)));
 $$(".category-tile").forEach(btn=>btn.addEventListener("click",()=>{const cat=btn.dataset.category;$("#searchInput").value=cat;renderResults(DAYS.filter(x=>x.cat===cat));$("#explore").scrollIntoView({behavior:"smooth"});}));
 $$(".mobile-nav a").forEach(link=>link.addEventListener("click",()=>{$$(".mobile-nav a").forEach(a=>a.classList.toggle("active",a===link));}));
}
function renderAll(){applyLanguage();renderFeatured();renderToday();renderUpcoming();tickCountdown();if($("#searchResults").children.length)bindDayCards($("#searchResults"));}
async function init(){
 applyTheme();applyLanguage();bindEvents();
 try{DAYS=await loadDays();renderAll();}catch(error){$("#featuredCard").innerHTML='<p class="empty">Day data load nahi hua. Please refresh karke try karo.</p>';}
 tickCountdown();setInterval(tickCountdown,1000);
}
document.addEventListener("DOMContentLoaded",init);
