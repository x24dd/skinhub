const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const params = new URLSearchParams(location.search);
const ADMIN_ID = params.get("demo_admin_id") || "";
const user = tg?.initDataUnsafe?.user || null;
const userId = user?.id ? String(user.id) : "local-demo";
const userName = user
  ? user.first_name + (user.last_name ? " " + user.last_name : "")
  : "Guest";
const isAdmin = !!user && ADMIN_ID && String(user.id) === String(ADMIN_ID);

/* ---------- i18n ---------- */
const LANGS = {
  ru: "Русский",
  en: "English",
  de: "Deutsch",
  zh: "中文",
  it: "Italiano",
  ja: "日本語"
};

const I18N = {
  ru: {
    brandSub: "COMMUNITY MARKET · DEMO",
    heroEyebrow: "COMMUNITY MARKETPLACE",
    heroTitle: "ТВОЯ ИГРОВАЯ<br><span>ВИТРИНА</span>",
    heroDesc: "SkinHub — это маркет, где вы можете приобрести/продать скины за Telegram Stars!",
    heroNote: "Оплата и передача — через Telegram Stars и Steam Trade",
    tabHome: "Главная",
    tabSell: "Выставить",
    tabHowto: "Как это работает",
    tabReviews: "Отзывы",
    tabSupport: "Поддержка",
    tabProfile: "Профиль",
    tabAdmin: "Админ",
    discover: "DISCOVER",
    showcaseTitle: "Витрина сообщества",
    searchPlaceholder: "Поиск...",
    filterAll: "Все",
    filterRifle: "Винтовки",
    filterPistol: "Пистолеты",
    filterKnife: "Ножи",
    filterOther: "Другое",
    createListing: "CREATE LISTING",
    newListing: "Новое объявление",
    selectSkin: "Выберите скин",
    category: "Категория",
    priceStars: "Цена (Telegram Stars)",
    addListing: "Добавить объявление",
    listingHint: "Объявление появится в вашей витрине. Покупатели увидят его в каталоге приложения.",
    howtoEyebrow: "GUIDE",
    howtoTitle: "Оплата и передача",
    howto1Title: "1. Выбор скина",
    howto1Text: "Продавец выбирает скин из списка — фото подставляется автоматически. Покупатель видит объявление в каталоге.",
    howto2Title: "2. Оплата Telegram Stars",
    howto2Text: "Сделка оформляется за Telegram Stars. После согласования условий покупатель отправляет Stars продавцу через Telegram.",
    howto3Title: "3. Передача в Steam",
    howto3Text: "После оплаты продавец отправляет трейд-оффер в Steam. Покупатель принимает предмет. При спорных ситуациях пишите в поддержку.",
    howto4Title: "4. Поддержка",
    howto4Text: "Вопросы по сделкам и безопасности — @SkinHub_support",
    feedback: "COMMUNITY FEEDBACK",
    reviewsTitle: "Отзывы",
    leaveReview: "Оставить отзыв",
    rating: "Оценка",
    comment: "Комментарий",
    reviewPlaceholder: "Напиши отзыв...",
    sendReview: "Отправить отзыв",
    helpEyebrow: "WE ARE HERE TO HELP",
    supportTitle: "Поддержка",
    supportIntro: "Нужна помощь со сделкой, оплатой Stars или передачей скина?",
    ticketSubject: "Тема обращения",
    ticketSubjectPh: "Например, вопрос по сделке",
    ticketMessage: "Сообщение",
    ticketMessagePh: "Опиши вопрос...",
    createTicket: "Создать обращение",
    myTickets: "Мои обращения",
    account: "ACCOUNT",
    profileTitle: "Профиль",
    myListings: "Мои объявления",
    adminTitle: "Админ-панель",
    adminWarning: "Права администратора в этом макете проверяются на клиенте и не являются безопасной защитой для продакшена.",
    adminAddReview: "Добавить отзыв от имени магазина",
    name: "Имя",
    text: "Текст",
    addReviewBtn: "Добавить отзыв",
    userTickets: "Обращения пользователей",
    replyTicket: "Ответить на обращение",
    reply: "Ответ",
    saveReply: "Сохранить ответ",
    nothingFound: "Ничего не найдено.",
    noListings: "Ты ещё не добавлял объявления.",
    noTickets: "У тебя пока нет обращений.",
    noAdminTickets: "Обращений пока нет.",
    listingLabel: "Объявление",
    stars: "Stars",
    fillSkinPrice: "Выберите скин и укажите положительную цену в Stars.",
    listingAdded: "Объявление добавлено.",
    writeReview: "Напиши текст отзыва.",
    fillTicket: "Заполни тему и сообщение.",
    ticketSaved: "Обращение сохранено.",
    noAccess: "Нет доступа.",
    fillNameText: "Заполни имя и текст.",
    reviewAdded: "Отзыв добавлен.",
    checkIdReply: "Проверь ID обращения и ответ.",
    replySaved: "Ответ сохранён.",
    openTelegram: "Открой приложение через Telegram",
    localMode: "Локальный режим вне Telegram",
    statusNew: "Новое",
    statusReplied: "Ответ дан",
    supportReply: "Ответ поддержки"
  },
  en: {
    brandSub: "COMMUNITY MARKET · DEMO",
    heroEyebrow: "COMMUNITY MARKETPLACE",
    heroTitle: "YOUR GAMING<br><span>SHOWCASE</span>",
    heroDesc: "SkinHub is a market where you can buy/sell skins for Telegram Stars!",
    heroNote: "Payment & transfer via Telegram Stars and Steam Trade",
    tabHome: "Home",
    tabSell: "Sell",
    tabHowto: "How it works",
    tabReviews: "Reviews",
    tabSupport: "Support",
    tabProfile: "Profile",
    tabAdmin: "Admin",
    discover: "DISCOVER",
    showcaseTitle: "Community showcase",
    searchPlaceholder: "Search...",
    filterAll: "All",
    filterRifle: "Rifles",
    filterPistol: "Pistols",
    filterKnife: "Knives",
    filterOther: "Other",
    createListing: "CREATE LISTING",
    newListing: "New listing",
    selectSkin: "Select a skin",
    category: "Category",
    priceStars: "Price (Telegram Stars)",
    addListing: "Add listing",
    listingHint: "Your listing will appear in the catalog inside the app.",
    howtoEyebrow: "GUIDE",
    howtoTitle: "Payment & transfer",
    howto1Title: "1. Choose a skin",
    howto1Text: "Seller picks a skin from the list — the photo is set automatically. Buyers see it in the catalog.",
    howto2Title: "2. Pay with Telegram Stars",
    howto2Text: "Deals are settled in Telegram Stars. After agreeing on terms, the buyer sends Stars to the seller in Telegram.",
    howto3Title: "3. Steam transfer",
    howto3Text: "After payment the seller sends a Steam trade offer. The buyer accepts the item. Contact support if anything goes wrong.",
    howto4Title: "4. Support",
    howto4Text: "Questions about deals and safety — @SkinHub_support",
    feedback: "COMMUNITY FEEDBACK",
    reviewsTitle: "Reviews",
    leaveReview: "Leave a review",
    rating: "Rating",
    comment: "Comment",
    reviewPlaceholder: "Write a review...",
    sendReview: "Submit review",
    helpEyebrow: "WE ARE HERE TO HELP",
    supportTitle: "Support",
    supportIntro: "Need help with a deal, Stars payment or skin transfer?",
    ticketSubject: "Subject",
    ticketSubjectPh: "e.g. question about a deal",
    ticketMessage: "Message",
    ticketMessagePh: "Describe your question...",
    createTicket: "Create ticket",
    myTickets: "My tickets",
    account: "ACCOUNT",
    profileTitle: "Profile",
    myListings: "My listings",
    adminTitle: "Admin panel",
    adminWarning: "Admin rights in this mock are checked on the client and are not a secure production guard.",
    adminAddReview: "Add store review",
    name: "Name",
    text: "Text",
    addReviewBtn: "Add review",
    userTickets: "User tickets",
    replyTicket: "Reply to ticket",
    reply: "Reply",
    saveReply: "Save reply",
    nothingFound: "Nothing found.",
    noListings: "You have no listings yet.",
    noTickets: "You have no tickets yet.",
    noAdminTickets: "No tickets yet.",
    listingLabel: "Listing",
    stars: "Stars",
    fillSkinPrice: "Select a skin and enter a positive Stars price.",
    listingAdded: "Listing added.",
    writeReview: "Please write a review.",
    fillTicket: "Fill in subject and message.",
    ticketSaved: "Ticket saved.",
    noAccess: "Access denied.",
    fillNameText: "Fill in name and text.",
    reviewAdded: "Review added.",
    checkIdReply: "Check ticket ID and reply.",
    replySaved: "Reply saved.",
    openTelegram: "Open the app via Telegram",
    localMode: "Local mode outside Telegram",
    statusNew: "New",
    statusReplied: "Replied",
    supportReply: "Support reply"
  },
  de: {
    brandSub: "COMMUNITY MARKET · DEMO",
    heroEyebrow: "COMMUNITY MARKETPLACE",
    heroTitle: "DEINE GAMING-<br><span>VITRINE</span>",
    heroDesc: "SkinHub ist ein Marktplatz, auf dem du Skins für Telegram Stars kaufen/verkaufen kannst!",
    heroNote: "Zahlung & Transfer über Telegram Stars und Steam Trade",
    tabHome: "Start",
    tabSell: "Verkaufen",
    tabHowto: "So funktioniert's",
    tabReviews: "Bewertungen",
    tabSupport: "Support",
    tabProfile: "Profil",
    tabAdmin: "Admin",
    discover: "ENTDECKEN",
    showcaseTitle: "Community-Vitrine",
    searchPlaceholder: "Suche...",
    filterAll: "Alle",
    filterRifle: "Gewehre",
    filterPistol: "Pistolen",
    filterKnife: "Messer",
    filterOther: "Sonstiges",
    createListing: "ANZEIGE ERSTELLEN",
    newListing: "Neue Anzeige",
    selectSkin: "Skin auswählen",
    category: "Kategorie",
    priceStars: "Preis (Telegram Stars)",
    addListing: "Anzeige hinzufügen",
    listingHint: "Deine Anzeige erscheint im Katalog der App.",
    howtoEyebrow: "ANLEITUNG",
    howtoTitle: "Zahlung & Transfer",
    howto1Title: "1. Skin wählen",
    howto1Text: "Der Verkäufer wählt einen Skin aus der Liste — das Foto wird automatisch gesetzt. Käufer sehen die Anzeige im Katalog.",
    howto2Title: "2. Mit Telegram Stars bezahlen",
    howto2Text: "Deals laufen über Telegram Stars. Nach Einigung sendet der Käufer Stars an den Verkäufer in Telegram.",
    howto3Title: "3. Steam-Transfer",
    howto3Text: "Nach der Zahlung sendet der Verkäufer ein Steam-Trade-Angebot. Der Käufer nimmt den Gegenstand an. Bei Problemen Support kontaktieren.",
    howto4Title: "4. Support",
    howto4Text: "Fragen zu Deals und Sicherheit — @SkinHub_support",
    feedback: "COMMUNITY-FEEDBACK",
    reviewsTitle: "Bewertungen",
    leaveReview: "Bewertung abgeben",
    rating: "Bewertung",
    comment: "Kommentar",
    reviewPlaceholder: "Schreibe eine Bewertung...",
    sendReview: "Absenden",
    helpEyebrow: "WIR HELFEN DIR",
    supportTitle: "Support",
    supportIntro: "Hilfe bei Deal, Stars-Zahlung oder Skin-Transfer?",
    ticketSubject: "Betreff",
    ticketSubjectPh: "z.B. Frage zum Deal",
    ticketMessage: "Nachricht",
    ticketMessagePh: "Beschreibe deine Frage...",
    createTicket: "Ticket erstellen",
    myTickets: "Meine Tickets",
    account: "KONTO",
    profileTitle: "Profil",
    myListings: "Meine Anzeigen",
    adminTitle: "Admin-Panel",
    adminWarning: "Admin-Rechte in diesem Mock werden clientseitig geprüft und sind kein sicherer Produktivschutz.",
    adminAddReview: "Shop-Bewertung hinzufügen",
    name: "Name",
    text: "Text",
    addReviewBtn: "Bewertung hinzufügen",
    userTickets: "Nutzer-Tickets",
    replyTicket: "Auf Ticket antworten",
    reply: "Antwort",
    saveReply: "Antwort speichern",
    nothingFound: "Nichts gefunden.",
    noListings: "Du hast noch keine Anzeigen.",
    noTickets: "Du hast noch keine Tickets.",
    noAdminTickets: "Noch keine Tickets.",
    listingLabel: "Anzeige",
    stars: "Stars",
    fillSkinPrice: "Wähle einen Skin und gib einen positiven Stars-Preis ein.",
    listingAdded: "Anzeige hinzugefügt.",
    writeReview: "Bitte Bewertungstext eingeben.",
    fillTicket: "Betreff und Nachricht ausfüllen.",
    ticketSaved: "Ticket gespeichert.",
    noAccess: "Kein Zugriff.",
    fillNameText: "Name und Text ausfüllen.",
    reviewAdded: "Bewertung hinzugefügt.",
    checkIdReply: "Ticket-ID und Antwort prüfen.",
    replySaved: "Antwort gespeichert.",
    openTelegram: "App über Telegram öffnen",
    localMode: "Lokaler Modus außerhalb von Telegram",
    statusNew: "Neu",
    statusReplied: "Beantwortet",
    supportReply: "Support-Antwort"
  },
  zh: {
    brandSub: "COMMUNITY MARKET · DEMO",
    heroEyebrow: "COMMUNITY MARKETPLACE",
    heroTitle: "你的游戏<br><span>橱窗</span>",
    heroDesc: "SkinHub 是一个可以用 Telegram Stars 买卖皮肤的市场！",
    heroNote: "通过 Telegram Stars 与 Steam 交易完成支付和转移",
    tabHome: "首页",
    tabSell: "出售",
    tabHowto: "如何运作",
    tabReviews: "评价",
    tabSupport: "支持",
    tabProfile: "个人",
    tabAdmin: "管理",
    discover: "发现",
    showcaseTitle: "社区橱窗",
    searchPlaceholder: "搜索...",
    filterAll: "全部",
    filterRifle: "步枪",
    filterPistol: "手枪",
    filterKnife: "刀具",
    filterOther: "其他",
    createListing: "创建列表",
    newListing: "新列表",
    selectSkin: "选择皮肤",
    category: "分类",
    priceStars: "价格（Telegram Stars）",
    addListing: "添加列表",
    listingHint: "你的列表将显示在应用目录中。",
    howtoEyebrow: "指南",
    howtoTitle: "支付与转移",
    howto1Title: "1. 选择皮肤",
    howto1Text: "卖家从列表中选择皮肤，照片会自动填充。买家可在目录中看到。",
    howto2Title: "2. 使用 Telegram Stars 付款",
    howto2Text: "交易以 Telegram Stars 结算。达成一致后，买家通过 Telegram 向卖家发送 Stars。",
    howto3Title: "3. Steam 转移",
    howto3Text: "付款后卖家发送 Steam 交易报价，买家接受物品。如有争议请联系支持。",
    howto4Title: "4. 支持",
    howto4Text: "交易与安全问题请联系 — @SkinHub_support",
    feedback: "社区反馈",
    reviewsTitle: "评价",
    leaveReview: "发表评价",
    rating: "评分",
    comment: "评论",
    reviewPlaceholder: "写下评价...",
    sendReview: "提交评价",
    helpEyebrow: "我们随时帮助",
    supportTitle: "支持",
    supportIntro: "需要交易、Stars 支付或皮肤转移方面的帮助？",
    ticketSubject: "主题",
    ticketSubjectPh: "例如：交易相关问题",
    ticketMessage: "消息",
    ticketMessagePh: "描述你的问题...",
    createTicket: "创建工单",
    myTickets: "我的工单",
    account: "账户",
    profileTitle: "个人资料",
    myListings: "我的列表",
    adminTitle: "管理面板",
    adminWarning: "此演示中管理员权限在客户端检查，不适合生产环境的安全保护。",
    adminAddReview: "添加商店评价",
    name: "姓名",
    text: "文本",
    addReviewBtn: "添加评价",
    userTickets: "用户工单",
    replyTicket: "回复工单",
    reply: "回复",
    saveReply: "保存回复",
    nothingFound: "未找到。",
    noListings: "你还没有列表。",
    noTickets: "你还没有工单。",
    noAdminTickets: "暂无工单。",
    listingLabel: "列表",
    stars: "Stars",
    fillSkinPrice: "请选择皮肤并输入正数 Stars 价格。",
    listingAdded: "列表已添加。",
    writeReview: "请填写评价内容。",
    fillTicket: "请填写主题和消息。",
    ticketSaved: "工单已保存。",
    noAccess: "无权限。",
    fillNameText: "请填写姓名和文本。",
    reviewAdded: "评价已添加。",
    checkIdReply: "请检查工单 ID 和回复。",
    replySaved: "回复已保存。",
    openTelegram: "请通过 Telegram 打开应用",
    localMode: "Telegram 外的本地模式",
    statusNew: "新建",
    statusReplied: "已回复",
    supportReply: "支持回复"
  },
  it: {
    brandSub: "COMMUNITY MARKET · DEMO",
    heroEyebrow: "COMMUNITY MARKETPLACE",
    heroTitle: "LA TUA VETRINA<br><span>GAMING</span>",
    heroDesc: "SkinHub è un market dove puoi comprare/vendere skin con Telegram Stars!",
    heroNote: "Pagamento e trasferimento via Telegram Stars e Steam Trade",
    tabHome: "Home",
    tabSell: "Vendi",
    tabHowto: "Come funziona",
    tabReviews: "Recensioni",
    tabSupport: "Supporto",
    tabProfile: "Profilo",
    tabAdmin: "Admin",
    discover: "SCOPRI",
    showcaseTitle: "Vetrina community",
    searchPlaceholder: "Cerca...",
    filterAll: "Tutti",
    filterRifle: "Fucili",
    filterPistol: "Pistole",
    filterKnife: "Coltelli",
    filterOther: "Altro",
    createListing: "CREA ANNUNCIO",
    newListing: "Nuovo annuncio",
    selectSkin: "Seleziona skin",
    category: "Categoria",
    priceStars: "Prezzo (Telegram Stars)",
    addListing: "Aggiungi annuncio",
    listingHint: "Il tuo annuncio apparirà nel catalogo dell'app.",
    howtoEyebrow: "GUIDA",
    howtoTitle: "Pagamento e trasferimento",
    howto1Title: "1. Scegli la skin",
    howto1Text: "Il venditore sceglie la skin dall'elenco — la foto si imposta automaticamente. L'acquirente la vede nel catalogo.",
    howto2Title: "2. Paga con Telegram Stars",
    howto2Text: "Le transazioni avvengono in Telegram Stars. Dopo l'accordo l'acquirente invia Stars al venditore su Telegram.",
    howto3Title: "3. Trasferimento Steam",
    howto3Text: "Dopo il pagamento il venditore invia un'offerta Steam. L'acquirente accetta l'oggetto. In caso di problemi contatta il supporto.",
    howto4Title: "4. Supporto",
    howto4Text: "Domande su affari e sicurezza — @SkinHub_support",
    feedback: "FEEDBACK COMMUNITY",
    reviewsTitle: "Recensioni",
    leaveReview: "Lascia una recensione",
    rating: "Valutazione",
    comment: "Commento",
    reviewPlaceholder: "Scrivi una recensione...",
    sendReview: "Invia recensione",
    helpEyebrow: "SIAMO QUI PER AIUTARTI",
    supportTitle: "Supporto",
    supportIntro: "Serve aiuto con un affare, pagamento Stars o trasferimento skin?",
    ticketSubject: "Oggetto",
    ticketSubjectPh: "es. domanda su un affare",
    ticketMessage: "Messaggio",
    ticketMessagePh: "Descrivi la domanda...",
    createTicket: "Crea ticket",
    myTickets: "I miei ticket",
    account: "ACCOUNT",
    profileTitle: "Profilo",
    myListings: "I miei annunci",
    adminTitle: "Pannello admin",
    adminWarning: "I diritti admin in questo mock sono controllati lato client e non sono una protezione sicura in produzione.",
    adminAddReview: "Aggiungi recensione negozio",
    name: "Nome",
    text: "Testo",
    addReviewBtn: "Aggiungi recensione",
    userTickets: "Ticket utenti",
    replyTicket: "Rispondi al ticket",
    reply: "Risposta",
    saveReply: "Salva risposta",
    nothingFound: "Nessun risultato.",
    noListings: "Non hai ancora annunci.",
    noTickets: "Non hai ancora ticket.",
    noAdminTickets: "Nessun ticket.",
    listingLabel: "Annuncio",
    stars: "Stars",
    fillSkinPrice: "Seleziona una skin e inserisci un prezzo Stars positivo.",
    listingAdded: "Annuncio aggiunto.",
    writeReview: "Scrivi il testo della recensione.",
    fillTicket: "Compila oggetto e messaggio.",
    ticketSaved: "Ticket salvato.",
    noAccess: "Accesso negato.",
    fillNameText: "Compila nome e testo.",
    reviewAdded: "Recensione aggiunta.",
    checkIdReply: "Controlla ID ticket e risposta.",
    replySaved: "Risposta salvata.",
    openTelegram: "Apri l'app tramite Telegram",
    localMode: "Modalità locale fuori da Telegram",
    statusNew: "Nuovo",
    statusReplied: "Risposto",
    supportReply: "Risposta supporto"
  },
  ja: {
    brandSub: "COMMUNITY MARKET · DEMO",
    heroEyebrow: "COMMUNITY MARKETPLACE",
    heroTitle: "あなたのゲーム<br><span>ショーケース</span>",
    heroDesc: "SkinHubはTelegram Starsでスキンを売買できるマーケットです！",
    heroNote: "支払いと転送はTelegram StarsとSteamトレードで行います",
    tabHome: "ホーム",
    tabSell: "出品",
    tabHowto: "使い方",
    tabReviews: "レビュー",
    tabSupport: "サポート",
    tabProfile: "プロフィール",
    tabAdmin: "管理",
    discover: "発見",
    showcaseTitle: "コミュニティショーケース",
    searchPlaceholder: "検索...",
    filterAll: "すべて",
    filterRifle: "ライフル",
    filterPistol: "ピストル",
    filterKnife: "ナイフ",
    filterOther: "その他",
    createListing: "出品作成",
    newListing: "新規出品",
    selectSkin: "スキンを選択",
    category: "カテゴリ",
    priceStars: "価格（Telegram Stars）",
    addListing: "出品を追加",
    listingHint: "出品はアプリ内カタログに表示されます。",
    howtoEyebrow: "ガイド",
    howtoTitle: "支払いと転送",
    howto1Title: "1. スキンを選ぶ",
    howto1Text: "出品者がリストからスキンを選ぶと写真が自動で入ります。購入者はカタログで確認できます。",
    howto2Title: "2. Telegram Starsで支払う",
    howto2Text: "取引はTelegram Starsで行われます。条件合意後、購入者がTelegramで出品者にStarsを送ります。",
    howto3Title: "3. Steam転送",
    howto3Text: "支払い後、出品者がSteamトレードオファーを送り、購入者が受け取ります。問題があればサポートへ。",
    howto4Title: "4. サポート",
    howto4Text: "取引や安全に関する質問 — @SkinHub_support",
    feedback: "コミュニティフィードバック",
    reviewsTitle: "レビュー",
    leaveReview: "レビューを書く",
    rating: "評価",
    comment: "コメント",
    reviewPlaceholder: "レビューを書く...",
    sendReview: "送信",
    helpEyebrow: "お手伝いします",
    supportTitle: "サポート",
    supportIntro: "取引、Stars支払い、スキン転送でお困りですか？",
    ticketSubject: "件名",
    ticketSubjectPh: "例：取引に関する質問",
    ticketMessage: "メッセージ",
    ticketMessagePh: "質問を記入...",
    createTicket: "チケット作成",
    myTickets: "自分のチケット",
    account: "アカウント",
    profileTitle: "プロフィール",
    myListings: "自分の出品",
    adminTitle: "管理パネル",
    adminWarning: "このモックでは管理者権限はクライアント側で確認され、本番の安全な保護ではありません。",
    adminAddReview: "ストアレビューを追加",
    name: "名前",
    text: "テキスト",
    addReviewBtn: "レビュー追加",
    userTickets: "ユーザーチケット",
    replyTicket: "チケットに返信",
    reply: "返信",
    saveReply: "返信を保存",
    nothingFound: "見つかりません。",
    noListings: "まだ出品がありません。",
    noTickets: "まだチケットがありません。",
    noAdminTickets: "チケットはまだありません。",
    listingLabel: "出品",
    stars: "Stars",
    fillSkinPrice: "スキンを選び、正のStars価格を入力してください。",
    listingAdded: "出品を追加しました。",
    writeReview: "レビュー本文を書いてください。",
    fillTicket: "件名とメッセージを入力してください。",
    ticketSaved: "チケットを保存しました。",
    noAccess: "アクセスできません。",
    fillNameText: "名前とテキストを入力してください。",
    reviewAdded: "レビューを追加しました。",
    checkIdReply: "チケットIDと返信を確認してください。",
    replySaved: "返信を保存しました。",
    openTelegram: "Telegramからアプリを開いてください",
    localMode: "Telegram外のローカルモード",
    statusNew: "新規",
    statusReplied: "返信済み",
    supportReply: "サポート返信"
  }
};

let lang = localStorage.getItem("sh_lang") || (navigator.language || "ru").slice(0, 2);
if (!I18N[lang]) lang = "ru";

function t(key) {
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}

function applyI18n() {
  document.documentElement.lang = lang;
  document.getElementById("brandSub").textContent = t("brandSub");
  document.getElementById("heroEyebrow").textContent = t("heroEyebrow");
  document.getElementById("heroTitle").innerHTML = t("heroTitle");
  document.getElementById("heroDesc").textContent = t("heroDesc");
  document.getElementById("heroNote").textContent = t("heroNote");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) el.placeholder = t(key);
  });

  const catSelect = document.getElementById("itemCategory");
  if (catSelect) {
    [...catSelect.options].forEach((opt) => {
      const map = { rifle: "filterRifle", pistol: "filterPistol", knife: "filterKnife", other: "filterOther" };
      if (map[opt.value]) opt.textContent = t(map[opt.value]);
    });
  }

  renderCatalog();
  renderReviews();
  renderTickets();
  if (document.getElementById("profile").classList.contains("active")) renderMyListings();
  if (isAdmin && document.getElementById("admin").classList.contains("active")) renderAdmin();
}

/* ---------- Skin catalog (name + auto image) ---------- */
const SKINS = [
  { id: "ak-redline", name: "AK-47 | Redline", category: "rifle", image: "https://placehold.co/360x360/1a1028/c8adff/png?text=AK-47%0ARedline" },
  { id: "awp-asiimov", name: "AWP | Asiimov", category: "rifle", image: "https://placehold.co/360x360/1a1028/ff9b6b/png?text=AWP%0AAsiimov" },
  { id: "m4-printstream", name: "M4A1-S | Printstream", category: "rifle", image: "https://placehold.co/360x360/1a1028/e8e8ff/png?text=M4A1-S%0APrintstream" },
  { id: "usp-kc", name: "USP-S | Kill Confirmed", category: "pistol", image: "https://placehold.co/360x360/1a1028/9bdcff/png?text=USP-S%0AKill+Confirmed" },
  { id: "glock-fade", name: "Glock-18 | Fade", category: "pistol", image: "https://placehold.co/360x360/1a1028/ff9be8/png?text=Glock-18%0AFade" },
  { id: "deagle-blaze", name: "Desert Eagle | Blaze", category: "pistol", image: "https://placehold.co/360x360/1a1028/ffb36b/png?text=Deagle%0ABlaze" },
  { id: "karambit-doppler", name: "★ Karambit | Doppler", category: "knife", image: "https://placehold.co/360x360/1a1028/6bdcff/png?text=Karambit%0ADoppler" },
  { id: "bayonet-tiger", name: "★ Bayonet | Tiger Tooth", category: "knife", image: "https://placehold.co/360x360/1a1028/ffd66b/png?text=Bayonet%0ATiger+Tooth" },
  { id: "butterfly-fade", name: "★ Butterfly Knife | Fade", category: "knife", image: "https://placehold.co/360x360/1a1028/d6a0ff/png?text=Butterfly%0AFade" },
  { id: "gloves-pandora", name: "★ Sport Gloves | Pandora's Box", category: "other", image: "https://placehold.co/360x360/1a1028/b36bff/png?text=Gloves%0APandora" }
];

// More reliable approach: use Steam CDN with known working image paths from public market data.
// Fallback: colored placeholder with skin name if image fails.
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

let listings = read("sh_listings_v2", [
  { id: 1, name: "AK-47 | Redline", category: "rifle", price: 125, image: "", owner: "system", skinId: "ak-redline" },
  { id: 2, name: "AWP | Asiimov", category: "rifle", price: 280, image: "", owner: "system", skinId: "awp-asiimov" },
  { id: 3, name: "★ Karambit | Doppler", category: "knife", price: 890, image: "", owner: "system", skinId: "karambit-doppler" },
  { id: 4, name: "Glock-18 | Fade", category: "pistol", price: 320, image: "", owner: "system", skinId: "glock-fade" }
]);
// fill images from catalog
listings = listings.map(l => {
  if (!l.image) {
    const s = SKINS.find(x => x.id === l.skinId || x.name === l.name);
    if (s) l.image = s.image;
  }
  return l;
});
let reviews = read("sh_reviews_v2", [
  { name: "Alex", rating: 5, text: "Fast support and clear process." },
  { name: "Mira", rating: 5, text: "Nice catalog and Stars payments." }
]);
let tickets = read("sh_tickets_v2", []);
let activeFilter = "all";

/* ---------- UI init ---------- */
document.getElementById("userLabel").textContent = userName;
document.getElementById("profileName").textContent = userName;
document.getElementById("profileId").textContent = user
  ? "Telegram ID: " + user.id
  : t("localMode");
document.getElementById("avatar").textContent = (userName[0] || "?").toUpperCase();
if (isAdmin) document.getElementById("adminTab").hidden = false;

const langSelect = document.getElementById("langSelect");
Object.entries(LANGS).forEach(([code, label]) => {
  const opt = document.createElement("option");
  opt.value = code;
  opt.textContent = label;
  if (code === lang) opt.selected = true;
  langSelect.appendChild(opt);
});
langSelect.addEventListener("change", () => {
  lang = langSelect.value;
  localStorage.setItem("sh_lang", lang);
  applyI18n();
});

const skinSelect = document.getElementById("itemSkin");
SKINS.forEach((s) => {
  const opt = document.createElement("option");
  opt.value = s.id;
  opt.textContent = s.name;
  skinSelect.appendChild(opt);
});

const preview = document.getElementById("skinPreview");
const previewImg = document.getElementById("skinPreviewImg");
const previewName = document.getElementById("skinPreviewName");

skinSelect.addEventListener("change", () => {
  const skin = SKINS.find((s) => s.id === skinSelect.value);
  if (!skin) {
    preview.classList.add("hidden");
    return;
  }
  preview.classList.remove("hidden");
  previewImg.src = skin.image;
  previewImg.alt = skin.name;
  previewName.textContent = skin.name;
  document.getElementById("itemCategory").value = skin.category;
  previewImg.onerror = () => {
    previewImg.style.display = "none";
  };
  previewImg.onload = () => {
    previewImg.style.display = "";
  };
});

function showPage(name) {
  document.querySelectorAll(".page").forEach((p) => p.classList.toggle("active", p.id === name));
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.page === name));
  if (name === "profile") renderMyListings();
  if (name === "admin" && isAdmin) renderAdmin();
}
document.querySelectorAll(".tab").forEach((b) =>
  b.addEventListener("click", () => showPage(b.dataset.page))
);

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(s) {
  return escapeHtml(s);
}
function categoryName(c) {
  return ({ rifle: t("filterRifle"), pistol: t("filterPistol"), knife: t("filterKnife"), other: t("filterOther") })[c] || t("filterOther");
}

function renderCatalog() {
  const q = document.getElementById("search").value.toLowerCase();
  const list = listings.filter(
    (x) => (activeFilter === "all" || x.category === activeFilter) && x.name.toLowerCase().includes(q)
  );
  document.getElementById("catalog").innerHTML =
    list
      .map(
        (x) => `
    <article class="item">
      <div class="item-art">${x.image ? `<img src="${escapeAttr(x.image)}" alt="${escapeAttr(x.name)}" onerror="this.style.display='none';this.parentElement.textContent='✦'">` : "✦"}</div>
      <div class="item-body">
        <h3>${escapeHtml(x.name)}</h3>
        <div class="muted">${t("listingLabel")} · ${categoryName(x.category)}</div>
        <div class="price">${Number(x.price)} ${t("stars")}</div>
      </div>
    </article>`
      )
      .join("") || `<p class="muted">${t("nothingFound")}</p>`;
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

document.getElementById("addListing").onclick = () => {
  const skinId = skinSelect.value;
  const skin = SKINS.find((s) => s.id === skinId);
  const price = Number(document.getElementById("itemPrice").value);
  if (!skin || !Number.isFinite(price) || price <= 0) {
    alert(t("fillSkinPrice"));
    return;
  }
  listings.unshift({
    id: Date.now(),
    name: skin.name,
    category: document.getElementById("itemCategory").value || skin.category,
    price,
    image: skin.image,
    owner: userId,
    skinId: skin.id
  });
  write("sh_listings_v2", listings);
  document.getElementById("itemPrice").value = "";
  skinSelect.value = "";
  preview.classList.add("hidden");
  renderCatalog();
  alert(t("listingAdded"));
  showPage("home");
};

function renderReviews() {
  document.getElementById("reviewList").innerHTML = reviews
    .map(
      (r) =>
        `<div class="entry"><h3>${escapeHtml(r.name)} <span style="color:#c6a3ff">${"★".repeat(
          Math.max(1, Math.min(5, Number(r.rating)))
        )}</span></h3><p>${escapeHtml(r.text)}</p></div>`
    )
    .join("");
}
document.getElementById("addReview").onclick = () => {
  const text = document.getElementById("reviewText").value.trim();
  if (!text) {
    alert(t("writeReview"));
    return;
  }
  reviews.unshift({
    name: userName,
    rating: Number(document.getElementById("reviewRating").value),
    text
  });
  write("sh_reviews_v2", reviews);
  document.getElementById("reviewText").value = "";
  renderReviews();
};

function ticketHtml(ticket) {
  return `<div class="entry"><h3>#${ticket.id} · ${escapeHtml(ticket.subject)} <span class="muted">· ${escapeHtml(
    ticket.status
  )}</span></h3><p>${escapeHtml(ticket.text)}</p>${
    ticket.reply ? `<p><b>${t("supportReply")}:</b> ${escapeHtml(ticket.reply)}</p>` : ""
  }</div>`;
}
function renderTickets() {
  const mine = tickets.filter((x) => x.owner === userId);
  document.getElementById("ticketList").innerHTML =
    mine.map(ticketHtml).join("") || `<p class="muted">${t("noTickets")}</p>`;
}
document.getElementById("createTicket").onclick = () => {
  const subject = document.getElementById("ticketSubject").value.trim();
  const text = document.getElementById("ticketText").value.trim();
  if (!subject || !text) {
    alert(t("fillTicket"));
    return;
  }
  tickets.unshift({
    id: Date.now(),
    owner: userId,
    name: userName,
    subject,
    text,
    status: t("statusNew"),
    reply: ""
  });
  write("sh_tickets_v2", tickets);
  document.getElementById("ticketSubject").value = "";
  document.getElementById("ticketText").value = "";
  renderTickets();
  alert(t("ticketSaved"));
};

function renderMyListings() {
  document.getElementById("myListings").innerHTML =
    listings
      .filter((x) => x.owner === userId)
      .map(
        (x) =>
          `<div class="entry"><h3>${escapeHtml(x.name)}</h3><p>${x.price} ${t("stars")}</p></div>`
      )
      .join("") || `<p class="muted">${t("noListings")}</p>`;
}

function renderAdmin() {
  if (!isAdmin) return;
  document.getElementById("adminTickets").innerHTML =
    tickets.map(ticketHtml).join("") || `<p class="muted">${t("noAdminTickets")}</p>`;
}
document.getElementById("adminAddReview").onclick = () => {
  if (!isAdmin) return alert(t("noAccess"));
  const name = document.getElementById("adminReviewName").value.trim();
  const text = document.getElementById("adminReviewText").value.trim();
  if (!name || !text) {
    alert(t("fillNameText"));
    return;
  }
  reviews.unshift({ name, rating: 5, text });
  write("sh_reviews_v2", reviews);
  renderReviews();
  alert(t("reviewAdded"));
};
document.getElementById("sendReply").onclick = () => {
  if (!isAdmin) return alert(t("noAccess"));
  const id = Number(document.getElementById("replyTicketId").value);
  const reply = document.getElementById("replyTicketText").value.trim();
  const ticket = tickets.find((x) => x.id === id);
  if (!ticket || !reply) {
    alert(t("checkIdReply"));
    return;
  }
  ticket.reply = reply;
  ticket.status = t("statusReplied");
  write("sh_tickets_v2", tickets);
  renderAdmin();
  renderTickets();
  alert(t("replySaved"));
};

applyI18n();
renderCatalog();
renderReviews();
renderTickets();
