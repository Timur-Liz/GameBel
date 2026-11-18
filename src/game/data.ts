import type { GameState } from "./types";
import type { RegionId } from "./mapData";

export interface FaceParams {
  skin: string;
  hair: string;
  style: "short" | "long" | "bun" | "bald" | "curly" | "cap" | "ponytail" | "spiky";
  shirt: string;
  glasses?: boolean;
  beard?: boolean;
  mustache?: boolean;
  female?: boolean;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  kind: "colleague" | "criminal" | "citizen";
  img?: string;
  face?: FaceParams;
  color: string;
  bio: string;
  quote: string;
}

export const CHARACTERS: Record<string, Character> = {
  kravets: {
    id: "kravets",
    name: "Майор Кравец",
    role: "Наставник, старший оперуполномоченный",
    kind: "colleague",
    img: "/chars/kravets.webp",
    color: "#2563eb",
    bio: "Виктор Петрович, 55 лет. В милиции 30 лет, в киберотделе — с первого дня. Пьёт чай только из подстаканника, обожает драники и не доверяет «облакам». Пять лет назад его лучший стажёр предал отдел.",
    quote: "Девяносто процентов киберпреступлений — это не взлом, а обман.",
  },
  alesya: {
    id: "alesya",
    name: "Лейтенант Алеся",
    role: "Аналитик, цифровая криминалистика",
    kind: "colleague",
    img: "/chars/alesya.webp",
    color: "#9333ea",
    bio: "Алеся Ковальчук, 26 лет. Выпускница БГУИР, победитель CTF-соревнований. Живёт на энергетиках, разговаривает сарказмом, но за своих порвёт любого.",
    quote: "Мой стол не трогать, энергетики не брать.",
  },
  zubr: {
    id: "zubr",
    name: "Капитан Зубрицкий",
    role: "Оперативник, выезды и задержания",
    kind: "colleague",
    img: "/chars/zubr.webp",
    color: "#0f766e",
    bio: "Дмитрий «Зубр» Зубрицкий, 35 лет. Бывший борец, КМС. Ездит на старом «Пассате», который паркует на два места. В технике не разбирается, но выбивает двери за одну попытку.",
    quote: "Ты по клавиатуре, я по дверям — сработаемся!",
  },
  stalnaya: {
    id: "stalnaya",
    name: "Полковник Стальная",
    role: "Начальник управления",
    kind: "colleague",
    img: "/chars/stalnaya.webp",
    color: "#b91c1c",
    bio: "Тамара Игнатьевна Стальная. Строгая, справедливая, хвалит раз в пять лет. Именно она подписывает приказы о присвоении званий.",
    quote: "Звания не дарят. Их зарабатывают.",
  },
  babushka: {
    id: "babushka",
    name: "Галина Степановна",
    role: "Пенсионерка с Уручья",
    kind: "citizen",
    img: "/chars/babushka.webp",
    color: "#dc2626",
    bio: "75 лет, бывший бухгалтер. Первая потерпевшая, которую вы спасли. Теперь считает вас внуком и носит драники в управление.",
    quote: "Сыночек, я тебе драников нажарила!",
  },
  aist: {
    id: "aist",
    name: "«Аист»",
    role: "Организатор сети «Гнездо»",
    kind: "criminal",
    img: "/chars/aist.webp",
    color: "#111827",
    bio: "Артур Лелик, 29 лет. Бывший стажёр майора Кравца. Продал базу данных отдела и исчез. Создал «франшизу мошенничества»: сайты, боты, колл-центры и дропы по всей Беларуси.",
    quote: "Умный может всё. Остальные — просто ресурс.",
  },
  edik: {
    id: "edik",
    name: "Эдик «Банкир»",
    role: "Руководитель колл-центра",
    kind: "criminal",
    img: "/chars/edik.webp",
    color: "#7c3aed",
    bio: "Эдуард Ляхович, 31 год. Бархатный голос «службы безопасности банка». Обманул более 400 пенсионеров. Уверял, что продаёт пылесосы.",
    quote: "Вас беспокоит служба безопасности банка…",
  },
  kirill: {
    id: "kirill",
    name: "Крипто-Кирилл",
    role: "Лжеинвестор «КриптоГарант»",
    kind: "criminal",
    img: "/chars/kirill.webp",
    color: "#0d9488",
    bio: "Кирилл Бабко, 28 лет. Инфоцыган с арендованным «Ламборгини». Обещал 40% в месяц, а «прибыль» дорисовывал вручную в админке.",
    quote: "Мои клиенты богатеют вместе со мной!",
  },
  marina: { id: "marina", name: "Марина", role: "Студентка, продавала куртку", kind: "citizen", color: "#db2777", face: { skin: "#f6d2b8", hair: "#8b5a2b", style: "long", shirt: "#f472b6", female: true }, bio: "19 лет, студентка БГУ. Попалась на схему «покупатель оплатил».", quote: "Он такой вежливый был!" },
  lisa: { id: "lisa", name: "Лиза Бульбашка", role: "TikTok-блогер, 300K", kind: "citizen", color: "#e11d48", face: { skin: "#f9dcc4", hair: "#facc15", style: "ponytail", shirt: "#fb7185", female: true }, bio: "Блогер из Минска. Пароль lisa2005 на всех сайтах.", quote: "У меня надёжный пароль!" },
  timur: { id: "timur", name: "Тимур", role: "Школьник, 8 «Б»", kind: "citizen", color: "#2563eb", face: { skin: "#e8b98f", hair: "#1f2937", style: "spiky", shirt: "#60a5fa" }, bio: "14 лет, Борисов. Проголосовал «за Настю» и потерял Telegram.", quote: "Можно я их тоже взломаю?" },
  lyudmila: { id: "lyudmila", name: "Людмила", role: "Мать, Солигорск", kind: "citizen", color: "#ea580c", face: { skin: "#f3c9a8", hair: "#7c2d12", style: "bun", shirt: "#fdba74", female: true }, bio: "52 года, мастер на калийном комбинате. Услышала «голос сына» — нейросетевую подделку.", quote: "Это был его голос!" },
  denis: { id: "denis", name: "Денис", role: "Курьер мошенников", kind: "criminal", color: "#475569", face: { skin: "#eac2a0", hair: "#3f3f46", style: "cap", shirt: "#94a3b8" }, bio: "20 лет. Устроился «курьером» за 300$ в день. Забирал деньги у обманутых.", quote: "Я просто мимо проходил." },
  yana: { id: "yana", name: "Яна", role: "Бариста, Гродно", kind: "citizen", color: "#a16207", face: { skin: "#f5d0b5", hair: "#b45309", style: "curly", shirt: "#fcd34d", female: true }, bio: "Бариста кафе «Под Замком». Заметила подозрительную Wi-Fi сеть.", quote: "У нас сеть с паролем!" },
  gleb: { id: "gleb", name: "Глеб «Аистёнок»", role: "Перехватчик Wi-Fi", kind: "criminal", color: "#334155", face: { skin: "#f0c8a8", hair: "#111827", style: "short", shirt: "#1e293b", glasses: true }, bio: "20 лет, студент. Раздавал фейковый Wi-Fi и продавал пароли.", quote: "Это учебный проект!" },
  irina: { id: "irina", name: "Ирина Васильевна", role: "Учительница, Лида", kind: "citizen", color: "#15803d", face: { skin: "#f1c7a5", hair: "#57534e", style: "bun", shirt: "#86efac", female: true, glasses: true }, bio: "Хотела купить сыну телефон дёшево.", quote: "Отзывы же хорошие были…" },
  petr: { id: "petr", name: "Пётр Иванович", role: "Инженер на пенсии, Брест", kind: "citizen", color: "#1d4ed8", face: { skin: "#eebf9c", hair: "#d4d4d8", style: "bald", shirt: "#93c5fd", mustache: true, glasses: true }, bio: "Вложил 12 500 BYN в «КриптоГарант».", quote: "Мне показывали прибыль!" },
  stas: { id: "stas", name: "Стас", role: "Студент-дроп, Пинск", kind: "criminal", color: "#4d7c0f", face: { skin: "#f2cdb0", hair: "#a16207", style: "curly", shirt: "#bef264" }, bio: "19 лет. Продал свою банковскую карту за 200 BYN в неделю. Через неё прошли 46 краденых переводов.", quote: "Это же просто карта…" },
  director: { id: "director", name: "Анатолий Борисович", role: "Директор завода, Могилёв", kind: "citizen", color: "#9a3412", face: { skin: "#e9b48e", hair: "#78716c", style: "short", shirt: "#f5f5f4", mustache: true }, bio: "Директор завода «Днепртехмаш». Завод встал из-за шифровальщика.", quote: "Конвейер стоит!" },
  olya: { id: "olya", name: "Оля", role: "Мама в декрете, Бобруйск", kind: "citizen", color: "#c026d3", face: { skin: "#f8d6bd", hair: "#292524", style: "ponytail", shirt: "#e879f9", female: true }, bio: "Искала подработку на дому и попала в «таск-скам».", quote: "Сначала же заплатили!" },
  katya: { id: "katya", name: "Катя", role: "Фанатка фестиваля, Витебск", kind: "citizen", color: "#0891b2", face: { skin: "#f6d5bf", hair: "#dc2626", style: "long", shirt: "#67e8f9", female: true }, bio: "Купила 4 поддельных билета на «Славянский базар».", quote: "Билеты поддельные?!" },
  vasya: { id: "vasya", name: "Вася", role: "Выпускник, Полоцк", kind: "citizen", color: "#4338ca", face: { skin: "#efc6a4", hair: "#854d0e", style: "spiky", shirt: "#a5b4fc", glasses: true }, bio: "Открыл «Фото_с_выпускного.apk».", quote: "Это же было фото!" },
  ksenia: { id: "ksenia", name: "Ксения", role: "Студентка, искала жильё, Мозырь", kind: "citizen", color: "#0284c7", face: { skin: "#f7d7c0", hair: "#3f2a1d", style: "long", shirt: "#7dd3fc", female: true }, bio: "Перевела предоплату за квартиру, которой у «хозяина» никогда не было.", quote: "Фото же были настоящие!" },
  vitaly: { id: "vitaly", name: "Виталий «Лжемайор»", role: "Звонарь колл-центра", kind: "criminal", color: "#1e3a8a", face: { skin: "#e9b896", hair: "#27272a", style: "short", shirt: "#1e40af", mustache: true }, bio: "Представлялся «майором милиции» и «сотрудником Нацбанка». Второй звонок в «каскаде».", quote: "С вами говорит майор милиции…" },
  natalia: { id: "natalia", name: "Наталья", role: "Медсестра, Барановичи", kind: "citizen", color: "#be185d", face: { skin: "#f3cfb3", hair: "#a16207", style: "bun", shirt: "#f9a8d4", female: true }, bio: "Заметила, что телефон греется и садится за полдня. Внутри оказалась шпионская программа.", quote: "Он знал, где я была…" },
  oleg: { id: "oleg", name: "Олег", role: "Муж-ревнивец", kind: "criminal", color: "#57534e", face: { skin: "#e6b38f", hair: "#44403c", style: "short", shirt: "#a8a29e", beard: true }, bio: "Тайно установил жене шпионское приложение. Считал, что «имеет право».", quote: "Я просто волновался!" },
  vadim: { id: "vadim", name: "Вадим «Инсайдер»", role: "Сисадмин, Новополоцк", kind: "criminal", color: "#0f766e", face: { skin: "#f0c9a6", hair: "#78350f", style: "curly", shirt: "#134e4a", glasses: true }, bio: "Продавал базу клиентов интернет-провайдера. Последний «птенец» Гнезда.", quote: "Я просто бэкап делал!" },
  svetlana: { id: "svetlana", name: "Светлана", role: "Волонтёр фонда, Жлобин", kind: "citizen", color: "#16a34a", face: { skin: "#f5d3b8", hair: "#d97706", style: "ponytail", shirt: "#86efac", female: true }, bio: "Настоящий волонтёр. Мошенники украли фото подопечного ребёнка для фейкового сбора.", quote: "Это наш Тимоша на фото!" },
  rimma: { id: "rimma", name: "Римма Павловна", role: "Главный бухгалтер, Слоним", kind: "citizen", color: "#7c2d12", face: { skin: "#eec4a2", hair: "#52525b", style: "bun", shirt: "#fdba74", female: true, glasses: true }, bio: "30 лет стажа. Перевела 84 000 BYN после видеозвонка «директора».", quote: "Это же было его лицо!" },
  mishka: { id: "mishka", name: "Мишка", role: "Внук Галины Степановны", kind: "citizen", color: "#ea580c", face: { skin: "#f6cfae", hair: "#c2410c", style: "spiky", shirt: "#fb923c" }, bio: "12 лет, геймер. Хотел бесплатных скинов.", quote: "Бабуль, ну там же бесплатно!" },
  nadezhda: { id: "nadezhda", name: "Надежда", role: "Молодая мама, Светлогорск", kind: "citizen", color: "#7c3aed", face: { skin: "#f6d2b9", hair: "#92400e", style: "ponytail", shirt: "#c4b5fd", female: true }, bio: "Нашла в Telegram-канале видео со своей радионяни. Пароль на устройстве был заводской — admin.", quote: "Дочка спит, а кто-то это смотрит…" },
  glazok: { id: "glazok", name: "Даниил «Глазок»", role: "Продавец доступа к камерам", kind: "criminal", color: "#3f3f46", face: { skin: "#efc9a8", hair: "#1c1917", style: "spiky", shirt: "#3f3f46", glasses: true }, bio: "19 лет. Подбирал заводские пароли к 140 камерам и продавал «подписку» на чужую жизнь.", quote: "Они же сами пароль не поменяли!" },
  maxim: { id: "maxim", name: "«Максим-пилот»", role: "Брачный аферист", kind: "criminal", color: "#0369a1", face: { skin: "#f0c7a4", hair: "#facc15", style: "short", shirt: "#e0f2fe" }, bio: "«Пилот из Дубая» с чужими фотографиями. На деле — Геннадий из колл-центра, 47 лет.", quote: "Ты особенная, Алеся…" },
};

export const NARRATOR = "narrator";

export interface Rank {
  name: string;
  short: string;
  xp: number;
  salary: number;
  stars: number;
  big: boolean;
  perms: string[];
}

export const RANKS: Rank[] = [
  { name: "Стажёр", short: "Стажёр", xp: 0, salary: 450, stars: 0, big: false, perms: ["Дела в г. Минске", "Наставник рядом: +1 подсказка в каждом деле"] },
  { name: "Младший лейтенант милиции", short: "Мл. лейтенант", xp: 150, salary: 800, stars: 1, big: false, perms: ["Дела Минской области", "Дежурная часть: вызовы граждан на карте", "Повседневная форма"] },
  { name: "Лейтенант милиции", short: "Лейтенант", xp: 400, salary: 1000, stars: 2, big: false, perms: ["Выезды в Гродненскую и Брестскую области", "Тактическая форма отдела «К»", "Самостоятельные допросы"] },
  { name: "Старший лейтенант милиции", short: "Ст. лейтенант", xp: 800, salary: 1250, stars: 3, big: false, perms: ["Гомельская и Могилёвская области", "Сейф для улик и полевая форма", "Участие в задержаниях"] },
  { name: "Капитан милиции", short: "Капитан", xp: 1300, salary: 1550, stars: 4, big: false, perms: ["Витебская область", "Кресло руководителя, деловой костюм", "Руководство выездной группой"] },
  { name: "Майор милиции", short: "Майор", xp: 1900, salary: 1900, stars: 1, big: true, perms: ["Операция «Гнездо»", "Парадная форма", "Серверная стойка в кабинет"] },
  { name: "Подполковник милиции", short: "Подполковник", xp: 3000, salary: 2400, stars: 2, big: true, perms: ["Заместитель начальника управления", "Личный водитель (шутка, Зубр отказался)"] },
  { name: "Полковник милиции", short: "Полковник", xp: 4300, salary: 3000, stars: 3, big: true, perms: ["Начальник собственного отдела", "Генеральский китель", "Легенда киберполиции Беларуси"] },
];

export function rankOf(xp: number): number {
  let r = 0;
  RANKS.forEach((rk, i) => {
    if (xp >= rk.xp) r = i;
  });
  return r;
}

export const REGION_RANK: Record<RegionId, number> = {
  minsk: 0,
  minsk_obl: 1,
  grodno: 2,
  brest: 2,
  gomel: 3,
  mogilev: 3,
  vitebsk: 4,
};

export interface Uniform {
  id: string;
  name: string;
  price: number;
  minRank: number;
  body: string;
  accent: string;
  tie?: string;
  cap?: string;
  boards: boolean;
  perk: string;
  xpBonus: number;
  moneyBonus: number;
}

export const UNIFORMS: Uniform[] = [
  { id: "hoodie", name: "Худи стажёра", price: 0, minRank: 0, body: "#64748b", accent: "#334155", boards: false, perk: "Удобно. Но Стальная косится.", xpBonus: 0, moneyBonus: 0 },
  { id: "daily", name: "Повседневная форма", price: 300, minRank: 1, body: "#93c5fd", accent: "#1e3a8a", tie: "#1e3a8a", boards: true, perk: "+5% к опыту", xpBonus: 0.05, moneyBonus: 0 },
  { id: "tactical", name: "Тактическая форма «К»", price: 700, minRank: 2, body: "#1e293b", accent: "#0ea5e9", boards: true, perk: "+10% к опыту", xpBonus: 0.1, moneyBonus: 0 },
  { id: "field", name: "Полевая форма", price: 900, minRank: 3, body: "#3f6212", accent: "#1a2e05", boards: true, perk: "+10% опыта, +5% денег", xpBonus: 0.1, moneyBonus: 0.05 },
  { id: "suit", name: "Деловой костюм", price: 1400, minRank: 4, body: "#1f2937", accent: "#111827", tie: "#b91c1c", boards: false, perk: "+15% к премиям", xpBonus: 0.05, moneyBonus: 0.15 },
  { id: "parade", name: "Парадная форма", price: 2200, minRank: 5, body: "#1e3a8a", accent: "#facc15", tie: "#0f172a", cap: "#1e3a8a", boards: true, perk: "+15% опыта, +10% денег", xpBonus: 0.15, moneyBonus: 0.1 },
  { id: "general", name: "Китель полковника", price: 5000, minRank: 7, body: "#14532d", accent: "#facc15", tie: "#052e16", cap: "#14532d", boards: true, perk: "+25% ко всему. Вы — легенда.", xpBonus: 0.25, moneyBonus: 0.25 },
];

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  minRank: number;
  desc: string;
  xpBonus?: number;
  moneyBonus?: number;
  hints?: number;
  // позиция в кабинете (проценты)
  x: number;
  y: number;
  size: number;
}

export const SHOP: ShopItem[] = [
  { id: "plant", name: "Фикус «Василий»", icon: "🪴", price: 60, minRank: 0, desc: "Оживляет кабинет. Петрович одобряет.", x: 6, y: 62, size: 64 },
  { id: "tea", name: "Подстаканник с чаем", icon: "🍵", price: 90, minRank: 0, desc: "Как у Петровича. +5% опыта.", xpBonus: 0.05, x: 44, y: 58, size: 36 },
  { id: "zubrportrait", name: "Картина «Зубр в Пуще»", icon: "🦬", price: 150, minRank: 0, desc: "Символ Беловежской пущи на стене.", x: 18, y: 18, size: 56 },
  { id: "map", name: "Карта РБ на стену", icon: "🗺️", price: 200, minRank: 0, desc: "С красными нитками, как у настоящих оперов.", x: 70, y: 16, size: 64 },
  { id: "monitor2", name: "Второй монитор", icon: "🖥️", price: 350, minRank: 1, desc: "+1 подсказка в каждом деле.", hints: 1, x: 56, y: 46, size: 48 },
  { id: "cat", name: "Кот Байт", icon: "🐈", price: 400, minRank: 1, desc: "Офисный кот. Спит на клавиатуре и комментирует ваши дела.", x: 80, y: 72, size: 48 },
  { id: "neon", name: "Неоновая вывеска «КиберЩит»", icon: "🛡️", price: 450, minRank: 1, desc: "Светится по ночам. Алеся завидует.", x: 44, y: 10, size: 48 },
  { id: "coffee", name: "Кофемашина", icon: "☕", price: 550, minRank: 2, desc: "+10% опыта. Ночные смены не страшны.", xpBonus: 0.1, x: 90, y: 50, size: 48 },
  { id: "safe", name: "Сейф для улик", icon: "🔒", price: 650, minRank: 3, desc: "+5% к премиям за раскрытие.", moneyBonus: 0.05, x: 92, y: 70, size: 56 },
  { id: "aquarium", name: "Аквариум", icon: "🐠", price: 700, minRank: 2, desc: "Рыбки успокаивают перед допросом.", x: 6, y: 40, size: 56 },
  { id: "chair", name: "Кресло руководителя", icon: "🪑", price: 900, minRank: 4, desc: "+10% к зарплате и премиям.", moneyBonus: 0.1, x: 34, y: 66, size: 64 },
  { id: "sofa", name: "Диван для ночных смен", icon: "🛋️", price: 1100, minRank: 3, desc: "+1 подсказка. Выспавшийся опер видит больше.", hints: 1, x: 18, y: 72, size: 72 },
  { id: "cup", name: "Кубок «Лучший опер»", icon: "🏆", price: 1200, minRank: 4, desc: "Стоит на полке и сияет.", x: 30, y: 26, size: 44 },
  { id: "server", name: "Серверная стойка", icon: "🗄️", price: 1600, minRank: 5, desc: "Личная лаборатория. +15% опыта.", xpBonus: 0.15, x: 92, y: 30, size: 64 },
  { id: "flag", name: "Государственный флаг", icon: "🇧🇾", price: 800, minRank: 5, desc: "За спиной — для солидности.", x: 58, y: 18, size: 48 },
];

export function bonuses(s: GameState) {
  let xp = 0;
  let money = 0;
  let hints = 1;
  for (const id of s.owned) {
    const it = SHOP.find((i) => i.id === id);
    if (it) {
      xp += it.xpBonus ?? 0;
      money += it.moneyBonus ?? 0;
      hints += it.hints ?? 0;
    }
  }
  const u = UNIFORMS.find((u) => u.id === s.uniform);
  if (u) {
    xp += u.xpBonus;
    money += u.moneyBonus;
  }
  if (rankOf(s.xp) === 0) hints += 1;
  return { xp, money, hints };
}

export const PAYDAY_EVERY = 3;
