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
};

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

const wordBanks: Record<string, Word[]> = {
  primary: [
    { word: "family", phonetic: "/ˈfæməli/", part: "n.", meaning: "家庭；家人", example: "I love my family.", translation: "我爱我的家人。" },
    { word: "happy", phonetic: "/ˈhæpi/", part: "adj.", meaning: "快乐的；高兴的", example: "We are happy today.", translation: "我们今天很开心。" },
    { word: "school", phonetic: "/skuːl/", part: "n.", meaning: "学校", example: "I walk to school.", translation: "我步行去学校。" },
    { word: "friend", phonetic: "/frend/", part: "n.", meaning: "朋友", example: "Amy is my best friend.", translation: "艾米是我最好的朋友。" },
    { word: "beautiful", phonetic: "/ˈbjuːtɪfəl/", part: "adj.", meaning: "美丽的", example: "What a beautiful flower!", translation: "多美的一朵花啊！" },
    { word: "breakfast", phonetic: "/ˈbrekfəst/", part: "n.", meaning: "早餐", example: "Breakfast is ready.", translation: "早餐准备好了。" },
  ],
  junior: [
    { word: "advice", phonetic: "/ədˈvaɪs/", part: "n.", meaning: "建议；忠告", example: "Thank you for your advice.", translation: "谢谢你的建议。" },
    { word: "improve", phonetic: "/ɪmˈpruːv/", part: "v.", meaning: "改善；提高", example: "Reading can improve your English.", translation: "阅读能提高你的英语。" },
    { word: "environment", phonetic: "/ɪnˈvaɪrənmənt/", part: "n.", meaning: "环境", example: "We should protect the environment.", translation: "我们应该保护环境。" },
    { word: "possible", phonetic: "/ˈpɒsəbəl/", part: "adj.", meaning: "可能的", example: "Anything is possible.", translation: "一切皆有可能。" },
    { word: "decision", phonetic: "/dɪˈsɪʒən/", part: "n.", meaning: "决定；选择", example: "It was a difficult decision.", translation: "这是一个艰难的决定。" },
    { word: "knowledge", phonetic: "/ˈnɒlɪdʒ/", part: "n.", meaning: "知识；学问", example: "Knowledge gives us power.", translation: "知识给予我们力量。" },
  ],
  senior: [
    { word: "significant", phonetic: "/sɪɡˈnɪfɪkənt/", part: "adj.", meaning: "重要的；显著的", example: "The project made significant progress.", translation: "这个项目取得了显著进展。" },
    { word: "contribute", phonetic: "/kənˈtrɪbjuːt/", part: "v.", meaning: "贡献；促成", example: "Everyone can contribute to the team.", translation: "每个人都能为团队做贡献。" },
    { word: "opportunity", phonetic: "/ˌɒpəˈtjuːnəti/", part: "n.", meaning: "机会；时机", example: "This is a valuable opportunity.", translation: "这是一个宝贵的机会。" },
    { word: "essential", phonetic: "/ɪˈsenʃəl/", part: "adj.", meaning: "必不可少的", example: "Water is essential for life.", translation: "水对生命至关重要。" },
    { word: "challenge", phonetic: "/ˈtʃælɪndʒ/", part: "n.", meaning: "挑战；难题", example: "She is ready for the challenge.", translation: "她已准备好迎接挑战。" },
    { word: "independent", phonetic: "/ˌɪndɪˈpendənt/", part: "adj.", meaning: "独立的；自主的", example: "He became an independent learner.", translation: "他成为了一名自主学习者。" },
  ],
  daily: [
    { word: "actually", phonetic: "/ˈæktʃuəli/", part: "adv.", meaning: "其实；实际上", example: "Actually, I agree with you.", translation: "其实，我同意你的看法。" },
    { word: "probably", phonetic: "/ˈprɒbəbli/", part: "adv.", meaning: "大概；很可能", example: "I will probably be there at six.", translation: "我大概六点到。" },
    { word: "available", phonetic: "/əˈveɪləbəl/", part: "adj.", meaning: "有空的；可获得的", example: "Are you available this afternoon?", translation: "你今天下午有空吗？" },
    { word: "recommend", phonetic: "/ˌrekəˈmend/", part: "v.", meaning: "推荐；建议", example: "What do you recommend?", translation: "你有什么推荐？" },
    { word: "convenient", phonetic: "/kənˈviːniənt/", part: "adj.", meaning: "方便的", example: "Is this time convenient for you?", translation: "这个时间你方便吗？" },
    { word: "appreciate", phonetic: "/əˈpriːʃieɪt/", part: "v.", meaning: "感激；欣赏", example: "I really appreciate your help.", translation: "我真的很感谢你的帮助。" },
  ],
  cet4: examWords,
  cet6: examWords,
  ielts: examWords,
};

type Screen = "library" | "plan" | "study" | "done" | "profile";

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

  const progress = Math.min(index / Math.max(daily, 1), 1);
  const activeWords = wordBanks[library.id] ?? examWords;
  const current = activeWords[index % activeWords.length];
  const languagePack = languagePacks.find((pack) => pack.id === languagePackId) ?? languagePacks[0];
  const studyNumber = Math.min(index + 1, daily);
  const remainingDays = Math.ceil(library.total / daily);
  const masteryRate = user.totalLearned ? Math.round((user.totalKnown / user.totalLearned) * 100) : 0;

  const selectLibrary = (item: Library) => {
    setLibrary(item);
    setScreen("plan");
  };

  const startStudy = () => {
    window.localStorage.setItem("wordflow-plan", JSON.stringify({ libraryId: library.id, daily }));
    const session = window.localStorage.getItem("wordflow-session-v1");
    const parsed = session ? JSON.parse(session) as LocalSession : null;
    const canResume = parsed?.date === dateKey() && parsed.libraryId === library.id && parsed.daily === daily && parsed.index < daily;
    setIndex(canResume ? parsed.index : 0);
    setKnown(canResume ? parsed.known : 0);
    setReview(canResume ? parsed.review : 0);
    setHasSavedSession(Boolean(canResume));
    setFlipped(false);
    setScreen("study");
  };

  const answer = (remembered: boolean) => {
    if (answerLock.current) return;
    answerLock.current = true;
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
    if (screen === "plan") return "制定计划";
    if (screen === "profile") return "学习档案";
    return "X-says";
  }, [screen]);

  return (
    <main className="page-shell">
      <div className={`phone-app screen-${screen}`}>
        <header className="app-header">
          <button className="icon-button" aria-label="返回" onClick={() => setScreen(screen === "plan" ? "library" : "library")}>
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

        {screen === "plan" && (
          <section className="content plan-screen">
            <div className="step-track"><span style={{ width: "100%" }} /></div>
            <span className="mini-label">第 2 步，共 2 步</span>
            <h2>定一个刚好的节奏</h2>
            <p className="muted">每天坚持一点，比偶尔努力一大步更有用。</p>
            <div className="selected-book">
              <span className={`tiny-cover ${library.tone}`}>{library.level}</span>
              <span><small>当前词书</small><b>{library.title}</b></span>
              <button onClick={() => setScreen("library")}>更换</button>
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
            <button className="primary-button" onClick={startStudy}>开始今日学习 <span>→</span></button>
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
                      <div className="example"><span>EXAMPLE</span><q>{current.example}</q><small>{current.translation}</small><div className="example-actions"><button onClick={(event) => { event.stopPropagation(); speakText(current.example); }}>🔊 听例句</button></div></div>
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

        {screen !== "study" && screen !== "done" && (
          <nav className="bottom-nav" aria-label="主导航">
            <button className={screen === "library" || screen === "plan" ? "active" : ""} onClick={() => setScreen("library")}><span>⌂</span><small>学习</small></button>
            <button onClick={() => setScreen("plan")}><span>◷</span><small>复习</small></button>
            <button onClick={() => setScreen("profile")} className={screen === "profile" ? "active" : ""}><span>○</span><small>我的</small></button>
          </nav>
        )}
      </div>
    </main>
  );
}
