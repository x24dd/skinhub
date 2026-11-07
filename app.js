const tg = window.Telegram?.WebApp;
tg?.ready(); tg?.expand();

const params = new URLSearchParams(location.search);
const ADMIN_ID = params.get("demo_admin_id") || ""; // Только для локального демо! Не использовать как защиту в реальном проекте.
const user = tg?.initDataUnsafe?.user || null;
const userId = user?.id ? String(user.id) : "local-demo";
const userName = user ? (user.first_name + (user.last_name ? " " + user.last_name : "")) : "Гость демо";
const isAdmin = !!user && ADMIN_ID && String(user.id) === String(ADMIN_ID);

const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let listings = read("sh_listings", [
 {id:1,name:"Demo Rifle | Violet",category:"rifle",price:125,image:""},
 {id:2,name:"Demo Pistol | Neon",category:"pistol",price:80,image:""},
 {id:3,name:"Demo Knife | Eclipse",category:"knife",price:240,image:""},
 {id:4,name:"Demo Item | Aurora",category:"other",price:55,image:""}
]);
let reviews = read("sh_reviews",[
 {name:"Alex",rating:5,text:"Удобный интерфейс и быстрая поддержка. Демо-отзыв."},
 {name:"Mira",rating:5,text:"Понравилась структура каталога. Демо-отзыв."}
]);
let tickets = read("sh_tickets",[]);
let activeFilter = "all";

document.getElementById("userLabel").textContent = userName;
document.getElementById("profileName").textContent = userName;
document.getElementById("profileId").textContent = user ? "Telegram ID: " + user.id : "Локальный режим вне Telegram";
document.getElementById("avatar").textContent = userName[0]?.toUpperCase() || "?";
if(isAdmin) document.getElementById("adminTab").hidden = false;

function showPage(name){
 document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===name));
 document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.page===name));
 if(name==="profile") renderMyListings();
 if(name==="admin" && isAdmin) renderAdmin();
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));

function renderCatalog(){
 const q=document.getElementById("search").value.toLowerCase();
 const list=listings.filter(x=>(activeFilter==="all"||x.category===activeFilter)&&x.name.toLowerCase().includes(q));
 document.getElementById("catalog").innerHTML=list.map(x=>`
 <article class="item"><div class="item-art">${x.image?`<img src="${escapeAttr(x.image)}" alt="">`:"✦"}</div>
 <div class="item-body"><h3>${escapeHtml(x.name)}</h3><div class="muted">Демо-объявление · ${categoryName(x.category)}</div><div class="price">${Number(x.price)} баллов</div></div></article>`).join("") || `<p class="muted">Ничего не найдено.</p>`;
}
function categoryName(c){return ({rifle:"Винтовки",pistol:"Пистолеты",knife:"Ножи",other:"Другое"})[c]||"Другое"}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s){return escapeHtml(s)}
document.getElementById("search").addEventListener("input",renderCatalog);
document.querySelectorAll(".chip").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".chip").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");activeFilter=b.dataset.filter;renderCatalog()}));

document.getElementById("addListing").onclick=()=>{
 const name=document.getElementById("itemName").value.trim(),price=Number(document.getElementById("itemPrice").value);
 if(!name||!Number.isFinite(price)||price<=0){alert("Заполни название и положительную цену.");return}
 listings.unshift({id:Date.now(),name,category:document.getElementById("itemCategory").value,price,image:document.getElementById("itemImage").value.trim(),owner:userId});
 write("sh_listings",listings);["itemName","itemPrice","itemImage"].forEach(id=>document.getElementById(id).value="");
 renderCatalog();alert("Демо-объявление добавлено.");showPage("home");
};

function renderReviews(){
 document.getElementById("reviewList").innerHTML=reviews.map(r=>`<div class="entry"><h3>${escapeHtml(r.name)} <span style="color:#c6a3ff">${"★".repeat(Math.max(1,Math.min(5,Number(r.rating))))}</span></h3><p>${escapeHtml(r.text)}</p></div>`).join("");
}
document.getElementById("addReview").onclick=()=>{
 const text=document.getElementById("reviewText").value.trim();if(!text){alert("Напиши текст отзыва.");return}
 reviews.unshift({name:userName,rating:Number(document.getElementById("reviewRating").value),text});write("sh_reviews",reviews);document.getElementById("reviewText").value="";renderReviews();
};

function renderTickets(){
 const mine=tickets.filter(t=>t.owner===userId);
 document.getElementById("ticketList").innerHTML=mine.map(ticketHtml).join("")||`<p class="muted">У тебя пока нет обращений.</p>`;
}
function ticketHtml(t){return `<div class="entry"><h3>#${t.id} · ${escapeHtml(t.subject)} <span class="muted">· ${escapeHtml(t.status)}</span></h3><p>${escapeHtml(t.text)}</p>${t.reply?`<p><b>Ответ поддержки:</b> ${escapeHtml(t.reply)}</p>`:""}</div>`}
document.getElementById("createTicket").onclick=()=>{
 const subject=document.getElementById("ticketSubject").value.trim(),text=document.getElementById("ticketText").value.trim();if(!subject||!text){alert("Заполни тему и сообщение.");return}
 tickets.unshift({id:Date.now(),owner:userId,name:userName,subject,text,status:"Новое",reply:""});write("sh_tickets",tickets);document.getElementById("ticketSubject").value="";document.getElementById("ticketText").value="";renderTickets();alert("Обращение сохранено в демо-браузере.");
};

function renderMyListings(){
 document.getElementById("myListings").innerHTML=listings.filter(x=>x.owner===userId).map(x=>`<div class="entry"><h3>${escapeHtml(x.name)}</h3><p>${x.price} демо-баллов</p></div>`).join("")||`<p class="muted">Ты ещё не добавлял объявления.</p>`;
}
function renderAdmin(){
 if(!isAdmin)return;
 document.getElementById("adminTickets").innerHTML=tickets.map(ticketHtml).join("")||`<p class="muted">Обращений пока нет.</p>`;
}
document.getElementById("adminAddReview").onclick=()=>{
 if(!isAdmin)return alert("Нет доступа.");
 const name=document.getElementById("adminReviewName").value.trim(),text=document.getElementById("adminReviewText").value.trim();if(!name||!text){alert("Заполни имя и текст.");return}
 reviews.unshift({name,rating:5,text});write("sh_reviews",reviews);renderReviews();alert("Демо-отзыв добавлен.");
};
document.getElementById("sendReply").onclick=()=>{
 if(!isAdmin)return alert("Нет доступа.");
 const id=Number(document.getElementById("replyTicketId").value),reply=document.getElementById("replyTicketText").value.trim(),t=tickets.find(x=>x.id===id);
 if(!t||!reply){alert("Проверь ID обращения и ответ.");return}
 t.reply=reply;t.status="Ответ дан";write("sh_tickets",tickets);renderAdmin();renderTickets();alert("Ответ сохранён в демо-браузере.");
};

renderCatalog();renderReviews();renderTickets();
