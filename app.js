const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const params = new URLSearchParams(location.search);
const ADMIN_ID = params.get("demo_admin_id") || "";
const user = tg?.initDataUnsafe?.user || null;
const userId = user?.id ? String(user.id) : "local-demo";
const userName = user ? user.first_name + (user.last_name ? " " + user.last_name : "") : "Guest";
const isAdmin = !!user && ADMIN_ID && String(user.id) === String(ADMIN_ID);

/* ========== SUPABASE ==========
  1. Создай проект на https://supabase.com
  2. SQL Editor → вставь supabase_setup.sql → Run
  3. Settings → API → скопируй URL и anon public key сюда:
*/
const SUPABASE_URL = "https://rqvsgihpllhbukruqdxa.supabase.co
";   // например https://xxxx.supabase.co
const SUPABASE_ANON_KEY = "sb_publishable_r5dwBignQN1kULwgTHcvTA_4ZabvV3-";

const sbEnabled = SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20 && !SUPABASE_ANON_KEY.startsWith("ВСТАВЬ");

async function sb(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
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


const LANGS = { ru:"Русский", en:"English", de:"Deutsch", zh:"中文", it:"Italiano", ja:"日本語" };

const I18N = {
ru:{
brandSub:"COMMUNITY MARKET · DEMO",heroEyebrow:"COMMUNITY MARKETPLACE",heroTitle:"ТВОЯ ИГРОВАЯ<br><span>ВИТРИНА</span>",
heroDesc:"SkinHub — это маркет, где вы можете приобрести/продать скины за Telegram Stars!",
tabHome:"Главная",tabSell:"Выставить",tabHowto:"Как это работает",tabReviews:"Отзывы",tabSupport:"Поддержка",tabProfile:"Профиль",tabAdmin:"Админ",
discover:"DISCOVER",showcaseTitle:"Витрина сообщества",searchPlaceholder:"Поиск...",filterAll:"Все",filterRifle:"Винтовки",filterPistol:"Пистолеты",filterKnife:"Ножи",filterOther:"Другое",
createListing:"CREATE LISTING",newListing:"Новое объявление",selectSkin:"Выберите скин",category:"Категория",priceStars:"Цена (Telegram Stars)",addListing:"Добавить объявление",
howtoEyebrow:"GUIDE",howtoTitle:"Как это работает",feedback:"COMMUNITY FEEDBACK",reviewsTitle:"Отзывы",leaveReview:"Оставить отзыв",rating:"Оценка",comment:"Комментарий",reviewPlaceholder:"Напиши отзыв...",sendReview:"Отправить отзыв",
helpEyebrow:"WE ARE HERE TO HELP",supportTitle:"Поддержка",ticketSubject:"Тема обращения",ticketSubjectPh:"Например, вопрос по сделке",ticketMessage:"Сообщение",ticketMessagePh:"Опиши вопрос...",createTicket:"Создать обращение",myTickets:"Мои обращения",
account:"ACCOUNT",profileTitle:"Профиль",myListings:"Мои объявления",adminTitle:"Админ-панель",adminWarning:"Права администратора в этом макете проверяются на клиенте и не являются безопасной защитой для продакшена.",
adminAddReview:"Добавить отзыв от имени магазина",name:"Имя",text:"Текст",addReviewBtn:"Добавить отзыв",userTickets:"Обращения пользователей",replyTicket:"Ответить на обращение",reply:"Ответ",saveReply:"Сохранить ответ",
nothingFound:"Ничего не найдено.",noListings:"Ты ещё не добавлял объявления.",noTickets:"У тебя пока нет обращений.",noAdminTickets:"Обращений пока нет.",listingLabel:"Объявление",stars:"Stars",
fillSkinPrice:"Выберите скин и укажите положительную цену в Stars.",listingAdded:"Объявление добавлено. Свяжитесь с @xyrexon для передачи скина.",writeReview:"Напиши текст отзыва.",fillTicket:"Заполни тему и сообщение.",ticketSaved:"Обращение сохранено.",
noAccess:"Нет доступа.",fillNameText:"Заполни имя и текст.",reviewAdded:"Отзыв добавлен.",checkIdReply:"Проверь ID обращения и ответ.",replySaved:"Ответ сохранён.",openTelegram:"Открой приложение через Telegram",localMode:"Локальный режим вне Telegram",
statusNew:"Новое",statusReplied:"Ответ дан",supportReply:"Ответ поддержки",skinsShown:"скинов"
},
en:{
brandSub:"COMMUNITY MARKET · DEMO",heroEyebrow:"COMMUNITY MARKETPLACE",heroTitle:"YOUR GAMING<br><span>SHOWCASE</span>",
heroDesc:"SkinHub is a market where you can buy/sell skins for Telegram Stars!",
tabHome:"Home",tabSell:"Sell",tabHowto:"How it works",tabReviews:"Reviews",tabSupport:"Support",tabProfile:"Profile",tabAdmin:"Admin",
discover:"DISCOVER",showcaseTitle:"Community showcase",searchPlaceholder:"Search...",filterAll:"All",filterRifle:"Rifles",filterPistol:"Pistols",filterKnife:"Knives",filterOther:"Other",
createListing:"CREATE LISTING",newListing:"New listing",selectSkin:"Select a skin",category:"Category",priceStars:"Price (Telegram Stars)",addListing:"Add listing",
howtoEyebrow:"GUIDE",howtoTitle:"How it works",feedback:"COMMUNITY FEEDBACK",reviewsTitle:"Reviews",leaveReview:"Leave a review",rating:"Rating",comment:"Comment",reviewPlaceholder:"Write a review...",sendReview:"Submit review",
helpEyebrow:"WE ARE HERE TO HELP",supportTitle:"Support",ticketSubject:"Subject",ticketSubjectPh:"e.g. question about a deal",ticketMessage:"Message",ticketMessagePh:"Describe your question...",createTicket:"Create ticket",myTickets:"My tickets",
account:"ACCOUNT",profileTitle:"Profile",myListings:"My listings",adminTitle:"Admin panel",adminWarning:"Admin rights in this mock are checked on the client and are not a secure production guard.",
adminAddReview:"Add store review",name:"Name",text:"Text",addReviewBtn:"Add review",userTickets:"User tickets",replyTicket:"Reply to ticket",reply:"Reply",saveReply:"Save reply",
nothingFound:"Nothing found.",noListings:"You have no listings yet.",noTickets:"You have no tickets yet.",noAdminTickets:"No tickets yet.",listingLabel:"Listing",stars:"Stars",
fillSkinPrice:"Select a skin and enter a positive Stars price.",listingAdded:"Listing added. Contact @xyrexon to transfer the skin.",writeReview:"Please write a review.",fillTicket:"Fill in subject and message.",ticketSaved:"Ticket saved.",
noAccess:"Access denied.",fillNameText:"Fill in name and text.",reviewAdded:"Review added.",checkIdReply:"Check ticket ID and reply.",replySaved:"Reply saved.",openTelegram:"Open the app via Telegram",localMode:"Local mode outside Telegram",
statusNew:"New",statusReplied:"Replied",supportReply:"Support reply",skinsShown:"skins"
},
de:{
brandSub:"COMMUNITY MARKET · DEMO",heroEyebrow:"COMMUNITY MARKETPLACE",heroTitle:"DEINE GAMING-<br><span>VITRINE</span>",
heroDesc:"SkinHub ist ein Marktplatz, auf dem du Skins für Telegram Stars kaufen/verkaufen kannst!",
tabHome:"Start",tabSell:"Verkaufen",tabHowto:"So funktioniert's",tabReviews:"Bewertungen",tabSupport:"Support",tabProfile:"Profil",tabAdmin:"Admin",
discover:"ENTDECKEN",showcaseTitle:"Community-Vitrine",searchPlaceholder:"Suche...",filterAll:"Alle",filterRifle:"Gewehre",filterPistol:"Pistolen",filterKnife:"Messer",filterOther:"Sonstiges",
createListing:"ANZEIGE ERSTELLEN",newListing:"Neue Anzeige",selectSkin:"Skin auswählen",category:"Kategorie",priceStars:"Preis (Telegram Stars)",addListing:"Anzeige hinzufügen",
howtoEyebrow:"ANLEITUNG",howtoTitle:"So funktioniert's",feedback:"COMMUNITY-FEEDBACK",reviewsTitle:"Bewertungen",leaveReview:"Bewertung abgeben",rating:"Bewertung",comment:"Kommentar",reviewPlaceholder:"Schreibe eine Bewertung...",sendReview:"Absenden",
helpEyebrow:"WIR HELFEN DIR",supportTitle:"Support",ticketSubject:"Betreff",ticketSubjectPh:"z.B. Frage zum Deal",ticketMessage:"Nachricht",ticketMessagePh:"Beschreibe deine Frage...",createTicket:"Ticket erstellen",myTickets:"Meine Tickets",
account:"KONTO",profileTitle:"Profil",myListings:"Meine Anzeigen",adminTitle:"Admin-Panel",adminWarning:"Admin-Rechte in diesem Mock werden clientseitig geprüft und sind kein sicherer Produktivschutz.",
adminAddReview:"Shop-Bewertung hinzufügen",name:"Name",text:"Text",addReviewBtn:"Bewertung hinzufügen",userTickets:"Nutzer-Tickets",replyTicket:"Auf Ticket antworten",reply:"Antwort",saveReply:"Antwort speichern",
nothingFound:"Nichts gefunden.",noListings:"Du hast noch keine Anzeigen.",noTickets:"Du hast noch keine Tickets.",noAdminTickets:"Noch keine Tickets.",listingLabel:"Anzeige",stars:"Stars",
fillSkinPrice:"Wähle einen Skin und gib einen positiven Stars-Preis ein.",listingAdded:"Anzeige hinzugefügt. Kontaktiere @xyrexon für den Transfer.",writeReview:"Bitte Bewertungstext eingeben.",fillTicket:"Betreff und Nachricht ausfüllen.",ticketSaved:"Ticket gespeichert.",
noAccess:"Kein Zugriff.",fillNameText:"Name und Text ausfüllen.",reviewAdded:"Bewertung hinzugefügt.",checkIdReply:"Ticket-ID und Antwort prüfen.",replySaved:"Antwort gespeichert.",openTelegram:"App über Telegram öffnen",localMode:"Lokaler Modus außerhalb von Telegram",
statusNew:"Neu",statusReplied:"Beantwortet",supportReply:"Support-Antwort",skinsShown:"Skins"
},
zh:{
brandSub:"COMMUNITY MARKET · DEMO",heroEyebrow:"COMMUNITY MARKETPLACE",heroTitle:"你的游戏<br><span>橱窗</span>",
heroDesc:"SkinHub 是一个可以用 Telegram Stars 买卖皮肤的市场！",
tabHome:"首页",tabSell:"出售",tabHowto:"如何运作",tabReviews:"评价",tabSupport:"支持",tabProfile:"个人",tabAdmin:"管理",
discover:"发现",showcaseTitle:"社区橱窗",searchPlaceholder:"搜索...",filterAll:"全部",filterRifle:"步枪",filterPistol:"手枪",filterKnife:"刀具",filterOther:"其他",
createListing:"创建列表",newListing:"新列表",selectSkin:"选择皮肤",category:"分类",priceStars:"价格（Telegram Stars）",addListing:"添加列表",
howtoEyebrow:"指南",howtoTitle:"如何运作",feedback:"社区反馈",reviewsTitle:"评价",leaveReview:"发表评价",rating:"评分",comment:"评论",reviewPlaceholder:"写下评价...",sendReview:"提交评价",
helpEyebrow:"我们随时帮助",supportTitle:"支持",ticketSubject:"主题",ticketSubjectPh:"例如：交易相关问题",ticketMessage:"消息",ticketMessagePh:"描述你的问题...",createTicket:"创建工单",myTickets:"我的工单",
account:"账户",profileTitle:"个人资料",myListings:"我的列表",adminTitle:"管理面板",adminWarning:"此演示中管理员权限在客户端检查，不适合生产环境的安全保护。",
adminAddReview:"添加商店评价",name:"姓名",text:"文本",addReviewBtn:"添加评价",userTickets:"用户工单",replyTicket:"回复工单",reply:"回复",saveReply:"保存回复",
nothingFound:"未找到。",noListings:"你还没有列表。",noTickets:"你还没有工单。",noAdminTickets:"暂无工单。",listingLabel:"列表",stars:"Stars",
fillSkinPrice:"请选择皮肤并输入正数 Stars 价格。",listingAdded:"列表已添加。请联系 @xyrexon 转移皮肤。",writeReview:"请填写评价内容。",fillTicket:"请填写主题和消息。",ticketSaved:"工单已保存。",
noAccess:"无权限。",fillNameText:"请填写姓名和文本。",reviewAdded:"评价已添加。",checkIdReply:"请检查工单 ID 和回复。",replySaved:"回复已保存。",openTelegram:"请通过 Telegram 打开应用",localMode:"Telegram 外的本地模式",
statusNew:"新建",statusReplied:"已回复",supportReply:"支持回复",skinsShown:"个皮肤"
},
it:{
brandSub:"COMMUNITY MARKET · DEMO",heroEyebrow:"COMMUNITY MARKETPLACE",heroTitle:"LA TUA VETRINA<br><span>GAMING</span>",
heroDesc:"SkinHub è un market dove puoi comprare/vendere skin con Telegram Stars!",
tabHome:"Home",tabSell:"Vendi",tabHowto:"Come funziona",tabReviews:"Recensioni",tabSupport:"Supporto",tabProfile:"Profilo",tabAdmin:"Admin",
discover:"SCOPRI",showcaseTitle:"Vetrina community",searchPlaceholder:"Cerca...",filterAll:"Tutti",filterRifle:"Fucili",filterPistol:"Pistole",filterKnife:"Coltelli",filterOther:"Altro",
createListing:"CREA ANNUNCIO",newListing:"Nuovo annuncio",selectSkin:"Seleziona skin",category:"Categoria",priceStars:"Prezzo (Telegram Stars)",addListing:"Aggiungi annuncio",
howtoEyebrow:"GUIDA",howtoTitle:"Come funziona",feedback:"FEEDBACK COMMUNITY",reviewsTitle:"Recensioni",leaveReview:"Lascia una recensione",rating:"Valutazione",comment:"Commento",reviewPlaceholder:"Scrivi una recensione...",sendReview:"Invia recensione",
helpEyebrow:"SIAMO QUI PER AIUTARTI",supportTitle:"Supporto",ticketSubject:"Oggetto",ticketSubjectPh:"es. domanda su un affare",ticketMessage:"Messaggio",ticketMessagePh:"Descrivi la domanda...",createTicket:"Crea ticket",myTickets:"I miei ticket",
account:"ACCOUNT",profileTitle:"Profilo",myListings:"I miei annunci",adminTitle:"Pannello admin",adminWarning:"I diritti admin in questo mock sono controllati lato client e non sono una protezione sicura in produzione.",
adminAddReview:"Aggiungi recensione negozio",name:"Nome",text:"Testo",addReviewBtn:"Aggiungi recensione",userTickets:"Ticket utenti",replyTicket:"Rispondi al ticket",reply:"Risposta",saveReply:"Salva risposta",
nothingFound:"Nessun risultato.",noListings:"Non hai ancora annunci.",noTickets:"Non hai ancora ticket.",noAdminTickets:"Nessun ticket.",listingLabel:"Annuncio",stars:"Stars",
fillSkinPrice:"Seleziona una skin e inserisci un prezzo Stars positivo.",listingAdded:"Annuncio aggiunto. Contatta @xyrexon per trasferire la skin.",writeReview:"Scrivi il testo della recensione.",fillTicket:"Compila oggetto e messaggio.",ticketSaved:"Ticket salvato.",
noAccess:"Accesso negato.",fillNameText:"Compila nome e testo.",reviewAdded:"Recensione aggiunta.",checkIdReply:"Controlla ID ticket e risposta.",replySaved:"Risposta salvata.",openTelegram:"Apri l'app tramite Telegram",localMode:"Modalità locale fuori da Telegram",
statusNew:"Nuovo",statusReplied:"Risposto",supportReply:"Risposta supporto",skinsShown:"skin"
},
ja:{
brandSub:"COMMUNITY MARKET · DEMO",heroEyebrow:"COMMUNITY MARKETPLACE",heroTitle:"あなたのゲーム<br><span>ショーケース</span>",
heroDesc:"SkinHubはTelegram Starsでスキンを売買できるマーケットです！",
tabHome:"ホーム",tabSell:"出品",tabHowto:"使い方",tabReviews:"レビュー",tabSupport:"サポート",tabProfile:"プロフィール",tabAdmin:"管理",
discover:"発見",showcaseTitle:"コミュニティショーケース",searchPlaceholder:"検索...",filterAll:"すべて",filterRifle:"ライフル",filterPistol:"ピストル",filterKnife:"ナイフ",filterOther:"その他",
createListing:"出品作成",newListing:"新規出品",selectSkin:"スキンを選択",category:"カテゴリ",priceStars:"価格（Telegram Stars）",addListing:"出品を追加",
howtoEyebrow:"ガイド",howtoTitle:"使い方",feedback:"コミュニティフィードバック",reviewsTitle:"レビュー",leaveReview:"レビューを書く",rating:"評価",comment:"コメント",reviewPlaceholder:"レビューを書く...",sendReview:"送信",
helpEyebrow:"お手伝いします",supportTitle:"サポート",ticketSubject:"件名",ticketSubjectPh:"例：取引に関する質問",ticketMessage:"メッセージ",ticketMessagePh:"質問を記入...",createTicket:"チケット作成",myTickets:"自分のチケット",
account:"アカウント",profileTitle:"プロフィール",myListings:"自分の出品",adminTitle:"管理パネル",adminWarning:"このモックでは管理者権限はクライアント側で確認され、本番の安全な保護ではありません。",
adminAddReview:"ストアレビューを追加",name:"名前",text:"テキスト",addReviewBtn:"レビュー追加",userTickets:"ユーザーチケット",replyTicket:"チケットに返信",reply:"返信",saveReply:"返信を保存",
nothingFound:"見つかりません。",noListings:"まだ出品がありません。",noTickets:"まだチケットがありません。",noAdminTickets:"チケットはまだありません。",listingLabel:"出品",stars:"Stars",
fillSkinPrice:"スキンを選び、正のStars価格を入力してください。",listingAdded:"出品を追加しました。@xyrexon に連絡してスキンを送ってください。",writeReview:"レビュー本文を書いてください。",fillTicket:"件名とメッセージを入力してください。",ticketSaved:"チケットを保存しました。",
noAccess:"アクセスできません。",fillNameText:"名前とテキストを入力してください。",reviewAdded:"レビューを追加しました。",checkIdReply:"チケットIDと返信を確認してください。",replySaved:"返信を保存しました。",openTelegram:"Telegramからアプリを開いてください",localMode:"Telegram外のローカルモード",
statusNew:"新規",statusReplied:"返信済み",supportReply:"サポート返信",skinsShown:"スキン"
}
};
const HOWTO = {"ru": {"howto1Title": "1. Продажа скина", "howto1Text": "Выберите скин в приложении и выставьте объявление. Чтобы продать скин, отправьте его админу @xyrexon — с ним можно связаться в Telegram.", "howto2Title": "2. Когда ваш скин купили", "howto2Text": "Если ваш скин купили, тот же админ @xyrexon отправляет вам Telegram Stars за продажу.", "howto3Title": "3. Покупка скина", "howto3Text": "При покупке вы отправляете Stars админу @xyrexon, а он передаёт вам скин через Steam Trade.", "howto4Title": "4. Поддержка", "howto4Text": "Все сделки и вопросы — через админа @xyrexon. Дополнительно: @SkinHub_support", "listingHint": "После публикации свяжитесь с @xyrexon и передайте скин админу.", "heroNote": "Сделки через админа @xyrexon · Telegram Stars + Steam", "supportIntro": "Сделки, Stars и передача скинов — через админа:", "supportExtra": "Доп. поддержка: @SkinHub_support", "adminContactLabel": "Админ для сделок:", "skinSearchPh": "Поиск скина (AK, AWP, Karambit...)"}, "en": {"howto1Title": "1. Selling a skin", "howto1Text": "Pick a skin in the app and create a listing. To sell, send the skin to admin @xyrexon — contact him on Telegram.", "howto2Title": "2. When your skin is bought", "howto2Text": "If your skin is bought, the same admin @xyrexon sends you Telegram Stars for the sale.", "howto3Title": "3. Buying a skin", "howto3Text": "When buying, you send Stars to admin @xyrexon and he transfers the skin to you via Steam Trade.", "howto4Title": "4. Support", "howto4Text": "All deals and questions go through admin @xyrexon. Extra: @SkinHub_support", "listingHint": "After listing, contact @xyrexon and send him the skin.", "heroNote": "Deals via admin @xyrexon · Telegram Stars + Steam", "supportIntro": "Deals, Stars and skin transfers — through the admin:", "supportExtra": "Extra support: @SkinHub_support", "adminContactLabel": "Deal admin:", "skinSearchPh": "Search skin (AK, AWP, Karambit...)"}, "de": {"howto1Title": "1. Skin verkaufen", "howto1Text": "Wähle einen Skin und erstelle eine Anzeige. Zum Verkauf sende den Skin an Admin @xyrexon — erreichbar auf Telegram.", "howto2Title": "2. Wenn dein Skin gekauft wird", "howto2Text": "Wird dein Skin gekauft, sendet derselbe Admin @xyrexon dir Telegram Stars.", "howto3Title": "3. Skin kaufen", "howto3Text": "Beim Kauf sendest du Stars an Admin @xyrexon; er überträgt den Skin per Steam Trade.", "howto4Title": "4. Support", "howto4Text": "Alle Deals über Admin @xyrexon. Zusätzlich: @SkinHub_support", "listingHint": "Nach der Anzeige kontaktiere @xyrexon und sende den Skin.", "heroNote": "Deals über Admin @xyrexon · Telegram Stars + Steam", "supportIntro": "Deals, Stars und Transfers — über den Admin:", "supportExtra": "Extra-Support: @SkinHub_support", "adminContactLabel": "Deal-Admin:", "skinSearchPh": "Skin suchen (AK, AWP, Karambit...)"}, "zh": {"howto1Title": "1. 出售皮肤", "howto1Text": "在应用中选择皮肤并发布。出售时请将皮肤发送给管理员 @xyrexon（Telegram 联系）。", "howto2Title": "2. 皮肤被购买时", "howto2Text": "若你的皮肤被买走，同一管理员 @xyrexon 会向你发送 Telegram Stars。", "howto3Title": "3. 购买皮肤", "howto3Text": "购买时你向管理员 @xyrexon 发送 Stars，他通过 Steam 交易把皮肤给你。", "howto4Title": "4. 支持", "howto4Text": "所有交易与问题通过管理员 @xyrexon。额外：@SkinHub_support", "listingHint": "发布后联系 @xyrexon 并发送皮肤。", "heroNote": "交易通过管理员 @xyrexon · Telegram Stars + Steam", "supportIntro": "交易、Stars 与皮肤转移通过管理员：", "supportExtra": "额外支持：@SkinHub_support", "adminContactLabel": "交易管理员：", "skinSearchPh": "搜索皮肤 (AK, AWP, Karambit...)"}, "it": {"howto1Title": "1. Vendita skin", "howto1Text": "Scegli una skin e crea l'annuncio. Per vendere, invia la skin all'admin @xyrexon su Telegram.", "howto2Title": "2. Quando la tua skin viene comprata", "howto2Text": "Se la tua skin viene acquistata, lo stesso admin @xyrexon ti invia i Telegram Stars.", "howto3Title": "3. Acquisto skin", "howto3Text": "In acquisto invii Stars all'admin @xyrexon e lui ti trasferisce la skin via Steam Trade.", "howto4Title": "4. Supporto", "howto4Text": "Tutti gli affari tramite admin @xyrexon. Extra: @SkinHub_support", "listingHint": "Dopo l'annuncio contatta @xyrexon e inviagli la skin.", "heroNote": "Affari tramite admin @xyrexon · Telegram Stars + Steam", "supportIntro": "Affari, Stars e trasferimenti — tramite l'admin:", "supportExtra": "Supporto extra: @SkinHub_support", "adminContactLabel": "Admin affari:", "skinSearchPh": "Cerca skin (AK, AWP, Karambit...)"}, "ja": {"howto1Title": "1. スキンの売却", "howto1Text": "アプリでスキンを選び出品します。売却するには管理者 @xyrexon にスキンを送ってください（Telegram）。", "howto2Title": "2. スキンが売れたとき", "howto2Text": "スキンが購入されたら、同じ管理者 @xyrexon が Telegram Stars を送ります。", "howto3Title": "3. スキンの購入", "howto3Text": "購入時は管理者 @xyrexon に Stars を送り、Steamトレードでスキンを受け取ります。", "howto4Title": "4. サポート", "howto4Text": "取引は管理者 @xyrexon 経由。追加: @SkinHub_support", "listingHint": "出品後 @xyrexon に連絡しスキンを送ってください。", "heroNote": "管理者 @xyrexon 経由 · Telegram Stars + Steam", "supportIntro": "取引・Stars・転送は管理者経由：", "supportExtra": "追加サポート: @SkinHub_support", "adminContactLabel": "取引管理者：", "skinSearchPh": "スキン検索 (AK, AWP, Karambit...)"}};
for (const [lang, ov] of Object.entries(HOWTO)) {
  if (!I18N[lang]) I18N[lang] = {};
  Object.assign(I18N[lang], ov);
}
const SKINS = [
  {
    "id": "ak-redline",
    "name": "AK-47 | Redline",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0ARedline"
  },
  {
    "id": "ak-fire-serpent",
    "name": "AK-47 | Fire Serpent",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0AFire%20Serpent"
  },
  {
    "id": "ak-vulcan",
    "name": "AK-47 | Vulcan",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0AVulcan"
  },
  {
    "id": "ak-bloodsport",
    "name": "AK-47 | Bloodsport",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0ABloodsport"
  },
  {
    "id": "ak-neon-revolution",
    "name": "AK-47 | Neon Revolution",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0ANeon%20Revolution"
  },
  {
    "id": "ak-asiimov",
    "name": "AK-47 | Asiimov",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0AAsiimov"
  },
  {
    "id": "ak-the-empress",
    "name": "AK-47 | The Empress",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0AThe%20Empress"
  },
  {
    "id": "ak-fuel-injector",
    "name": "AK-47 | Fuel Injector",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0AFuel%20Injector"
  },
  {
    "id": "ak-case-hardened",
    "name": "AK-47 | Case Hardened",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0ACase%20Hardened"
  },
  {
    "id": "ak-jaguar",
    "name": "AK-47 | Jaguar",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0AJaguar"
  },
  {
    "id": "ak-wasteland-rebel",
    "name": "AK-47 | Wasteland Rebel",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0AWasteland%20Rebel"
  },
  {
    "id": "ak-neon-rider",
    "name": "AK-47 | Neon Rider",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0ANeon%20Rider"
  },
  {
    "id": "ak-gold-arabesque",
    "name": "AK-47 | Gold Arabesque",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0AGold%20Arabesque"
  },
  {
    "id": "ak-inheritance",
    "name": "AK-47 | Inheritance",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0AInheritance"
  },
  {
    "id": "ak-slate",
    "name": "AK-47 | Slate",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0ASlate"
  },
  {
    "id": "ak-nightwish",
    "name": "AK-47 | Nightwish",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0ANightwish"
  },
  {
    "id": "awp-dragon-lore",
    "name": "AWP | Dragon Lore",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AWP%0ADragon%20Lore"
  },
  {
    "id": "awp-asiimov",
    "name": "AWP | Asiimov",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AWP%0AAsiimov"
  },
  {
    "id": "awp-medusa",
    "name": "AWP | Medusa",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AWP%0AMedusa"
  },
  {
    "id": "awp-hyper-beast",
    "name": "AWP | Hyper Beast",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AWP%0AHyper%20Beast"
  },
  {
    "id": "awp-lightning-strike",
    "name": "AWP | Lightning Strike",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AWP%0ALightning%20Strike"
  },
  {
    "id": "awp-containment-breach",
    "name": "AWP | Containment Breach",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AWP%0AContainment%20Breach"
  },
  {
    "id": "awp-neo-noir",
    "name": "AWP | Neo-Noir",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AWP%0ANeo-Noir"
  },
  {
    "id": "awp-wildfire",
    "name": "AWP | Wildfire",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AWP%0AWildfire"
  },
  {
    "id": "awp-oni-taiji",
    "name": "AWP | Oni Taiji",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AWP%0AOni%20Taiji"
  },
  {
    "id": "awp-fade",
    "name": "AWP | Fade",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AWP%0AFade"
  },
  {
    "id": "awp-chromatic-aberration",
    "name": "AWP | Chromatic Aberration",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AWP%0AChromatic%20Aberration"
  },
  {
    "id": "awp-printstream",
    "name": "AWP | Printstream",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AWP%0APrintstream"
  },
  {
    "id": "awp-gungnir",
    "name": "AWP | Gungnir",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AWP%0AGungnir"
  },
  {
    "id": "m4a1s-printstream",
    "name": "M4A1-S | Printstream",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A1-S%0APrintstream"
  },
  {
    "id": "m4a1s-hyper-beast",
    "name": "M4A1-S | Hyper Beast",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A1-S%0AHyper%20Beast"
  },
  {
    "id": "m4a1s-player-two",
    "name": "M4A1-S | Player Two",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A1-S%0APlayer%20Two"
  },
  {
    "id": "m4a1s-blue-phospher",
    "name": "M4A1-S | Blue Phosphor",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A1-S%0ABlue%20Phosphor"
  },
  {
    "id": "m4a1s-ikea",
    "name": "M4A1-S | Welcome to the Jungle",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A1-S%0AWelcome%20to%20the%20Jungle"
  },
  {
    "id": "m4a1s-mecha-industries",
    "name": "M4A1-S | Mecha Industries",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A1-S%0AMecha%20Industries"
  },
  {
    "id": "m4a1s-cyrex",
    "name": "M4A1-S | Cyrex",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A1-S%0ACyrex"
  },
  {
    "id": "m4a1s-golden-coil",
    "name": "M4A1-S | Golden Coil",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A1-S%0AGolden%20Coil"
  },
  {
    "id": "m4a1s-black-lotus",
    "name": "M4A1-S | Black Lotus",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A1-S%0ABlack%20Lotus"
  },
  {
    "id": "m4a1s-nightmare",
    "name": "M4A1-S | Nightmare",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A1-S%0ANightmare"
  },
  {
    "id": "m4a4-howl",
    "name": "M4A4 | Howl",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A4%0AHowl"
  },
  {
    "id": "m4a4-asiimov",
    "name": "M4A4 | Asiimov",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A4%0AAsiimov"
  },
  {
    "id": "m4a4-the-emperor",
    "name": "M4A4 | The Emperor",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A4%0AThe%20Emperor"
  },
  {
    "id": "m4a4-neo-noir",
    "name": "M4A4 | Neo-Noir",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A4%0ANeo-Noir"
  },
  {
    "id": "m4a4-desolate-space",
    "name": "M4A4 | Desolate Space",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A4%0ADesolate%20Space"
  },
  {
    "id": "m4a4-temukau",
    "name": "M4A4 | Temukau",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A4%0ATemukau"
  },
  {
    "id": "m4a4-in-living-color",
    "name": "M4A4 | In Living Color",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A4%0AIn%20Living%20Color"
  },
  {
    "id": "m4a4-the-coalition",
    "name": "M4A4 | The Coalition",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M4A4%0AThe%20Coalition"
  },
  {
    "id": "aug-chameleion",
    "name": "AUG | Chameleon",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AUG%0AChameleon"
  },
  {
    "id": "aug-aiki",
    "name": "AUG | Akihabara Accept",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=AUG%0AAkihabara%20Accept"
  },
  {
    "id": "sg-integrale",
    "name": "SG 553 | Integrale",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=SG%20553%0AIntegrale"
  },
  {
    "id": "famas-mecha",
    "name": "FAMAS | Mecha Industries",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=FAMAS%0AMecha%20Industries"
  },
  {
    "id": "galil-eco",
    "name": "Galil AR | Eco",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Galil%20AR%0AEco"
  },
  {
    "id": "galil-chromium",
    "name": "Galil AR | Chromatic Aberration",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Galil%20AR%0AChromatic%20Aberration"
  },
  {
    "id": "ssg-blood-in-water",
    "name": "SSG 08 | Blood in the Water",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=SSG%2008%0ABlood%20in%20the%20Water"
  },
  {
    "id": "ssg-turbo-peek",
    "name": "SSG 08 | Turbo Peek",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=SSG%2008%0ATurbo%20Peek"
  },
  {
    "id": "scar-cardiac",
    "name": "SCAR-20 | Cardiac",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=SCAR-20%0ACardiac"
  },
  {
    "id": "g3sg1-flux",
    "name": "G3SG1 | Flux",
    "category": "rifle",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=G3SG1%0AFlux"
  },
  {
    "id": "usp-kill-confirmed",
    "name": "USP-S | Kill Confirmed",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=USP-S%0AKill%20Confirmed"
  },
  {
    "id": "usp-neo-noir",
    "name": "USP-S | Neo-Noir",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=USP-S%0ANeo-Noir"
  },
  {
    "id": "usp-orion",
    "name": "USP-S | Orion",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=USP-S%0AOrion"
  },
  {
    "id": "usp-printstream",
    "name": "USP-S | Printstream",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=USP-S%0APrintstream"
  },
  {
    "id": "usp-the-traitor",
    "name": "USP-S | The Traitor",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=USP-S%0AThe%20Traitor"
  },
  {
    "id": "usp-cortex",
    "name": "USP-S | Cortex",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=USP-S%0ACortex"
  },
  {
    "id": "usp-whiteout",
    "name": "USP-S | Whiteout",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=USP-S%0AWhiteout"
  },
  {
    "id": "usp-ticket-to-hell",
    "name": "USP-S | Ticket to Hell",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=USP-S%0ATicket%20to%20Hell"
  },
  {
    "id": "glock-fade",
    "name": "Glock-18 | Fade",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Glock-18%0AFade"
  },
  {
    "id": "glock-wasteland-rebel",
    "name": "Glock-18 | Wasteland Rebel",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Glock-18%0AWasteland%20Rebel"
  },
  {
    "id": "glock-water-elemental",
    "name": "Glock-18 | Water Elemental",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Glock-18%0AWater%20Elemental"
  },
  {
    "id": "glock-twilight-galaxy",
    "name": "Glock-18 | Twilight Galaxy",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Glock-18%0ATwilight%20Galaxy"
  },
  {
    "id": "glock-neo-noir",
    "name": "Glock-18 | Neo-Noir",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Glock-18%0ANeo-Noir"
  },
  {
    "id": "glock-vogue",
    "name": "Glock-18 | Vogue",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Glock-18%0AVogue"
  },
  {
    "id": "glock-gamma-doppler",
    "name": "Glock-18 | Gamma Doppler",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Glock-18%0AGamma%20Doppler"
  },
  {
    "id": "deagle-blaze",
    "name": "Desert Eagle | Blaze",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Desert%20Eagle%0ABlaze"
  },
  {
    "id": "deagle-code-red",
    "name": "Desert Eagle | Code Red",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Desert%20Eagle%0ACode%20Red"
  },
  {
    "id": "deagle-printstream",
    "name": "Desert Eagle | Printstream",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Desert%20Eagle%0APrintstream"
  },
  {
    "id": "deagle-kumicho",
    "name": "Desert Eagle | Kumicho Dragon",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Desert%20Eagle%0AKumicho%20Dragon"
  },
  {
    "id": "deagle-mecha",
    "name": "Desert Eagle | Mecha Industries",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Desert%20Eagle%0AMecha%20Industries"
  },
  {
    "id": "deagle-ocean-drive",
    "name": "Desert Eagle | Ocean Drive",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Desert%20Eagle%0AOcean%20Drive"
  },
  {
    "id": "deagle-conspiracy",
    "name": "Desert Eagle | Conspiracy",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Desert%20Eagle%0AConspiracy"
  },
  {
    "id": "p250-see-ya",
    "name": "P250 | See Ya Later",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=P250%0ASee%20Ya%20Later"
  },
  {
    "id": "p250-muertos",
    "name": "P250 | Muertos",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=P250%0AMuertos"
  },
  {
    "id": "p250-asiimov",
    "name": "P250 | Asiimov",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=P250%0AAsiimov"
  },
  {
    "id": "five-seven-hyper-beast",
    "name": "Five-SeveN | Hyper Beast",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Five-SeveN%0AHyper%20Beast"
  },
  {
    "id": "five-seven-angry-mob",
    "name": "Five-SeveN | Angry Mob",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Five-SeveN%0AAngry%20Mob"
  },
  {
    "id": "tec9-fuel-injector",
    "name": "Tec-9 | Fuel Injector",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Tec-9%0AFuel%20Injector"
  },
  {
    "id": "tec9-deco",
    "name": "Tec-9 | Decimator",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Tec-9%0ADecimator"
  },
  {
    "id": "cz-xiangliu",
    "name": "CZ75-Auto | Xiangliu",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=CZ75-Auto%0AXiangliu"
  },
  {
    "id": "dual-cobalt",
    "name": "Dual Berettas | Cobalt Quartz",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Dual%20Berettas%0ACobalt%20Quartz"
  },
  {
    "id": "r8-fade",
    "name": "R8 Revolver | Fade",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=R8%20Revolver%0AFade"
  },
  {
    "id": "p2000-fire-elemental",
    "name": "P2000 | Fire Elemental",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=P2000%0AFire%20Elemental"
  },
  {
    "id": "p2000-ocean-foam",
    "name": "P2000 | Ocean Foam",
    "category": "pistol",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=P2000%0AOcean%20Foam"
  },
  {
    "id": "karambit-fade",
    "name": "★ Karambit | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Karambit%0AFade"
  },
  {
    "id": "karambit-doppler",
    "name": "★ Karambit | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Karambit%0ADoppler"
  },
  {
    "id": "karambit-marble",
    "name": "★ Karambit | Marble Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Karambit%0AMarble%20Fade"
  },
  {
    "id": "karambit-tiger",
    "name": "★ Karambit | Tiger Tooth",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Karambit%0ATiger%20Tooth"
  },
  {
    "id": "karambit-lore",
    "name": "★ Karambit | Lore",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Karambit%0ALore"
  },
  {
    "id": "karambit-crimson",
    "name": "★ Karambit | Crimson Web",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Karambit%0ACrimson%20Web"
  },
  {
    "id": "karambit-slaughter",
    "name": "★ Karambit | Slaughter",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Karambit%0ASlaughter"
  },
  {
    "id": "karambit-case-hardened",
    "name": "★ Karambit | Case Hardened",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Karambit%0ACase%20Hardened"
  },
  {
    "id": "karambit-autotronic",
    "name": "★ Karambit | Autotronic",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Karambit%0AAutotronic"
  },
  {
    "id": "bayonet-fade",
    "name": "★ Bayonet | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Bayonet%0AFade"
  },
  {
    "id": "bayonet-doppler",
    "name": "★ Bayonet | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Bayonet%0ADoppler"
  },
  {
    "id": "bayonet-tiger",
    "name": "★ Bayonet | Tiger Tooth",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Bayonet%0ATiger%20Tooth"
  },
  {
    "id": "bayonet-lore",
    "name": "★ Bayonet | Lore",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Bayonet%0ALore"
  },
  {
    "id": "bayonet-slaughter",
    "name": "★ Bayonet | Slaughter",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Bayonet%0ASlaughter"
  },
  {
    "id": "m9-fade",
    "name": "★ M9 Bayonet | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M9%20Bayonet%0AFade"
  },
  {
    "id": "m9-doppler",
    "name": "★ M9 Bayonet | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M9%20Bayonet%0ADoppler"
  },
  {
    "id": "m9-marble",
    "name": "★ M9 Bayonet | Marble Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M9%20Bayonet%0AMarble%20Fade"
  },
  {
    "id": "m9-tiger",
    "name": "★ M9 Bayonet | Tiger Tooth",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M9%20Bayonet%0ATiger%20Tooth"
  },
  {
    "id": "m9-lore",
    "name": "★ M9 Bayonet | Lore",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M9%20Bayonet%0ALore"
  },
  {
    "id": "m9-crimson",
    "name": "★ M9 Bayonet | Crimson Web",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M9%20Bayonet%0ACrimson%20Web"
  },
  {
    "id": "butterfly-fade",
    "name": "★ Butterfly Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Butterfly%20Knife%0AFade"
  },
  {
    "id": "butterfly-doppler",
    "name": "★ Butterfly Knife | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Butterfly%20Knife%0ADoppler"
  },
  {
    "id": "butterfly-marble",
    "name": "★ Butterfly Knife | Marble Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Butterfly%20Knife%0AMarble%20Fade"
  },
  {
    "id": "butterfly-tiger",
    "name": "★ Butterfly Knife | Tiger Tooth",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Butterfly%20Knife%0ATiger%20Tooth"
  },
  {
    "id": "butterfly-slaughter",
    "name": "★ Butterfly Knife | Slaughter",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Butterfly%20Knife%0ASlaughter"
  },
  {
    "id": "butterfly-crimson",
    "name": "★ Butterfly Knife | Crimson Web",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Butterfly%20Knife%0ACrimson%20Web"
  },
  {
    "id": "talon-fade",
    "name": "★ Talon Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Talon%20Knife%0AFade"
  },
  {
    "id": "talon-doppler",
    "name": "★ Talon Knife | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Talon%20Knife%0ADoppler"
  },
  {
    "id": "talon-marble",
    "name": "★ Talon Knife | Marble Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Talon%20Knife%0AMarble%20Fade"
  },
  {
    "id": "talon-tiger",
    "name": "★ Talon Knife | Tiger Tooth",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Talon%20Knife%0ATiger%20Tooth"
  },
  {
    "id": "skeleton-fade",
    "name": "★ Skeleton Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Skeleton%20Knife%0AFade"
  },
  {
    "id": "skeleton-doppler",
    "name": "★ Skeleton Knife | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Skeleton%20Knife%0ADoppler"
  },
  {
    "id": "skeleton-slaughter",
    "name": "★ Skeleton Knife | Slaughter",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Skeleton%20Knife%0ASlaughter"
  },
  {
    "id": "nomad-fade",
    "name": "★ Nomad Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Nomad%20Knife%0AFade"
  },
  {
    "id": "nomad-doppler",
    "name": "★ Nomad Knife | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Nomad%20Knife%0ADoppler"
  },
  {
    "id": "paracord-fade",
    "name": "★ Paracord Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Paracord%20Knife%0AFade"
  },
  {
    "id": "survival-fade",
    "name": "★ Survival Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Survival%20Knife%0AFade"
  },
  {
    "id": "ursus-fade",
    "name": "★ Ursus Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Ursus%20Knife%0AFade"
  },
  {
    "id": "ursus-doppler",
    "name": "★ Ursus Knife | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Ursus%20Knife%0ADoppler"
  },
  {
    "id": "stiletto-fade",
    "name": "★ Stiletto Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Stiletto%20Knife%0AFade"
  },
  {
    "id": "stiletto-doppler",
    "name": "★ Stiletto Knife | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Stiletto%20Knife%0ADoppler"
  },
  {
    "id": "navaja-fade",
    "name": "★ Navaja Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Navaja%20Knife%0AFade"
  },
  {
    "id": "bowie-fade",
    "name": "★ Bowie Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Bowie%20Knife%0AFade"
  },
  {
    "id": "bowie-doppler",
    "name": "★ Bowie Knife | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Bowie%20Knife%0ADoppler"
  },
  {
    "id": "huntsman-fade",
    "name": "★ Huntsman Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Huntsman%20Knife%0AFade"
  },
  {
    "id": "huntsman-doppler",
    "name": "★ Huntsman Knife | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Huntsman%20Knife%0ADoppler"
  },
  {
    "id": "flip-fade",
    "name": "★ Flip Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Flip%20Knife%0AFade"
  },
  {
    "id": "flip-doppler",
    "name": "★ Flip Knife | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Flip%20Knife%0ADoppler"
  },
  {
    "id": "gut-fade",
    "name": "★ Gut Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Gut%20Knife%0AFade"
  },
  {
    "id": "gut-doppler",
    "name": "★ Gut Knife | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Gut%20Knife%0ADoppler"
  },
  {
    "id": "falchion-fade",
    "name": "★ Falchion Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Falchion%20Knife%0AFade"
  },
  {
    "id": "falchion-doppler",
    "name": "★ Falchion Knife | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Falchion%20Knife%0ADoppler"
  },
  {
    "id": "shadow-daggers-fade",
    "name": "★ Shadow Daggers | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Shadow%20Daggers%0AFade"
  },
  {
    "id": "shadow-daggers-doppler",
    "name": "★ Shadow Daggers | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Shadow%20Daggers%0ADoppler"
  },
  {
    "id": "classic-fade",
    "name": "★ Classic Knife | Fade",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Classic%20Knife%0AFade"
  },
  {
    "id": "classic-doppler",
    "name": "★ Classic Knife | Doppler",
    "category": "knife",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Classic%20Knife%0ADoppler"
  },
  {
    "id": "mp9-hydra",
    "name": "MP9 | Hydra",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=MP9%0AHydra"
  },
  {
    "id": "mp9-food-chain",
    "name": "MP9 | Food Chain",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=MP9%0AFood%20Chain"
  },
  {
    "id": "mp7-bloodsport",
    "name": "MP7 | Bloodsport",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=MP7%0ABloodsport"
  },
  {
    "id": "mac10-neon-rider",
    "name": "MAC-10 | Neon Rider",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=MAC-10%0ANeon%20Rider"
  },
  {
    "id": "mac10-disco-tech",
    "name": "MAC-10 | Disco Tech",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=MAC-10%0ADisco%20Tech"
  },
  {
    "id": "ump-primal-saber",
    "name": "UMP-45 | Primal Saber",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=UMP-45%0APrimal%20Saber"
  },
  {
    "id": "p90-asiimov",
    "name": "P90 | Asiimov",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=P90%0AAsiimov"
  },
  {
    "id": "p90-emerald-dragon",
    "name": "P90 | Emerald Dragon",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=P90%0AEmerald%20Dragon"
  },
  {
    "id": "p90-death-by-kitty",
    "name": "P90 | Death by Kitty",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=P90%0ADeath%20by%20Kitty"
  },
  {
    "id": "mp5-agent",
    "name": "MP5-SD | Agent",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=MP5-SD%0AAgent"
  },
  {
    "id": "pp-bizon-judgement",
    "name": "PP-Bizon | Judgement of Anubis",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=PP-Bizon%0AJudgement%20of%20Anubis"
  },
  {
    "id": "nova-hyper-beast",
    "name": "Nova | Hyper Beast",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Nova%0AHyper%20Beast"
  },
  {
    "id": "xm-tranquility",
    "name": "XM1014 | Tranquility",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=XM1014%0ATranquility"
  },
  {
    "id": "mag7-justice",
    "name": "MAG-7 | Justice",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=MAG-7%0AJustice"
  },
  {
    "id": "sawed-off-devourer",
    "name": "Sawed-Off | The Devourer",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Sawed-Off%0AThe%20Devourer"
  },
  {
    "id": "negev-midas",
    "name": "Negev | Midas",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Negev%0AMidas"
  },
  {
    "id": "m249-nebula",
    "name": "M249 | Nebula Crusader",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=M249%0ANebula%20Crusader"
  },
  {
    "id": "gloves-pandora",
    "name": "★ Sport Gloves | Pandora's Box",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Sport%20Gloves%0APandora%27s%20Box"
  },
  {
    "id": "gloves-superconductor",
    "name": "★ Sport Gloves | Superconductor",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Sport%20Gloves%0ASuperconductor"
  },
  {
    "id": "gloves-hedgehog",
    "name": "★ Sport Gloves | Hedge Maze",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Sport%20Gloves%0AHedge%20Maze"
  },
  {
    "id": "gloves-vice",
    "name": "★ Sport Gloves | Vice",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Sport%20Gloves%0AVice"
  },
  {
    "id": "gloves-omega",
    "name": "★ Specialist Gloves | Omega",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Specialist%20Gloves%0AOmega"
  },
  {
    "id": "gloves-crimson-kimono",
    "name": "★ Specialist Gloves | Crimson Kimono",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Specialist%20Gloves%0ACrimson%20Kimono"
  },
  {
    "id": "gloves-emerald",
    "name": "★ Specialist Gloves | Emerald Web",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Specialist%20Gloves%0AEmerald%20Web"
  },
  {
    "id": "gloves-fade",
    "name": "★ Driver Gloves | Fade",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Driver%20Gloves%0AFade"
  },
  {
    "id": "gloves-king-snake",
    "name": "★ Driver Gloves | King Snake",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Driver%20Gloves%0AKing%20Snake"
  },
  {
    "id": "gloves-crimson-weave",
    "name": "★ Driver Gloves | Crimson Weave",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Driver%20Gloves%0ACrimson%20Weave"
  },
  {
    "id": "gloves-lunar",
    "name": "★ Moto Gloves | Cool Mint",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Moto%20Gloves%0ACool%20Mint"
  },
  {
    "id": "gloves-spearmint",
    "name": "★ Moto Gloves | Spearmint",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Moto%20Gloves%0ASpearmint"
  },
  {
    "id": "gloves-polygon",
    "name": "★ Moto Gloves | Polygon",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Moto%20Gloves%0APolygon"
  },
  {
    "id": "gloves-emerald-web",
    "name": "★ Hand Wraps | Overprint",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Hand%20Wraps%0AOverprint"
  },
  {
    "id": "gloves-leather",
    "name": "★ Hand Wraps | Leather",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Hand%20Wraps%0ALeather"
  },
  {
    "id": "gloves-badlands",
    "name": "★ Broken Fang Gloves | Jade",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Broken%20Fang%20Gloves%0AJade"
  },
  {
    "id": "gloves-yellow-banded",
    "name": "★ Bloodhound Gloves | Charred",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Bloodhound%20Gloves%0ACharred"
  },
  {
    "id": "gloves-snakebite",
    "name": "★ Hydra Gloves | Case Hardened",
    "category": "other",
    "image": "https://placehold.co/360x360/1a1028/c8adff/png?text=Hydra%20Gloves%0ACase%20Hardened"
  }
];

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
  populateSkins();
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

function mapListing(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    image: row.image || "",
    owner: row.owner,
    ownerName: row.owner_name || "",
    skinId: row.skin_id || ""
  };
}
function mapReview(row) {
  return { id: row.id, name: row.name, rating: Number(row.rating), text: row.text };
}
function mapTicket(row) {
  return { id: row.id, owner: row.owner, name: row.name, subject: row.subject, text: row.text, status: row.status, reply: row.reply || "" };
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
      sb("listings?select=*&order=created_at.desc"),
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
  const list = listings.filter((x) => (activeFilter === "all" || x.category === activeFilter) && x.name.toLowerCase().includes(q));
  document.getElementById("catalog").innerHTML =
    list.map((x) => `
    <article class="item">
      <div class="item-art">${x.image ? `<img src="${escapeAttr(x.image)}" alt="${escapeAttr(x.name)}" onerror="this.style.display='none';this.parentElement.textContent='✦'">` : "✦"}</div>
      <div class="item-body">
        <h3>${escapeHtml(x.name)}</h3>
        <div class="muted">${t("listingLabel")} · ${categoryName(x.category)}</div>
        <div class="price">${Number(x.price)} ${t("stars")}</div>
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

document.getElementById("addListing").onclick = async () => {
  const skinId = skinSelect.value;
  const skin = SKINS.find((s) => s.id === skinId);
  const price = Number(document.getElementById("itemPrice").value);
  if (!skin || !Number.isFinite(price) || price <= 0) { alert(t("fillSkinPrice")); return; }
  const payload = {
    name: skin.name,
    category: document.getElementById("itemCategory").value || skin.category,
    price,
    image: skin.image,
    owner: userId,
    owner_name: userName,
    skin_id: skin.id
  };
  try {
    if (sbEnabled) {
      const rows = await sb("listings", { method: "POST", body: JSON.stringify(payload) });
      const row = Array.isArray(rows) ? rows[0] : rows;
      listings.unshift(mapListing(row));
    } else {
      listings.unshift({ id: Date.now(), ...payload, skinId: skin.id, ownerName: userName });
      write("sh_listings_v3", listings);
    }
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
  alert(t("listingAdded"));
  showPage("home");
};

function renderReviews() {
  document.getElementById("reviewList").innerHTML = reviews.map((r) =>
    `<div class="entry"><h3>${escapeHtml(r.name)} <span style="color:#c6a3ff">${"★".repeat(Math.max(1, Math.min(5, Number(r.rating))))}</span></h3><p>${escapeHtml(r.text)}</p></div>`
  ).join("");
}
document.getElementById("addReview").onclick = async () => {
  const textVal = document.getElementById("reviewText").value.trim();
  if (!textVal) { alert(t("writeReview")); return; }
  const payload = { name: userName, rating: Number(document.getElementById("reviewRating").value), text: textVal };
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
  const mine = tickets.filter((x) => x.owner === userId);
  document.getElementById("ticketList").innerHTML = mine.map(ticketHtml).join("") || `<p class="muted">${t("noTickets")}</p>`;
}
document.getElementById("createTicket").onclick = async () => {
  const subject = document.getElementById("ticketSubject").value.trim();
  const textVal = document.getElementById("ticketText").value.trim();
  if (!subject || !textVal) { alert(t("fillTicket")); return; }
  const payload = { owner: userId, name: userName, subject, text: textVal, status: t("statusNew"), reply: "" };
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
  document.getElementById("myListings").innerHTML =
    listings.filter((x) => x.owner === userId).map((x) =>
      `<div class="entry"><h3>${escapeHtml(x.name)}</h3><p>${x.price} ${t("stars")}</p></div>`
    ).join("") || `<p class="muted">${t("noListings")}</p>`;
}

function renderAdmin() {
  if (!isAdmin) return;
  document.getElementById("adminTickets").innerHTML = tickets.map(ticketHtml).join("") || `<p class="muted">${t("noAdminTickets")}</p>`;
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
loadAllData();
