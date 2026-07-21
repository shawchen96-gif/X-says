"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Library = {
  id: string;
  title: string;
  subtitle: string;
  total: number;
  level: string;
  tone: string;
};

type Word = {
  word: string;
  phonetic: string;
  part: string;
  meaning: string;
  example: string;
  translation: string;
  definition?: string;
  attribution?: string;
};

type CompactWord = { w: string; p: string; t: string; m: string; d: string; e: string; z: string; a: string };

const libraries: Library[] = [
  { id: "primary", title: "小学核心词汇", subtitle: "趣味启蒙 · 课本同步", total: 600, level: "PRIMARY", tone: "sky" },
  { id: "junior", title: "初中必备词汇", subtitle: "中考基础 · 核心词组", total: 1600, level: "JUNIOR", tone: "violet" },
  { id: "senior", title: "高中高频词汇", subtitle: "高考必备 · 阅读高频", total: 3500, level: "SENIOR", tone: "coral" },
  { id: "daily", title: "日常口语词汇", subtitle: "生活场景 · 开口就说", total: 1200, level: "DAILY", tone: "lemon" },
  { id: "cet4", title: "大学英语四级", subtitle: "打牢基础 · 高频必备", total: 2607, level: "CET-4", tone: "mint" },
  { id: "cet6", title: "大学英语六级", subtitle: "进阶提升 · 真题高频", total: 2078, level: "CET-6", tone: "blue" },
  { id: "ielts", title: "雅思核心词汇", subtitle: "留学备考 · 场景分类", total: 3421, level: "IELTS", tone: "orange" },
];

const examWords: Word[] = [
  { word: "serendipity", phonetic: "/ˌserənˈdɪpəti/", part: "n.", meaning: "意外发现美好事物的机缘", example: "We met by pure serendipity.", translation: "我们的相遇纯属美好的偶然。" },
  { word: "resilient", phonetic: "/rɪˈzɪliənt/", part: "adj.", meaning: "有韧性的；能快速恢复的", example: "Children can be remarkably resilient.", translation: "孩子们可以表现得极具韧性。" },
  { word: "elaborate", phonetic: "/ɪˈlæbərət/", part: "adj.", meaning: "精心制作的；详尽的", example: "She made an elaborate plan.", translation: "她制定了一份周密的计划。" },
  { word: "subtle", phonetic: "/ˈsʌtəl/", part: "adj.", meaning: "微妙的；不易察觉的", example: "There is a subtle difference.", translation: "其中有一个微妙的差别。" },
  { word: "inevitable", phonetic: "/ɪnˈevɪtəbəl/", part: "adj.", meaning: "不可避免的；必然的", example: "Change is inevitable.", translation: "变化是不可避免的。" },
  { word: "perspective", phonetic: "/pəˈspektɪv/", part: "n.", meaning: "观点；思考问题的角度", example: "Try to see it from my perspective.", translation: "试着从我的角度看它。" },
];

const coreWords: Word[] = [
  { word: "water", phonetic: "/ˈwɔːtər/", part: "n.", meaning: "水", example: "Please drink more water.", translation: "请多喝水。" },
  { word: "book", phonetic: "/bʊk/", part: "n.", meaning: "书；书籍", example: "This book is easy to read.", translation: "这本书很容易读。" },
  { word: "teacher", phonetic: "/ˈtiːtʃər/", part: "n.", meaning: "老师；教师", example: "Our teacher explains it clearly.", translation: "我们的老师讲解得很清楚。" },
  { word: "student", phonetic: "/ˈstuːdənt/", part: "n.", meaning: "学生", example: "Every student has a notebook.", translation: "每个学生都有一本笔记本。" },
  { word: "morning", phonetic: "/ˈmɔːrnɪŋ/", part: "n.", meaning: "早晨；上午", example: "I study English every morning.", translation: "我每天早晨学习英语。" },
  { word: "evening", phonetic: "/ˈiːvnɪŋ/", part: "n.", meaning: "傍晚；晚上", example: "We take a walk in the evening.", translation: "我们晚上散步。" },
  { word: "window", phonetic: "/ˈwɪndoʊ/", part: "n.", meaning: "窗户", example: "Please open the window.", translation: "请打开窗户。" },
  { word: "garden", phonetic: "/ˈɡɑːrdn/", part: "n.", meaning: "花园；园地", example: "Flowers grow in the garden.", translation: "花朵生长在花园里。" },
  { word: "animal", phonetic: "/ˈænɪməl/", part: "n.", meaning: "动物", example: "The panda is a lovely animal.", translation: "熊猫是一种可爱的动物。" },
  { word: "color", phonetic: "/ˈkʌlər/", part: "n.", meaning: "颜色", example: "Blue is my favorite color.", translation: "蓝色是我最喜欢的颜色。" },
  { word: "music", phonetic: "/ˈmjuːzɪk/", part: "n.", meaning: "音乐", example: "She listens to music after class.", translation: "她下课后听音乐。" },
  { word: "story", phonetic: "/ˈstɔːri/", part: "n.", meaning: "故事", example: "He told us an interesting story.", translation: "他给我们讲了一个有趣的故事。" },
  { word: "question", phonetic: "/ˈkwestʃən/", part: "n.", meaning: "问题；疑问", example: "May I ask a question?", translation: "我可以问一个问题吗？" },
  { word: "answer", phonetic: "/ˈænsər/", part: "n.; v.", meaning: "答案；回答", example: "Please answer the question.", translation: "请回答这个问题。" },
  { word: "listen", phonetic: "/ˈlɪsən/", part: "v.", meaning: "听；倾听", example: "Listen carefully to the speaker.", translation: "认真听发言者讲话。" },
  { word: "speak", phonetic: "/spiːk/", part: "v.", meaning: "说话；讲话", example: "Could you speak more slowly?", translation: "你能说慢一点吗？" },
  { word: "write", phonetic: "/raɪt/", part: "v.", meaning: "写；书写", example: "Write your name here.", translation: "在这里写下你的名字。" },
  { word: "read", phonetic: "/riːd/", part: "v.", meaning: "阅读；朗读", example: "I read for twenty minutes a day.", translation: "我每天阅读二十分钟。" },
  { word: "learn", phonetic: "/lɜːrn/", part: "v.", meaning: "学习；学会", example: "We learn something new every day.", translation: "我们每天学习新东西。" },
  { word: "remember", phonetic: "/rɪˈmembər/", part: "v.", meaning: "记得；记住", example: "Remember to review these words.", translation: "记得复习这些单词。" },
  { word: "begin", phonetic: "/bɪˈɡɪn/", part: "v.", meaning: "开始", example: "The lesson will begin at nine.", translation: "课程将在九点开始。" },
  { word: "finish", phonetic: "/ˈfɪnɪʃ/", part: "v.", meaning: "完成；结束", example: "I finished my homework early.", translation: "我很早就完成了作业。" },
  { word: "help", phonetic: "/help/", part: "v.; n.", meaning: "帮助；援助", example: "Can you help me with this task?", translation: "你能帮我完成这项任务吗？" },
  { word: "choose", phonetic: "/tʃuːz/", part: "v.", meaning: "选择；挑选", example: "Choose the best answer.", translation: "选择最佳答案。" },
  { word: "travel", phonetic: "/ˈtrævəl/", part: "v.; n.", meaning: "旅行；游历", example: "They love to travel by train.", translation: "他们喜欢乘火车旅行。" },
  { word: "health", phonetic: "/helθ/", part: "n.", meaning: "健康", example: "Sleep is important for your health.", translation: "睡眠对你的健康很重要。" },
  { word: "market", phonetic: "/ˈmɑːrkɪt/", part: "n.", meaning: "市场；集市", example: "We bought fruit at the market.", translation: "我们在市场买了水果。" },
  { word: "office", phonetic: "/ˈɔːfɪs/", part: "n.", meaning: "办公室；办事处", example: "She works in a small office.", translation: "她在一间小办公室工作。" },
  { word: "meeting", phonetic: "/ˈmiːtɪŋ/", part: "n.", meaning: "会议；会面", example: "The meeting starts at two.", translation: "会议两点开始。" },
  { word: "message", phonetic: "/ˈmesɪdʒ/", part: "n.", meaning: "消息；信息", example: "I left you a message.", translation: "我给你留了一条消息。" },
  { word: "weather", phonetic: "/ˈweðər/", part: "n.", meaning: "天气", example: "The weather is warm today.", translation: "今天天气暖和。" },
  { word: "future", phonetic: "/ˈfjuːtʃər/", part: "n.; adj.", meaning: "未来；将来的", example: "We are planning for the future.", translation: "我们正在规划未来。" },
  { word: "culture", phonetic: "/ˈkʌltʃər/", part: "n.", meaning: "文化", example: "Food is an important part of culture.", translation: "饮食是文化的重要组成部分。" },
  { word: "language", phonetic: "/ˈlæŋɡwɪdʒ/", part: "n.", meaning: "语言", example: "English is an international language.", translation: "英语是一门国际语言。" },
  { word: "important", phonetic: "/ɪmˈpɔːrtənt/", part: "adj.", meaning: "重要的", example: "Practice is important for progress.", translation: "练习对进步很重要。" },
  { word: "careful", phonetic: "/ˈkerfəl/", part: "adj.", meaning: "小心的；仔细的", example: "Be careful when you cross the road.", translation: "过马路时要小心。" },
  { word: "friendly", phonetic: "/ˈfrendli/", part: "adj.", meaning: "友好的；亲切的", example: "The staff are helpful and friendly.", translation: "工作人员乐于助人而且很友好。" },
  { word: "different", phonetic: "/ˈdɪfrənt/", part: "adj.", meaning: "不同的；有差异的", example: "The two pictures look different.", translation: "这两幅图片看起来不同。" },
  { word: "useful", phonetic: "/ˈjuːsfəl/", part: "adj.", meaning: "有用的；实用的", example: "This dictionary is very useful.", translation: "这本词典非常实用。" },
  { word: "ready", phonetic: "/ˈredi/", part: "adj.", meaning: "准备好的", example: "Are you ready to begin?", translation: "你准备好开始了吗？" },
  { word: "quickly", phonetic: "/ˈkwɪkli/", part: "adv.", meaning: "迅速地；很快地", example: "She quickly found the answer.", translation: "她很快找到了答案。" },
  { word: "always", phonetic: "/ˈɔːlweɪz/", part: "adv.", meaning: "总是；一直", example: "He always arrives on time.", translation: "他总是准时到达。" },
  { word: "sometimes", phonetic: "/ˈsʌmtaɪmz/", part: "adv.", meaning: "有时；偶尔", example: "We sometimes study together.", translation: "我们有时一起学习。" },
  { word: "together", phonetic: "/təˈɡeðər/", part: "adv.", meaning: "一起；共同", example: "Let us solve the problem together.", translation: "让我们一起解决这个问题。" },
  { word: "because", phonetic: "/bɪˈkɔːz/", part: "conj.", meaning: "因为；由于", example: "I stayed home because it rained.", translation: "因为下雨，我待在家里。" },
  { word: "enough", phonetic: "/ɪˈnʌf/", part: "adj.; adv.", meaning: "足够的；充分地", example: "We have enough time to finish.", translation: "我们有足够的时间完成。" },
  { word: "arrive", phonetic: "/əˈraɪv/", part: "v.", meaning: "到达；抵达", example: "The train will arrive soon.", translation: "火车很快就会到达。" },
  { word: "explain", phonetic: "/ɪkˈspleɪn/", part: "v.", meaning: "解释；说明", example: "Can you explain this rule again?", translation: "你能再解释一下这条规则吗？" },
  { word: "practice", phonetic: "/ˈpræktɪs/", part: "n.; v.", meaning: "练习；训练", example: "Daily practice builds confidence.", translation: "每日练习能建立信心。" },
  { word: "success", phonetic: "/səkˈses/", part: "n.", meaning: "成功；成就", example: "Hard work can lead to success.", translation: "努力可以带来成功。" },
];

const wordBanks: Record<string, Word[]> = {
  primary: [
    { word: "family", phonetic: "/ˈfæməli/", part: "n.", meaning: "家庭；家人", example: "I love my family.", translation: "我爱我的家人。" },
    { word: "happy", phonetic: "/ˈhæpi/", part: "adj.", meaning: "快乐的；高兴的", example: "We are happy today.", translation: "我们今天很开心。" },
    { word: "school", phonetic: "/skuːl/", part: "n.", meaning: "学校", example: "I walk to school.", translation: "我步行去学校。" },
    { word: "friend", phonetic: "/frend/", part: "n.", meaning: "朋友", example: "Amy is my best friend.", translation: "艾米是我最好的朋友。" },
    { word: "beautiful", phonetic: "/ˈbjuːtɪfəl/", part: "adj.", meaning: "美丽的", example: "What a beautiful flower!", translation: "多美的一朵花啊！" },
    { word: "breakfast", phonetic: "/ˈbrekfəst/", part: "n.", meaning: "早餐", example: "Breakfast is ready.", translation: "早餐准备好了。" },
    ...coreWords,
  ],
  junior: [
    { word: "advice", phonetic: "/ədˈvaɪs/", part: "n.", meaning: "建议；忠告", example: "Thank you for your advice.", translation: "谢谢你的建议。" },
    { word: "improve", phonetic: "/ɪmˈpruːv/", part: "v.", meaning: "改善；提高", example: "Reading can improve your English.", translation: "阅读能提高你的英语。" },
    { word: "environment", phonetic: "/ɪnˈvaɪrənmənt/", part: "n.", meaning: "环境", example: "We should protect the environment.", translation: "我们应该保护环境。" },
    { word: "possible", phonetic: "/ˈpɒsəbəl/", part: "adj.", meaning: "可能的", example: "Anything is possible.", translation: "一切皆有可能。" },
    { word: "decision", phonetic: "/dɪˈsɪʒən/", part: "n.", meaning: "决定；选择", example: "It was a difficult decision.", translation: "这是一个艰难的决定。" },
    { word: "knowledge", phonetic: "/ˈnɒlɪdʒ/", part: "n.", meaning: "知识；学问", example: "Knowledge gives us power.", translation: "知识给予我们力量。" },
    ...coreWords,
  ],
  senior: [
    { word: "significant", phonetic: "/sɪɡˈnɪfɪkənt/", part: "adj.", meaning: "重要的；显著的", example: "The project made significant progress.", translation: "这个项目取得了显著进展。" },
    { word: "contribute", phonetic: "/kənˈtrɪbjuːt/", part: "v.", meaning: "贡献；促成", example: "Everyone can contribute to the team.", translation: "每个人都能为团队做贡献。" },
    { word: "opportunity", phonetic: "/ˌɒpəˈtjuːnəti/", part: "n.", meaning: "机会；时机", example: "This is a valuable opportunity.", translation: "这是一个宝贵的机会。" },
    { word: "essential", phonetic: "/ɪˈsenʃəl/", part: "adj.", meaning: "必不可少的", example: "Water is essential for life.", translation: "水对生命至关重要。" },
    { word: "challenge", phonetic: "/ˈtʃælɪndʒ/", part: "n.", meaning: "挑战；难题", example: "She is ready for the challenge.", translation: "她已准备好迎接挑战。" },
    { word: "independent", phonetic: "/ˌɪndɪˈpendənt/", part: "adj.", meaning: "独立的；自主的", example: "He became an independent learner.", translation: "他成为了一名自主学习者。" },
    ...coreWords,
  ],
  daily: [
    { word: "actually", phonetic: "/ˈæktʃuəli/", part: "adv.", meaning: "其实；实际上", example: "Actually, I agree with you.", translation: "其实，我同意你的看法。" },
    { word: "probably", phonetic: "/ˈprɒbəbli/", part: "adv.", meaning: "大概；很可能", example: "I will probably be there at six.", translation: "我大概六点到。" },
    { word: "available", phonetic: "/əˈveɪləbəl/", part: "adj.", meaning: "有空的；可获得的", example: "Are you available this afternoon?", translation: "你今天下午有空吗？" },
    { word: "recommend", phonetic: "/ˌrekəˈmend/", part: "v.", meaning: "推荐；建议", example: "What do you recommend?", translation: "你有什么推荐？" },
    { word: "convenient", phonetic: "/kənˈviːniənt/", part: "adj.", meaning: "方便的", example: "Is this time convenient for you?", translation: "这个时间你方便吗？" },
    { word: "appreciate", phonetic: "/əˈpriːʃieɪt/", part: "v.", meaning: "感激；欣赏", example: "I really appreciate your help.", translation: "我真的很感谢你的帮助。" },
    ...coreWords,
  ],
  cet4: [...examWords, ...coreWords],
  cet6: [...examWords, ...coreWords],
  ielts: [...examWords, ...coreWords],
};

type Screen = "library" | "wordlist" | "plan" | "study" | "done" | "profile";

type LocalUser = {
  totalLearned: number;
  totalKnown: number;
  reviewCount: number;
  streak: number;
  completedDays: number;
  lastStudyDate: string;
};

type LocalSession = {
  date: string;
  libraryId: string;
  daily: number;
  index: number;
  known: number;
  review: number;
};

type LanguagePack = { id: string; name: string; note: string; lang: string; rate: number; badge: string };

const languagePacks: LanguagePack[] = [
  { id: "us", name: "美式英语", note: "清晰自然，适合日常听音", lang: "en-US", rate: 0.82, badge: "US" },
  { id: "uk", name: "英式英语", note: "标准英音，适合考试听力", lang: "en-GB", rate: 0.8, badge: "UK" },
  { id: "au", name: "澳洲英语", note: "熟悉多元英语口音", lang: "en-AU", rate: 0.82, badge: "AU" },
  { id: "slow", name: "慢速发音", note: "放慢语速，适合拆分音节", lang: "en-US", rate: 0.58, badge: "0.7×" },
];

const emptyUser: LocalUser = {
  totalLearned: 0,
  totalKnown: 0,
  reviewCount: 0,
  streak: 0,
  completedDays: 0,
  lastStudyDate: "",
};

const dateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const yesterdayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return dateKey(date);
};

export default function WordApp() {
  const [screen, setScreen] = useState<Screen>("library");
  const [library, setLibrary] = useState<Library>(libraries[0]);
  const [daily, setDaily] = useState(20);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [review, setReview] = useState(0);
  const [user, setUser] = useState<LocalUser>(emptyUser);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [languagePackId, setLanguagePackId] = useState("us");
  const [showLanguagePacks, setShowLanguagePacks] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [wordCache, setWordCache] = useState<Record<string, Word[]>>({});
  const [wordLoading, setWordLoading] = useState(true);
  const [wordError, setWordError] = useState("");
  const [wordQuery, setWordQuery] = useState("");
  const [visibleWords, setVisibleWords] = useState(60);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const answerLock = useRef(false);

  useEffect(() => {
    try {
      const savedPlan = window.localStorage.getItem("wordflow-plan");
      const savedUser = window.localStorage.getItem("wordflow-user-v1");
      const savedSession = window.localStorage.getItem("wordflow-session-v1");
      const savedLanguagePack = window.localStorage.getItem("xsays-language-pack");

      if (savedPlan) {
        const parsed = JSON.parse(savedPlan) as { libraryId: string; daily: number };
        setLibrary(libraries.find((item) => item.id === parsed.libraryId) ?? libraries[0]);
        setDaily(parsed.daily);
      }
      if (savedUser) setUser({ ...emptyUser, ...(JSON.parse(savedUser) as LocalUser) });
      if (savedLanguagePack && languagePacks.some((pack) => pack.id === savedLanguagePack)) setLanguagePackId(savedLanguagePack);
      if (savedSession) {
        const session = JSON.parse(savedSession) as LocalSession;
        if (session.date === dateKey() && session.index < session.daily) {
          setLibrary(libraries.find((item) => item.id === session.libraryId) ?? libraries[0]);
          setDaily(session.daily);
          setIndex(session.index);
          setKnown(session.known);
          setReview(session.review);
          setHasSavedSession(true);
        } else {
          window.localStorage.removeItem("wordflow-session-v1");
        }
      }
    } catch {
      window.localStorage.removeItem("wordflow-session-v1");
    }
  }, []);

  useEffect(() => {
    if (wordCache[library.id]) {
      setWordLoading(false);
      return;
    }
    let cancelled = false;
    setWordLoading(true);
    setWordError("");
    const dataUrl = new URL(`data/${library.id}.json`, document.baseURI).toString();
    fetch(dataUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<CompactWord[]>;
      })
      .then((items) => {
        if (items.length !== library.total) throw new Error(`词库数量应为 ${library.total}，实际为 ${items.length}`);
        const words = items.map((item) => ({
          word: item.w,
          phonetic: item.p ? `/${item.p.replace(/^\/+|\/+$/g, "")}/` : "",
          part: item.t || "",
          meaning: item.m,
          example: item.e,
          translation: item.z,
          definition: item.d,
          attribution: item.a,
        }));
        if (!cancelled) setWordCache((currentCache) => ({ ...currentCache, [library.id]: words }));
      })
      .catch(() => {
        if (!cancelled) setWordError("词库加载失败，请检查网络后重试。");
      })
      .finally(() => {
        if (!cancelled) setWordLoading(false);
      });
    return () => { cancelled = true; };
  }, [library.id, library.total, wordCache]);

  const progress = Math.min(index / Math.max(daily, 1), 1);
  const activeWords = useMemo(() => {
    const words = wordCache[library.id] ?? wordBanks[library.id] ?? examWords;
    return Array.from(new Map(words.map((item) => [item.word.toLowerCase(), item])).values());
  }, [library.id, wordCache]);
  const filteredWords = useMemo(() => {
    const query = wordQuery.trim().toLowerCase();
    if (!query) return activeWords;
    return activeWords.filter((item) => item.word.toLowerCase().includes(query) || item.meaning.includes(wordQuery.trim()));
  }, [activeWords, wordQuery]);
  const current = activeWords[index] ?? activeWords[0];
  const languagePack = languagePacks.find((pack) => pack.id === languagePackId) ?? languagePacks[0];
  const studyNumber = Math.min(index + 1, daily);
  const remainingDays = Math.ceil(library.total / daily);
  const masteryRate = user.totalLearned ? Math.round((user.totalKnown / user.totalLearned) * 100) : 0;

  const selectLibrary = (item: Library) => {
    setLibrary(item);
    setWordQuery("");
    setVisibleWords(60);
    setWordLoading(!wordCache[item.id]);
    setScreen("wordlist");
  };

  const startStudy = () => {
    if (wordLoading || wordError || activeWords.length < daily) return;
    window.localStorage.setItem("wordflow-plan", JSON.stringify({ libraryId: library.id, daily }));
    const session = window.localStorage.getItem("wordflow-session-v1");
    const parsed = session ? JSON.parse(session) as LocalSession : null;
    const canResume = parsed?.date === dateKey() && parsed.libraryId === library.id && parsed.daily === daily && parsed.index < daily;
    setIndex(canResume ? parsed.index : 0);
    setKnown(canResume ? parsed.known : 0);
    setReview(canResume ? parsed.review : 0);
    setHasSavedSession(Boolean(canResume));
    setFlipped(false);
    setShowDefinition(false);
    setScreen("study");
  };

  const answer = (remembered: boolean) => {
    if (answerLock.current) return;
    answerLock.current = true;
    setShowDefinition(false);
    const nextIndex = index + 1;
    const nextKnown = known + (remembered ? 1 : 0);
    const nextReview = review + (remembered ? 0 : 1);
    const finishing = nextIndex >= daily;
    setKnown(nextKnown);
    setReview(nextReview);

    setUser((previous) => {
      const today = dateKey();
      const firstStudyToday = previous.lastStudyDate !== today;
      const nextUser: LocalUser = {
        totalLearned: previous.totalLearned + 1,
        totalKnown: previous.totalKnown + (remembered ? 1 : 0),
        reviewCount: previous.reviewCount + (remembered ? 0 : 1),
        streak: firstStudyToday ? (previous.lastStudyDate === yesterdayKey() ? previous.streak + 1 : 1) : previous.streak,
        completedDays: previous.completedDays + (finishing ? 1 : 0),
        lastStudyDate: today,
      };
      window.localStorage.setItem("wordflow-user-v1", JSON.stringify(nextUser));
      return nextUser;
    });

    if (finishing) {
      window.localStorage.removeItem("wordflow-session-v1");
      setHasSavedSession(false);
      setScreen("done");
      answerLock.current = false;
    } else {
      const session: LocalSession = { date: dateKey(), libraryId: library.id, daily, index: nextIndex, known: nextKnown, review: nextReview };
      window.localStorage.setItem("wordflow-session-v1", JSON.stringify(session));
      setHasSavedSession(true);
      setDragX(remembered ? 520 : -520);
      window.setTimeout(() => {
        setIndex(nextIndex);
        setFlipped(false);
        setDragX(0);
        answerLock.current = false;
      }, 180);
    }
  };

  const resetLocalData = () => {
    if (!window.confirm("确定清空这台设备上的学习记录吗？")) return;
    ["wordflow-plan", "wordflow-user-v1", "wordflow-session-v1", "xsays-language-pack"].forEach((key) => window.localStorage.removeItem(key));
    setUser(emptyUser);
    setLibrary(libraries[0]);
    setDaily(20);
    setIndex(0);
    setKnown(0);
    setReview(0);
    setHasSavedSession(false);
    setLanguagePackId("us");
    setScreen("library");
  };

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languagePack.lang;
    utterance.rate = languagePack.rate;
    window.speechSynthesis.speak(utterance);
  };

  const chooseLanguagePack = (pack: LanguagePack) => {
    setLanguagePackId(pack.id);
    window.localStorage.setItem("xsays-language-pack", pack.id);
    setShowLanguagePacks(false);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    startX.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragX(event.clientX - startX.current);
  };

  const onPointerUp = () => {
    setDragging(false);
    if (Math.abs(dragX) > 90) answer(dragX > 0);
    else setDragX(0);
  };

  const title = useMemo(() => {
    if (screen === "library") return "选择词书";
    if (screen === "wordlist") return "查看词库";
    if (screen === "plan") return "制定计划";
    if (screen === "profile") return "学习档案";
    return "X-says";
  }, [screen]);

  const goBack = () => {
    if (screen === "plan") setScreen("wordlist");
    else setScreen("library");
  };

  return (
    <main className="page-shell">
      <div className={`phone-app screen-${screen}`}>
        <header className="app-header">
          <button className="icon-button" aria-label="返回" onClick={goBack}>
            {screen === "library" ? <span className="brand-dot" aria-label="X-says">×</span> : <span aria-hidden="true">‹</span>}
          </button>
          <div>
            <p className="eyebrow">X-SAYS · SPEAK IT</p>
            <h1>{title}</h1>
          </div>
          <button className="streak" aria-label={`连续学习 ${user.streak} 天`} onClick={() => setScreen("profile")}><span aria-hidden="true">◆</span> {user.streak}</button>
        </header>

        {screen === "library" && (
          <section className="content library-screen">
            <div className="welcome-copy">
              <span className="mini-label">第 1 步，共 2 步</span>
              <h2>今天想背哪本？</h2>
              <p>选一本适合你当前目标的词书</p>
            </div>
            <div className="local-save-note"><span>✓</span><p><b>本机用户·已自动保存</b><small>{hasSavedSession ? `今日已学 ${index} 词，点击当前词书继续` : user.totalLearned ? `已累计学习 ${user.totalLearned} 词` : "学习记录只保存在这台设备"}</small></p></div>
            <div className="library-list">
              {libraries.map((item, itemIndex) => (
                <button className={`library-card ${item.tone}`} key={item.id} onClick={() => selectLibrary(item)}>
                  <span className="book-cover" aria-hidden="true"><b>{item.level}</b><i>0{itemIndex + 1}</i></span>
                  <span className="book-info">
                    <span className="book-title">{item.title}</span>
                    <span className="book-subtitle">{item.subtitle}</span>
                    <span className="book-meta"><b>{item.total.toLocaleString()}</b> 词 <i>预计 {Math.ceil(item.total / 20)} 天</i></span>
                  </span>
                  <span className="arrow" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
            <button className="import-link" onClick={() => alert("自定义词书导入功能将在下一版开放")}><span>＋</span> 导入我的词书</button>
          </section>
        )}

        {screen === "wordlist" && (
          <section className="content wordlist-screen">
            <div className={`wordlist-hero ${library.tone}`}>
              <span className="book-cover" aria-hidden="true"><b>{library.level}</b><i>{String(libraries.findIndex((item) => item.id === library.id) + 1).padStart(2, "0")}</i></span>
              <div><span className="mini-label">完整词库</span><h2>{library.title}</h2><p>{wordLoading ? "正在读取词条…" : `${activeWords.length.toLocaleString()} 个真实词条`}</p></div>
            </div>
            <label className="word-search"><span aria-hidden="true">⌕</span><input value={wordQuery} onChange={(event) => { setWordQuery(event.target.value); setVisibleWords(60); }} placeholder="搜索英文或中文释义" aria-label="搜索词库" /></label>
            {wordLoading ? (
              <div className="wordlist-state"><span className="loading-dot" />正在加载完整词库</div>
            ) : wordError ? (
              <div className="wordlist-state error">{wordError}<button onClick={() => { setWordError(""); setWordCache((cache) => ({ ...cache })); }}>重新加载</button></div>
            ) : (
              <>
                <div className="wordlist-summary"><b>{filteredWords.length.toLocaleString()}</b> 个结果 <span>每次显示最多 60 个，继续下拉可加载更多</span></div>
                <ol className="word-rows">
                  {filteredWords.slice(0, visibleWords).map((item, itemIndex) => (
                    <li key={item.word}>
                      <span className="word-order">{String(itemIndex + 1).padStart(3, "0")}</span>
                      <span className="word-row-copy"><b>{item.word}</b><small>{item.phonetic}</small><p>{item.part && <em>{item.part}</em>}{item.meaning}</p></span>
                      <button onClick={() => speakText(item.word)} aria-label={`播放 ${item.word} 发音`}>🔊</button>
                    </li>
                  ))}
                </ol>
                {visibleWords < filteredWords.length && <button className="load-more" onClick={() => setVisibleWords((count) => count + 60)}>再显示 60 个</button>}
                {!filteredWords.length && <div className="wordlist-state">没有找到相关单词</div>}
                <p className="dictionary-source">释义与音标基于 ECDICT；双语例句来自 Tatoeba 开放语料</p>
                <button className="primary-button wordlist-use" onClick={() => setScreen("plan")}>使用这本词书 <span>→</span></button>
              </>
            )}
          </section>
        )}

        {screen === "plan" && (
          <section className="content plan-screen">
            <div className="step-track"><span style={{ width: "100%" }} /></div>
            <span className="mini-label">第 2 步，共 2 步</span>
            <h2>定一个刚好的节奏</h2>
            <p className="muted">每天坚持一点，比偶尔努力一大步更有用。</p>
            <div className="selected-book">
              <span className={`tiny-cover ${library.tone}`}>{library.level}</span>
              <span><small>当前词书</small><b>{library.title}</b></span>
              <button onClick={() => setScreen("wordlist")}>查看词库</button>
            </div>
            <div className="number-panel">
              <span className="panel-title">每日学习量</span>
              <div className="daily-number"><b>{daily}</b><span>个单词 / 天</span></div>
              <input aria-label="每日学习量" type="range" min="10" max="50" step="10" value={daily} onChange={(event) => setDaily(Number(event.target.value))} style={{ "--range-progress": `${((daily - 10) / 40) * 100}%` } as React.CSSProperties} />
              <div className="range-labels"><span>10</span><span>20</span><span>30</span><span>40</span><span>50</span></div>
            </div>
            <div className="plan-summary">
              <div><span>◷</span><p><b>约 {Math.max(5, Math.round(daily * 0.55))} 分钟</b><small>每日预计时长</small></p></div>
              <div><span>◎</span><p><b>{remainingDays} 天</b><small>预计完成词书</small></p></div>
            </div>
            <button className="primary-button" disabled={wordLoading || Boolean(wordError)} onClick={startStudy}>{wordLoading ? "正在加载词库…" : "开始今日学习"} <span>→</span></button>
            <p className="tip-line">◆ 你可以随时在「我的」中调整计划</p>
          </section>
        )}

        {screen === "study" && (
          <section className="study-screen" onKeyDown={(event) => { if (event.key === "ArrowLeft") answer(false); if (event.key === "ArrowRight") answer(true); }} tabIndex={0}>
            <div className="study-topline">
              <button onClick={() => setScreen("plan")} aria-label="退出学习">×</button>
              <div className="study-progress"><span style={{ width: `${Math.max(4, progress * 100)}%` }} /></div>
              <b>{studyNumber}<small>/{daily}</small></b>
            </div>
            <div className="card-stage">
              <div className="behind-card second" />
              <div className="behind-card first" />
              <div
                className={`word-card ${flipped ? "flipped" : ""} ${dragging ? "dragging" : ""}`}
                style={{ transform: `translateX(${dragX}px) rotate(${dragX / 18}deg)` }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onClick={() => !dragging && setFlipped((value) => !value)}
                role="button"
                aria-label="点击翻转单词卡"
              >
                <span className={`swipe-stamp left ${dragX < -30 ? "show" : ""}`}>← 再学习</span>
                <span className={`swipe-stamp right ${dragX > 30 ? "show" : ""}`}>记住了 →</span>
                <div className="word-main">
                  <span className="word-tag">{library.level}</span>
                  <h2>{current.word}</h2>
                  <div className="pronunciation-actions">
                    <button className="sound-button" onClick={(event) => { event.stopPropagation(); speakText(current.word); }} aria-label={`播放${languagePack.name}发音`}><span aria-hidden="true">🔊</span><b>听发音</b></button>
                  </div>
                  <p className="phonetic">{current.phonetic}</p>
                  {flipped ? (
                    <div className="definition reveal">
                      <p><b>{current.part}</b> {current.meaning}</p>
                      <div className="example"><span>EXAMPLE</span><q>{current.example}</q><small>{current.translation}</small>{current.attribution && <small className="example-source">{current.attribution.replace("CC-BY 2.0 (France) Attribution: ", "Tatoeba · ")}</small>}<div className="example-actions"><button onClick={(event) => { event.stopPropagation(); speakText(current.example); }}>🔊 听例句</button></div></div>
                      {current.definition && <button className="definition-info-button" onClick={(event) => { event.stopPropagation(); setShowDefinition(true); }} aria-label="查看英文释义"><span aria-hidden="true">i</span> 英文释义</button>}
                    </div>
                  ) : (
                    <div className="tap-hint"><span>↻</span> 点击卡片查看释义</div>
                  )}
                </div>
                <span className="card-index">{String(studyNumber).padStart(2, "0")}</span>
              </div>
            </div>
            <div className="swipe-instruction"><span>← 再学习</span><i>左右滑动卡片</i><span>记住了 →</span></div>
            <div className="answer-actions">
              <button className="again-button" onClick={() => answer(false)}><span>↺</span><b>再学习</b><small>按 ←</small></button>
              <button className="know-button" onClick={() => answer(true)}><span>✓</span><b>记住了</b><small>按 →</small></button>
            </div>
          </section>
        )}

        {screen === "done" && (
          <section className="content done-screen">
            <div className="success-mark">✓</div>
            <span className="mini-label">TODAY COMPLETE</span>
            <h2>今日任务完成！</h2>
            <p>你又向目标靠近了一点。</p>
            <div className="result-card">
              <div><b>{daily}</b><small>学习单词</small></div>
              <div><b>{Math.round((known / daily) * 100)}%</b><small>首次认识</small></div>
              <div><b>{review}</b><small>加入复习</small></div>
            </div>
            <div className="quote-card"><span>“</span><p>Small steps every day lead to big results.<small>每天的一小步，都会带来了不起的改变。</small></p></div>
            <button className="primary-button" onClick={() => setScreen("library")}>回到首页</button>
          </section>
        )}

        {screen === "profile" && (
          <section className="content profile-screen">
            <div className="profile-hero"><span>×</span><h2>本机学习者</h2><p>已连续学习 {user.streak} 天</p><small>无需登录 · 数据仅存在当前设备</small></div>
            <div className="profile-grid"><div><b>{user.totalLearned}</b><small>累计学习</small></div><div><b>{masteryRate}%</b><small>掌握率</small></div><div><b>{user.reviewCount}</b><small>待复习</small></div></div>
            <button className="settings-row" onClick={() => setScreen("plan")}><span>◎</span><b>学习计划</b><small>{daily} 词/天 ›</small></button>
            <button className="settings-row" onClick={() => setScreen("library")}><span>▤</span><b>我的词书</b><small>{library.level} ›</small></button>
            <button className="settings-row" onClick={() => setShowLanguagePacks(true)}><span>♪</span><b>发音语言包</b><small>{languagePack.name} ›</small></button>
            <button className="settings-row danger-row" onClick={resetLocalData}><span>↺</span><b>清空本机记录</b><small>不可恢复 ›</small></button>
          </section>
        )}

        {showLanguagePacks && (
          <div className="language-overlay" role="presentation" onClick={() => setShowLanguagePacks(false)}>
            <section className="language-sheet" role="dialog" aria-modal="true" aria-label="选择发音语言包" onClick={(event) => event.stopPropagation()}>
              <div className="sheet-handle" />
              <h2>发音语言包</h2>
              <p>选择单词和例句的播放口音</p>
              <div className="language-list">
                {languagePacks.map((pack) => (
                  <button key={pack.id} className={pack.id === languagePackId ? "selected" : ""} onClick={() => chooseLanguagePack(pack)}>
                    <span>{pack.badge}</span><p><b>{pack.name}</b><small>{pack.note}</small></p><i>{pack.id === languagePackId ? "✓" : "›"}</i>
                  </button>
                ))}
              </div>
              <button className="sheet-close" onClick={() => setShowLanguagePacks(false)}>完成</button>
            </section>
          </div>
        )}

        {showDefinition && screen === "study" && (
          <div className="definition-overlay" role="presentation" onClick={() => setShowDefinition(false)}>
            <section className="definition-dialog" role="dialog" aria-modal="true" aria-label={`${current.word} 的英文释义`} onClick={(event) => event.stopPropagation()}>
              <button className="definition-close" onClick={() => setShowDefinition(false)} aria-label="关闭英文释义">×</button>
              <span className="mini-label">ENGLISH DEFINITION</span>
              <h2>{current.word}</h2>
              <p>{current.definition}</p>
              <small>{current.part} {current.meaning}</small>
              <button className="definition-done" onClick={() => setShowDefinition(false)}>关闭</button>
            </section>
          </div>
        )}

        {screen !== "study" && screen !== "done" && (
          <nav className="bottom-nav" aria-label="主导航">
            <button className={screen === "library" || screen === "wordlist" || screen === "plan" ? "active" : ""} onClick={() => setScreen("library")}><span>⌂</span><small>学习</small></button>
            <button onClick={() => setScreen("plan")}><span>◷</span><small>复习</small></button>
            <button onClick={() => setScreen("profile")} className={screen === "profile" ? "active" : ""}><span>○</span><small>我的</small></button>
          </nav>
        )}
      </div>
    </main>
  );
}
