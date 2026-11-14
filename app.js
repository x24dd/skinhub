// 1. Инициализируем Telegram WebApp и получаем пользователя ОДИН раз
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const user = tg?.initDataUnsafe?.user || null;

// 2. Выводим имя в кнопку
if (user) {
    const userLabel = document.getElementById("userLabel");
    if (userLabel) {
        userLabel.textContent = user.first_name;
    }
}

// 3. Параметры
const params = new URLSearchParams(location.search);

const userId = user?.id ? String(user.id) : "local-demo";
const userName = user ? user.first_name + (user.last_name ? " " + user.last_name : "") : "Guest";
let isAdmin = false;
/* ========== SUPABASE ==========
  1. Создай проект на https://supabase.com
  2. SQL Editor → вставь supabase_setup.sql → Run
  3. Settings → API → скопируй URL и anon public key сюда:
*/
const SUPABASE_URL = "https://rqvsgihpllhbukruqdxa.supabase.co";   // например https://xxxx.supabase.co
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdnNnaWhwbGxoYnVrcnVxZHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzODQzNzQsImV4cCI6MjEwOTk2MDM3NH0.hlDgvV6SgGZzTuQZvs-SOnk6oDVmtIlwALAPSk2udPA";

const sbEnabled = SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20 && !SUPABASE_ANON_KEY.startsWith("ВСТАВЬ");

async function sb(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session?.access_token || SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}


/* ========== AUTH (ник + пароль через Supabase Auth) ========== */
function nickToEmail(nick) {
  const safe = String(nick).trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
  return safe + "@skinhub.local";
}

let session = null;
try { session = JSON.parse(localStorage.getItem("sh_session") || "null"); } catch { session = null; }

function isLoggedIn() {
  return !!(session && session.access_token && session.username);
}

function currentUsername() {
  if (isLoggedIn()) return session.username;
  return userName;
}

function currentOwnerId() {
  if (isLoggedIn()) return "user:" + session.user_id;
  return userId;
}

function updateAuthUI() {
  const btn = document.getElementById("authBtn");
  const logout = document.getElementById("doLogout");
  if (btn) btn.textContent = isLoggedIn() ? session.username : t("authGuest");
  if (logout) logout.classList.toggle("hidden", !isLoggedIn());
  const label = document.getElementById("userLabel");
  if (label) label.textContent = isLoggedIn() ? session.username : t("authGuest");
  const pn = document.getElementById("profileName");
  if (pn) pn.textContent = isLoggedIn() ? session.username : userName;
  const pi = document.getElementById("profileId");
  if (pi) pi.textContent = isLoggedIn() ? ("@" + session.username) : (user ? "Telegram ID: " + user.id : t("localMode"));
  const av = document.getElementById("avatar");
  if (av) av.textContent = (isLoggedIn() ? session.username : userName)[0]?.toUpperCase() || "?";
}

async function sbAuth(path, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error_description || data.msg || data.error || data.message || res.statusText;
    throw new Error(msg);
  }
  return data;
}

function openAuthModal() {
  document.getElementById("authModal")?.classList.remove("hidden");
  document.getElementById("authError").textContent = "";
  updateAuthUI();
}
function closeAuthModal() {
  document.getElementById("authModal")?.classList.add("hidden");
}

document.getElementById("authBtn")?.addEventListener("click", openAuthModal);
document.getElementById("authClose")?.addEventListener("click", closeAuthModal);
document.getElementById("authModal")?.addEventListener("click", (e) => {
  if (e.target.id === "authModal") closeAuthModal();
});

document.querySelectorAll(".auth-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".auth-tab").forEach((x) => x.classList.remove("active"));
    tab.classList.add("active");
    const mode = tab.dataset.auth;
    document.getElementById("authLoginPane").classList.toggle("hidden", mode !== "login");
    document.getElementById("authRegisterPane").classList.toggle("hidden", mode !== "register");
    document.getElementById("authError").textContent = "";
  });
});

document.getElementById("doLogin")?.addEventListener("click", async () => {
  const nick = document.getElementById("loginNick").value.trim();
  const pass = document.getElementById("loginPass").value;
  const err = document.getElementById("authError");
  if (!nick || !pass) return (err.textContent = t("authNeedFields"));
  if (!sbEnabled) return (err.textContent = "Supabase не настроен");
  try {
    const data = await sbAuth("token?grant_type=password", {
      email: nickToEmail(nick),
      password: pass
    });
    session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user_id: data.user?.id || data.user_id,
      username: nick
    };
    write("sh_session", session);
    updateAuthUI();
    await refreshAdminRole();
    await loadAllData();
    err.textContent = t("authOkLogin");
    setTimeout(closeAuthModal, 500);
  } catch (e) {
    err.textContent = e.message || t("authErr");
  }
});

document.getElementById("doRegister")?.addEventListener("click", async () => {
  const nick = document.getElementById("regNick").value.trim();
  const pass = document.getElementById("regPass").value;
  const pass2 = document.getElementById("regPass2").value;
  const err = document.getElementById("authError");
  if (!nick || !pass) return (err.textContent = t("authNeedFields"));
  if (nick.length < 3) return (err.textContent = t("authNickShort"));
  if (pass.length < 6) return (err.textContent = t("authPassShort"));
  if (pass !== pass2) return (err.textContent = t("authPassMatch"));
  if (!sbEnabled) return (err.textContent = "Supabase не настроен");
  try {
    const data = await sbAuth("signup", {
      email: nickToEmail(nick),
      password: pass,
      data: { username: nick }
    });
    // some projects require email confirm — if session returned, login immediately
    if (data.access_token) {
      session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user_id: data.user?.id,
        username: nick
      };
      write("sh_session", session);
      updateAuthUI();
      await refreshAdminRole();
      await loadAllData();
      err.textContent = t("authOkReg");
      setTimeout(closeAuthModal, 600);
    } else if (data.user || data.id) {
      // try login right away
      const login = await sbAuth("token?grant_type=password", {
        email: nickToEmail(nick),
        password: pass
      });
      session = {
        access_token: login.access_token,
        refresh_token: login.refresh_token,
        user_id: login.user?.id,
        username: nick
      };
      write("sh_session", session);
      updateAuthUI();
      await refreshAdminRole();
      await loadAllData();
      err.textContent = t("authOkReg");
      setTimeout(closeAuthModal, 600);
    } else {
      err.textContent = t("authOkReg");
    }
  } catch (e) {
    err.textContent = e.message || t("authErr");
  }
});

document.getElementById("doLogout")?.addEventListener("click", () => {
  session = null;
  isAdmin = false;
  const adminTab = document.getElementById("adminTab"); if (adminTab) adminTab.hidden = true;
  localStorage.removeItem("sh_session");
  updateAuthUI();
  closeAuthModal();
});



const LANGS = { ru:"Русский", en:"English", de:"Deutsch", zh:"中文", it:"Italiano", ja:"日本語" };

const I18N = {
ru:{
brandSub:"COMMUNITY MARKET · DEMO",heroEyebrow:"COMMUNITY MARKETPLACE",heroTitle:"ТВОЯ ИГРОВАЯ<br><span>ВИТРИНА</span>",
heroDesc:"SkinHub — это маркет, где вы можете приобрести/продать скины за Telegram Stars!",
tabHome:"Главная",tabSell:"Выставить",tabHowto:"Как это работает",tabReviews:"Отзывы",tabSupport:"Поддержка",tabProfile:"Профиль",tabAdmin:"Админ",
discover:"DISCOVER",showcaseTitle:"Витрина сообщества",searchPlaceholder:"Поиск...",filterAll:"Все",filterRifle:"Винтовки",filterPistol:"Пистолеты",filterKnife:"Ножи",filterOther:"Другое",
createListing:"CREATE LISTING",newListing:"Новое объявление",selectSkin:"Выберите скин",category:"Категория",wear:"Износ",wearFN:"Factory New",wearMW:"Minimal Wear",wearFT:"Field-Tested",wearWW:"Well-Worn",wearBS:"Battle-Scarred",priceStars:"Цена (Telegram Stars)",addListing:"Добавить объявление",
howtoEyebrow:"GUIDE",howtoTitle:"Как это работает",feedback:"COMMUNITY FEEDBACK",reviewsTitle:"Отзывы",leaveReview:"Оставить отзыв",rating:"Оценка",comment:"Комментарий",reviewPlaceholder:"Напиши отзыв...",sendReview:"Отправить отзыв",
helpEyebrow:"WE ARE HERE TO HELP",supportTitle:"Поддержка",ticketSubject:"Тема обращения",ticketSubjectPh:"Например, вопрос по сделке",ticketMessage:"Сообщение",ticketMessagePh:"Опиши вопрос...",createTicket:"Создать обращение",myTickets:"Мои обращения",
account:"ACCOUNT",profileTitle:"Профиль",myListings:"Мои объявления",adminTitle:"Админ-панель",adminWarning:"Права администратора в этом макете проверяются на клиенте и не являются безопасной защитой для продакшена.",
adminAddReview:"Добавить отзыв от имени магазина",name:"Имя",text:"Текст",addReviewBtn:"Добавить отзыв",userTickets:"Обращения пользователей",replyTicket:"Ответить на обращение",reply:"Ответ",saveReply:"Сохранить ответ",
nothingFound:"Ничего не найдено.",noListings:"Ты ещё не добавлял объявления.",noTickets:"У тебя пока нет обращений.",noAdminTickets:"Обращений пока нет.",listingLabel:"Объявление",stars:"Stars",
fillSkinPrice:"Выберите скин и укажите положительную цену в Stars.",listingAdded:"Объявление добавлено. Свяжитесь с @skinhub_storage для передачи скина.",writeReview:"Напиши текст отзыва.",fillTicket:"Заполни тему и сообщение.",ticketSaved:"Обращение сохранено.",
noAccess:"Нет доступа.",fillNameText:"Заполни имя и текст.",reviewAdded:"Отзыв добавлен.",checkIdReply:"Проверь ID обращения и ответ.",replySaved:"Ответ сохранён.",openTelegram:"Открой приложение через Telegram",localMode:"Локальный режим вне Telegram",
statusNew:"Новое",statusReplied:"Ответ дан",supportReply:"Ответ поддержки",skinsShown:"скинов"
},
en:{
brandSub:"COMMUNITY MARKET · DEMO",heroEyebrow:"COMMUNITY MARKETPLACE",heroTitle:"YOUR GAMING<br><span>SHOWCASE</span>",
heroDesc:"SkinHub is a market where you can buy/sell skins for Telegram Stars!",
tabHome:"Home",tabSell:"Sell",tabHowto:"How it works",tabReviews:"Reviews",tabSupport:"Support",tabProfile:"Profile",tabAdmin:"Admin",
discover:"DISCOVER",showcaseTitle:"Community showcase",searchPlaceholder:"Search...",filterAll:"All",filterRifle:"Rifles",filterPistol:"Pistols",filterKnife:"Knives",filterOther:"Other",
createListing:"CREATE LISTING",newListing:"New listing",selectSkin:"Select a skin",category:"Category",wear:"Wear",wearFN:"Factory New",wearMW:"Minimal Wear",wearFT:"Field-Tested",wearWW:"Well-Worn",wearBS:"Battle-Scarred",priceStars:"Price (Telegram Stars)",addListing:"Add listing",
howtoEyebrow:"GUIDE",howtoTitle:"How it works",feedback:"COMMUNITY FEEDBACK",reviewsTitle:"Reviews",leaveReview:"Leave a review",rating:"Rating",comment:"Comment",reviewPlaceholder:"Write a review...",sendReview:"Submit review",
helpEyebrow:"WE ARE HERE TO HELP",supportTitle:"Support",ticketSubject:"Subject",ticketSubjectPh:"e.g. question about a deal",ticketMessage:"Message",ticketMessagePh:"Describe your question...",createTicket:"Create ticket",myTickets:"My tickets",
account:"ACCOUNT",profileTitle:"Profile",myListings:"My listings",adminTitle:"Admin panel",adminWarning:"Admin rights in this mock are checked on the client and are not a secure production guard.",
adminAddReview:"Add store review",name:"Name",text:"Text",addReviewBtn:"Add review",userTickets:"User tickets",replyTicket:"Reply to ticket",reply:"Reply",saveReply:"Save reply",
nothingFound:"Nothing found.",noListings:"You have no listings yet.",noTickets:"You have no tickets yet.",noAdminTickets:"No tickets yet.",listingLabel:"Listing",stars:"Stars",
fillSkinPrice:"Select a skin and enter a positive Stars price.",listingAdded:"Listing added. Contact @skinhub_storage to transfer the skin.",writeReview:"Please write a review.",fillTicket:"Fill in subject and message.",ticketSaved:"Ticket saved.",
noAccess:"Access denied.",fillNameText:"Fill in name and text.",reviewAdded:"Review added.",checkIdReply:"Check ticket ID and reply.",replySaved:"Reply saved.",openTelegram:"Open the app via Telegram",localMode:"Local mode outside Telegram",
statusNew:"New",statusReplied:"Replied",supportReply:"Support reply",skinsShown:"skins"
},
de:{
brandSub:"COMMUNITY MARKET · DEMO",heroEyebrow:"COMMUNITY MARKETPLACE",heroTitle:"DEINE GAMING-<br><span>VITRINE</span>",
heroDesc:"SkinHub ist ein Marktplatz, auf dem du Skins für Telegram Stars kaufen/verkaufen kannst!",
tabHome:"Start",tabSell:"Verkaufen",tabHowto:"So funktioniert's",tabReviews:"Bewertungen",tabSupport:"Support",tabProfile:"Profil",tabAdmin:"Admin",
discover:"ENTDECKEN",showcaseTitle:"Community-Vitrine",searchPlaceholder:"Suche...",filterAll:"Alle",filterRifle:"Gewehre",filterPistol:"Pistolen",filterKnife:"Messer",filterOther:"Sonstiges",
createListing:"ANZEIGE ERSTELLEN",newListing:"Neue Anzeige",selectSkin:"Skin auswählen",category:"Kategorie",wear:"Abnutzung",wearFN:"Factory New",wearMW:"Minimal Wear",wearFT:"Field-Tested",wearWW:"Well-Worn",wearBS:"Battle-Scarred",priceStars:"Preis (Telegram Stars)",addListing:"Anzeige hinzufügen",
howtoEyebrow:"ANLEITUNG",howtoTitle:"So funktioniert's",feedback:"COMMUNITY-FEEDBACK",reviewsTitle:"Bewertungen",leaveReview:"Bewertung abgeben",rating:"Bewertung",comment:"Kommentar",reviewPlaceholder:"Schreibe eine Bewertung...",sendReview:"Absenden",
helpEyebrow:"WIR HELFEN DIR",supportTitle:"Support",ticketSubject:"Betreff",ticketSubjectPh:"z.B. Frage zum Deal",ticketMessage:"Nachricht",ticketMessagePh:"Beschreibe deine Frage...",createTicket:"Ticket erstellen",myTickets:"Meine Tickets",
account:"KONTO",profileTitle:"Profil",myListings:"Meine Anzeigen",adminTitle:"Admin-Panel",adminWarning:"Admin-Rechte in diesem Mock werden clientseitig geprüft und sind kein sicherer Produktivschutz.",
adminAddReview:"Shop-Bewertung hinzufügen",name:"Name",text:"Text",addReviewBtn:"Bewertung hinzufügen",userTickets:"Nutzer-Tickets",replyTicket:"Auf Ticket antworten",reply:"Antwort",saveReply:"Antwort speichern",
nothingFound:"Nichts gefunden.",noListings:"Du hast noch keine Anzeigen.",noTickets:"Du hast noch keine Tickets.",noAdminTickets:"Noch keine Tickets.",listingLabel:"Anzeige",stars:"Stars",
fillSkinPrice:"Wähle einen Skin und gib einen positiven Stars-Preis ein.",listingAdded:"Anzeige hinzugefügt. Kontaktiere @skinhub_storage für den Transfer.",writeReview:"Bitte Bewertungstext eingeben.",fillTicket:"Betreff und Nachricht ausfüllen.",ticketSaved:"Ticket gespeichert.",
noAccess:"Kein Zugriff.",fillNameText:"Name und Text ausfüllen.",reviewAdded:"Bewertung hinzugefügt.",checkIdReply:"Ticket-ID und Antwort prüfen.",replySaved:"Antwort gespeichert.",openTelegram:"App über Telegram öffnen",localMode:"Lokaler Modus außerhalb von Telegram",
statusNew:"Neu",statusReplied:"Beantwortet",supportReply:"Support-Antwort",skinsShown:"Skins"
},
zh:{
brandSub:"COMMUNITY MARKET · DEMO",heroEyebrow:"COMMUNITY MARKETPLACE",heroTitle:"你的游戏<br><span>橱窗</span>",
heroDesc:"SkinHub 是一个可以用 Telegram Stars 买卖皮肤的市场！",
tabHome:"首页",tabSell:"出售",tabHowto:"如何运作",tabReviews:"评价",tabSupport:"支持",tabProfile:"个人",tabAdmin:"管理",
discover:"发现",showcaseTitle:"社区橱窗",searchPlaceholder:"搜索...",filterAll:"全部",filterRifle:"步枪",filterPistol:"手枪",filterKnife:"刀具",filterOther:"其他",
createListing:"创建列表",newListing:"新列表",selectSkin:"选择皮肤",category:"分类",wear:"磨损",wearFN:"Factory New",wearMW:"Minimal Wear",wearFT:"Field-Tested",wearWW:"Well-Worn",wearBS:"Battle-Scarred",priceStars:"价格（Telegram Stars）",addListing:"添加列表",
howtoEyebrow:"指南",howtoTitle:"如何运作",feedback:"社区反馈",reviewsTitle:"评价",leaveReview:"发表评价",rating:"评分",comment:"评论",reviewPlaceholder:"写下评价...",sendReview:"提交评价",
helpEyebrow:"我们随时帮助",supportTitle:"支持",ticketSubject:"主题",ticketSubjectPh:"例如：交易相关问题",ticketMessage:"消息",ticketMessagePh:"描述你的问题...",createTicket:"创建工单",myTickets:"我的工单",
account:"账户",profileTitle:"个人资料",myListings:"我的列表",adminTitle:"管理面板",adminWarning:"此演示中管理员权限在客户端检查，不适合生产环境的安全保护。",
adminAddReview:"添加商店评价",name:"姓名",text:"文本",addReviewBtn:"添加评价",userTickets:"用户工单",replyTicket:"回复工单",reply:"回复",saveReply:"保存回复",
nothingFound:"未找到。",noListings:"你还没有列表。",noTickets:"你还没有工单。",noAdminTickets:"暂无工单。",listingLabel:"列表",stars:"Stars",
fillSkinPrice:"请选择皮肤并输入正数 Stars 价格。",listingAdded:"列表已添加。请联系 @skinhub_storage 转移皮肤。",writeReview:"请填写评价内容。",fillTicket:"请填写主题和消息。",ticketSaved:"工单已保存。",
noAccess:"无权限。",fillNameText:"请填写姓名和文本。",reviewAdded:"评价已添加。",checkIdReply:"请检查工单 ID 和回复。",replySaved:"回复已保存。",openTelegram:"请通过 Telegram 打开应用",localMode:"Telegram 外的本地模式",
statusNew:"新建",statusReplied:"已回复",supportReply:"支持回复",skinsShown:"个皮肤"
},
it:{
brandSub:"COMMUNITY MARKET · DEMO",heroEyebrow:"COMMUNITY MARKETPLACE",heroTitle:"LA TUA VETRINA<br><span>GAMING</span>",
heroDesc:"SkinHub è un market dove puoi comprare/vendere skin con Telegram Stars!",
tabHome:"Home",tabSell:"Vendi",tabHowto:"Come funziona",tabReviews:"Recensioni",tabSupport:"Supporto",tabProfile:"Profilo",tabAdmin:"Admin",
discover:"SCOPRI",showcaseTitle:"Vetrina community",searchPlaceholder:"Cerca...",filterAll:"Tutti",filterRifle:"Fucili",filterPistol:"Pistole",filterKnife:"Coltelli",filterOther:"Altro",
createListing:"CREA ANNUNCIO",newListing:"Nuovo annuncio",selectSkin:"Seleziona skin",category:"Categoria",wear:"Usura",wearFN:"Factory New",wearMW:"Minimal Wear",wearFT:"Field-Tested",wearWW:"Well-Worn",wearBS:"Battle-Scarred",priceStars:"Prezzo (Telegram Stars)",addListing:"Aggiungi annuncio",
howtoEyebrow:"GUIDA",howtoTitle:"Come funziona",feedback:"FEEDBACK COMMUNITY",reviewsTitle:"Recensioni",leaveReview:"Lascia una recensione",rating:"Valutazione",comment:"Commento",reviewPlaceholder:"Scrivi una recensione...",sendReview:"Invia recensione",
helpEyebrow:"SIAMO QUI PER AIUTARTI",supportTitle:"Supporto",ticketSubject:"Oggetto",ticketSubjectPh:"es. domanda su un affare",ticketMessage:"Messaggio",ticketMessagePh:"Descrivi la domanda...",createTicket:"Crea ticket",myTickets:"I miei ticket",
account:"ACCOUNT",profileTitle:"Profilo",myListings:"I miei annunci",adminTitle:"Pannello admin",adminWarning:"I diritti admin in questo mock sono controllati lato client e non sono una protezione sicura in produzione.",
adminAddReview:"Aggiungi recensione negozio",name:"Nome",text:"Testo",addReviewBtn:"Aggiungi recensione",userTickets:"Ticket utenti",replyTicket:"Rispondi al ticket",reply:"Risposta",saveReply:"Salva risposta",
nothingFound:"Nessun risultato.",noListings:"Non hai ancora annunci.",noTickets:"Non hai ancora ticket.",noAdminTickets:"Nessun ticket.",listingLabel:"Annuncio",stars:"Stars",
fillSkinPrice:"Seleziona una skin e inserisci un prezzo Stars positivo.",listingAdded:"Annuncio aggiunto. Contatta @skinhub_storage per trasferire la skin.",writeReview:"Scrivi il testo della recensione.",fillTicket:"Compila oggetto e messaggio.",ticketSaved:"Ticket salvato.",
noAccess:"Accesso negato.",fillNameText:"Compila nome e testo.",reviewAdded:"Recensione aggiunta.",checkIdReply:"Controlla ID ticket e risposta.",replySaved:"Risposta salvata.",openTelegram:"Apri l'app tramite Telegram",localMode:"Modalità locale fuori da Telegram",
statusNew:"Nuovo",statusReplied:"Risposto",supportReply:"Risposta supporto",skinsShown:"skin"
},
ja:{
brandSub:"COMMUNITY MARKET · DEMO",heroEyebrow:"COMMUNITY MARKETPLACE",heroTitle:"あなたのゲーム<br><span>ショーケース</span>",
heroDesc:"SkinHubはTelegram Starsでスキンを売買できるマーケットです！",
tabHome:"ホーム",tabSell:"出品",tabHowto:"使い方",tabReviews:"レビュー",tabSupport:"サポート",tabProfile:"プロフィール",tabAdmin:"管理",
discover:"発見",showcaseTitle:"コミュニティショーケース",searchPlaceholder:"検索...",filterAll:"すべて",filterRifle:"ライフル",filterPistol:"ピストル",filterKnife:"ナイフ",filterOther:"その他",
createListing:"出品作成",newListing:"新規出品",selectSkin:"スキンを選択",category:"カテゴリ",wear:"摩耗",wearFN:"Factory New",wearMW:"Minimal Wear",wearFT:"Field-Tested",wearWW:"Well-Worn",wearBS:"Battle-Scarred",priceStars:"価格（Telegram Stars）",addListing:"出品を追加",
howtoEyebrow:"ガイド",howtoTitle:"使い方",feedback:"コミュニティフィードバック",reviewsTitle:"レビュー",leaveReview:"レビューを書く",rating:"評価",comment:"コメント",reviewPlaceholder:"レビューを書く...",sendReview:"送信",
helpEyebrow:"お手伝いします",supportTitle:"サポート",ticketSubject:"件名",ticketSubjectPh:"例：取引に関する質問",ticketMessage:"メッセージ",ticketMessagePh:"質問を記入...",createTicket:"チケット作成",myTickets:"自分のチケット",
account:"アカウント",profileTitle:"プロフィール",myListings:"自分の出品",adminTitle:"管理パネル",adminWarning:"このモックでは管理者権限はクライアント側で確認され、本番の安全な保護ではありません。",
adminAddReview:"ストアレビューを追加",name:"名前",text:"テキスト",addReviewBtn:"レビュー追加",userTickets:"ユーザーチケット",replyTicket:"チケットに返信",reply:"返信",saveReply:"返信を保存",
nothingFound:"見つかりません。",noListings:"まだ出品がありません。",noTickets:"まだチケットがありません。",noAdminTickets:"チケットはまだありません。",listingLabel:"出品",stars:"Stars",
fillSkinPrice:"スキンを選び、正のStars価格を入力してください。",listingAdded:"出品を追加しました。@skinhub_storage に連絡してスキンを送ってください。",writeReview:"レビュー本文を書いてください。",fillTicket:"件名とメッセージを入力してください。",ticketSaved:"チケットを保存しました。",
noAccess:"アクセスできません。",fillNameText:"名前とテキストを入力してください。",reviewAdded:"レビューを追加しました。",checkIdReply:"チケットIDと返信を確認してください。",replySaved:"返信を保存しました。",openTelegram:"Telegramからアプリを開いてください",localMode:"Telegram外のローカルモード",
statusNew:"新規",statusReplied:"返信済み",supportReply:"サポート返信",skinsShown:"スキン"
}
};
const HOWTO = {"ru": {"howto1Title": "1. Продажа скина", "howto1Text": "Выберите скин в приложении и выставьте объявление. Чтобы продать скин, отправьте его админу @skinhub_storage — с ним можно связаться в Telegram.", "howto2Title": "2. Когда ваш скин купили", "howto2Text": "Если ваш скин купили, тот же админ @skinhub_storage отправляет вам Telegram Stars за продажу.", "howto3Title": "3. Покупка скина", "howto3Text": "При покупке вы отправляете Stars админу @skinhub_storage, а он передаёт вам скин через Steam Trade.", "howto4Title": "4. Поддержка", "howto4Text": "Все сделки и вопросы — через админа @skinhub_storage. Дополнительно: @SkinHub_support", "listingHint": "После публикации свяжитесь с @skinhub_storage и передайте скин админу.", "heroNote": "Сделки через админа @skinhub_storage · Telegram Stars + Steam", "supportIntro": "Сделки, Stars и передача скинов — через админа:", "supportExtra": "Доп. поддержка: @SkinHub_support", "adminContactLabel": "Админ для сделок:", "skinSearchPh": "Поиск скина (AK, AWP, Karambit...)"}, "en": {"howto1Title": "1. Selling a skin", "howto1Text": "Pick a skin in the app and create a listing. To sell, send the skin to admin @skinhub_storage — contact him on Telegram.", "howto2Title": "2. When your skin is bought", "howto2Text": "If your skin is bought, the same admin @skinhub_storage sends you Telegram Stars for the sale.", "howto3Title": "3. Buying a skin", "howto3Text": "When buying, you send Stars to admin @skinhub_storage and he transfers the skin to you via Steam Trade.", "howto4Title": "4. Support", "howto4Text": "All deals and questions go through admin @skinhub_storage. Extra: @SkinHub_support", "listingHint": "After listing, contact @skinhub_storage and send him the skin.", "heroNote": "Deals via admin @skinhub_storage · Telegram Stars + Steam", "supportIntro": "Deals, Stars and skin transfers — through the admin:", "supportExtra": "Extra support: @SkinHub_support", "adminContactLabel": "Deal admin:", "skinSearchPh": "Search skin (AK, AWP, Karambit...)"}, "de": {"howto1Title": "1. Skin verkaufen", "howto1Text": "Wähle einen Skin und erstelle eine Anzeige. Zum Verkauf sende den Skin an Admin @skinhub_storage — erreichbar auf Telegram.", "howto2Title": "2. Wenn dein Skin gekauft wird", "howto2Text": "Wird dein Skin gekauft, sendet derselbe Admin @skinhub_storage dir Telegram Stars.", "howto3Title": "3. Skin kaufen", "howto3Text": "Beim Kauf sendest du Stars an Admin @skinhub_storage; er überträgt den Skin per Steam Trade.", "howto4Title": "4. Support", "howto4Text": "Alle Deals über Admin @skinhub_storage. Zusätzlich: @SkinHub_support", "listingHint": "Nach der Anzeige kontaktiere @skinhub_storage und sende den Skin.", "heroNote": "Deals über Admin @skinhub_storage · Telegram Stars + Steam", "supportIntro": "Deals, Stars und Transfers — über den Admin:", "supportExtra": "Extra-Support: @SkinHub_support", "adminContactLabel": "Deal-Admin:", "skinSearchPh": "Skin suchen (AK, AWP, Karambit...)"}, "zh": {"howto1Title": "1. 出售皮肤", "howto1Text": "在应用中选择皮肤并发布。出售时请将皮肤发送给管理员 @skinhub_storage（Telegram 联系）。", "howto2Title": "2. 皮肤被购买时", "howto2Text": "若你的皮肤被买走，同一管理员 @skinhub_storage 会向你发送 Telegram Stars。", "howto3Title": "3. 购买皮肤", "howto3Text": "购买时你向管理员 @skinhub_storage 发送 Stars，他通过 Steam 交易把皮肤给你。", "howto4Title": "4. 支持", "howto4Text": "所有交易与问题通过管理员 @skinhub_storage。额外：@SkinHub_support", "listingHint": "发布后联系 @skinhub_storage 并发送皮肤。", "heroNote": "交易通过管理员 @skinhub_storage · Telegram Stars + Steam", "supportIntro": "交易、Stars 与皮肤转移通过管理员：", "supportExtra": "额外支持：@SkinHub_support", "adminContactLabel": "交易管理员：", "skinSearchPh": "搜索皮肤 (AK, AWP, Karambit...)"}, "it": {"howto1Title": "1. Vendita skin", "howto1Text": "Scegli una skin e crea l'annuncio. Per vendere, invia la skin all'admin @skinhub_storage su Telegram.", "howto2Title": "2. Quando la tua skin viene comprata", "howto2Text": "Se la tua skin viene acquistata, lo stesso admin @skinhub_storage ti invia i Telegram Stars.", "howto3Title": "3. Acquisto skin", "howto3Text": "In acquisto invii Stars all'admin @skinhub_storage e lui ti trasferisce la skin via Steam Trade.", "howto4Title": "4. Supporto", "howto4Text": "Tutti gli affari tramite admin @skinhub_storage. Extra: @SkinHub_support", "listingHint": "Dopo l'annuncio contatta @skinhub_storage e inviagli la skin.", "heroNote": "Affari tramite admin @skinhub_storage · Telegram Stars + Steam", "supportIntro": "Affari, Stars e trasferimenti — tramite l'admin:", "supportExtra": "Supporto extra: @SkinHub_support", "adminContactLabel": "Admin affari:", "skinSearchPh": "Cerca skin (AK, AWP, Karambit...)"}, "ja": {"howto1Title": "1. スキンの売却", "howto1Text": "アプリでスキンを選び出品します。売却するには管理者 @skinhub_storage にスキンを送ってください（Telegram）。", "howto2Title": "2. スキンが売れたとき", "howto2Text": "スキンが購入されたら、同じ管理者 @skinhub_storage が Telegram Stars を送ります。", "howto3Title": "3. スキンの購入", "howto3Text": "購入時は管理者 @skinhub_storage に Stars を送り、Steamトレードでスキンを受け取ります。", "howto4Title": "4. サポート", "howto4Text": "取引は管理者 @skinhub_storage 経由。追加: @SkinHub_support", "listingHint": "出品後 @skinhub_storage に連絡しスキンを送ってください。", "heroNote": "管理者 @skinhub_storage 経由 · Telegram Stars + Steam", "supportIntro": "取引・Stars・転送は管理者経由：", "supportExtra": "追加サポート: @SkinHub_support", "adminContactLabel": "取引管理者：", "skinSearchPh": "スキン検索 (AK, AWP, Karambit...)"}};
for (const [lang, ov] of Object.entries(HOWTO)) {
  if (!I18N[lang]) I18N[lang] = {};
  Object.assign(I18N[lang], ov);
}

const AUTH_I18N = {
  ru:{authLogin:"Вход",authRegister:"Регистрация",authLoginBtn:"Войти",authRegisterBtn:"Создать аккаунт",authLogout:"Выйти",authNick:"Ник",authPass:"Пароль",authPass2:"Повтор пароля",authNeedFields:"Введите ник и пароль",authPassMatch:"Пароли не совпадают",authPassShort:"Пароль минимум 6 символов",authNickShort:"Ник минимум 3 символа",authOkLogin:"Вход выполнен",authOkReg:"Аккаунт создан",authErr:"Ошибка",authGuest:"Гость"},
  en:{authLogin:"Login",authRegister:"Sign up",authLoginBtn:"Log in",authRegisterBtn:"Create account",authLogout:"Log out",authNick:"Nickname",authPass:"Password",authPass2:"Repeat password",authNeedFields:"Enter nickname and password",authPassMatch:"Passwords do not match",authPassShort:"Password at least 6 characters",authNickShort:"Nickname at least 3 characters",authOkLogin:"Logged in",authOkReg:"Account created",authErr:"Error",authGuest:"Guest"},
  de:{authLogin:"Login",authRegister:"Registrieren",authLoginBtn:"Einloggen",authRegisterBtn:"Konto erstellen",authLogout:"Abmelden",authNick:"Nickname",authPass:"Passwort",authPass2:"Passwort wiederholen",authNeedFields:"Nickname und Passwort eingeben",authPassMatch:"Passwörter stimmen nicht überein",authPassShort:"Mindestens 6 Zeichen",authNickShort:"Mindestens 3 Zeichen",authOkLogin:"Eingeloggt",authOkReg:"Konto erstellt",authErr:"Fehler",authGuest:"Gast"},
  zh:{authLogin:"登录",authRegister:"注册",authLoginBtn:"登录",authRegisterBtn:"创建账户",authLogout:"退出",authNick:"昵称",authPass:"密码",authPass2:"确认密码",authNeedFields:"请输入昵称和密码",authPassMatch:"两次密码不一致",authPassShort:"密码至少6位",authNickShort:"昵称至少3个字符",authOkLogin:"已登录",authOkReg:"账户已创建",authErr:"错误",authGuest:"游客"},
  it:{authLogin:"Accedi",authRegister:"Registrati",authLoginBtn:"Entra",authRegisterBtn:"Crea account",authLogout:"Esci",authNick:"Nickname",authPass:"Password",authPass2:"Ripeti password",authNeedFields:"Inserisci nickname e password",authPassMatch:"Le password non coincidono",authPassShort:"Minimo 6 caratteri",authNickShort:"Minimo 3 caratteri",authOkLogin:"Accesso effettuato",authOkReg:"Account creato",authErr:"Errore",authGuest:"Ospite"},
  ja:{authLogin:"ログイン",authRegister:"登録",authLoginBtn:"ログイン",authRegisterBtn:"アカウント作成",authLogout:"ログアウト",authNick:"ニックネーム",authPass:"パスワード",authPass2:"パスワード再入力",authNeedFields:"ニックネームとパスワードを入力",authPassMatch:"パスワードが一致しません",authPassShort:"パスワードは6文字以上",authNickShort:"ニックネームは3文字以上",authOkLogin:"ログインしました",authOkReg:"アカウント作成",authErr:"エラー",authGuest:"ゲスト"}
};
for (const [lang, ov] of Object.entries(AUTH_I18N)) {
  if (!I18N[lang]) I18N[lang] = {};
  Object.assign(I18N[lang], ov);
}

let SKINS = [];

const CSGO_SKINS_URL = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json";

function mapApiCategory(skin) {
  const catName = (skin.category && skin.category.name) || "";
  const weaponName = (skin.weapon && skin.weapon.name) || skin.name || "";
  const n = (catName + " " + weaponName).toLowerCase();
  if (n.includes("knife") || weaponName.startsWith("★") || n.includes("bayonet") || n.includes("karambit") || n.includes("dagger")) return "knife";
  if (n.includes("pistol")) return "pistol";
  if (n.includes("rifle") || n.includes("sniper")) return "rifle";
  // SMG, heavy, gloves, etc.
  return "other";
}

async function loadSkinsCatalog() {
  try {
    const res = await fetch(CSGO_SKINS_URL);
    if (!res.ok) throw new Error("skins api " + res.status);
    const data = await res.json();
    SKINS = (data || []).map((s) => ({
      id: s.id || s.name,
      name: s.name,
      category: mapApiCategory(s),
      image: s.image || ""
    })).filter((s) => s.name && s.image);
    // prefer non-statrak/souvenir duplicates by unique name base - keep all for full list
  } catch (e) {
    console.error("Failed to load CS2 skins catalog", e);
    SKINS = [];
  }
  populateSkins();
}

let lang = localStorage.getItem("sh_lang") || (navigator.language || "ru").slice(0, 2);
if (!I18N[lang]) lang = "ru";
function t(key) { return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key; }

function applyI18n() {
  document.documentElement.lang = lang;
  const setTxt = (id, key) => { const el = document.getElementById(id); if (el) el.textContent = t(key); };
  const setHtml = (id, key) => { const el = document.getElementById(id); if (el) el.innerHTML = t(key); };
  setTxt("brandSub","brandSub"); setTxt("heroEyebrow","heroEyebrow"); setHtml("heroTitle","heroTitle");
  setTxt("heroDesc","heroDesc"); setTxt("heroNote","heroNote");
  document.querySelectorAll("[data-i18n]").forEach((el) => { const key = el.getAttribute("data-i18n"); if (key) el.textContent = t(key); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => { const key = el.getAttribute("data-i18n-placeholder"); if (key) el.placeholder = t(key); });
  const catSelect = document.getElementById("itemCategory");
  if (catSelect) {
    [...catSelect.options].forEach((opt) => {
      const map = { rifle: "filterRifle", pistol: "filterPistol", knife: "filterKnife", other: "filterOther" };
      if (map[opt.value]) opt.textContent = t(map[opt.value]);
    });
  }
  const wearSelect = document.getElementById("itemWear");
  if (wearSelect) {
    [...wearSelect.options].forEach((opt) => {
      const map = { FN: "wearFN", MW: "wearMW", FT: "wearFT", WW: "wearWW", BS: "wearBS" };
      if (map[opt.value]) opt.textContent = t(map[opt.value]);
    });
  }
  populateSkins();
  updateAuthUI();
  renderCatalog(); renderReviews(); renderTickets();
  if (document.getElementById("profile")?.classList.contains("active")) renderMyListings();
  if (isAdmin && document.getElementById("admin")?.classList.contains("active")) renderAdmin();
}

const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

let listings = [];
let reviews = [];
let tickets = [];
let activeFilter = "all";
let dataReady = false;

function resolveSkinImage(name, skinId, image) {
  if (image && !image.includes("placehold.co")) return image;
  if (skinId) {
    const byId = SKINS.find((s) => s.id === skinId);
    if (byId && byId.image) return byId.image;
  }
  if (name) {
    const byName = SKINS.find((s) => s.name === name);
    if (byName && byName.image) return byName.image;
    const lower = name.toLowerCase();
    const partial = SKINS.find((s) => s.name.toLowerCase() === lower || s.name.toLowerCase().includes(lower));
    if (partial && partial.image) return partial.image;
  }
  return image || "";
}
function mapListing(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    image: resolveSkinImage(row.name, row.skin_id, row.image || ""),
    owner: row.owner,
    ownerName: row.owner_name || "",
    skinId: row.skin_id || "",
    wear: row.wear || "",
    status: row.status || "pending",
    commissionPercent: Number(row.commission_percent ?? 20),
    commissionAmount: Number(row.commission_amount ?? Math.round(Number(row.price) * 0.2)),
    sellerPayout: Number(row.seller_payout ?? Math.round(Number(row.price) * 0.8))
  };
}
function wearLabel(code) {
  const map = { FN: "wearFN", MW: "wearMW", FT: "wearFT", WW: "wearWW", BS: "wearBS" };
  return map[code] ? t(map[code]) : (code || "");
}
function mapReview(row) {
  return { id: row.id, name: row.name, rating: Number(row.rating), text: row.text };
}
function mapTicket(row) {
  return { id: row.id, owner: row.owner, name: row.name, subject: row.subject, text: row.text, status: row.status, reply: row.reply || "" };
}

async function refreshAdminRole() {
  isAdmin = false;
  if (!isLoggedIn() || !session.user_id || !sbEnabled) {
    const tab = document.getElementById("adminTab");
    if (tab) tab.hidden = true;
    return;
  }
  try {
    const rows = await sb(`admin_users?select=user_id&user_id=eq.${encodeURIComponent(session.user_id)}`);
    isAdmin = Array.isArray(rows) && rows.some((r) => String(r.user_id) === String(session.user_id));
  } catch (e) {
    console.warn("Admin role check failed", e);
    isAdmin = false;
  }
  const tab = document.getElementById("adminTab");
  if (tab) tab.hidden = !isAdmin;
}

async function loadAllData() {
  if (!sbEnabled) {
    // fallback localStorage
    listings = read("sh_listings_v3", []);
    reviews = read("sh_reviews_v3", []);
    tickets = read("sh_tickets_v3", []);
    dataReady = true;
    renderCatalog(); renderReviews(); renderTickets();
    return;
  }
  try {
    const [L, R, T] = await Promise.all([
      sb(`listings?select=*&${isAdmin ? "" : `or=(status.eq.approved,owner.eq.${encodeURIComponent(currentOwnerId())})&`}order=created_at.desc`),
      sb("reviews?select=*&order=created_at.desc"),
      sb("tickets?select=*&order=created_at.desc")
    ]);
    listings = (L || []).map(mapListing);
    reviews = (R || []).map(mapReview);
    tickets = (T || []).map(mapTicket);
  } catch (e) {
    console.error("Supabase load error", e);
    alert("Ошибка загрузки данных с сервера. Проверь SUPABASE_URL и ключ.");
  }
  dataReady = true;
  renderCatalog(); renderReviews(); renderTickets();
}

document.getElementById("userLabel").textContent = userName;
document.getElementById("profileName").textContent = userName;
document.getElementById("profileId").textContent = user ? "Telegram ID: " + user.id : t("localMode");
document.getElementById("avatar").textContent = (userName[0] || "?").toUpperCase();
if (isAdmin) document.getElementById("adminTab").hidden = false;

const langSelect = document.getElementById("langSelect");
Object.entries(LANGS).forEach(([code, label]) => {
  const opt = document.createElement("option");
  opt.value = code; opt.textContent = label;
  if (code === lang) opt.selected = true;
  langSelect.appendChild(opt);
});
langSelect.addEventListener("change", () => { lang = langSelect.value; localStorage.setItem("sh_lang", lang); applyI18n(); });

const skinSelect = document.getElementById("itemSkin");
const skinSearch = document.getElementById("skinSearch");
const preview = document.getElementById("skinPreview");
const previewImg = document.getElementById("skinPreviewImg");
const previewName = document.getElementById("skinPreviewName");

function populateSkins() {
  const q = (skinSearch?.value || "").toLowerCase().trim();
  const filtered = SKINS.filter((s) => !q || s.name.toLowerCase().includes(q) || s.id.includes(q));
  const prev = skinSelect.value;
  skinSelect.innerHTML = "";
  const empty = document.createElement("option");
  empty.value = ""; empty.textContent = "—";
  skinSelect.appendChild(empty);
  filtered.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id; opt.textContent = s.name;
    skinSelect.appendChild(opt);
  });
  if (filtered.some((s) => s.id === prev)) skinSelect.value = prev;
  const cnt = document.getElementById("skinCount");
  if (cnt) cnt.textContent = filtered.length + " / " + SKINS.length + " " + t("skinsShown");
}

skinSearch?.addEventListener("input", populateSkins);

skinSelect.addEventListener("change", () => {
  const skin = SKINS.find((s) => s.id === skinSelect.value);
  if (!skin) { preview.classList.add("hidden"); return; }
  preview.classList.remove("hidden");
  previewImg.src = skin.image;
  previewImg.alt = skin.name;
  previewName.textContent = skin.name;
  document.getElementById("itemCategory").value = skin.category;
  previewImg.onerror = () => { previewImg.style.display = "none"; };
  previewImg.onload = () => { previewImg.style.display = ""; };
});

function showPage(name) {
  document.querySelectorAll(".page").forEach((p) => p.classList.toggle("active", p.id === name));
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.page === name));
  if (name === "profile") renderMyListings();
  if (name === "admin" && isAdmin) renderAdmin();
}
document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => showPage(b.dataset.page)));

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }
function categoryName(c) {
  return ({ rifle: t("filterRifle"), pistol: t("filterPistol"), knife: t("filterKnife"), other: t("filterOther") })[c] || t("filterOther");
}

function renderCatalog() {
  const q = document.getElementById("search").value.toLowerCase();
  const list = listings.filter((x) => x.status === "approved" && (activeFilter === "all" || x.category === activeFilter) && x.name.toLowerCase().includes(q));
  document.getElementById("catalog").innerHTML =
    list.map((x) => `
    <article class="item">
      <div class="item-art">${x.image ? `<img src="${escapeAttr(x.image)}" alt="${escapeAttr(x.name)}" onerror="this.style.display='none';this.parentElement.textContent='✦'">` : "✦"}</div>
      <div class="item-body">
        <h3>${escapeHtml(x.name)}</h3>
        <div class="muted">Объявление #${escapeHtml(x.id)} · ${categoryName(x.category)}${x.wear ? " · " + wearLabel(x.wear) : ""}</div>
        <div class="price">${Number(x.price)} ${t("stars")}</div>
        <div class="muted">Комиссия 20%: ${x.commissionAmount} ⭐ · продавцу: ${x.sellerPayout} ⭐</div>
      </div>
    </article>`).join("") || `<p class="muted">${t("nothingFound")}</p>`;
}

document.getElementById("search").addEventListener("input", renderCatalog);
document.querySelectorAll(".chip").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((x) => x.classList.remove("selected"));
    b.classList.add("selected");
    activeFilter = b.dataset.filter;
    renderCatalog();
  })
);

function updateCommissionPreview() {
  const price = Number(document.getElementById("itemPrice")?.value || 0);
  const fee = Number.isFinite(price) && price > 0 ? Math.round(price * 0.20) : 0;
  const payout = Math.max(0, price - fee);
  const el = document.getElementById("commissionPreview");
  if (el) el.textContent = price > 0
    ? `Комиссия 20%: ${fee} ⭐ · после комиссии продавец получит: ${payout} ⭐`
    : "Комиссия 20% · продавец получит 80% от цены";
}
document.getElementById("itemPrice")?.addEventListener("input", updateCommissionPreview);

document.getElementById("addListing").onclick = async () => {
  if (!isLoggedIn()) { alert("Сначала войдите или зарегистрируйтесь, чтобы выставить скин."); openAuthModal(); return; }
  if (!sbEnabled) { alert("Для публикации необходимо подключение к общей базе SKINHUB."); return; }
  const skinId = skinSelect.value;
  const skin = SKINS.find((s) => s.id === skinId);
  const price = Number(document.getElementById("itemPrice").value);
  if (!skin || !Number.isInteger(price) || price <= 0) { alert(t("fillSkinPrice")); return; }
  const wear = document.getElementById("itemWear")?.value || "FT";
  const payload = {
    name: skin.name,
    category: document.getElementById("itemCategory").value || skin.category,
    price,
    image: skin.image,
    owner: currentOwnerId(),
    owner_name: currentUsername(),
    skin_id: skin.id,
    wear,
    status: "pending",
    commission_percent: 20,
    commission_amount: Math.round(price * 0.20),
    seller_payout: price - Math.round(price * 0.20)
  };
  try {
    const rows = await sb("listings", { method: "POST", body: JSON.stringify(payload) });
    const row = Array.isArray(rows) ? rows[0] : rows;
    listings.unshift(mapListing(row));
  } catch (e) {
    console.error(e);
    alert("Не удалось сохранить объявление: " + e.message);
    return;
  }
  document.getElementById("itemPrice").value = "";
  skinSelect.value = "";
  if (skinSearch) skinSearch.value = "";
  populateSkins();
  preview.classList.add("hidden");
  renderCatalog();
  alert("Объявление отправлено администратору на модерацию. После одобрения оно появится в каталоге.");
  renderMyListings();
  showPage("profile");
};

function renderReviews() {
  document.getElementById("reviewList").innerHTML = reviews.map((r) =>
    `<div class="entry"><h3>${escapeHtml(r.name)} <span style="color:#c6a3ff">${"★".repeat(Math.max(1, Math.min(5, Number(r.rating))))}</span></h3><p>${escapeHtml(r.text)}</p></div>`
  ).join("");
}
document.getElementById("addReview").onclick = async () => {
  const textVal = document.getElementById("reviewText").value.trim();
  if (!textVal) { alert(t("writeReview")); return; }
  const payload = { name: currentUsername(), rating: Number(document.getElementById("reviewRating").value), text: textVal };
  try {
    if (sbEnabled) {
      const rows = await sb("reviews", { method: "POST", body: JSON.stringify(payload) });
      const row = Array.isArray(rows) ? rows[0] : rows;
      reviews.unshift(mapReview(row));
    } else {
      reviews.unshift(payload);
      write("sh_reviews_v3", reviews);
    }
  } catch (e) {
    console.error(e);
    alert("Не удалось сохранить отзыв: " + e.message);
    return;
  }
  document.getElementById("reviewText").value = "";
  renderReviews();
};

function ticketHtml(ticket) {
  return `<div class="entry"><h3>#${ticket.id} · ${escapeHtml(ticket.subject)} <span class="muted">· ${escapeHtml(ticket.status)}</span></h3><p>${escapeHtml(ticket.text)}</p>${
    ticket.reply ? `<p><b>${t("supportReply")}:</b> ${escapeHtml(ticket.reply)}</p>` : ""
  }</div>`;
}
function renderTickets() {
  const mine = tickets.filter((x) => x.owner === currentOwnerId() || x.owner === userId);
  document.getElementById("ticketList").innerHTML = mine.map(ticketHtml).join("") || `<p class="muted">${t("noTickets")}</p>`;
}
document.getElementById("createTicket").onclick = async () => {
  const subject = document.getElementById("ticketSubject").value.trim();
  const textVal = document.getElementById("ticketText").value.trim();
  if (!subject || !textVal) { alert(t("fillTicket")); return; }
  const payload = { owner: currentOwnerId(), name: currentUsername(), subject, text: textVal, status: t("statusNew"), reply: "" };
  try {
    if (sbEnabled) {
      const rows = await sb("tickets", { method: "POST", body: JSON.stringify(payload) });
      const row = Array.isArray(rows) ? rows[0] : rows;
      tickets.unshift(mapTicket(row));
    } else {
      tickets.unshift({ id: Date.now(), ...payload });
      write("sh_tickets_v3", tickets);
    }
  } catch (e) {
    console.error(e);
    alert("Не удалось создать обращение: " + e.message);
    return;
  }
  document.getElementById("ticketSubject").value = "";
  document.getElementById("ticketText").value = "";
  renderTickets();
  alert(t("ticketSaved"));
};

function renderMyListings() {
  const mine = listings.filter((x) => x.owner === currentOwnerId() || x.owner === userId);
  document.getElementById("myListings").innerHTML = mine.map((x) =>
    `<div class="entry listing-manage">
      <div><h3>${escapeHtml(x.name)} <span class="muted">#${escapeHtml(x.id)}</span></h3>
      <p>${x.wear ? wearLabel(x.wear) + " · " : ""}${x.price} ⭐ · комиссия ${x.commissionAmount} ⭐ · вам ${x.sellerPayout} ⭐</p>
      <p class="muted">Статус: ${x.status === "approved" ? "Одобрено" : x.status === "rejected" ? "Отклонено" : "На модерации"}</p></div>
      <button class="danger" data-delete-listing="${escapeAttr(x.id)}" type="button">Удалить</button>
    </div>`
  ).join("") || `<p class="muted">${t("noListings")}</p>`;
  document.querySelectorAll("[data-delete-listing]").forEach((btn) => {
    btn.addEventListener("click", () => deleteListing(btn.dataset.deleteListing));
  });
}

async function deleteListing(id) {
  if (!confirm("Удалить это объявление?")) return;
  try {
    if (!sbEnabled || !isLoggedIn()) throw new Error("Войдите в аккаунт, чтобы управлять объявлениями.");
    await sb(`listings?id=eq.${encodeURIComponent(id)}&owner=eq.${encodeURIComponent(currentOwnerId())}`, {
      method: "DELETE", prefer: "return=minimal"
    });
    listings = listings.filter((x) => String(x.id) !== String(id));
    renderCatalog();
    renderMyListings();
  } catch (e) {
    alert("Не удалось удалить объявление: " + e.message);
  }
}

function renderAdmin() {
  if (!isAdmin) return;
  document.getElementById("adminTickets").innerHTML = tickets.map(ticketHtml).join("") || `<p class="muted">${t("noAdminTickets")}</p>`;
  const pending = listings.filter((x) => x.status === "pending");
  document.getElementById("adminListings").innerHTML = pending.map((x) =>
    `<div class="entry"><h3>${escapeHtml(x.name)} <span class="muted">#${escapeHtml(x.id)}</span></h3>
    <p>${x.price} ⭐ · комиссия ${x.commissionAmount} ⭐ · продавцу ${x.sellerPayout} ⭐ · ${escapeHtml(x.ownerName)}</p>
    <div class="admin-actions"><button class="primary" data-approve-listing="${escapeAttr(x.id)}">Одобрить</button>
    <button class="danger" data-reject-listing="${escapeAttr(x.id)}">Отклонить</button></div></div>`
  ).join("") || `<p class="muted">Нет объявлений на модерации.</p>`;
  document.querySelectorAll("[data-approve-listing]").forEach((b) => b.addEventListener("click", () => moderateListing(b.dataset.approveListing, "approved")));
  document.querySelectorAll("[data-reject-listing]").forEach((b) => b.addEventListener("click", () => moderateListing(b.dataset.rejectListing, "rejected")));
}

async function moderateListing(id, status) {
  if (!isAdmin) return alert("Нет доступа.");
  try {
    await sb(`listings?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH", body: JSON.stringify({ status }), prefer: "return=minimal"
    });
    const item = listings.find((x) => String(x.id) === String(id));
    if (item) item.status = status;
    renderAdmin();
    renderCatalog();
    renderMyListings();
  } catch (e) {
    alert("Не удалось изменить статус: " + e.message);
  }
}
document.getElementById("adminAddReviewBtn").onclick = async () => {
  if (!isAdmin) return alert(t("noAccess"));
  const name = document.getElementById("adminReviewName").value.trim();
  const textVal = document.getElementById("adminReviewText").value.trim();
  if (!name || !textVal) { alert(t("fillNameText")); return; }
  const payload = { name, rating: 5, text: textVal };
  try {
    if (sbEnabled) {
      const rows = await sb("reviews", { method: "POST", body: JSON.stringify(payload) });
      const row = Array.isArray(rows) ? rows[0] : rows;
      reviews.unshift(mapReview(row));
    } else {
      reviews.unshift(payload);
      write("sh_reviews_v3", reviews);
    }
  } catch (e) {
    console.error(e);
    alert("Не удалось добавить отзыв: " + e.message);
    return;
  }
  renderReviews();
  alert(t("reviewAdded"));
};
document.getElementById("sendReply").onclick = async () => {
  if (!isAdmin) return alert(t("noAccess"));
  const id = Number(document.getElementById("replyTicketId").value);
  const reply = document.getElementById("replyTicketText").value.trim();
  const ticket = tickets.find((x) => x.id === id);
  if (!ticket || !reply) { alert(t("checkIdReply")); return; }
  try {
    if (sbEnabled) {
      await sb(`tickets?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify({ reply, status: t("statusReplied") }),
        prefer: "return=minimal"
      });
    }
    ticket.reply = reply;
    ticket.status = t("statusReplied");
    if (!sbEnabled) write("sh_tickets_v3", tickets);
  } catch (e) {
    console.error(e);
    alert("Не удалось сохранить ответ: " + e.message);
    return;
  }
  renderAdmin(); renderTickets();
  alert(t("replySaved"));
};

applyI18n();
refreshAdminRole().then(() => Promise.all([loadSkinsCatalog(), loadAllData()])).then(() => {
  listings = listings.map((l) => ({ ...l, image: resolveSkinImage(l.name, l.skinId, l.image) }));
  renderCatalog();
  renderMyListings();
  if (isAdmin) renderAdmin();
});
