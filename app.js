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
    fact:"Fun fact",who:"Kisne shuru kiya",dateRequired:"Pehle date choose karo.",shareDone:"Share card download ho gaya.",shareError:"Share karne mein problem hui."
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
let lang = "en";
let theme = "dark";
let DAYS = [];
let activeFilter = "popular";
let lastRendered = [];
const t = (key) => COPY[lang][key] || COPY.en[key] || key;
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const categoryLabel = (cat) => ({festival:lang==="hi"?"Tyohar":"Festival",awareness:lang==="hi"?"Jagrukta":"Awareness",international:lang==="hi"?"Duniya bhar ke din":"International",national:lang==="hi"?"Rashtriya din":"National",fun:lang==="hi"?"Mazedaar din":"Fun",food:lang==="hi"?"Food days":"Food"}[cat] || cat || "Day");
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
function applyTheme(){document.documentElement.dataset.theme=theme;$("#themeToggle").textContent=theme==="dark"?"☾":"☀";}
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
 const input=$("#dateInput");
 const value=input.value;
 if(!value){showToast(t("dateRequired"));input.focus();return;}
 const parts=value.split("-");
 if(parts.length!==3||parts.some(part=>!/^\\d+$/.test(part))){showToast(t("dateRequired"));return;}
 const year=Number(parts[0]),month=Number(parts[1]),day=Number(parts[2]);
 const chosen=new Date(year,month-1,day);
 if(chosen.getFullYear()!==year||chosen.getMonth()!==month-1||chosen.getDate()!==day){showToast(t("dateRequired"));return;}
 const key=parts[1]+"-"+parts[2];
 const found=daysFor(key);
 renderResults(found);
 if(!found.length)$("#searchResults").innerHTML='<p class="empty">'+esc(t("noData"))+'</p>';
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
async function shareDay(entry){
 const displayName=entry["name_"+(lang==="hi"?"hi":"en")]||entry.name;
 const title=displayName+" — Daypedia";
 const shareText=displayName+"\n"+field(entry,"why")+"\n\n"+location.href;
 const canvas=buildShareCanvas(entry);
 try{
  if(navigator.share&&navigator.canShare&&typeof File!=="undefined"){
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
   if(blob){
    const file=new File([blob],"daypedia-"+displayName.toLowerCase().replace(/[^a-z0-9]+/g,"-")+".png",{type:"image/png"});
    if(navigator.canShare({files:[file]})){await navigator.share({title,text:shareText,files:[file]});showToast(t("shareDone"));return;}
   }
  }
 }catch(error){if(error&&error.name==="AbortError")return;}
 downloadShareCard(entry);
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(shareText).then(()=>showToast(lang==="hi"?"Share card save ho gaya, details copy ho gayi!":"Share card saved and details copied!")).catch(()=>{});}
}
function buildShareCanvas(entry){
 const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1350;
 const ctx=canvas.getContext("2d");
 const bg=ctx.createLinearGradient(0,0,1080,1350);bg.addColorStop(0,"#100b2c");bg.addColorStop(.48,"#090b20");bg.addColorStop(1,"#06091a");ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1350);
 const glow=ctx.createRadialGradient(540,350,10,540,350,620);glow.addColorStop(0,(entry.cat==="food"||entry.cat==="Food")?"rgba(255,45,153,.28)":"rgba(139,92,246,.35)");glow.addColorStop(1,"rgba(10,8,30,0)");ctx.fillStyle=glow;ctx.fillRect(0,0,1080,900);
 ctx.save();ctx.globalAlpha=.85;ctx.strokeStyle="#9333ea";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(40,190);ctx.bezierCurveTo(170,175,120,65,250,40);ctx.stroke();ctx.strokeStyle="#22d3ee";ctx.beginPath();ctx.moveTo(890,1280);ctx.bezierCurveTo(970,1210,1010,1300,1040,1170);ctx.stroke();ctx.restore();
 const border=ctx.createLinearGradient(50,40,1030,1310);border.addColorStop(0,"#a855f7");border.addColorStop(.55,"#ec4899");border.addColorStop(1,"#22d3ee");ctx.strokeStyle=border;ctx.lineWidth=4;roundRect(ctx,36,36,1008,1278,32);ctx.stroke();
 ctx.textAlign="center";ctx.fillStyle="#e9d5ff";ctx.font="700 48px system-ui, sans-serif";ctx.fillText("✦ Daypedia",540,120);
 ctx.fillStyle="rgba(167,139,250,.18)";roundRect(ctx,385,158,310,46,23);ctx.fill();ctx.fillStyle="#d8b4fe";ctx.font="700 22px system-ui, sans-serif";ctx.fillText(lang==="hi"?"AAJ KI KHOJ":"TODAY'S DISCOVERY",540,188);
 ctx.shadowColor="#d946ef";ctx.shadowBlur=34;ctx.font="150px system-ui, sans-serif";ctx.fillStyle="#fff";ctx.fillText(entry.emoji||"✦",540,370);ctx.shadowBlur=0;
 ctx.fillStyle="#fff";const displayName=entry["name_"+(lang==="hi"?"hi":"en")]||entry.name;const titleSize=displayName.length>28?52:displayName.length>19?64:76;ctx.font="900 "+titleSize+"px system-ui, sans-serif";const titleLines=wrapCanvas(ctx,displayName,540,485,900,titleSize*1.12);let y=485+titleLines*titleSize*1.12+18;
 const cat=categoryLabel(entry.cat).toUpperCase();ctx.font="800 28px system-ui, sans-serif";const pillW=Math.min(430,Math.max(170,ctx.measureText(cat).width+94));const pillGrad=ctx.createLinearGradient(540-pillW/2,y,540+pillW/2,y+70);pillGrad.addColorStop(0,"#8b5cf6");pillGrad.addColorStop(1,"#ec4899");ctx.fillStyle=pillGrad;roundRect(ctx,540-pillW/2,y,pillW,64,32);ctx.fill();ctx.fillStyle="#fff";ctx.fillText(cat,540,y+41);y+=92;
 const desc=field(entry,"why");const panelH=Math.min(235,Math.max(145,Math.ceil(String(desc).length/43)*47+54));ctx.fillStyle="rgba(20,22,52,.92)";roundRect(ctx,100,y,880,panelH,28);ctx.fill();ctx.strokeStyle="rgba(139,92,246,.55)";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="#f1efff";ctx.font="34px system-ui, sans-serif";wrapCanvas(ctx,desc,540,y+55,800,48);y+=panelH+34;
 const dateText=niceDate(istDate()),dateY=Math.min(y,1075);const dateGrad=ctx.createLinearGradient(240,dateY,840,dateY+84);dateGrad.addColorStop(0,"#0e2340");dateGrad.addColorStop(1,"#171039");ctx.fillStyle=dateGrad;roundRect(ctx,225,dateY,630,82,41);ctx.fill();ctx.strokeStyle="#22d3ee";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="#67e8f9";ctx.font="700 34px system-ui, sans-serif";ctx.fillText(dateText,540,dateY+52);
 ctx.fillStyle="#d8b4fe";ctx.font="700 30px system-ui, sans-serif";ctx.fillText(lang==="hi"?"Har din ek kahani hai.":"Every day has a story.",540,1225);ctx.fillStyle="#a5b4fc";ctx.font="22px system-ui, sans-serif";ctx.fillText("daypedia.vercel.app",540,1268);ctx.font="700 22px system-ui, sans-serif";ctx.fillText("@days_pedia",540,1298);return canvas;
}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function wrapCanvas(ctx,text,x,y,maxWidth,lineHeight){let line="",yy=y,lines=0;for(const word of String(text).split(/\s+/)){const test=line+word+" ";if(ctx.measureText(test).width>maxWidth&&line){ctx.fillText(line.trim(),x,yy);line=word+" ";yy+=lineHeight;lines++;}else line=test;}if(line.trim()){ctx.fillText(line.trim(),x,yy);lines++;}return lines;}
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
 $("#langToggle").addEventListener("click",()=>{lang=lang==="hi"?"en":"hi";applyLanguage();renderAll();});
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
