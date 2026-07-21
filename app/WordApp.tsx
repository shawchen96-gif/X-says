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
  { id: "cet4", title: "大学英语四级", subtitle: "打牢基础 · 高频必备", total: 2607, level: "CET-4", tone: "mint" },
  { id: "cet6", title: "大学英语六级", subtitle: "进阶提升 · 真题高频", total: 2078, level: "CET-6", tone: "blue" },
  { id: "ielts", title: "雅思核心词汇", subtitle: "留学备考 · 场景分类", total: 3421, level: "IELTS", tone: "orange" },
];

const words: Word[] = [
  { word: "serendipity", phonetic: "/ˌserənˈdɪpəti/", part: "n.", meaning: "意外发现美好事物的机缘", example: "We met by pure serendipity.", translation: "我们的相遇纯属美好的偶然。" },
  { word: "resilient", phonetic: "/rɪˈzɪliənt/", part: "adj.", meaning: "有韧性的；能快速恢复的", example: "Children can be remarkably resilient.", translation: "孩子们可以表现得极具韧性。" },
  { word: "elaborate", phonetic: "/ɪˈlæbərət/", part: "adj.", meaning: "精心制作的；详尽的", example: "She made an elaborate plan.", translation: "她制定了一份周密的计划。" },
  { word: "subtle", phonetic: "/ˈsʌtəl/", part: "adj.", meaning: "微妙的；不易察觉的", example: "There is a subtle difference.", translation: "其中有一个微妙的差别。" },
  { word: "inevitable", phonetic: "/ɪnˈevɪtəbəl/", part: "adj.", meaning: "不可避免的；必然的", example: "Change is inevitable.", translation: "变化是不可避免的。" },
  { word: "perspective", phonetic: "/pəˈspektɪv/", part: "n.", meaning: "观点；思考问题的角度", example: "Try to see it from my perspective.", translation: "试着从我的角度看它。" },
];

type Screen = "library" | "plan" | "study" | "done" | "profile";

export default function WordApp() {
  const [screen, setScreen] = useState<Screen>("library");
  const [library, setLibrary] = useState<Library>(libraries[0]);
  const [daily, setDaily] = useState(20);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [review, setReview] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  useEffect(() => {
    const saved = window.localStorage.getItem("wordflow-plan");
    if (saved) {
      const parsed = JSON.parse(saved) as { libraryId: string; daily: number };
      setLibrary(libraries.find((item) => item.id === parsed.libraryId) ?? libraries[0]);
      setDaily(parsed.daily);
    }
  }, []);

  const progress = Math.min(index / Math.max(daily, 1), 1);
  const current = words[index % words.length];
  const studyNumber = Math.min(index + 1, daily);
  const remainingDays = Math.ceil(library.total / daily);

  const selectLibrary = (item: Library) => {
    setLibrary(item);
    setScreen("plan");
  };

  const startStudy = () => {
    window.localStorage.setItem("wordflow-plan", JSON.stringify({ libraryId: library.id, daily }));
    setIndex(0);
    setKnown(0);
    setReview(0);
    setFlipped(false);
    setScreen("study");
  };

  const answer = (remembered: boolean) => {
    if (remembered) setKnown((value) => value + 1);
    else setReview((value) => value + 1);
    if (index + 1 >= daily) {
      setScreen("done");
    } else {
      setDragX(remembered ? 520 : -520);
      window.setTimeout(() => {
        setIndex((value) => value + 1);
        setFlipped(false);
        setDragX(0);
      }, 180);
    }
  };

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(current.word);
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
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
    return "WordFlow";
  }, [screen]);

  return (
    <main className="page-shell">
      <div className={`phone-app screen-${screen}`}>
        <header className="app-header">
          <button className="icon-button" aria-label="返回" onClick={() => setScreen(screen === "plan" ? "library" : "library")}>
            {screen === "library" ? <span className="brand-dot">W</span> : <span aria-hidden="true">‹</span>}
          </button>
          <div>
            <p className="eyebrow">WORD FLOW</p>
            <h1>{title}</h1>
          </div>
          <button className="streak" aria-label="连续学习 7 天"><span aria-hidden="true">◆</span> 7</button>
        </header>

        {screen === "library" && (
          <section className="content library-screen">
            <div className="welcome-copy">
              <span className="mini-label">第 1 步，共 2 步</span>
              <h2>今天想背哪本？</h2>
              <p>选一本适合你当前目标的词书</p>
            </div>
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
                <span className={`swipe-stamp left ${dragX < -30 ? "show" : ""}`}>再学习</span>
                <span className={`swipe-stamp right ${dragX > 30 ? "show" : ""}`}>认识了</span>
                <div className="word-main">
                  <span className="word-tag">{library.level}</span>
                  <h2>{current.word}</h2>
                  <button className="sound-button" onClick={(event) => { event.stopPropagation(); speak(); }} aria-label="播放发音">♪</button>
                  <p className="phonetic">{current.phonetic}</p>
                  {flipped ? (
                    <div className="definition reveal">
                      <p><b>{current.part}</b> {current.meaning}</p>
                      <div className="example"><span>EXAMPLE</span><q>{current.example}</q><small>{current.translation}</small></div>
                    </div>
                  ) : (
                    <div className="tap-hint"><span>↻</span> 点击卡片查看释义</div>
                  )}
                </div>
                <span className="card-index">{String(studyNumber).padStart(2, "0")}</span>
              </div>
            </div>
            <div className="swipe-instruction"><span>← 模糊</span><i>左右滑动卡片</i><span>认识 →</span></div>
            <div className="answer-actions">
              <button className="again-button" onClick={() => answer(false)}><span>↺</span><b>再学习</b><small>按 ←</small></button>
              <button className="know-button" onClick={() => answer(true)}><span>✓</span><b>认识了</b><small>按 →</small></button>
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
            <div className="profile-hero"><span>W</span><h2>学习者</h2><p>已连续学习 7 天</p></div>
            <div className="profile-grid"><div><b>142</b><small>累计学习</small></div><div><b>86%</b><small>掌握率</small></div></div>
            <button className="settings-row" onClick={() => setScreen("plan")}><span>◎</span><b>学习计划</b><small>{daily} 词/天 ›</small></button>
            <button className="settings-row" onClick={() => setScreen("library")}><span>▤</span><b>我的词书</b><small>{library.level} ›</small></button>
          </section>
        )}

        {screen !== "study" && screen !== "done" && (
          <nav className="bottom-nav" aria-label="主导航">
            <button className={screen === "library" || screen === "plan" ? "active" : ""} onClick={() => setScreen("library")}><span>⌂</span><small>学习</small></button>
            <button onClick={() => setScreen("plan")}><span>◷</span><small>复习</small></button>
            <button onClick={() => setScreen("profile")} className={screen === "profile" ? "active" : ""}><span>○</span><small>我的</small></button>
          </nav>
        )}
      </div>
      <aside className="desktop-note">
        <span className="note-logo">W</span>
        <h2>把零碎时间<br />变成词汇量</h2>
        <p>选词书 · 定节奏 · 滑卡学习</p>
        <div className="gesture-demo"><span>←</span><i />
          <span>→</span></div>
        <small>支持鼠标拖动、触屏滑动与键盘方向键</small>
      </aside>
    </main>
  );
}
