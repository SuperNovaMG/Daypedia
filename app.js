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
    fact:"Fun fact",who:"Kisne shuru kiya",dailyKicker:"HAR DIN EK NAYI KHOJ",dailyTitle:"Aaj ki discovery",dailyBadge:"Aaj ke liye",savedKicker:"TUMHARI PERSONAL COLLECTION",savedTitle:"Saved days",savedEmpty:"Jo days pasand hain unhe save karo, yahan milenge.",recentKicker:"JAHAN CHHODA WAHIN SE",recentTitle:"Recently viewed",recentEmpty:"Jo days tum open karoge, woh yahan dikhenge.",clearRecent:"History saaf karo",saveDay:"Save day",savedDay:"Saved",unsaveDay:"Remove saved day",saveToast:"Day saved ho gaya!",unsaveToast:"Saved days se hata diya.",clearToast:"Recently viewed history clear ho gayi.",dateRequired:"Pehle date choose karo.",shareDone:"Share card download ho gaya.",shareError:"Share karne mein problem hui."
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
    popular:"Popular",week:"This week",festival:"Festivals",awareness:"Awareness",why:"Why it's celebrated",fact:"Fun fact",dailyKicker:"A FRESH FIND, EVERY DAY",dailyTitle:"Daily discovery",dailyBadge:"Picked for today",savedKicker:"YOUR PERSONAL COLLECTION",savedTitle:"Saved days",savedEmpty:"Save a day you love and it will appear here.",recentKicker:"PICK UP WHERE YOU LEFT OFF",recentTitle:"Recently viewed",recentEmpty:"Days you open will show up here.",clearRecent:"Clear history",saveDay:"Save day",savedDay:"Saved",unsaveDay:"Remove saved day",saveToast:"Day saved!",unsaveToast:"Removed from saved days.",clearToast:"Recently viewed history cleared.",
    dateRequired:"Please choose a date first.",shareDone:"Share card downloaded.",shareError:"Could not share this day."
  }
};
let lang = "en";
let theme = "dark";
let DAYS = [];
let activeFilter = "popular";
let lastRendered = [];
const SAVED_KEY = "daypedia:saved-days:v1";
const RECENT_KEY = "daypedia:recent-days:v1";
const safeReadList = key => { try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; } catch { return []; } };
let savedDays = safeReadList(SAVED_KEY);
let recentDays = safeReadList(RECENT_KEY);
const entryId = entry => String(entry?.name_en || entry?.name || entry?.d || "");
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
  document.documentElement.lang=lang==="hi"?"hi":"en";
  document.documentElement.dataset.lang=lang;
  document.querySelectorAll("[data-i18n]").forEach(el=>{const key=el.dataset.i18n;if(t(key)!==key){if(key==="featuredTitle")el.innerHTML=esc(t(key))+' <span>· '+esc(t("today"))+'</span>';else el.textContent=t(key);}});
  const search=$("#searchInput");if(search)search.placeholder=t("searchPlaceholder");
  $("#langToggle").innerHTML=(lang==="hi"?"HI":"EN")+' <span>⌄</span>';
  $("#themeToggle").textContent=theme==="dark"?"☾":"☀";
  document.title=lang==="hi"?"Daypedia — Har din ek nayi kahani":"Daypedia — Every Day Has a Story";
}
function applyTheme(){
  document.documentElement.dataset.theme=theme;
  document.body.dataset.theme=theme;
  const button=$("#themeToggle");
  if(button){button.textContent=theme==="dark"?"☾":"☀";button.setAttribute("aria-label",theme==="dark"?"Switch to light theme":"Switch to dark theme");button.title=theme==="dark"?"Switch to light theme":"Switch to dark theme";button.setAttribute("aria-pressed",String(theme==="light"));}
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content",theme==="dark"?"#07091b":"#f6f5ff");
}
function daySlug(name){return String(name||"special-day").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"special-day";}
function dayPageUrl(entry){return "/day/"+daySlug(entry.name)+"/";}
function cardHTML(entry){
 const date=nextOccurrence(entry);
 const key=entry.d;
 const isSaved=savedDays.includes(entryId(entry));
 return '<article class="day-card" role="button" tabindex="0" data-day-key="'+esc(key)+'" aria-label="'+esc("Open "+entry.name)+'"><div class="day-card-media" style="background-image:linear-gradient(0deg,rgba(6,9,27,.58),rgba(6,9,27,.08)),url(&quot;'+dayImage(entry)+'&quot;);background-size:cover;background-position:center"><span class="card-emoji">'+esc(entry.emoji||"✦")+'</span></div><div class="day-card-body"><span class="category-badge">'+esc(categoryLabel(entry.cat))+'</span><h3>'+esc(entry.name)+'</h3><p>'+esc(field(entry,"why"))+'</p><div class="day-card-meta"><span>'+esc(shortDate(date))+'</span><span class="card-arrow">↗</span></div><div class="day-card-actions"><button type="button" class="card-save-btn'+(isSaved?' is-saved':'')+'" data-save-day="'+esc(entryId(entry))+'" aria-pressed="'+String(isSaved)+'" aria-label="'+esc(isSaved?t("unsaveDay"):t("saveDay"))+'">'+(isSaved?"♥":"♡")+' <span>'+esc(isSaved?t("savedDay"):t("saveDay"))+'</span></button><a class="card-open-btn" href="'+dayPageUrl(entry)+'">'+esc(t("learnMore"))+'</a><button type="button" class="card-share-btn" data-share-day="'+esc(key)+'" aria-label="'+esc("Share "+entry.name)+'">↗ '+esc(t("share"))+'</button></div></div></article>';
}
function closeDayModal(){const modal=$("#dayModalBackdrop");if(modal)modal.remove();}
function openDayModal(entry){
 closeDayModal();recordRecent(entry);
 const date=nextOccurrence(entry);
 const backdrop=document.createElement("div");backdrop.id="dayModalBackdrop";backdrop.className="day-modal-backdrop";backdrop.innerHTML='<article class="day-modal" role="dialog" aria-modal="true" aria-labelledby="dayModalTitle"><div class="day-modal-cover" style="background-image:linear-gradient(0deg,rgba(5,8,23,.3),rgba(5,8,23,.1)),url(&quot;'+dayImage(entry)+'&quot;);background-size:cover;background-position:center"><span>'+esc(entry.emoji||"✦")+'</span><button class="day-modal-close" type="button" aria-label="Close">×</button></div><div class="day-modal-content"><span class="category-badge">'+esc(categoryLabel(entry.cat))+'</span><h2 id="dayModalTitle">'+esc(entry.name)+'</h2><p class="day-modal-date">▦ '+esc(niceDate(date))+'</p><section class="day-modal-section"><h3>'+esc(t("why"))+'</h3><p>'+esc(field(entry,"why"))+'</p></section><section class="day-modal-section"><h3>'+esc(t("who"))+'</h3><p>'+esc(field(entry,"who"))+'</p></section><section class="day-modal-section"><h3>'+esc(t("fact"))+'</h3><p>'+esc(field(entry,"fact"))+'</p></section><div class="day-modal-actions"><a class="primary-btn" href="'+dayPageUrl(entry)+'">Read full story →</a><button class="primary-btn" id="modalShareDay">'+esc(t("share"))+' ↗</button><button class="secondary-btn" id="modalCopyDay">Copy details</button></div></div></article>';
 document.body.appendChild(backdrop);
 const previousFocus=document.activeElement;
 backdrop.addEventListener("click",event=>{if(event.target===backdrop||event.target.closest(".day-modal-close")){closeDayModal();if(previousFocus&&typeof previousFocus.focus==="function")previousFocus.focus();}});
 const closeButton=backdrop.querySelector(".day-modal-close");if(closeButton)closeButton.focus();
 const modal=backdrop.querySelector(".day-modal");
 modal.addEventListener("keydown",event=>{if(event.key!=="Tab")return;const focusable=[...modal.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex='-1'])")];if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
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
 root.querySelectorAll("[data-save-day]").forEach(button=>button.addEventListener("click",event=>{event.stopPropagation();const entry=DAYS.find(item=>entryId(item)===button.dataset.saveDay);if(entry)toggleSaved(entry);}));
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
function normalizeSearch(value){
 return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
}
function runSearch({scroll=true}={}){
 const input=$("#searchInput");
 const query=normalizeSearch(input?.value||"");
 const results=$("#searchResults");
 if(!results)return;
 if(!query){results.innerHTML="";return;}
 const terms=query.split(/\s+/).filter(Boolean);
 const categoryAliases={
  festival:["festival","festivals","celebration","celebrations","tyohar"],
  awareness:["awareness","jagrukta","health","cause"],
  international:["international","world","global","historic","history"],
  national:["national","india","indian","rashtriya"],
  fun:["fun","quirky","funny","mazedaar"],
  food:["food","eat","cuisine"]
 };
 const found=DAYS.filter(entry=>{
  const categoryText=[entry.cat,categoryLabel(entry.cat),...(categoryAliases[entry.cat]||[])].join(" ");
  const searchable=normalizeSearch([entry.name,entry.name_en,entry.name_hi,categoryText,entry.why_en,entry.why_hi,entry.who_en,entry.who_hi,entry.fact_en,entry.fact_hi].filter(Boolean).join(" "));
  return terms.every(term=>searchable.includes(term));
 });
 $("#dateInput").value="";
 renderResults(found);
 if(scroll)results.scrollIntoView({behavior:"smooth",block:"nearest"});
}
let calendarMonthDate = new Date();
function renderCalendar(){
 const monthDate=new Date(calendarMonthDate.getFullYear(),calendarMonthDate.getMonth(),1);
 const year=monthDate.getFullYear(),month=monthDate.getMonth();
 $("#calendarMonth").textContent=new Intl.DateTimeFormat(lang==="hi"?"en-IN":"en-US",{month:"long",year:"numeric"}).format(monthDate);
 const firstDay=(monthDate.getDay()+6)%7;
 const daysInMonth=new Date(year,month+1,0).getDate();
 const cells=[];
 for(let i=0;i<firstDay;i++)cells.push('<span class="calendar-empty" aria-hidden="true"></span>');
 for(let day=1;day<=daysInMonth;day++){
  const key=String(month+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
  const hasDays=daysFor(key).length>0;
  const today=key===todayKey()&&year===istDate().getUTCFullYear();
  cells.push('<button type="button" aria-pressed="false" class="calendar-day'+(hasDays?' has-observances':'')+(today?' is-today':'')+'" data-calendar-date="'+year+'-'+String(month+1).padStart(2,"0")+'-'+String(day).padStart(2,"0")+'" aria-label="'+esc(new Intl.DateTimeFormat(lang==="hi"?"en-IN":"en-US",{month:"long",day:"numeric",year:"numeric"}).format(new Date(year,month,day)))+(hasDays?', '+daysFor(key).length+' observances':'')+'"><span>'+day+'</span>'+(hasDays?'<i aria-hidden="true"></i>':'')+'</button>');
 }
 $("#calendarDays").innerHTML=cells.join("");
 $("#calendarDays").querySelectorAll("[data-calendar-date]").forEach(button=>button.addEventListener("click",()=>{
  $("#dateInput").value=button.dataset.calendarDate;
  $("#calendarDays").querySelectorAll(".is-selected").forEach(el=>{el.classList.remove("is-selected");el.setAttribute("aria-pressed","false");});
  button.classList.add("is-selected");
  button.setAttribute("aria-pressed","true");
  runDateSearch();
 }));
 $("#calendarHint").textContent=lang==="hi"?"Date choose karo, us din ke observances dekho. Dot ka matlab listed days hain.":"Select a date to see its observances. Dots mark dates with listed days.";
}
function runDateSearch(){
 const input=$("#dateInput");
 const value=input.value;
 if(!value){showToast(t("dateRequired"));input.focus();return;}
 const parts=value.split("-");
 if(parts.length!==3||parts.some(part=>!/^[0-9]{1,4}$/.test(part))){showToast(t("dateRequired"));return;}
 const year=Number(parts[0]),month=Number(parts[1]),day=Number(parts[2]);
 const chosen=new Date(year,month-1,day);
 if(chosen.getFullYear()!==year||chosen.getMonth()!==month-1||chosen.getDate()!==day){showToast(t("dateRequired"));return;}
 const key=parts[1]+"-"+parts[2];
 const found=daysFor(key);
 const results=$("#searchResults");
 results.innerHTML="";
 if(found.length){renderResults(found);}else{results.innerHTML='<p class="empty">'+esc(t("noData"))+'</p>';}
 results.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function applyQuickFilter(filter){
 activeFilter=filter;
 $(".quick-filter").forEach(btn=>btn.classList.toggle("active",btn.dataset.filter===filter));
 $("#searchInput").value="";
 $("#dateInput").value="";
 if(filter==="today")renderResults(daysFor(todayKey()));
 else if(filter==="tomorrow")renderResults(daysFor(todayKey(1)));
 else if(filter==="festival"||filter==="awareness")renderResults(DAYS.filter(x=>x.cat===filter));
 else if(filter==="week"){const keys=new Set(Array.from({length:7},(_,i)=>todayKey(i)));renderResults(DAYS.filter(x=>keys.has(x.d)));}
 else{renderResults(DAYS.slice(0,9));}
}
function showToast(message){const toast=$("#toast");toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2400);}
async function shareDay(entry){
 const displayName=entry["name_"+(lang==="hi"?"hi":"en")]||entry.name;
 const title=displayName+" — Daypedia";
 const shareText=displayName+"\n"+field(entry,"why")+"\n\n"+new URL(dayPageUrl(entry),location.origin).href;
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
function validateDayData(input){
 if(!Array.isArray(input))throw new Error("Day data must be a JSON array");
 const allowedCategories=new Set(["festival","awareness","international","national","fun","food"]);
 const seenNames=new Set();
 const valid=[];
 const issues=[];
 for(const [index,raw] of input.entries()){
  if(!raw||typeof raw!=="object"||Array.isArray(raw)){issues.push("row "+(index+1)+": not an object");continue;}
  const name=String(raw.name||"").trim();
  const date=String(raw.d||"");
  const category=String(raw.cat||"").trim().toLowerCase();
  const match=date.match(/^(\d{2})-(\d{2})$/);
  if(!name){issues.push("row "+(index+1)+": missing name");continue;}
  if(!match){issues.push(name+": invalid date format");continue;}
  const month=Number(match[1]),day=Number(match[2]);
  const dateCheck=new Date(Date.UTC(2000,month-1,day));
  if(month<1||month>12||dateCheck.getUTCMonth()!==month-1||dateCheck.getUTCDate()!==day){issues.push(name+": invalid calendar date");continue;}
  if(!allowedCategories.has(category)){issues.push(name+": unsupported category");continue;}
  const nameKey=normalizeSearch(name);
  if(seenNames.has(nameKey)){issues.push(name+": duplicate name");continue;}
  seenNames.add(nameKey);
  valid.push({...raw,d:date,name,cat:category});
 }
 if(issues.length)console.warn("Daypedia data validation:",issues);
 if(!valid.length)throw new Error("No valid day entries were found");
 return valid;
}
async function loadDays(){
 let lastError;
 for(const url of ["days.json","https://raw.githubusercontent.com/SuperNovaMG/Daypedia/main/days.json"]){
  try{
   const response=await fetch(url,{cache:"no-cache"});
   if(!response.ok)throw new Error("HTTP "+response.status+" for "+url);
   const data=await response.json();
   return validateDayData(data);
  }catch(error){lastError=error;console.warn("Could not load Daypedia data from "+url,error);}
 }
 throw lastError||new Error("Day data could not be loaded");
}
function bindEvents(){
 $("#langToggle").addEventListener("click",()=>{lang=lang==="hi"?"en":"hi";applyLanguage();renderAll();});
 $("#themeToggle").addEventListener("click",()=>{theme=document.documentElement.dataset.theme==="dark"?"light":"dark";applyTheme();});
 $("#searchForm").addEventListener("submit",event=>{event.preventDefault();runSearch();});
 $("#searchInput").addEventListener("input",()=>{if($("#searchInput").value.trim())runSearch({scroll:false});else $("#searchResults").innerHTML="";});
 $("#dateGo").addEventListener("click",runDateSearch);
  $("#calendarPrev").addEventListener("click",()=>{calendarMonthDate=new Date(calendarMonthDate.getFullYear(),calendarMonthDate.getMonth()-1,1);renderCalendar();});
  $("#calendarNext").addEventListener("click",()=>{calendarMonthDate=new Date(calendarMonthDate.getFullYear(),calendarMonthDate.getMonth()+1,1);renderCalendar();});
  $("#calendarToday").addEventListener("click",()=>{const today=istDate();calendarMonthDate=new Date(today.getUTCFullYear(),today.getUTCMonth(),1);renderCalendar();$("#dateInput").value=today.getUTCFullYear()+"-"+String(today.getUTCMonth()+1).padStart(2,"0")+"-"+String(today.getUTCDate()).padStart(2,"0");runDateSearch();});
 $("#dateInput").addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();runDateSearch();}});
 $("#navShare").addEventListener("click",()=>{const first=daysFor(todayKey())[0];if(first)shareDay(first);else showToast(t("noData"));});
 $("#clearRecent").addEventListener("click",()=>{recentDays=[];persistList(RECENT_KEY,recentDays);renderRetention();showToast(t("clearToast"));});
 $$(".quick-filter").forEach(btn=>btn.addEventListener("click",()=>applyQuickFilter(btn.dataset.filter)));
 $$(".category-tile").forEach(btn=>btn.addEventListener("click",()=>{const cat=btn.dataset.category;$("#searchInput").value=cat;renderResults(DAYS.filter(x=>x.cat===cat));$("#explore").scrollIntoView({behavior:"smooth"});}));
 $$(".mobile-nav a").forEach(link=>link.addEventListener("click",()=>{$$(".mobile-nav a").forEach(a=>a.classList.toggle("active",a===link));}));
}
function persistList(key,list){try{localStorage.setItem(key,JSON.stringify(list));}catch(error){console.warn("Daypedia storage unavailable",error);}}
function toggleSaved(entry){
 const id=entryId(entry);
 if(savedDays.includes(id)){savedDays=savedDays.filter(item=>item!==id);showToast(t("unsaveToast"));}
 else{savedDays=[id,...savedDays.filter(item=>item!==id)].slice(0,100);showToast(t("saveToast"));}
 persistList(SAVED_KEY,savedDays);renderRetention();renderToday();
 if($("#searchResults").children.length){const query=normalizeSearch($("#searchInput").value);if(query)renderResults(DAYS.filter(item=>normalizeSearch([item.name,item.name_en,item.name_hi,item.cat,item.why_en,item.why_hi].join(" ")).includes(query)));}
}
function recordRecent(entry){
 const id=entryId(entry);recentDays=[id,...recentDays.filter(item=>item!==id)].slice(0,8);persistList(RECENT_KEY,recentDays);renderRetention();
}
function retentionCard(entry){
 const id=entryId(entry),isSaved=savedDays.includes(id);
 return '<article class="day-card" role="button" tabindex="0" data-retention-key="'+esc(id)+'" aria-label="'+esc("Open "+entry.name)+'"><div class="day-card-media"><span class="card-emoji">'+esc(entry.emoji||"✦")+'</span></div><div class="day-card-body"><span class="category-badge">'+esc(categoryLabel(entry.cat))+'</span><h3>'+esc(field(entry,"name")||entry.name)+'</h3><p>'+esc(field(entry,"why"))+'</p><div class="day-card-meta"><span>'+esc(shortDate(nextOccurrence(entry)))+'</span></div><div class="day-card-actions"><button type="button" class="card-save-btn'+(isSaved?' is-saved':'')+'" data-save-day="'+esc(id)+'" aria-pressed="'+String(isSaved)+'">'+(isSaved?"♥":"♡")+' <span>'+esc(isSaved?t("savedDay"):t("saveDay"))+'</span></button><a class="card-open-btn" href="'+dayPageUrl(entry)+'">'+esc(t("learnMore"))+'</a></div></div></article>';
}
function bindRetentionCards(root){
 root.querySelectorAll("[data-retention-key]").forEach(card=>{
  const open=()=>{const entry=DAYS.find(item=>entryId(item)===card.dataset.retentionKey);if(entry)openDayModal(entry);};
  card.addEventListener("click",event=>{if(event.target.closest("button,a"))return;open();});
  card.addEventListener("keydown",event=>{if((event.key==="Enter"||event.key===" ")&&!event.target.closest("button,a")){event.preventDefault();open();}});
 });
 root.querySelectorAll("[data-save-day]").forEach(button=>button.addEventListener("click",event=>{event.stopPropagation();const entry=DAYS.find(item=>entryId(item)===button.dataset.saveDay);if(entry)toggleSaved(entry);}));
}
function renderRetention(){
 const savedEntries=savedDays.map(id=>DAYS.find(item=>entryId(item)===id)).filter(Boolean);
 const recentEntries=recentDays.map(id=>DAYS.find(item=>entryId(item)===id)).filter(Boolean);
 $("#savedCount").textContent=String(savedEntries.length);
 $("#savedDaysGrid").innerHTML=savedEntries.length?savedEntries.map(retentionCard).join(""):'<p class="empty">'+esc(t("savedEmpty"))+'</p>';
 $("#recentDaysGrid").innerHTML=recentEntries.length?recentEntries.map(retentionCard).join(""):'<p class="empty">'+esc(t("recentEmpty"))+'</p>';
 bindRetentionCards($("#savedDaysGrid"));bindRetentionCards($("#recentDaysGrid"));
 const daily=$("#dailyDiscoveryCard");
 if(daily&&DAYS.length){
  const today=istDate();const seed=Number(today.getUTCFullYear())*10000+(today.getUTCMonth()+1)*100+today.getUTCDate();
  const entry=DAYS[seed%DAYS.length],id=entryId(entry),isSaved=savedDays.includes(id);
  daily.innerHTML='<div class="featured-image retention-discovery-art"><span>'+esc(entry.emoji||"✦")+'</span></div><div class="featured-content"><span class="category-badge">'+esc(categoryLabel(entry.cat))+'</span><h3>'+esc(field(entry,"name")||entry.name)+'</h3><p class="feature-why">'+esc(field(entry,"why"))+'</p><div class="day-card-actions"><button type="button" class="card-save-btn'+(isSaved?' is-saved':'')+'" data-save-day="'+esc(id)+'" aria-pressed="'+String(isSaved)+'">'+(isSaved?"♥":"♡")+' <span>'+esc(isSaved?t("savedDay"):t("saveDay"))+'</span></button><a class="card-open-btn" href="'+dayPageUrl(entry)+'">'+esc(t("learnMore"))+'</a></div></div>';
  bindRetentionCards(daily);
 }
}
function renderAll(){applyLanguage();renderFeatured();renderToday();renderUpcoming();renderCalendar();renderRetention();tickCountdown();if($("#searchResults").children.length)bindDayCards($("#searchResults"));}
async function init(){
 applyTheme();applyLanguage();bindEvents();
 try{DAYS=await loadDays();renderAll();}catch(error){$("#featuredCard").innerHTML='<p class="empty">Day data load nahi hua. Please refresh karke try karo.</p>';}
 tickCountdown();setInterval(tickCountdown,1000);
}
document.addEventListener("DOMContentLoaded",init);
