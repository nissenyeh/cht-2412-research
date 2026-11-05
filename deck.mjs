// 公司研究讀書會 · 中華電信（2412）：沿用聯發科那份的「Visa ROIC」風格（白底黑字、單一藍 #0360F0、細黑框卡片、藍字結論）
// 重建：officeknife create deck.mjs --out 中華電信_2412.pptx --png <預覽資料夾>
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
export default function ({ col, row, text, shape, chart, image: rawImage }) {
  const GRAY = "8A8A8A", LGRAY = "D9D9D9", BLUE = "0360F0", LBLUE = "DCE8FD", INK = "000000", WHITE = "FFFFFF";
  const W = 840; // 960 − 左右 padding 60×2
  const IMG = decodeURIComponent(new URL("./img/", import.meta.url).pathname);
  const HERE = decodeURIComponent(new URL("./", import.meta.url).pathname);
  // 照片先裁成框的長寬比（png、logo 不裁），快取在 img/_crop/
  const image = (path, o = {}) => {
    if (o.fit === "cover" && o.w && o.h && /\.jpe?g$/i.test(path)) {
      const dir = IMG + "_crop/"; if (!existsSync(dir)) mkdirSync(dir);
      const r = (o.w / o.h).toFixed(2), name = path.split("/").pop().replace(/\.jpe?g$/i, `_${r}.jpg`);
      if (!existsSync(dir + name)) execSync(`uv run -q --with pillow python3 "${HERE}crop.py" "${path}" "${dir + name}" ${o.w} ${o.h}`);
      return rawImage(dir + name, { ...o, fit: "contain" });
    }
    return rawImage(path, o);
  };


  // ── 共用元件（同讀書會提案） ─────────────────────────────
  const page = (...kids) => col({ pad: [38, 60, 26, 60] }, ...kids);
  const gap = (h) => col({ h });
  const eyebrow = (t) => text(t, { size: 12, color: GRAY, charSpacing: 2 });
  const heading = (t, size = 30) => text(t, { size, bold: true, color: INK });
  const sub = (t) => text(t, { size: 12, color: GRAY, lineSpacingMultiple: 1.2 });
  const takeaway = (t) =>
    col({ grow: 1, justify: "end" }, text(t, { size: 16, bold: true, color: BLUE, align: "center" }));
  const source = (t) => text(t, { size: 8.5, color: GRAY });
  const header = (eb, h, s) => [eyebrow(eb), gap(8), heading(h), gap(6), sub(s), gap(16)];

  const card = (w, h, pad, ...kids) =>
    col({ layer: true, w, h },
      shape({ geom: "rect", x: 0, y: 0, w, h, line: { color: INK, width: 0.75 } }),
      col({ x: 0, y: 0, w, h, pad, gap: 6 }, ...kids));

  const bullets = (items, w, size = 12) =>
    col({ gap: 7 }, ...items.map((t) =>
      row({ gap: 6 },
        text("—", { size, color: BLUE, w: 20 }),
        text(t, { size, color: INK, w: w - 26, lineSpacingMultiple: 1.25 }))));

  const numTitle = (n, t, w, size = 18) =>
    row({ gap: 10, align: "end" },
      text(n, { size: size + 8, bold: true, color: BLUE, w: 44 }),
      text(t, { size, bold: true, color: INK, w: w - 54 }));

  // 絕對座標小工具（只用在示意圖的 layer 裡）
  const rect = (x, y, w, h, o = {}) =>
    shape({ geom: "rect", x, y, w, h, fill: o.fill, line: o.line === undefined ? { color: INK, width: 0.75 } : o.line });
  const label = (x, y, w, h, t, o = {}) => {
    const size = o.size || 11;
    const lines = String(t).split("\n").length;
    return text(t, { x, y: y + (h - size * 1.3 * lines) / 2, w, size, bold: o.bold, color: o.color || INK, align: o.align || "center", lineSpacingMultiple: 1.05 });
  };
  const box = (x, y, w, h, t, o = {}) => [rect(x, y, w, h, o), label(x, y, w, h, t, o)];
  const hl = (x, y, w, c = BLUE, t = 1.5) => shape({ geom: "rect", x, y, w, h: t, fill: c, line: { color: c, width: 0 } });
  const vl = (x, y, h, c = BLUE, t = 1.5) => shape({ geom: "rect", x, y, w: t, h, fill: c, line: { color: c, width: 0 } });

  // 橫條（自己畫，配色才不會跑掉）
  const hbar = (items, w, max, o = {}) =>
    col({ gap: o.gap || 10 }, ...items.map(([name, v, txt, hi]) => {
      const LW = o.labelW || 110, VW = o.valueW || 70, BW = w - LW - VW - 16;
      return row({ gap: 8, align: "center" },
        text(name, { size: o.size || 12, bold: hi, color: INK, w: LW }),
        row({ w: BW, h: o.h || 18, align: "center" },
          shape({ geom: "rect", w: Math.max(2, (BW * v) / max), h: o.h || 18, fill: hi ? BLUE : (o.color || INK), line: { color: hi ? BLUE : (o.color || INK), width: 0 } })),
        text(txt, { size: o.size || 12, bold: true, color: hi ? BLUE : INK, w: VW }));
    }));

  const photo = (file, w, h, cap, fit = "cover") =>
    col({ w, gap: 3 },
      image(IMG + file, { w, h, fit }),
      cap ? text(cap, { size: 8.5, color: GRAY, w }) : gap(0));
  const legend = (c, t, w = 200) => row({ gap: 6, align: "center" }, shape({ geom: "rect", w: 12, h: 12, fill: c, line: { color: c, width: 0 } }), text(t, { size: 11, w }));
  // 表格列（三欄比較表共用）
  const trow = (cws, cells, o = {}) =>
    col({ gap: 0 },
      row({ gap: 0, align: "center", h: o.h || 34 },
        ...cells.map((c, j) => text(c, {
          size: o.head ? 10.5 : (o.sizes ? o.sizes[j] : 11.5),
          bold: !o.head && (j === 0 || (o.boldCol === j)),
          color: o.head ? GRAY : (o.colors ? o.colors[j] : INK),
          w: cws[j], pad: j < cells.length - 1 ? [0, 12, 0, 0] : 0, lineSpacingMultiple: 1.15,
        }))),
      shape({ geom: "rect", w: cws.reduce((a, b) => a + b, 0), h: o.head ? 0.75 : 0.5, fill: o.head ? INK : LGRAY, line: { color: LGRAY, width: 0 } }));


  // ── 共用：直條圖（自己畫，[標籤, 數值, 樣式, 顯示文字]；樣式 true＝藍、"e"＝灰色預估） ──
  const vbars = (data, w, h, o = {}) => {
    const n = data.length, slot = w / n, bw = Math.min(o.bw || 40, slot * 0.7);
    const max = o.max || Math.max(...data.map((d) => d[1])) * 1.3;
    const kids = [hl(0, h, w, INK, 0.75)];
    data.forEach(([lbl, v, k, t], i) => {
      const x = i * slot + (slot - bw) / 2, bh = (v / max) * h;
      const c = k === true ? BLUE : k === "e" ? GRAY : INK;
      kids.push(rect(x, h - bh, bw, bh, { fill: c, line: { color: WHITE, width: 0 } }));
      kids.push(text(t ?? String(v), { x: x - 14, y: h - bh - 14, w: bw + 28, size: o.size || 9.5, bold: true, color: k === true ? BLUE : INK, align: "center" }));
      kids.push(text(lbl, { x: x - 14, y: h + 3, w: bw + 28, size: o.size || 9.5, color: INK, align: "center" }));
    });
    return col({ layer: true, w, h: h + 16 }, ...kids);
  };
  const tiny = (t, w) => text(t, { size: 9.5, color: GRAY, w });

  // ── 段落（目錄與轉場頁共用） ─────────────────────────────
  const SEC = [
    ["公司概覽", "Company Overview", "從電信總局到民營公司：業務、歷史、成功關鍵", "hq-xinyi-1.jpg", "台北信義路中華電信總部｜Wikimedia, Yu tptw, CC BY-SA 4.0"],
    ["管理層與治理", "Leadership", "交通部怎麼管：董事長、總經理、經營團隊", "exec-chien-chihcheng.jpg", "董事長 簡志誠｜工商時報"],
    ["行動通信", "Mobile", "三雄之首：用戶 × ARPU，5G 升級", "bts-1.jpg", "中華電信行動基地台｜Wikimedia, 玄史生, CC0"],
    ["固網寬頻", "Fixed Broadband", "光纖、市話、MOD：現金牛，但市占慢慢被分走", "fiber-distribution-box.jpg", "電線桿上的光纖配線盒｜Wikimedia, Solomon203, CC BY-SA 4.0"],
    ["企業 ICT", "Enterprise ICT", "雲端、機房、資安：營收成長最快的一塊", "idc-banqiao-exterior.jpg", "板橋 IDC 機房｜Wikimedia, Tele2020, CC BY-SA 4.0"],
    ["AI 布局", "AI Strategy", "AI 部門、業務、目標，以及對手怎麼做", "ai-datacenter-immersion-cooling-vertiv.jpg", "AI 伺服器浸沒式液冷測試（與 Vertiv 合作）｜工商時報"],
    ["競爭總覽", "Competition", "三家電信、有線電視、外商雲：誰在哪個戰場", null, null],
    ["財務表現", "Financials", "營收結構、財測達成、配息與資本支出", null, null],
    ["財務模型與估值", "Model & Valuation", "量價拆解、2027 年三情境與估值", null, null],
  ];
  const LWD = 350, RWD = W - LWD - 40;
  const sectionMap = (k, eb) => {
    const [name, en, d, img, cap] = SEC[k - 1];
    return page(
      row({ grow: 1, gap: 40, align: "center" },
        col({ w: LWD, gap: 0 },
          eyebrow(eb || `第 ${k} 段，共 ${SEC.length} 段`),
          gap(10),
          text(`0${k}`, { size: img ? 60 : 84, bold: true, color: BLUE }),
          heading(name, img ? 34 : 40),
          gap(4),
          text(en.toUpperCase(), { size: 12, bold: true, color: GRAY, charSpacing: 2 }),
          gap(10),
          text(d, { size: 12.5, color: INK, w: LWD, lineSpacingMultiple: 1.35 }),
          ...(img && !eb ? [gap(12), photo(img, LWD, 112, cap)] : [])),
        col({ w: RWD, gap: 0 },
          ...SEC.map(([q, en2, d2], i) => {
            const n = i + 1, cur = n === k, done = n < k;
            const c = cur ? BLUE : done ? LGRAY : INK;
            return col({ gap: 0 },
              row({ gap: 12, align: "center", h: 49 },
                shape({ geom: "rect", w: 4, h: 32, fill: cur ? BLUE : WHITE, line: { color: cur ? BLUE : WHITE, width: 0 } }),
                text(`0${n}`, { size: 16, bold: true, color: cur ? BLUE : done ? LGRAY : GRAY, w: 36 }),
                col({ w: RWD - 64, gap: 1 },
                  row({ gap: 10, align: "end" },
                    text(q, { size: 15, bold: true, color: c }),
                    text(en2, { size: 9.5, bold: true, color: cur ? BLUE : done ? LGRAY : GRAY, charSpacing: 1, w: 200 })),
                  text(d2, { size: 10, color: cur ? INK : done ? LGRAY : GRAY, w: RWD - 64 }))),
              shape({ geom: "rect", w: RWD, h: 0.5, fill: LGRAY, line: { color: LGRAY, width: 0 } }));
          }))));
  };
  const div1 = sectionMap(1, "目錄 · Agenda");
  const div2 = sectionMap(2), div3 = sectionMap(3), div4 = sectionMap(4), div5 = sectionMap(5), div6 = sectionMap(6), div8 = sectionMap(8), div9 = sectionMap(9);

  // ── 封面 ─────────────────────────────────────────────────
  const cover = page(
    row({ grow: 1, gap: 30, align: "center" },
      col({ w: 520, gap: 0 },
        image(IMG + "cht-logo.png", { w: 200, h: 44, fit: "contain" }),
        gap(22),
        eyebrow("公司研究讀書會"),
        gap(12),
        heading("中華電信 Chunghwa Telecom（2412）", 36),
        gap(12),
        text("台灣最大的電信公司、交通部是最大股東：\n九年沒長的類公用事業，正在靠機房和 AI 重新成長", { size: 19, color: INK, w: 520, lineSpacingMultiple: 1.3 }),
        gap(30),
        row({ gap: 0 },
          shape({ geom: "rect", w: 4, h: 18, fill: BLUE, line: { color: BLUE, width: 0 } }),
          text("公司概覽 · 管理層 · 行動 · 固網 · 企業 ICT · AI · 競爭 · 財務 · 估值", { size: 12.5, bold: true, color: BLUE, w: 510, pad: [0, 0, 0, 8] }))),
      photo("hq-xinyi-1.jpg", 290, 200, "台北信義路中華電信總部｜Wikimedia, Yu tptw, CC BY-SA 4.0")),
    source("資料截至 2026/11/05；財報至 2026 Q3（公司自結），月營收至 2026 年 9 月"));

  // ── 一頁看懂 ─────────────────────────────────────────────
  const CW2 = (W - 40) / 3;
  const stat = (big, unit, lbl, note) =>
    card(CW2, 168, [18, 20, 16, 20],
      row({ gap: 4, align: "end" },
        text(big, { size: 54, bold: true, color: BLUE }),
        text(unit, { size: 18, bold: true, color: INK })),
      text(lbl, { size: 15, bold: true, color: INK, w: CW2 - 40 }),
      text(note, { size: 11, color: GRAY, w: CW2 - 40, lineSpacingMultiple: 1.25 }));
  const summary = page(
    ...header("一頁看懂", "電信本業穩穩收租，機房和 AI 讓它重新長大",
      "中華電信＝手機門號＋家裡光纖＋企業專線與機房；ICT（Information and Communication Technology，資通訊：雲端、機房、資安）是新引擎"),
    row({ gap: 20 },
      stat("41", "%", "行動營收市占，三家第一", "2026 Q3；台灣大、遠傳各約 29%。2023 年 5 家併成 3 家後，價格戰結束"),
      stat("78", "%", "台灣機房（IDC）市占", "2026 Q2，含子公司是方電訊；AI 資料中心需求帶動 IDC 營收 +26%"),
      stat("+20", "%", "企業 ICT 營收年增", "2026 前三季；雲端 +45%、IDC +26%、資安 +22%（Q3）。電信本業只長 1–3%")),
    gap(16),
    card(W, 58, [10, 22, 10, 22],
      row({ gap: 16, align: "center", grow: 1 },
        text("一句話", { size: 16, bold: true, color: INK, w: 70 }),
        text("過去九年營收一年只長 0.3%、賺多少就發多少股利；2026 年 ICT 和機房讓營收長 11%，市場給它 5 年最高的本益比（31.7 倍）", { size: 13, color: INK, w: W - 44 - 86 }))),
    takeaway("看中華電信＝看兩條線：電信本業（現金牛）＋ ICT／AI（新引擎）"),
    source("行動市占：2026 Q3 法說（NCC 口徑）；台灣大、遠傳：新聞彙整（2025 Q3）；IDC：2026 Q2 法說 Q&A；ICT：2026 Q3 財務分析表與法說；本益比：證交所 2026/11/05（近四季至 2026 Q2）"));

  // ── 01 公司介紹 ───────────────────────────────────────────
  const LW3 = 290, RW3 = W - LW3 - 20;
  const fact = (k, v) =>
    row({ gap: 8 },
      text(k, { size: 10.5, color: GRAY, w: 62 }),
      text(v, { size: 10.5, color: INK, w: LW3 - 70, lineSpacingMultiple: 1.15 }));
  const PW3 = 110;
  const product = (img, name, share, what, who, hi) =>
    card(RW3, 74, [6, 12, 6, 8],
      row({ gap: 12, align: "center" },
        image(IMG + img, { w: PW3, h: 62, fit: "cover" }),
        col({ w: 70, gap: 2 },
          text(share, { size: 20, bold: true, color: hi ? BLUE : INK }),
          text("2025 營收占比", { size: 8.5, color: GRAY })),
        col({ w: RW3 - 20 - PW3 - 70 - 24, gap: 2 },
          text(name, { size: 13.5, bold: true, color: INK }),
          text(what, { size: 10, color: INK, lineSpacingMultiple: 1.15 }),
          text(who, { size: 9.5, color: GRAY, lineSpacingMultiple: 1.15 }))));
  const intro = page(
    ...header("01 公司概覽 · 公司介紹", "台灣最大的電信公司，交通部仍是最大股東",
      "1996 年從交通部電信總局分出來，2005 年政府持股降到 5 成以下、正式民營化；董事長和總經理仍由交通部推派"),
    row({ gap: 20 },
      col({ w: LW3, gap: 5 },
        photo("exec-chien-chihcheng.jpg", LW3, 112, "董事長 簡志誠｜工商時報"),
        gap(2),
        fact("成立", "1996/7/1，電信總局公司化"),
        fact("經營層", "董事長 簡志誠、總經理 林榮賜（見 02 段）"),
        fact("大股東", "交通部 35.3%；政府合計 40.8%"),
        fact("上市", "2000 年台股 2412；2003 年紐約 ADR"),
        fact("員工", "集團 3.26 萬人；母公司 2.04 萬人"),
        fact("規模", "2025 營收 2,361 億元、EPS 4.99 元")),
      col({ gap: 8 },
        product("bts-1.jpg", "03　行動通信", "29%", "手機門號月租、5G、漫遊；1,351 萬門號", "三家第一：營收市占 41%", false),
        product("fiber-distribution-box.jpg", "04　固網（寬頻、市話、MOD、企業專線）", "34%", "光世代 393 萬戶、市話 844 萬戶、MOD 198 萬戶", "最大的一塊，但幾乎不長（+0.5%）", false),
        product("idc-banqiao-exterior.jpg", "05＋06　ICT（雲端、機房、資安、AI）", "15%", "企業與政府的 IT 專案、機房出租、資安服務", "成長最快：2026 前三季 +25%", true),
        product("store-signage.jpg", "銷貨（手機等設備）", "16%", "門市賣 iPhone 等手機，搭配門號", "營收大、毛利低；不另開段", false))),
    takeaway("營收三分之二是電信本業；成長靠右下那塊 ICT"),
    source("來源：中華電信 2025 年報、20-F FY2025（員工）、2026 Q3 財務分析表與月報；占比＝各事業群同類業務加總（行動 685、固網 815、ICT 345、銷貨 385 億）÷ 2,361 億，其餘 6% 為其他"));

  // ── 01 用在哪裡：你身邊哪裡有中華電信 ─────────────────────
  const CW3a = (W - 30) / 4;
  const market = (img, name, what, share, shareLbl, trend, hi) =>
    col({ w: CW3a, gap: 6 },
      image(IMG + img, { w: CW3a, h: 100, fit: "cover" }),
      text(name, { size: 15, bold: true, color: hi ? BLUE : INK, w: CW3a }),
      text(what, { size: 10, color: GRAY, w: CW3a, lineSpacingMultiple: 1.25 }),
      row({ gap: 4, align: "end" },
        text(share, { size: 22, bold: true, color: hi ? BLUE : INK }),
        text(shareLbl, { size: 9, color: GRAY })),
      text(trend, { size: 10.5, color: INK, w: CW3a, lineSpacingMultiple: 1.3 }));
  const endMarkets = page(
    ...header("01 公司概覽 · 客戶是誰", "四種客人：家庭、企業、國際，加上集團子公司",
      "公司按「客人是誰」分三個事業群；同一條光纖，賣給家庭叫寬頻，賣給企業叫專線"),
    row({ gap: 10 },
      market("store-signage.jpg", "個人家庭", "手機門號、家用光纖、MOD、手機銷售", "61%", "2025 營收占比", "利潤主力：稅前 313 億，占 62%"),
      market("idc-nangang.jpg", "企業客戶", "企業專線、雲端、機房、資安、智慧城市專案", "33%", "2025 營收占比", "ICT 成長快，但稅前利益兩年從 144 億降到 125 億", true),
      market("cable-laying-matsu4.jpg", "國際電信", "海纜、國際電路、海外子公司、美國建廠專案", "4%", "2025 營收占比", "2026 前三季 +31%：美國德州 AI 供應鏈建廠專案"),
      market("hq-xinyi-2.jpg", "其他（子公司）", "中華精測（探針卡）、光世代建設（不動產）等", "3%", "2025 營收占比", "2026 Q3 不動產一次性收益，單季 73 億")),
    gap(8),
    text("沒有：自己的手機品牌、有線電視（第四台，那是凱擘、中嘉等業者）；外商雲端（AWS、Google、微軟）是合作也是對手", { size: 10.5, color: GRAY }),
    takeaway("賺錢靠家庭客人，成長靠企業客人"),
    source("營收與稅前利益：20-F FY2025 附註 44（部門資訊，外部營收）；2026：2026 Q3 財務分析表與法說；「其他」2026 Q3 72.8 億含子公司資產活化一次性收益；\n照片：工商時報、Wikimedia（Solomon203, CC BY-SA 4.0；信義路總部 CC BY-SA 3.0）、新頭殼"));

  // ── 01 公司怎麼說：年報與法說會的敘事、KPI ──────────────
  const NLW = 404, NRW = W - NLW - 24;
  const story = (n, t, q, src) => card(NLW, 74, [7, 12, 7, 12],
    row({ gap: 8, align: "end" },
      text(n, { size: 16, bold: true, color: BLUE, w: 20 }),
      text(t, { size: 12.5, bold: true, w: NLW - 24 - 28 })),
    text(`「${q}」${src}`, { size: 9.5, color: GRAY, w: NLW - 24, lineSpacingMultiple: 1.2 }));
  const KPIW = [100, NRW - 100];
  const kpi = (k, v) => trow(KPIW, [k, v], { h: 29, sizes: [10.5, 10.5], colors: [INK, INK] });
  const narrative = page(
    ...header("01 公司概覽 · 公司怎麼說", "公司想讓市場相信：本業穩、ICT 快、AI 機房開始賺錢",
      "年報致股東信和每季法說會反覆講同樣三件事；每季追著報的 KPI，就是它要你盯的數字"),
    row({ gap: 24 },
      col({ w: NLW, gap: 7 },
        row({ gap: 10, align: "center" },
          image(IMG + "exec-lin-jungssu.jpg", { w: 110, h: 60, fit: "cover" }),
          text("總經理林榮賜每季法說會開場都講這三件事｜照片：中華電信（工商時報）", { size: 9.5, color: GRAY, w: NLW - 120, lineSpacingMultiple: 1.25 })),
        story("1", "三大引擎：電信本業、資通訊、子公司", "電信核心業務穩健成長、資通訊新興業務動能強勁，以及集團子公司貢獻提升等三大引擎", "（2025 年報）"),
        story("2", "AI 基礎建設開始變現", "we continued to monetize our AI infrastructure… particularly driven by AI data centers", "（2026 Q1 法說）"),
        story("3", "財測保守，年年超越", "we are quite confident that we will exceed our full-year forecasts", "（2026 Q3 法說）")),
      col({ w: NRW, gap: 0 },
        text("公司每季追著報的 KPI（最新一季）", { size: 11.5, bold: true }),
        gap(6),
        trow(KPIW, ["KPI", "公司揭露的數字"], { head: true, h: 18 }),
        kpi("行動營收市占", "41.2%（用戶市占 39.9%：賺得比人數多）"),
        kpi("月租 ARPU", "573 元，年增 2%；智慧機 5G 滲透率 49.6%"),
        kpi("寬頻 ARPU", "822 元；300M 以上用戶占 43%"),
        kpi("ICT 各項年增", "雲端 +45%、IDC +26%、資安 +22%、AIoT +14%"),
        kpi("ICT 新簽約", "前三季已是 2025 全年的 1.4 倍"),
        kpi("財測達成率", "前三季 EPS 4.25 元，達財測 116–119%"),
        kpi("股東回饋", "2025 股利 5.2 元，配發率 104%"))),
    takeaway("讀的時候要注意：公司少講企業事業群利潤在下滑、Q3 一次性收益有多大"),
    source("2025 年報〈致股東報告書〉p.3；2026 Q1、Q3 法說會逐字稿；KPI：2026 Q3 簡報與新聞稿；企業客戶稅前 143.6 億（2023）→ 125.0 億（2025）：20-F 附註 44；\nQ3 一次性收益：公司只說「子公司資產活化」，未揭露金額"));

  // ── 01 公司背景（過渡頁） ─────────────────────────────────
  const BG3 = [
    ["發展歷史", "從政府機關到民營公司：每一次轉折都跟著政策和對手走"],
    ["成功關鍵", "繼承來的網路＋每一代都買最好的頻譜＋公股帶來的信任"],
    ["誰訂的規則", "NCC 發執照、拍賣頻譜、管資費；交通部是大股東"],
    ["營收與利潤結構", "營收靠 ICT 長大，利潤還是靠家庭客人"],
  ];
  const bgDiv = page(
    row({ grow: 1, gap: 40, align: "center" },
      col({ w: LWD, gap: 0 },
        eyebrow("01 公司概覽 · 公司背景"),
        gap(10),
        heading("公司背景", 40),
        gap(4),
        text("BACKGROUND", { size: 12, bold: true, color: GRAY, charSpacing: 2 }),
        gap(10),
        text("進各業務之前，先看它怎麼走到今天：從電信總局、民營化、價格戰，到五家變三家", { size: 12.5, color: INK, w: LWD, lineSpacingMultiple: 1.35 }),
        gap(12),
        photo("history-1st-logo.jpg", LWD, 120, "中華電信第一代商標（1996 公司化後）｜Wikimedia, Solomon203, CC BY 3.0")),
      col({ w: RWD, gap: 0 },
        ...BG3.map(([t, d], i) => col({ gap: 0 },
          row({ gap: 14, align: "center", h: 70 },
            text(`${i + 1}`, { size: 22, bold: true, color: BLUE, w: 30 }),
            col({ w: RWD - 50, gap: 3 },
              text(t, { size: 17, bold: true, color: INK }),
              text(d, { size: 10.5, color: GRAY, w: RWD - 50 }))),
          shape({ geom: "rect", w: RWD, h: 0.5, fill: LGRAY, line: { color: LGRAY, width: 0 } }))))));

  // ── 01 發展歷史（每個轉折附當時環境） ─────────────────────
  const HIST_PHOTOS = [
    ["history-payphone-dgt-lightbox.jpg", "電信局時代的公用電話招牌｜Wikimedia, Solomon203, CC BY 3.0"],
    ["nyse-adr-2003-crop.jpg", "2003 紐約證交所 ADR 掛牌敲鐘｜數位時代"],
    ["5g-launch-2020-stage.jpg", "2020/6/30 5G 開台典禮｜Wikimedia, 總統府, CC BY 2.0"],
    ["idc-banqiao-exterior.jpg", "板橋 IDC 機房｜Wikimedia, Tele2020, CC BY-SA 4.0"],
  ];
  const MILESTONES = [
    ["1996", "公司化", "電信總局分成監理機關和中華電信；政府 100% 持股", "環境：電信自由化，準備開放民營", false],
    ["2000", "上市", "台股 2412；同年固網開放，三家新固網進場", "環境：政府釋股籌財源", false],
    ["2005", "民營化", "政府持股降到 5 成以下；2003 年已在紐約上市", "環境：新固網業者都沒做起來", true],
    ["2014", "4G 首家開台", "2013 年花 391 億買 4G 頻譜，拿滿上限", "環境：台灣之星、亞太開始低價搶客", false],
    ["2018", "價格戰", "499 吃到飽；行動 ARPU 從 595 掉到 506 元，營收 −5%", "環境：5 家搶 2,300 萬人", false],
    ["2020", "5G", "花 484 億買最多、位置最好的 3.5GHz 頻譜", "環境：5G 標金總額 1,422 億，業界說太貴", false],
    ["2023", "五家變三家", "台灣大併台灣之星、遠傳併亞太；價格戰結束", "環境：小業者付不起 5G 投資", true],
    ["2026", "AI 機房", "崙坪 AI 資料中心啟用；營收前三季 +11%", "環境：AI 帶動機房、資安需求", true],
  ];
  const MW = (W - 7 * 8) / 8;
  const history = page(
    ...header("01 公司概覽 · 發展歷史", "三十年三個轉折：民營化、價格戰、五家變三家",
      "中華電信本身變化不大，是周圍的規則和對手一直在變；藍點是改變產業格局的事件"),
    col({ layer: true, w: W, h: 22 },
      hl(0, 10, W, INK, 0.75),
      ...MILESTONES.map((m, i) => shape({ geom: "ellipse", x: i * (MW + 8) + 2, y: 4, w: 13, h: 13, fill: m[4] ? BLUE : WHITE, line: { color: m[4] ? BLUE : INK, width: 1 } }))),
    gap(8),
    row({ gap: 8 }, ...MILESTONES.map(([y, t, n, env, hi]) =>
      col({ w: MW, gap: 4 },
        text(y, { size: 19, bold: true, color: hi ? BLUE : INK }),
        text(t, { size: 12.5, bold: true, color: INK, w: MW }),
        text(n, { size: 9.5, color: INK, w: MW, lineSpacingMultiple: 1.2 }),
        text(env, { size: 9, color: GRAY, w: MW, lineSpacingMultiple: 1.2 })))),
    gap(10),
    row({ gap: 10 }, ...HIST_PHOTOS.map(([f, cap]) => photo(f, (W - 30) / 4, 84, cap))),
    takeaway("中華電信的好日子，多半是對手變少的時候"),
    source("來源：20-F FY2018／FY2025（公司化、上市、民營化、頻譜金額、2023 合併、ARPU）；年報；維基百科（2000 固網開放、2014 4G 開台日期）；\n499 價格戰為新聞報導；5G 標金總額：公視、工商時報"));

  // ── 01 成功關鍵：環境推了一把＋公司自己的選擇＋對手為什麼沒做 ──
  const KCW = (W - 36) / 4;
  const ksf = (n, t, env, own, rival, img, cap) => card(KCW, 300, [0, 0, 8, 0],
    photo(img, KCW, 70, ""),
    col({ pad: [0, 10, 0, 10], gap: 5 },
      row({ gap: 6, align: "end" },
        text(n, { size: 18, bold: true, color: BLUE, w: 20 }),
        text(t, { size: 13, bold: true, w: KCW - 20 - 26 })),
      ...[["環境", env], ["自己的選擇", own], ["對手為什麼沒有", rival]].map(([k, v]) => col({ gap: 1 },
        text(k, { size: 8.5, bold: true, color: k === "自己的選擇" ? BLUE : GRAY }),
        text(v, { size: 9.5, color: INK, w: KCW - 20, lineSpacingMultiple: 1.2 }))),
      text(cap, { size: 8, color: GRAY, w: KCW - 20 })));
  const keySuccess = page(
    ...header("01 公司概覽 · 成功關鍵", "三十年守住第一：先天的網路、敢花錢、被信任",
      "每一點都拆成兩半：環境推了一把（不是它能決定的），加上公司自己做的選擇"),
    row({ gap: 12 },
      ksf("1", "繼承全國網路", "1996 年公司化時，直接接手電信總局的管道、機房、銅線",
        "早早把銅線換成光纖：光世代 393 萬戶，1G 覆蓋率 94%",
        "2000 年三家新固網要自己挖路、長期虧損，後來都併進大集團", "fiber-distribution-box.jpg", "光纖配線盒｜Wikimedia, Solomon203, CC BY-SA 4.0"),
      ksf("2", "每一代都花最多錢", "NCC 用拍賣發頻譜，價格越標越高",
        "4G 拿滿上限（391 億）、5G 買最多最好的 3.5GHz（484 億）",
        "亞太沒標 3.5GHz、台灣之星只標 40MHz，網路品質追不上，2023 年被併", "bts-5g-antenna.jpg", "4G、5G 基地台天線｜中華電信（iThome）"),
      ksf("3", "撐過價格戰", "2014–2019 年 5 家搶客，499 吃到飽讓 ARPU 掉 15%",
        "跟著降價守住用戶，但沒退出高價方案；合併後先漲回來",
        "小業者以低價換用戶，用戶有了、錢沒賺到，付不起 5G", "store-signage.jpg", "中華電信門市｜工商時報"),
      ksf("4", "公股帶來的信任", "政府、銀行、醫院的資料要放在台灣，還要找信得過的廠商",
        "機房、資安獨立成子公司：IDC 市占 78%、政府資安共同供應契約約 4 成",
        "外商雲沒有在地機房和監管關係；民營電信機房規模小", "idc-banqiao-exterior.jpg", "板橋 IDC｜Wikimedia, Tele2020, CC BY-SA 4.0")),
    takeaway("成功公式：先天網路 × 每代砸最多錢 × 被政府信任 → 客人願意多付一點錢"),
    source("自己的歸納（不是公司說法）；光世代、1G 覆蓋、頻譜金額：20-F FY2025、年報；ARPU 595→506：20-F FY2018；IDC 78%：2026 Q2 法說；\n政府資安共同供應契約約 4 成：中華資安總經理洪進福（財報狗 Podcast EP487，2025/11）"));

  // ── 01 誰訂的規則 ─────────────────────────────────────────
  const RULES = [
    ["NCC", "國家通訊傳播委員會（2006）", "發執照、拍賣頻譜、管資費和網路品質", "頻譜像土地：要先標下來才能蓋基地台；4G 執照 2030 年到期"],
    ["交通部", "最大股東（35.3%）", "推派董事長、總經理和多數董事", "像房東兼股東：不管日常營運，但決定誰來當家"],
    ["數位發展部", "產業主管機關（2022）", "數位韌性、資安、衛星政策", "海纜被切斷後推「韌性通訊」，中華電信是主要承包者"],
    ["3GPP", "國際標準組織", "訂 4G、5G、6G 的技術規格", "電信公司照標準買設備，設備商是 Nokia、Ericsson"],
  ];
  const RCW = [92, 160, 250, W - 92 - 160 - 250];
  const rules = page(
    ...header("01 公司概覽 · 誰訂的規則", "電信是特許行業：執照和頻譜都要向政府拿",
      "中華電信每一步都在政府規則裡走：頻譜多少錢、資費能不能漲、誰當董事長，都不是它自己說了算"),
    trow(RCW, ["誰", "身分", "管什麼", "白話"], { head: true, h: 18 }),
    ...RULES.map((r) => trow(RCW, r, { h: 46, sizes: [13, 10.5, 10.5, 10.5], colors: [BLUE, INK, INK, GRAY] })),
    gap(12),
    row({ gap: 12 },
      card((W - 12) / 2, 86, [10, 14, 10, 14],
        text("頻譜：每一代都要重買", { size: 13, bold: true, color: BLUE }),
        text("中華電信付過的頻譜錢：2013 年 4G 391 億、2015 年 100 億、2017 年 109 億、2020 年 5G 484 億。下一次：4G 執照 2030 年到期，6G 最快 2028 年拍賣", { size: 10, w: (W - 12) / 2 - 28, lineSpacingMultiple: 1.25 })),
      card((W - 12) / 2, 86, [10, 14, 10, 14],
        text("市場主導者：市話市占 91%", { size: 13, bold: true, color: BLUE }),
        text("NCC 把中華電信列為固網的「市場主導者」，要把網路出租給對手、資費要先報備；這是公司化時繼承全國網路的代價", { size: 10, w: (W - 12) / 2 - 28, lineSpacingMultiple: 1.25 }))),
    takeaway("規則穩定是護城河，也是天花板：想漲價、想換人，政府都有話說"),
    source("NCC 成立、電信管理法（2020/7）、頻譜付款、市話市占 91.4%：20-F FY2025；執照到期與 6G 時程：工商時報 2026/6/1；交通部持股：20-F（2026/2/28）"));

  // ── 01 營收與利潤結構 ─────────────────────────────────────
  const SEGY = [["2023", [1370.9, 730.1, 91.9, 39.1], [289.1, 143.6, 21.4, 16.0]], ["2024", [1399.8, 753.4, 99.2, 47.3], [297.7, 128.8, 23.8, 28.1]], ["2025", [1433.7, 772.4, 95.2, 60.0], [313.1, 125.0, 22.2, 42.3]]];
  const SEGC = [INK, BLUE, GRAY, LGRAY];
  const stackV = (data, idx, w, h, max, fmt) => {
    const slot = w / data.length, bw = 54, kids = [hl(0, h, w, INK, 0.75)];
    data.forEach((d, i) => {
      const vs = d[idx], x = i * slot + (slot - bw) / 2; let top = h;
      vs.forEach((v, j) => {
        const bh = (v / max) * h; top -= bh;
        kids.push(rect(x, top, bw, bh, { fill: SEGC[j], line: { color: WHITE, width: 1 } }));
        if (bh > 16) kids.push(text(fmt(v), { x, y: top + bh / 2 - 7, w: bw, size: 9, bold: true, color: j === 0 || j === 1 ? WHITE : INK, align: "center" }));
      });
      kids.push(text(fmt(vs.reduce((a, b) => a + b, 0)), { x: x - 14, y: top - 15, w: bw + 28, size: 10.5, bold: true, align: "center" }));
      kids.push(text(d[0], { x: x - 14, y: h + 4, w: bw + 28, size: 10, align: "center" }));
    });
    return col({ layer: true, w, h: h + 20 }, ...kids);
  };
  const SGW = 300;
  const revMix = page(
    ...header("01 公司概覽 · 營收與利潤結構", "營收靠企業客人長大，利潤還是靠家庭客人",
      "企業事業群營收三年 +6%，稅前利益卻少了 13%：ICT 專案毛利低，傳統專線、語音在萎縮"),
    row({ gap: 30 },
      col({ w: SGW, gap: 4 },
        text("營收（億元）", { size: 11.5, bold: true }),
        gap(14),
        stackV(SEGY, 1, SGW, 190, 2600, (v) => Math.round(v).toLocaleString("en-US"))),
      col({ w: SGW, gap: 4 },
        text("稅前利益（億元）", { size: 11.5, bold: true }),
        gap(14),
        stackV(SEGY, 2, SGW, 190, 560, (v) => Math.round(v).toLocaleString("en-US"))),
      col({ w: W - SGW * 2 - 60, gap: 8 },
        legend(INK, "個人家庭", 120), legend(BLUE, "企業客戶", 120), legend(GRAY, "國際電信", 120), legend(LGRAY, "其他（子公司）", 120),
        gap(6),
        text("稅前利益率（2025）", { size: 11, bold: true }),
        text("個人家庭 21%\n企業客戶 16%\n國際電信 21%", { size: 10.5, lineSpacingMultiple: 1.4 }))),
    takeaway("要看的矛盾：成長最快的那塊，利潤率最低"),
    source("20-F FY2025、FY2024 附註（部門資訊；營收為外部營收、稅前利益率以含內部營收的部門營收計）；企業客戶利潤下滑原因：各季新聞稿（ICT 毛利低、語音衰退、人事費用）"));

  // ── 03 行動 · 市場 ────────────────────────────────────────
  const driver = (sym, t, d, w) => card(w, 92, [8, 12, 8, 12],
    row({ gap: 6, align: "end" },
      text(sym, { size: 18, bold: true, color: BLUE, w: 22 }),
      text(t, { size: 12.5, bold: true, w: w - 24 - 28 })),
    text(d, { size: 9.5, color: INK, w: w - 24, lineSpacingMultiple: 1.2 }));
  const before = [["中華", 1115, true], ["台灣大", 727], ["遠傳", 723], ["台灣之星", 242], ["亞太", 200]];
  const after = [["中華", 1132, true], ["台灣大", 892], ["遠傳", 816]];
  const MKW = 300, MSW = W - MKW * 2 - 48 + 10;
  const mobileMkt = page(
    ...header("03 行動通信 · 市場", "台灣行動市場不長，但 2023 年起從五家變三家",
      "門號數早就超過人口；行動服務市場一年約 1,700 億（由中華 690 億 ÷ 41% 回推）。合併後三家都不再殺價"),
    row({ gap: 24 },
      col({ w: MKW, gap: 4 },
        text("合併前：4G＋5G 用戶（萬，2023/11）", { size: 11.5, bold: true }),
        gap(10),
        hbar(before.map(([n, v, hi]) => [n, v, v.toLocaleString("en-US"), hi]), MKW, 1300, { labelW: 60, valueW: 46, h: 16, gap: 8, size: 11 })),
      col({ w: MKW, gap: 4 },
        text("合併後：行動寬頻用戶（萬，2026/8）", { size: 11.5, bold: true }),
        gap(10),
        hbar(after.map(([n, v, hi]) => [n, v, v.toLocaleString("en-US"), hi]), MKW, 1300, { labelW: 60, valueW: 46, h: 16, gap: 8, size: 11 }),
        gap(8),
        tiny("台灣大併台灣之星（2023/12/1）、遠傳併亞太（2023/12/15）", MKW)),
      col({ w: MSW, gap: 4 },
        text("中華營收市占", { size: 11.5, bold: true }),
        gap(10),
        vbars([["2018", 36.3, false, "36%"], ["2021", 38.9, false, "39%"], ["2023", 40.0, false, "40%"], ["26Q3", 41.2, true, "41%"]], MSW, 110, { bw: 26, max: 50 }))),
    gap(12),
    row({ gap: 12 },
      driver("↑", "價格戰結束", "合併後三家各有地盤；資費從比便宜變成比 5G 品質", (W - 24) / 3),
      driver("↑", "4G 升 5G", "升級 5G 後月繳平均多 36–40%；中華智慧機 5G 滲透率 49.6%，還有一半沒升", (W - 24) / 3),
      driver("→", "人口不長", "門號滲透率早已超過 100%；成長只能靠每人多付，不是多賣門號", (W - 24) / 3)),
    takeaway("市場總量不長：中華只能靠 5G 升級，讓同一群人每月多付一點"),
    source("合併前：NCC 統計（經 SOGI 手機王，2023/11）；合併後：NCC（經 SOGI，2026/8）；營收市占：中華電信 20-F 與各季簡報（NCC 口徑）；5G 月繳增幅：2026 Q1、Q3 簡報"));

  // ── 03 行動 · 量 × 價 ─────────────────────────────────────
  const PQW2 = (W - 24) / 2;
  const mobilePQ = page(
    ...header("03 行動通信 · 量 × 價", "行動營收＝門號數 × 每月平均收入（ARPU）",
      "ARPU（Average Revenue Per User）：每個門號一個月平均付多少錢。價格戰把它打掉 3 成，合併後才慢慢回來"),
    row({ gap: 24 },
      col({ w: PQW2, gap: 4 },
        text("價格戰：混合 ARPU（元，含 IoT）", { size: 11.5, bold: true }),
        gap(12),
        vbars([["2016", 598], ["2017", 595], ["2018", 506], ["2019", 461], ["2020", 427], ["2021", 418, true]], PQW2, 140, { bw: 40, size: 10.5, max: 700 }),
        tiny("2018 年起降：價格戰＋會計新制（IFRS 15，手機補貼改列）", PQW2)),
      col({ w: PQW2, gap: 4 },
        text("合併後：月租 ARPU（元，不含 IoT 與預付卡）", { size: 11.5, bold: true }),
        gap(12),
        vbars([["2021", 509], ["2022", 525], ["2023", 547], ["2024", 553], ["2025", 561], ["26Q3", 573, true]], PQW2, 140, { bw: 40, size: 10.5, max: 700 }),
        tiny("兩張圖口徑不同，不能直接相比", PQW2))),
    gap(10),
    row({ gap: 12 },
      card((W - 24) / 3, 70, [8, 12, 8, 12], text("量：月租門號 1,010 萬", { size: 12.5, bold: true }), text("2024 年底 991 萬 → 2026/9 1,010 萬，一年只多約 1%", { size: 9.5, w: (W - 24) / 3 - 24 })),
      card((W - 24) / 3, 70, [8, 12, 8, 12], text("價：ARPU 一年 +2%", { size: 12.5, bold: true, color: BLUE }), text("5G 升級＋漫遊（Q3 +18%）＋加值服務（Hami Video、資安）", { size: 9.5, w: (W - 24) / 3 - 24 })),
      card((W - 24) / 3, 70, [8, 12, 8, 12], text("結果：行動服務 +3%", { size: 12.5, bold: true }), text("2025 年 690 億；2026 前三季 +3.4%。穩，但不會變快", { size: 9.5, w: (W - 24) / 3 - 24 }))),
    takeaway("行動業務像收租：每年 +3%，靠的是漲價，不是多賣"),
    source("混合 ARPU：20-F FY2018、FY2021；月租 ARPU：20-F FY2023、FY2025 與 2026 Q3 簡報；門號數：公司月報（2024/12、2026/9）；行動服務營收：20-F FY2025、2026 Q3 財務分析表"));

  // ── 04 固網 · 市場與量價 ──────────────────────────────────
  const fixedMkt = page(
    ...header("04 固網寬頻 · 市場", "寬頻用戶一直被有線電視分走，中華靠升速把單價拉上去",
      "HiNet 上網市占十年從 68% 掉到 52%；同一段時間，每戶每月付的錢從 707 元漲到 822 元"),
    row({ gap: 24 },
      col({ w: PQW2, gap: 4 },
        text("量：HiNet 上網市占（%）", { size: 11.5, bold: true }),
        gap(12),
        vbars([["2016", 68.5], ["2018", 66.6], ["2020", 62.5], ["2021", 60.1], ["2023", 56.8], ["2025", 52.2, true]], PQW2, 130, { bw: 40, size: 10.5, max: 85 }),
        tiny("對手：有線電視業者用低價寬頻搶客，再和行動電信業者合賣（行固綁售）", PQW2)),
      col({ w: PQW2, gap: 4 },
        text("價：寬頻 ARPU（元／月）", { size: 11.5, bold: true }),
        gap(12),
        vbars([["2016", 717], ["2019", 707], ["2021", 745], ["2023", 774], ["2025", 808], ["26Q3", 822, true]], PQW2, 130, { bw: 40, size: 10.5, max: 1000 }),
        tiny("300M 以上用戶占 43%；1G 以上用戶一年 +52%", PQW2))),
    gap(10),
    row({ gap: 12 },
      driver("↓", "有線電視低價", "第四台業者用同軸電纜送網路，價格較低；全台有線電視 427 萬戶", (W - 24) / 3),
      driver("↓", "手機吃到飽取代", "很多人只用手機上網，不裝家用寬頻（20-F 歷年都這樣寫）", (W - 24) / 3),
      driver("↑", "上下行對稱、高速", "光纖 1G 覆蓋 94%；Wi-Fi 全屋通、家庭資安一起綁著賣", (W - 24) / 3)),
    takeaway("固網寬頻是「以價補量」：用戶少一點，但每戶多付一點"),
    source("HiNet 市占：20-F 歷年（2016–2021 為 HiNet 用戶÷全台上網用戶推算，2023、2025 為公司自報）；ARPU：20-F、2026 Q3 簡報；有線電視戶數：2025 年報 p.6；1G 覆蓋率：20-F FY2025"));

  // ── 04 固網 · 產品與對手 ──────────────────────────────────
  const FPW = (W - 24) / 3;
  const fprod = (img, cap, name, big, lbl, d, trend, hi) => card(FPW, 250, [0, 0, 10, 0],
    photo(img, FPW, 84, ""),
    col({ pad: [0, 12, 0, 12], gap: 5 },
      text(name, { size: 14, bold: true, color: hi ? BLUE : INK }),
      row({ gap: 4, align: "end" }, text(big, { size: 22, bold: true, color: hi ? BLUE : INK }), text(lbl, { size: 9.5, color: GRAY })),
      text(d, { size: 10, w: FPW - 24, lineSpacingMultiple: 1.25 }),
      text(trend, { size: 10, bold: true, color: hi ? BLUE : INK, w: FPW - 24 }),
      text(cap, { size: 8, color: GRAY, w: FPW - 24 })));
  const fixedProd = page(
    ...header("04 固網寬頻 · 產品", "三種固網產品：寬頻在長，MOD 持平，市話慢慢消失",
      "家用固網一年約 430 億；加上企業專線，整個固網 815 億，是中華電信最大的一塊"),
    row({ gap: 12 },
      fprod("fiber-distribution-box.jpg", "光纖配線盒｜Wikimedia, Solomon203, CC BY-SA 4.0", "光世代寬頻", "393", "萬戶（2025）", "光纖到府，上下行同速；1G、2G 方案", "寬頻營收 2025 年 466 億，+2.8%", true),
      fprod("mod-stb-mod205.jpg", "MOD 機上盒｜Wikimedia, Solomon203, CC BY-SA 3.0", "MOD 影視", "198", "萬戶（2026/9）", "用網路看電視；搭配 Hami Video 共 300 萬訂閱", "MOD 一年少 3 萬戶，比第四台少 8.5 萬戶抗跌", false),
      fprod("history-payphone-dgt-lightbox.jpg", "電信局時代公用電話招牌｜Wikimedia, Solomon203, CC BY 3.0", "市內電話", "844", "萬戶（2026/9）", "全台市話市占 91%", "三年少了 96 萬戶；占營收從 9.5% 降到 8.1%", false)),
    takeaway("固網是現金牛：不會長大，但每年穩穩收 800 億"),
    source("光世代、寬頻營收、MOD：2025 年報 p.3、p.5–6；MOD 2026/9 與市話：公司月報；市話占營收：20-F FY2025；Hami Video 訂閱：2026 Q3 簡報"));

  // ── 05 企業 ICT · 市場與成長 ──────────────────────────────
  const ICTW = 380, ICTR = W - ICTW - 24;
  const grow = (k, v, hi) => row({ gap: 8, align: "center", h: 30 },
    text(k, { size: 12, w: 110 }),
    text(v, { size: 20, bold: true, color: hi ? BLUE : INK, w: 90 }));
  const ictMkt = page(
    ...header("05 企業 ICT · 成長", "企業 ICT 是全公司長最快的一塊：前三季 +20%",
      "ICT＝幫企業和政府做 IT：出租機房、雲端、資安、智慧城市專案。客人從「買一條專線」變成「把整套 IT 交給中華」"),
    row({ gap: 24 },
      col({ w: ICTW, gap: 4 },
        text("企業客戶 ICT 營收（億元）", { size: 11.5, bold: true }),
        gap(12),
        vbars([["2022", 230, "e", "—"], ["2023", 247], ["2024", 278], ["2025", 304, true], ["9M25", 198], ["9M26", 238, true]].filter((d) => d[2] !== "e"), ICTW, 150, { bw: 44, size: 10.5, max: 380 }),
        tiny("另有國際 ICT（海外建廠專案）：2025 年 41 億，2026 前三季 +61%", ICTW)),
      col({ w: ICTR, gap: 2 },
        text("2026 Q3 各項年增", { size: 11.5, bold: true }),
        gap(6),
        grow("雲端", "+45%", true), grow("機房 IDC", "+26%", true), grow("資安", "+22%"), grow("AIoT", "+14%"),
        gap(6),
        text("新簽約金額：前三季已是 2025 全年的 1.4 倍（今天簽的約，明後年才認列營收）", { size: 10.5, w: ICTR, lineSpacingMultiple: 1.3 }))),
    gap(8),
    row({ gap: 12 },
      driver("↑", "AI 要機房", "AI 伺服器耗電、要液冷；企業自己的機房裝不下，改租電信機房", (W - 24) / 3),
      driver("↑", "資安與韌性", "海纜被切、駭客攻擊增加；政府、金融要在台灣、找信得過的廠商", (W - 24) / 3),
      driver("↑", "台商出海", "在美國、東南亞蓋廠，網路和機房一起找中華電信做", (W - 24) / 3)),
    takeaway("企業 ICT 一年長 2 成；但只占營收 15%，還拉不動整家公司"),
    source("企業客戶 ICT：2024 Q4、2025 Q4、2026 Q3 財務分析表；國際 ICT：同上；各項年增與新簽約：2026 Q3 法說；驅動因子：2025 年報、2026 財測新聞稿（資本支出用途）"));

  // ── 05 企業 ICT · 產品 ────────────────────────────────────
  const IPW = (W - 36) / 4;
  const iprod = (img, cap, name, big, lbl, d, who) => card(IPW, 270, [0, 0, 8, 0],
    photo(img, IPW, 84, ""),
    col({ pad: [0, 10, 0, 10], gap: 5 },
      text(name, { size: 13.5, bold: true, color: BLUE, w: IPW - 20 }),
      row({ gap: 4, align: "end" }, text(big, { size: 20, bold: true }), text(lbl, { size: 9, color: GRAY, w: IPW - 80 })),
      text(d, { size: 9.5, w: IPW - 20, lineSpacingMultiple: 1.25 }),
      text(who, { size: 9, color: GRAY, w: IPW - 20, lineSpacingMultiple: 1.2 }),
      text(cap, { size: 8, color: GRAY, w: IPW - 20 })));
  const ictProd = page(
    ...header("05 企業 ICT · 產品", "四種生意：機房、資安、智慧城市、海外建廠",
      "前兩種是每月收錢的「經常性營收」，後兩種是一次性的專案；公司特別愛報經常性營收"),
    row({ gap: 12 },
      iprod("idc-banqiao-exterior.jpg", "板橋 IDC｜Wikimedia, Tele2020", "機房＋雲端", "78%", "台灣 IDC 市占（含是方）", "出租機櫃、電力、網路；hicloud 雲端。像「IT 設備的停車場」，按位置和用電收月租", "集團 IDC＋雲端 2025 年營收破百億；子公司是方電訊（6561）"),
      iprod("soc-cht-monitoring-center.jpg", "機房監控中心（DDoS 防護）｜iThome", "資安", "約 4 成", "政府資安共同供應契約", "24 小時監控、事件調查、駭客演練（紅隊）；家用與企業上網資安", "子公司中華資安（7765，持股 57%）2025 營收 20.5 億"),
      iprod("smart-city-expo-2026.jpg", "2026 智慧城市展｜中華電信（工商時報）", "智慧城市與 AIoT", "100", "億（pre-6G 目標）", "智慧交通、監控、工廠、5G 專網；把感測器、網路、平台一起包", "2026 年 AIoT＋衛星＋大數據合計營收目標超過百億"),
      iprod("cable-laying-matsu4.jpg", "台馬四號海纜上岸｜新頭殼（連江縣政府提供）", "國際與海外", "+61%", "國際 ICT（2026 前三季）", "美國德州 AI 供應鏈建廠、海纜、海外機房；跟著台商出海", "2026/6 單月認列 18.5 億德州建廠專案")),
    takeaway("機房和資安每月收錢最穩；專案營收大但一次性，會讓季度數字跳動"),
    source("IDC 市占：2026 Q2 法說；IDC＋雲端破百億、資安：2025 年報；中華資安：公開資訊觀測站（2025）、財報狗 Podcast EP487；pre-6G 目標：2025 Q4 法說；\n德州專案：2026/6 月報與 2026 Q2 簡報"));

  // ── 05 企業 ICT · 對手與優勢 ──────────────────────────────
  const ECW = [80, 140, 200, 230, W - 80 - 140 - 200 - 230];
  const erow = (cells) => trow(ECW, cells, { h: 52, sizes: [12, 10.5, 10.5, 10, 10.5], colors: [INK, BLUE, INK, GRAY, INK] });
  const ictComp = page(
    ...header("05 企業 ICT · 對手與優勢", "機房一家獨大；雲端和資安是一群小公司在打",
      "中華的優勢是「網路＋機房＋信任」一起賣；對手各有一塊專長，也各有自己的理由"),
    trow(ECW, ["戰場", "中華地位", "主要對手", "對手的處境與理由", "中華的優勢"], { head: true, h: 18 }),
    erow(["機房 IDC", "市占 78%（含是方）", "遠傳、台灣固網（台灣大）、宏碁資訊", "民營電信要把錢優先投在行動網路；機房要大量土地和電力", "最多機房與電力、網路直連"]),
    erow(["雲端", "代管與自有雲並行", "AWS、Google、微軟；代理商伊雲谷、CloudMile、Nextlink、精誠", "外商雲規模大、功能多；代理商靠幫企業搬上外商雲賺服務費", "資料留在台灣、政府與金融客戶"]),
    erow(["資安", "政府共契約 4 成", "趨勢、精誠、安碁資訊等資安公司", "專業資安公司技術深，但沒有網路可以在線上直接擋攻擊", "上網資安（在網路上擋）只有電信做得到"]),
    erow(["專案 SI", "大型政府、金融案", "資拓宏宇（其實是自己的子公司）、精誠、中華系統整合", "系統整合毛利低，靠案量；大案常常要電信網路一起報", "網路＋機房＋系統一次包"]),
    takeaway("機房是護城河；雲端要跟外商「合作又競爭」，利潤最難守"),
    source("IDC、雲端對手名單：20-F FY2025；IDC 市占：2026 Q2 法說；資安：中華資安總經理（財報狗 Podcast EP487）；資拓宏宇持股 45%：20-F；對手處境為自己的整理"));

  // ── 08 財務 · 營收拆分 ───────────────────────────────────
  // 行動＝個家＋企客行動服務；固網＝個家＋企客＋國際固網；ICT＝企客＋國際 ICT；其他＝差額（含子公司、加值、資產活化）
  const PL = [["2023", [642.6, 819.3, 368.2, 275.4, 126.5]], ["2024", [662.2, 817.2, 372.3, 318.1, 129.9]], ["2025", [684.5, 814.5, 385.0, 344.7, 132.4]], ["9M25", [509.3, 607.6, 256.3, 227.8, 103.6]], ["9M26", [526.3, 614.8, 299.4, 285.1, 163.9]]];
  const PLN = ["行動服務", "固網服務", "銷貨（手機）", "ICT", "其他"];
  const PLC = [INK, GRAY, LGRAY, BLUE, "BFD3FA"];
  const SPW = 470, SPH = 200;
  const sp = [hl(0, SPH, SPW, INK, 0.75)];
  PL.forEach(([y, vs], i) => {
    const slot = SPW / PL.length, bw = 56, x = i * slot + (slot - bw) / 2; let top = SPH;
    vs.forEach((v, j) => {
      const h = (v / 2600) * SPH; top -= h;
      sp.push(rect(x, top, bw, h, { fill: PLC[j], line: { color: WHITE, width: 1 } }));
      if (h > 13) sp.push(text(String(Math.round(v)), { x, y: top + h / 2 - 6, w: bw, size: 8.5, bold: true, color: j === 0 || j === 3 ? WHITE : INK, align: "center" }));
    });
    sp.push(text(Math.round(vs.reduce((a, b) => a + b, 0)).toLocaleString("en-US"), { x: x - 14, y: top - 15, w: bw + 28, size: 10.5, bold: true, align: "center" }));
    sp.push(text(y, { x: x - 14, y: SPH + 4, w: bw + 28, size: 10, align: "center" }));
  });
  const SGR = [["行動服務", "+3.3%"], ["固網服務", "+1.2%"], ["銷貨（手機）", "+16.8%"], ["ICT", "+25.2%", true], ["其他", "+58%（一次性）"]];
  const segSplit = page(
    ...header("08 財務表現 · 營收拆分", "2026 年營收 +11%：ICT、iPhone 和一次性收益三個來源",
      "電信本業（行動＋固網）占營收 6 成，一年只長 1–3%；成長全靠右邊三塊"),
    row({ gap: 30 },
      col({ w: SPW, gap: 4 },
        text("營收按產品（億元）", { size: 11.5, bold: true }),
        gap(14),
        col({ layer: true, w: SPW, h: SPH + 22 }, ...sp)),
      col({ w: W - SPW - 30, gap: 6 },
        text("2026 前三季年增", { size: 11.5, bold: true }),
        gap(4),
        ...SGR.map(([n, g, hi], j) => row({ gap: 8, align: "center", h: 28 },
          shape({ geom: "rect", w: 12, h: 12, fill: PLC[j], line: { color: j === 2 || j === 4 ? GRAY : PLC[j], width: 0.5 } }),
          text(n, { size: 11.5, w: 110 }),
          text(g, { size: 14, bold: true, color: hi ? BLUE : INK, w: 140 }))),
        gap(6),
        text("「其他」含子公司、加值服務與 Q3 的子公司不動產一次性收益；明年不會再有", { size: 10, color: GRAY, w: W - SPW - 30, lineSpacingMultiple: 1.3 }))),
    takeaway("扣掉一次性收益和 iPhone，本業加 ICT 的成長大約是 +5%"),
    source("各季財務分析表（2024 Q4、2025 Q4、2026 Q3）；分類為自己加總：行動＝個人家庭＋企業客戶行動服務；固網＝三個事業群固網服務；ICT＝企業客戶＋國際 ICT；其他＝總營收減前四項；\n「約 +5%」＝（行動＋固網＋ICT）9M26 1,426 億 vs 9M25 1,345 億，+6.1%，再扣國際專案"));

  // ── 08 財務 · 財測達成 ───────────────────────────────────
  const GCW = [120, 170, 110, 110, 150, W - 120 - 170 - 110 - 110 - 150];
  const grow2 = (cells, hi) => trow(GCW, cells, { h: 32, sizes: [12, 11, 11, 11, 11, 11], colors: [INK, INK, INK, INK, hi ? BLUE : INK, GRAY], boldCol: 4 });
  const guide = page(
    ...header("08 財務表現 · 財測達成", "財測抓得保守，年年超越：今年前三季已達 116–119%",
      "每年 1 月公布全年財測，每季簡報都附達成率；2025 年 EPS 4.99 元也超過財測高標（4.82 元）"),
    trow(GCW, ["項目", "2026 全年財測", "2025 實際", "前三季實際", "前三季達成率", "第四季隱含"], { head: true, h: 18 }),
    grow2(["營收（億）", "2,420–2,437", "2,361", "1,890", "108%", "680–688"]),
    grow2(["營業利益（億）", "481–497", "486", "417", "116–118%", "128–136"]),
    grow2(["歸母淨利（億）", "374–389", "387", "330", "116–119%", "97–105"]),
    grow2(["EPS（元）", "4.82–5.02", "4.99", "4.25", "116–119%", "1.25–1.35"], true),
    grow2(["資本支出（億）", "319", "277", "162", "51%", "—"]),
    gap(12),
    row({ gap: 12 },
      card((W - 12) / 2, 82, [10, 14, 10, 14], text("全年 EPS 大約 5.5–5.6 元", { size: 13, bold: true, color: BLUE }),
        text("前三季 4.25 ＋ 第四季財測 1.25–1.35；但含 Q3 一次性收益，公司沒說多少", { size: 10, w: (W - 12) / 2 - 28, lineSpacingMultiple: 1.25 })),
      card((W - 12) / 2, 82, [10, 14, 10, 14], text("資本支出花得比說的少", { size: 13, bold: true }),
        text("前三季只用掉全年預算 51%；AI 機房投資的速度，比簡報上看起來慢", { size: 10, w: (W - 12) / 2 - 28, lineSpacingMultiple: 1.25 }))),
    takeaway("超越財測是常態，不是驚喜；要看的是扣掉一次性收益後還超多少"),
    source("2026 財測（2026/1/23）；2026 Q3 簡報 p.15 與財務分析表；第四季隱含與全年 EPS 為自己計算；2025 達成：2025 Q4 簡報"));

  // ── 08 財務 · 十年年度表 ─────────────────────────────────
  const ANN = [
    ["2016", "2,300", "−0.8%", "35.8%", "20.9%", "5.16", "4.94", "96%"],
    ["2017", "2,275", "−1.1%", "35.5%", "20.5%", "5.01", "4.80", "96%"],
    ["2018", "2,155", "−5.3%", "35.2%", "20.3%", "4.58", "4.48", "98%"],
    ["2019", "2,075", "−3.7%", "34.5%", "19.6%", "4.23", "4.23", "100%"],
    ["2020", "2,076", "0.0%", "34.0%", "20.4%", "4.31", "4.31", "100%"],
    ["2021", "2,105", "+1.4%", "35.8%", "21.3%", "4.61", "4.61", "100%"],
    ["2022", "2,167", "+3.0%", "36.9%", "21.6%", "4.70", "4.70", "100%"],
    ["2023", "2,232", "+3.0%", "36.5%", "20.8%", "4.76", "4.76", "100%"],
    ["2024", "2,300", "+3.0%", "36.3%", "20.4%", "4.80", "5.00", "104%"],
    ["2025", "2,361", "+2.7%", "36.8%", "20.6%", "4.99", "5.20", "104%"],
  ];
  const ACW = [70, 110, 90, 100, 100, 100, 130, W - 70 - 110 - 90 - 100 - 100 - 100 - 130];
  const annual = page(
    ...header("08 財務表現 · 年度", "十年營收幾乎沒變，賺多少就發多少",
      "2018–2019 年價格戰讓 EPS 掉到 4.23 元；之後連六年成長，2025 年 4.99 元是八年新高"),
    trow(ACW, ["年度", "營收（億）", "年增", "毛利率", "營益率", "EPS（元）", "現金股利（元）", "配發率"], { head: true, h: 18 }),
    ...ANN.map((r, i) => trow(ACW, r, { h: 25, sizes: Array(8).fill(11), colors: i === 2 || i === 3 ? [INK, INK, BLUE, INK, INK, BLUE, INK, INK] : Array(8).fill(INK) })),
    takeaway("像一張債券：本金不長，每年配 4–5 元利息"),
    source("營收、毛利率、營益率、EPS：公開資訊觀測站 綜合損益表（合併，2016–2025）；股利與配發率：20-F FY2025、財報狗；\n配發率超過 100%：法定盈餘公積已達股本，2015 年起不再提列（20-F）"));

  // ── 08 財務 · 配息與資本支出 ─────────────────────────────
  const CPW = (W - 24) / 2;
  const cashUse = page(
    ...header("08 財務表現 · 現金流", "每年賺進約 500 億自由現金流，幾乎全部發給股東",
      "資本支出 2021 年 5G 建網最高（353 億）；2026 年預算 319 億，大部分投在機房、海纜、衛星"),
    row({ gap: 24 },
      col({ w: CPW, gap: 4 },
        text("資本支出（億元）", { size: 11.5, bold: true }),
        gap(12),
        vbars([["2019", 242], ["2020", 235], ["2021", 353], ["2022", 315], ["2023", 307], ["2024", 288], ["2025", 277], ["26預算", 319, true]], CPW, 140, { bw: 30, size: 10, max: 420 }),
        tiny("2026 預算：行動 77 億、非行動 242 億（機房、海纜、衛星、韌性）", CPW)),
      col({ w: CPW, gap: 4 },
        text("自由現金流 vs 現金股利（億元）", { size: 11.5, bold: true }),
        gap(12),
        col({ layer: true, w: CPW, h: 156 }, ...(() => {
          const D2 = [["2021", 395, 357], ["2022", 445, 365], ["2023", 438, 369], ["2024", 505, 388], ["2025", 498, 403]];
          const h = 140, slot = CPW / D2.length, k = [hl(0, h, CPW, INK, 0.75)];
          D2.forEach(([y, f, d], i) => {
            const x = i * slot + (slot - 56) / 2;
            k.push(rect(x, h - (f / 600) * h, 26, (f / 600) * h, { fill: INK, line: { color: WHITE, width: 0 } }));
            k.push(rect(x + 30, h - (d / 600) * h, 26, (d / 600) * h, { fill: BLUE, line: { color: WHITE, width: 0 } }));
            k.push(text(String(f), { x: x - 6, y: h - (f / 600) * h - 13, w: 38, size: 9, bold: true, align: "center" }));
            k.push(text(String(d), { x: x + 24, y: h - (d / 600) * h - 13, w: 38, size: 9, bold: true, color: BLUE, align: "center" }));
            k.push(text(y, { x: x - 10, y: h + 3, w: 76, size: 10, align: "center" }));
          });
          return k;
        })()),
        row({ gap: 14 }, legend(INK, "自由現金流", 90), legend(BLUE, "現金股利總額", 110)))),
    gap(8),
    text("帳上淨現金 43 億、負債比 25%：幾乎不借錢；2020 年 5G 標金 484 億另外從投資現金流付", { size: 10.5, color: GRAY }),
    takeaway("股利靠自由現金流撐得住；但 AI 機房若要大幅加碼，配發率 104% 就得重新想"),
    source("資本支出、自由現金流：財報狗（2019–2023）、公司簡報（2024–2025、2026 Q3）；股利總額：20-F FY2025；2026 預算：2026 財測新聞稿；資產負債：2026 Q3 財務分析表（2026/9/30）"));

  // ══ 02 管理層與治理 ═════════════════════════════════════
  // ── 02 治理架構：交通部怎麼管 ─────────────────────────────
  const GW = 520, GH = 330, GR = W - GW - 24;
  const nb = (x, y, w, h, t, o = {}) => box(x, y, w, h, t, { size: 10.5, ...o });
  const arrowD = (x, y, h) => [vl(x, y, h, INK, 1), text("▼", { x: x - 6, y: y + h - 8, w: 13, size: 8, align: "center" })];
  const govStruct = page(
    ...header("02 管理層與治理 · 誰在管", "交通部持股 35%，卻能決定董事長和總經理",
      "董事會 13 席：8 席全是交通部指派的代表（含董事長、總經理），另 5 席獨立董事；交通部可以隨時換掉它指派的人"),
    row({ gap: 24 },
      col({ layer: true, w: GW, h: GH },
        image(IMG + "handover-2024.jpg", { x: 0, y: 0, w: 92, h: 54, fit: "cover" }),
        text("2024/9/30 交接｜數位時代", { x: 0, y: 55, w: 140, size: 7.5, color: GRAY }),
        image(IMG + "agm-2026.jpg", { x: 428, y: 0, w: 92, h: 54, fit: "cover" }),
        text("2026 股東會｜工商時報", { x: 400, y: 55, w: 120, size: 7.5, color: GRAY, align: "right" }),
        ...nb(150, 0, 220, 40, "交通部　持股 35.3%\n（加政府基金約 41.6%）", { bold: true, color: WHITE, fill: INK, line: { color: INK, width: 0 } }),
        ...arrowD(260, 40, 22),
        rect(0, 62, GW, 92, { line: { color: INK, width: 0.75 } }),
        text("董事會 13 席（2025–2028）", { x: 10, y: 66, w: 300, size: 10.5, bold: true }),
        ...nb(10, 86, 300, 60, "交通部代表 8 席\n董事長、總經理、交通部次長與司長、文化部次長、\n前 Google 台灣總經理簡立峰、學者、勞工董事", { size: 9.5, fill: LBLUE, line: { color: BLUE, width: 0.75 } }),
        ...nb(320, 86, 190, 60, "獨立董事 5 席\n會計、AI（杜奕瑾）、律師、\n企業家、工程學者", { size: 9.5 }),
        ...arrowD(260, 154, 22),
        ...nb(130, 176, 260, 40, "董事長 簡志誠（兼總執行長）", { bold: true, color: WHITE, fill: BLUE, line: { color: BLUE, width: 0 } }),
        ...arrowD(260, 216, 18),
        ...nb(130, 234, 260, 34, "總經理 林榮賜（兼永續長）", { bold: true, fill: LBLUE, line: { color: BLUE, width: 1 } }),
        hl(40, 280, 440, INK, 0.75), vl(260, 268, 12, INK, 0.75),
        ...[["4 位執行副總\n財務、業務、技術、行政", 0], ["5 個分公司\n個家、企客、國際、網路、資訊", 1], ["電信研究院\n約 1,500 人", 2]].flatMap(([t, i]) => [vl(40 + i * 220, 280, 10, INK, 0.75), ...nb(i * 175, 290, 165, 40, t, { size: 9.5 })])),
      col({ w: GR, gap: 8 },
        card(GR, 104, [8, 12, 8, 12], text("怎麼換人", { size: 12.5, bold: true, color: BLUE }),
          text("交通部先「改派」它在董事會的代表，再開臨時董事會選董事長。2024 年：9/24 改派、9/30 選出簡志誠", { size: 10, w: GR - 24, lineSpacingMultiple: 1.25 })),
        card(GR, 88, [8, 12, 8, 12], text("總經理一定內部升", { size: 12.5, bold: true, color: BLUE }),
          text("章程規定總經理要由「具電信經營專業」的董事兼任；2008 年後歷任總經理都是內部升上來", { size: 10, w: GR - 24, lineSpacingMultiple: 1.25 })),
        card(GR, 104, [8, 12, 8, 12], text("董事酬勞歸交通部", { size: 12.5, bold: true }),
          text("代表董事的酬勞 4,213 萬全數付給交通部；董事長、總經理月薪有上限（約 39 萬），變動薪酬不能超過固定薪", { size: 10, w: GR - 24, lineSpacingMultiple: 1.25 })))),
    takeaway("股份不到一半，人事權卻在政府手上：這是看中華電信最重要的一件事"),
    source("持股：20-F FY2025（2026/2/28）；政府基金合計 41.6% 為自己加總（2025 年報股東名冊：交通部、中華郵政、勞退、勞保）；董事名單：官網公司治理頁、2025 年報；\n改派與選任日期：數位時代、公司新聞稿（2024/9）；章程第 19 條；酬金上限：20-F FY2025"));

  // ── 02 董事長、總經理 ─────────────────────────────────────
  const PFW = (W - 20) / 2;
  const tl2 = (items, w) => col({ gap: 3 }, ...items.map(([y, t, hi]) => row({ gap: 6 },
    text(y, { size: 9.5, bold: true, color: hi ? BLUE : GRAY, w: 64 }),
    text(t, { size: 9.5, color: hi ? BLUE : INK, w: w - 70, bold: hi }))));
  const profile = (img, cap, role, name, sub2, lines, tags, quote) => card(PFW, 318, [10, 12, 10, 12],
    row({ gap: 12 },
      image(IMG + img, { w: 120, h: 92, fit: "cover" }),
      col({ w: PFW - 24 - 142, gap: 3 },
        text(role, { size: 10, color: GRAY }),
        text(name, { size: 22, bold: true }),
        text(sub2, { size: 10, w: PFW - 24 - 142, lineSpacingMultiple: 1.2 }),
        text(cap, { size: 8, color: GRAY, w: PFW - 24 - 142 }))),
    text("一路升上來", { size: 10.5, bold: true, color: BLUE }),
    tl2(lines, PFW - 24),
    text(tags, { size: 9.5, color: INK, w: PFW - 24, lineSpacingMultiple: 1.25 }),
    text(quote, { size: 9.5, color: GRAY, w: PFW - 24, lineSpacingMultiple: 1.25 }));
  const leaders = page(
    ...header("02 管理層與治理 · 董事長與總經理", "兩位都是內部升上來的工程博士",
      "一個管網路衛星、一個管研發資安；2024/9/30 同一天上任，接替財務出身的郭水義，媒體解讀為從「財務投資」轉回「技術」"),
    row({ gap: 20 },
      profile("exec-chien-chihcheng.jpg", "", "董事長（兼總執行長）· 66 歲", "簡志誠", "台科大電子工程博士；在中華電信約 39 年，自述「服務過七位董事長」",
        [["早年", "國際電信分公司總經理"], ["2021", "行動通信分公司總經理"], ["2022", "網路技術分公司總經理"], ["2023", "執行副總（行政長）"], ["2024/9", "董事長", true]],
        "專長：5G、網路韌性、衛星（主導和 OneWeb 低軌衛星合作）。口號「精簡、務實、智慧化」；2025 年酬金 920 萬元",
        "「堅實的基礎設施只是起點，關鍵在於將前瞻技術轉化為客戶可實現營收」（2026/4 Tech Day）"),
      profile("exec-lin-jungssu.jpg", "", "總經理（兼永續長）· 61 歲", "林榮賜", "交大資工博士；從電信研究院助理研究員做起",
        [["2017", "電信研究院院長（AI 團隊在此成形）"], ["2020", "執行副總兼技術長"], ["2024/1", "業務長兼資安長"], ["2024/9", "總經理", true]],
        "專長：網路架構、雲端、資安。上任第一條：「讓每位員工都能駕馭生成式 AI」；2026 年帶 111 位主管集體拿敏捷（Scrum）認證；2025 年酬金 901 萬元",
        "「把 AI 基礎建設投資轉成長期財務回報」（2026 Q2 法說）")),
    takeaway("一個顧「網路與機房」，一個顧「AI 與研發」：正好對上公司押的兩條線"),
    source("學經歷：2025 年報經理人資料、20-F FY2025、公司新聞稿（2024/9/30）；評價：數位時代（2024/9）；酬金：2025 年報；原話：2026/4/24 Tech Day 新聞稿、2026 Q2 法說逐字稿；\n照片：工商時報"));

  // ── 02 經營團隊 ───────────────────────────────────────────
  const TMW = [150, 72, 50, W - 150 - 72 - 50 - 250, 250];
  const tm = (cells, hi) => trow(TMW, cells, { h: 25, sizes: [10.5, 10.5, 10, 10, 10], colors: [hi ? BLUE : INK, INK, GRAY, INK, GRAY] });
  const team = page(
    ...header("02 管理層與治理 · 經營團隊", "一級主管幾乎都是內部升任的工程博士，平均 60 歲以上",
      "唯一明顯的外部空降是財務長許文馨（台大會計系教授）；AI 的技術端歸技術長，對外銷售歸企業客戶分公司"),
    trow(TMW, ["職稱", "姓名", "年齡", "背景", "跟 AI 的關係"], { head: true, h: 18 }),
    tm(["執行副總兼財務長", "許文馨", "49", "外部：台大會計系教授（2024/9 加入）", "對法人說明 AI 投資與成本"], true),
    tm(["執行副總兼業務長", "林文智", "59", "內部：業務管理、北區分公司", "兼 AI 影像子公司中華曜智董事長"]),
    tm(["執行副總兼技術長", "楊慧琪", "60", "內部：研究院副院長、資訊分公司總經理", "AI 技術、網路、資訊、研發都歸她"], true),
    tm(["執行副總兼行政長", "陳元凱", "58", "內部：交大資工博士、投資事業處", "人資、投資事業（子公司）"]),
    tm(["企業客戶分公司", "張本元", "64", "內部：交大資工博士", "對外賣 AI、智慧城市、資安專案"], true),
    tm(["資訊技術分公司", "陳明崇", "—", "內部：交大資工博士", "IDC、雲端、hicloud AI 算力雲"], true),
    tm(["國際電信分公司", "陳錦洲", "62", "內部：台大電機博士", "海纜、海外機房、美國建廠專案"]),
    tm(["網路技術分公司", "賈仲雍", "62", "內部：交大資工博士", "AI 基地台節能、網路維運 AI"]),
    tm(["個人家庭分公司", "胡學海", "64", "內部：成大交管碩士", "Hami、Google Gemini 方案、AI 客服"]),
    tm(["電信研究院", "蘇添財", "63", "內部：成大電機碩士", "約 1,500 人；兼 AI 子公司中華創智董事長"], true),
    takeaway("團隊很懂技術，但年齡集中在 58–64 歲：接班和「AI 人才」是同一個問題"),
    source("2025 年報經理人資料（2026/2/28）、20-F FY2025、官網組織圖（2026 版）；楊慧琪改任技術長、陳明崇接資訊分公司的日期未查到（約 2026 年 3–7 月）"));

  // ── 02 歷任董事長：跟著政府換 ─────────────────────────────
  const CH = [
    ["陳堯", "1996–2000", "官員", "電信總局局長", "李登輝"],
    ["毛治國", "2000–2003", "官員", "交通部次長", "陳水扁"],
    ["賀陳旦", "2003–2008", "官員", "交通部次長", "陳水扁"],
    ["呂學錦", "2008–2013", "內部", "原總經理", "馬英九"],
    ["李炎松", "2013–2014", "內部", "原總經理", "馬英九"],
    ["蔡力行", "2014–2016", "民間", "前台積電總經理", "馬英九"],
    ["鄭優", "2016–2019", "其他", "原中華電信董事", "蔡英文"],
    ["謝繼茂", "2019–2023", "內部", "原總經理", "蔡英文"],
    ["郭水義", "2023–2024", "內部", "原總經理（財務出身）", "蔡英文"],
    ["簡志誠", "2024–", "內部", "原執行副總（網路）", "賴清德"],
  ];
  const ERAS = [["李登輝", 0, 1], ["陳水扁（2000）", 1, 3], ["馬英九（2008）", 3, 6], ["蔡英文（2016）", 6, 9], ["賴清德", 9, 10]];
  const CHW = W / CH.length;
  const OC = { 官員: GRAY, 內部: INK, 民間: BLUE, 其他: LGRAY };
  const chairs = page(
    ...header("02 管理層與治理 · 歷任董事長", "每次政府換人，3–7 個月內董事長就跟著換",
      "1996 年以來 10 任董事長；2000、2008、2016、2024 四次政府交替（陳水扁、馬英九、蔡英文、賴清德上任）後都換了人"),
    col({ layer: true, w: W, h: 40 },
      ...ERAS.flatMap(([n, a, b], i) => [
        rect(a * CHW + 2, 0, (b - a) * CHW - 4, 30, { fill: i % 2 ? LBLUE : "F2F2F2", line: { color: WHITE, width: 0 } }),
        label(a * CHW + 2, 0, (b - a) * CHW - 4, 30, n, { size: 10.5, bold: true })])),
    row({ gap: 0 }, ...CH.map(([n, y, o, from], i) => col({ w: CHW, gap: 4, pad: [0, 4, 0, 4] },
      shape({ geom: "rect", w: CHW - 8, h: 6, fill: OC[o], line: { color: OC[o], width: 0 } }),
      text(n, { size: 13, bold: true, color: i === 9 ? BLUE : INK }),
      text(y, { size: 9.5, color: GRAY }),
      text(o, { size: 10, bold: true, color: o === "民間" ? BLUE : INK }),
      text(from, { size: 9, color: GRAY, w: CHW - 8, lineSpacingMultiple: 1.2 })))),
    gap(10),
    row({ gap: 12, align: "center" },
      legend(GRAY, "政府官員轉任", 100), legend(INK, "內部升任", 80), legend(BLUE, "民間企業", 80), legend(LGRAY, "其他", 60)),
    gap(10),
    row({ gap: 12 },
      photo("exec-sheih-kuo-2023.jpg", 150, 84, "2023 新春：謝繼茂（左）、郭水義｜中央社"),
      photo("handover-2024.jpg", 150, 84, "2024/9/30 交接典禮｜數位時代"),
      card(W - 324, 100, [8, 12, 8, 12],
        text("常見路徑：總經理升董事長", { size: 12, bold: true, color: BLUE }),
        text("呂學錦、李炎松、謝繼茂、郭水義都是總經理升上來；簡志誠是執行副總直接升，算例外。民間出身只有 2014 年的蔡力行（任內搶先開台 4G）", { size: 10, w: W - 348, lineSpacingMultiple: 1.25 }))),
    takeaway("政治決定「誰」，內部培養決定「人選池」：外人很難進來"),
    source("任期：維基百科（1996–2016，未逐筆以一手資料核對）、公司新聞稿（2019 年後）；政府交替後換人的間隔為自己計算；照片：中華電信"));

  // ── 02 公股 vs 家族：三家怎麼管 ───────────────────────────
  const GVW = [130, (W - 130) / 3, (W - 130) / 3, (W - 130) / 3];
  const gv = (cells, h = 40) => trow(GVW, cells, { h, sizes: [11, 10.5, 10.5, 10.5], colors: [INK, BLUE, INK, INK] });
  const govCompare = page(
    ...header("02 管理層與治理 · 三家怎麼管", "對手是家族企業加外聘總經理；中華電信是公股加內升",
      "治理差異會不會讓中華電信比較慢？沒有找到可靠研究直接證明，但可以看到公司自己在想辦法"),
    row({ gap: 0, align: "center", h: 30 },
      col({ w: GVW[0] }),
      ...[["cht-logo.png", 90], ["twm-logo.png", 90], ["fet-logo.png", 70]].map(([f, w], i) => col({ w: GVW[i + 1] }, image(IMG + f, { w, h: 22, fit: "contain" })))),
    trow(GVW, ["", "中華電信", "台灣大哥大", "遠傳電信"], { head: true, h: 18 }),
    gv(["控制股東", "交通部（公股）", "富邦集團（蔡家）", "遠東集團（徐家）"]),
    gv(["董事長", "簡志誠：內部專業經理人", "蔡明忠：家族", "徐旭東：家族"]),
    gv(["總經理", "林榮賜：內部升任", "林之晨：外聘（AppWorks 創辦人，2019）", "井琪：外聘（2018 加入，2019 升任）"]),
    gv(["換人看什麼", "政府交替、交通部改派", "家族決定", "家族決定"]),
    gv(["主管薪酬", "月薪上限約 39 萬；變動不超過固定", "市場化", "市場化"]),
    gap(8),
    text("中華電信自己的對策：把 AI 團隊分拆成子公司（中華創智 2025、中華曜智 2026），子公司可以用市場化方式募資、找人。自述目標是「讓大象靈巧轉身」", { size: 10.5, color: INK, w: W, lineSpacingMultiple: 1.3 }),
    takeaway("公股帶來信任和政府訂單，也帶來薪酬上限和政治換人：同一件事的兩面"),
    source("中華電信：20-F FY2025、2025 年報；台灣大、遠傳：各公司官網與新聞（搜尋摘要，未逐字核對）；「大象靈巧轉身」：媒體專訪標題；\n分拆子公司是否為了薪酬彈性是推論，公司未證實"));

  // ══ 06 AI 布局 ══════════════════════════════════════════
  // ── 06 電信業做 AI 的四條路 ──────────────────────────────
  const RT = [
    ["1", "算力房東", "蓋 AI 資料中心、出租 GPU（GPUaaS：像租車一樣按小時租 GPU）", ["SKT", "SoftBank", "Singtel", "DT", "中華"]],
    ["2", "自建大模型", "自己訓練母語的基礎模型，搭國家「主權 AI」政策", ["SKT", "SoftBank", "NTT"]],
    ["3", "網路 × AI", "AI 管基地台（AI-RAN）、全光網路（IOWN）把機房串起來", ["SoftBank", "NTT", "中華"]],
    ["4", "企業 AI 整合", "轉售外部模型（OpenAI、Claude、Gemini），做行業應用", ["DT", "Singtel", "中華"]],
  ];
  const RTW = [36, 120, 330, W - 36 - 120 - 330];
  const aiPaths = page(
    ...header("06 AI 布局 · 電信業為什麼做 AI", "電信業做 AI 有四條路，中華電信沒選自建大模型",
      "電信公司手上有機房、電力、網路和政府信任，正好是 AI 缺的東西；差別在要不要自己花大錢訓練模型"),
    trow(RTW, ["", "路線", "在做什麼", "誰在做"], { head: true, h: 18 }),
    ...RT.map(([n, t, d, who], i) => trow(RTW, [n, t, d, who.join("、")], { h: 42, sizes: [16, 13, 10.5, 10.5], colors: [i === 1 ? GRAY : BLUE, i === 1 ? GRAY : INK, INK, INK] })),
    gap(12),
    row({ gap: 12 },
      card((W - 12) / 2, 94, [8, 12, 8, 12], text("為什麼不自建模型？", { size: 12.5, bold: true, color: BLUE }),
        text("日韓有國家主權 AI 計畫撐腰，母語市場也夠大（SKT 自建 5,190 億參數模型）。台灣的繁中模型由國科會 TAIDE 主導，市場小；查不到中華電信參與 TAIDE 或自建大模型", { size: 9.5, w: (W - 12) / 2 - 24, lineSpacingMultiple: 1.25 })),
      card((W - 12) / 2, 94, [8, 12, 8, 12], text("環境推了一把", { size: 12.5, bold: true }),
        text("台電 2023 年起限制桃園以北新增 5MW 以上用電，大型 AI 機房很難蓋在北部；中華電信的「分散式 AI 資料中心」就是把算力分到中南部，再用光網路串起來", { size: 9.5, w: (W - 12) / 2 - 24, lineSpacingMultiple: 1.25 }))),
    takeaway("中華電信的定位：AI 的房東＋網路＋整合商，不當模型公司"),
    source("國際同業：SKT、SoftBank、NTT、Singtel、Deutsche Telekom 公開資料（搜尋摘要，未逐字核對）；中華：2025 年報、2026 法說；TAIDE：2 次搜尋查無中華電信參與紀錄；\n台電限電：iThome、民報（2023 年起）；分散式 AIDC：中華電信 2026/6 演講"));

  // ── 06 AI 組織：誰在做 AI ─────────────────────────────────
  const OW = W, OH = 300;
  const og = (x, y, w, h, t, s, o = {}) => [rect(x, y, w, h, { fill: o.fill || WHITE, line: { color: o.lc || INK, width: o.lw || 0.75 } }),
    text(t, { x: x + 8, y: y + 6, w: w - 16, size: 11.5, bold: true, color: o.tc || INK }),
    text(s, { x: x + 8, y: y + 24, w: w - 16, size: 9, color: o.sc || INK, lineSpacingMultiple: 1.2 })];
  const aiOrg = page(
    ...header("06 AI 布局 · 誰在做 AI", "沒有「AI 處」：委員會帶頭，研究院和子公司做事",
      "2023 下半年 ChatGPT 熱潮後成立「AI 2.0 企業策略委員會」，由總經理當主委；真正寫程式的是電信研究院"),
    col({ layer: true, w: OW, h: OH },
      ...og(250, 0, 340, 70, "AI 2.0 企業策略委員會（2023）", "董事長督導、總經理林榮賜任主委、4 位執行副總任委員。推 6 個「觸媒計畫」：智慧客服、智慧櫃台、法律助理、軟體開發、Copilot、算力雲", { fill: BLUE, lc: BLUE, tc: WHITE, sc: WHITE }),
      hl(125, 84, 590, INK, 0.75), vl(420, 70, 14, INK, 0.75),
      image(IMG + "exec-lin-forum-2026.jpg", { x: 0, y: 0, w: 96, h: 70, fit: "cover" }),
      text("主委：總經理林榮賜｜工商時報", { x: 102, y: 26, w: 140, size: 8.5, color: GRAY }),
      ...[125, 420, 715].map((x) => vl(x, 84, 12, INK, 0.75)),
      ...og(0, 96, 250, 86, "電信研究院（研發）", "約 1,500 人、近 300 件 AI 專利（AI 專利全台第 4、電信業第 1）；院長蘇添財。2017 年起養 AI 團隊", { fill: LBLUE, lc: BLUE }),
      ...og(290, 96, 260, 86, "分公司（賣 AI、用 AI）", "企業客戶：賣 AI 專案；資訊技術：機房、算力雲；網路技術：基地台 AI 節能；個人家庭：Hami、AI 客服", {}),
      ...og(590, 96, 250, 86, "董事會的 AI 專長", "董事簡立峰（前 Google 台灣總經理，交通部代表）、獨董杜奕瑾（台灣人工智慧實驗室創辦人）", {}),
      text("子公司（把 AI 做成獨立事業）", { x: 0, y: 196, w: 400, size: 11, bold: true, color: BLUE }),
      ...[["中華創智 InventAI", "2025/10，研究院 AI 團隊獨立；企業 AI 分析、語音、AgentHub；目標 2026 營收 5,000 萬以上"], ["中華曜智", "2026/10，AI 影像辨識、智慧城市、安防"], ["是方電訊（56%）", "機房主力子公司；雲林虎尾 AI 資料中心 16MW，2028 下半年啟用"], ["中華資安（57%）", "AI 資安、防詐；2025 年上市"]].flatMap(([t, s], i) =>
        og(i * 212, 216, 202, 80, t, s, { lc: i < 2 ? BLUE : INK }))),
    takeaway("AI 不另設部門：委員會定方向，研究院做技術，子公司做成生意"),
    source("委員會：2025 年報（AI 2.0 PMO）、數位時代專訪（2024/9/13）；研究院：中華電信新聞稿（2025/10/23 AI 專利）、媒體（1,500 人）；子公司：公司新聞稿（2025/10/21、2026/10/22）、20-F FY2025；\nInventAI 營收目標、虎尾規模：媒體報導"));

  // ── 06 AI 業務：三層 ──────────────────────────────────────
  const LYW = 120, LPW = 170, LTW = W - LYW - LPW - 24;
  const layerAI = (name, en, img, cap, items, hi) => row({ gap: 12, align: "center", h: 92 },
    col({ layer: true, w: LYW, h: 84 },
      rect(0, 0, LYW, 84, hi ? { fill: BLUE, line: { color: BLUE, width: 0 } } : { fill: LBLUE, line: { color: BLUE, width: 0.75 } }),
      label(0, 18, LYW, 24, name, { size: 15, bold: true, color: hi ? WHITE : INK }),
      label(0, 44, LYW, 20, en, { size: 9, color: hi ? "CFE0FD" : GRAY })),
    col({ w: LTW, gap: 4 }, ...items.map(([t, d]) => row({ gap: 8 },
      text(t, { size: 10.5, bold: true, w: 130 }),
      text(d, { size: 9.5, w: LTW - 138, lineSpacingMultiple: 1.2 })))),
    photo(img, LPW, 70, cap));
  const aiBiz = page(
    ...header("06 AI 布局 · 業務", "AI 業務分三層：租算力、接模型、做應用",
      "底下出租機房和 GPU，中間串接外部模型，上面幫政府和企業做應用；每一層都是既有業務的延伸"),
    layerAI("應用", "AI SOLUTIONS", "sovereign-ai-kaohsiung-pierf-exterior.jpg", "高雄 PIER F 主權 AI 基地｜自由時報",
      [["政府", "高雄 AI 燈塔：整合 1.3 萬支攝影機，道路坑洞 2 分鐘派工；智慧監控合約 10 億以上"], ["企業", "AI 客服（金融業首套整合型）、在宅住院 AI 監測（70 家醫院）"], ["個人", "Google Gemini 方案、防詐（每年擋 107.7 億次威脅）"]]),
    layerAI("平台", "AI FACTORY", "hdxk-banner-2026.jpg", "2026 尾牙「海地星空」｜科技新報", [["CHT AI Factory", "串接 OpenAI（Azure）、Claude（AWS）、Gemini 等多家外部模型；Agent Hub 讓企業不寫程式就能做 AI 代理人"], ["顧問與轉售", "幫企業挑模型、處理合規；2023 年已有 600 張以上微軟證照"]]),
    layerAI("算力與機房", "AIDC", "ai-datacenter-immersion-cooling-vertiv.jpg", "AI 伺服器浸沒式液冷測試｜工商時報", [["崙坪 AI 資料中心", "2026/8 啟用，全部建成 36MW（1MW 約可放數十櫃 AI 伺服器）"], ["hicloud AI 算力雲", "2025/8 上線，GPU 最小可切 1/4 張、按小時租"], ["台中、虎尾", "證交所備援中心（2029）、是方虎尾 16MW（2028 下半年）"]], true),
    takeaway("最確定賺錢的是最底層：機房；平台和應用還在拿案子的階段"),
    source("公司新聞稿（2025/8 hicloud、2025/12 PIER F、2026/4 Tech Day、2026/10 高雄 AI 燈塔、2026/11 Google）；2026 Q1–Q2 法說；官網；虎尾規模為媒體報導；照片：中華電信、iThome、科技新報"));

  // ── 06 內部用 AI ───────────────────────────────────────────
  const IUW = (W - 36) / 4;
  const iu = (big, unit, t, d) => card(IUW, 132, [10, 12, 10, 12],
    row({ gap: 3, align: "end" }, text(big, { size: 26, bold: true, color: BLUE }), text(unit, { size: 11, bold: true })),
    text(t, { size: 12, bold: true, w: IUW - 24 }),
    text(d, { size: 9.5, color: INK, w: IUW - 24, lineSpacingMultiple: 1.2 }));
  const aiInternal = page(
    ...header("06 AI 布局 · 自己先用", "對內先用 AI：省電、省人、補上退休潮的經驗斷層",
      "2023 年退休超過 1,300 人，未來 5 年還有約 4,000 人屆退；員工平均 44.6 歲、年資 16 年。AI 是「經驗傳承」的工具"),
    row({ gap: 12 },
      iu("−75", "%", "機房事件處理時間", "AI 監控機房、雲端和重要系統（AIOps）；稽核時間 −98%"),
      iu("10", "秒", "國際帳務對帳", "原本 6 人做 1 天；處理約 100 億元、7 種幣別，人力省 8 成"),
      iu("293", "萬度", "基地台 AI 節電", "2025 年；和 Ericsson 合作。2026 年預估超過 500 萬度"),
      iu("−50", "%", "寫程式時間", "上千名工程師用 GitHub Copilot；註解、測試再省約 2 成")),
    gap(12),
    row({ gap: 12 },
      card((W - 12) / 2, 96, [8, 12, 8, 12], text("全員學 AI", { size: 12.5, bold: true, color: BLUE }),
        text("約 70 門課、2.8 萬人次；111 位高階主管集體拿 Scrum 敏捷認證（2026/10）；ISO 42001 AI 管理認證預計 2027/3 前取得", { size: 10, w: (W - 12) / 2 - 24, lineSpacingMultiple: 1.25 })),
      card((W - 12) / 2, 96, [8, 12, 8, 12], text("同時有勞資爭議", { size: 12.5, bold: true }),
        text("工會 2026/10 起罷工投票，要求延後退休、提高退休金提撥；公司以「AI 時代需要人才流動」反對全面延退。投票結果尚未查到", { size: 10, w: (W - 12) / 2 - 24, lineSpacingMultiple: 1.25 }))),
    takeaway("內部 AI 的成果實在，但省下的是成本，不會直接出現在營收"),
    source("成效數字：中華電信官網負責任 AI 頁、2024/12/20 Copilot 新聞稿；退休人數：數位時代專訪（2024/9/13）；員工年齡年資：2025 年報；勞資爭議：公司與工會聲明、新聞（2026/5–10）"));

  // ── 06 AI 發展時間軸 ───────────────────────────────────────
  const AT = [
    ["2017", "研究院 AI 團隊", "林榮賜任研究院院長；做影像、語音 AI", "深度學習成熟，但還沒有 ChatGPT", false],
    ["2023", "AI 2.0 委員會", "接 Azure OpenAI 進內部；6 個觸媒計畫", "ChatGPT 爆紅；同年 5 家電信併成 3 家", true],
    ["2024/9", "新經營團隊", "簡志誠、林榮賜上任，喊「中華 AI 啟動未來」", "新政府上任 4 個月，交通部改派代表", false],
    ["2024/11", "AI 算力雲計畫", "採購 NVIDIA B 系列 GPU 測試，談主權雲合作", "北部大用電受限，GPU 缺貨", false],
    ["2025/8", "hicloud 算力雲", "GPU 按小時出租上線", "GPU 雲端出租價格戰", false],
    ["2025/10", "中華創智", "研究院 AI 團隊分拆成子公司", "行政院「AI 新十大建設」加碼", false],
    ["2026/8", "崙坪 AI 機房", "36MW AI 資料中心啟用", "台灣大桃園 25MW 同年啟用並宣稱完售", true],
    ["2026/10", "中華曜智", "AI 影像子公司；高雄 AI 燈塔成果", "工會發動罷工投票", false],
  ];
  const ATW = (W - 7 * 8) / 8;
  const aiTimeline = page(
    ...header("06 AI 布局 · 發展歷程", "九年三步：研究院養團隊 → 委員會推全公司 → 蓋機房、分拆子公司",
      "每一步都跟著外部環境走：ChatGPT 帶動需求、政府換人帶來新團隊、電力限制決定機房蓋在哪"),
    col({ layer: true, w: W, h: 22 },
      hl(0, 10, W, INK, 0.75),
      ...AT.map((m, i) => shape({ geom: "ellipse", x: i * (ATW + 8) + 2, y: 4, w: 13, h: 13, fill: m[4] ? BLUE : WHITE, line: { color: m[4] ? BLUE : INK, width: 1 } }))),
    gap(8),
    row({ gap: 8 }, ...AT.map(([y, t, n, env, hi]) =>
      col({ w: ATW, gap: 4 },
        text(y, { size: 16, bold: true, color: hi ? BLUE : INK }),
        text(t, { size: 12, bold: true, w: ATW }),
        text(n, { size: 9.5, w: ATW, lineSpacingMultiple: 1.2 }),
        text("環境：" + env, { size: 9, color: GRAY, w: ATW, lineSpacingMultiple: 1.2 })))),
    gap(10),
    row({ gap: 10 },
      photo("handover-2024-group.jpg", (W - 30) / 4, 80, "2024/9/30 董事長、總經理交接｜數位時代"),
      photo("idc-banqiao-interior.jpg", (W - 30) / 4, 80, "板橋 IDC 機房｜iThome"),
      photo("sovereign-ai-kaohsiung-pierf-cht-space.jpg", (W - 30) / 4, 80, "高雄 PIER F 主權 AI 基地｜自由時報"),
      photo("exec-lin-forum-2026.jpg", (W - 30) / 4, 80, "總經理林榮賜｜工商時報")),
    takeaway("真正開始花大錢是 2024 年新團隊上任之後"),
    source("中華電信新聞稿（2017–2026 標題清單、2025/10/21、2026/8/5、2026/10/22）；數位時代（2024/9）；經濟日報（2024/11 算力雲）；台電限電：iThome；台灣大 AIDC：民報、iThome；\n行政院 AI 新十大建設（2025/6，搜尋摘要）"));

  // ── 06 AI 目標：有什麼數字、缺什麼數字 ─────────────────────
  const GLW = 470, GLR = W - GLW - 24;
  const goalRow = (t, v, st, hi) => trow([150, 100, GLW - 250], [t, v, st], { h: 34, sizes: [10.5, 12, 10], colors: [INK, hi ? BLUE : INK, GRAY] });
  const aiGoals = page(
    ...header("06 AI 布局 · 目標", "公司給了很多目標，唯獨沒有「AI 營收」",
      "法說會上法人兩度追問崙坪 AI 機房投資多少、報酬率多少，公司都不揭露；只能用 ICT、機房營收來推"),
    row({ gap: 24 },
      col({ w: GLW, gap: 0 },
        text("公司公布的目標", { size: 11.5, bold: true }),
        gap(6),
        trow([150, 100, GLW - 250], ["目標", "數字", "進度"], { head: true, h: 18 }),
        goalRow("新三大百億", "各 100 億", "機房＋雲端已破百億；資安、Pre-6G 未到", true),
        goalRow("AIoT＋衛星＋大數據", "> 100 億", "2026 年目標"),
        goalRow("2026 資本支出", "319 億", "非行動 +24%；前三季只用 51%"),
        goalRow("崙坪 AI 資料中心", "36 MW", "2026/8 啟用，分期建置"),
        goalRow("中華創智營收", "> 5,000 萬", "2026；三年轉盈（媒體）"),
        goalRow("市值", "兆元", "2025 喊出；現約 1.25 兆", true),
        goalRow("AI 營收", "沒有公布", "—")),
      col({ w: GLR, gap: 8 },
        text("用替代指標推：AI 有多大？", { size: 11.5, bold: true }),
        hbar([["ICT 合計", 355, "355 億", true], ["機房＋雲端", 100, "> 100 億"], ["中華創智", 0.5, "0.5 億"]], GLR, 400, { labelW: 76, valueW: 56, h: 16, size: 10.5 }),
        text("2025 年；總營收 2,361 億。機房＋雲端約占 4%", { size: 9.5, color: GRAY, w: GLR }),
        card(GLR, 112, [8, 12, 8, 12],
          text("林榮賜（2026 Q2 法說）", { size: 10.5, bold: true, color: BLUE }),
          text("「（崙坪和證交所合作）證明我們能把 AI 基礎建設投資，轉成長期的財務回報」——但沒有給投資額和報酬率", { size: 10, w: GLR - 24, lineSpacingMultiple: 1.3 })))),
    takeaway("AI 目前是「機房出租＋專案」的故事，規模約占營收 4–15%，還不是獨立引擎"),
    source("目標：2025 年報 p.6、2026 財測新聞稿、2025 Q4 法說、2026 Q2 法說；InventAI：媒體報導；市值：2026/11/5 收盤 × 股數（自己計算）；\n法人追問：2026 Q2 法說 Q&A（HSBC、JPMorgan）；ICT、機房＋雲端：2025 年報致股東報告書"));

  // ── 06 AI 對手棋盤 ───────────────────────────────────────
  const ARW = [110, (W - 110) / 3, (W - 110) / 3, (W - 110) / 3];
  const ar = (cells, h = 50) => trow(ARW, cells, { h, sizes: [11, 10, 10, 10], colors: [INK, BLUE, INK, INK] });
  const aiRivals = page(
    ...header("06 AI 布局 · 對手棋盤", "三家押不同層：台灣大搶算力批發，遠傳先不碰重資產",
      "同一個 AI 熱潮，三家手上的牌不同（電力、機房、資金、客戶），所以下的棋也不同"),
    row({ gap: 0, align: "center", h: 28 },
      col({ w: ARW[0] }),
      ...[["cht-logo.png", 90], ["twm-logo.png", 90], ["fet-logo.png", 70]].map(([f, w], i) => col({ w: ARW[i + 1] }, image(IMG + f, { w, h: 22, fit: "contain" })))),
    trow(ARW, ["", "中華電信", "台灣大哥大", "遠傳電信"], { head: true, h: 18 }),
    ar(["AI 機房", "多點分散：崙坪 36MW、台中、是方虎尾 16MW；IDC 市占 78%", "集中一座：桃園 25MW，與 NVIDIA 雲端夥伴 GMI Cloud 合作，宣稱預售完", "不新建：用 9 座既有機房，部分樓層加液冷"]),
    ar(["它的理由", "北部缺電、自己有土地和網路；客戶多是政府、金融", "25MW 用電是 2023 限電令前拿到的；鎖定要資料留在台灣的客戶", "認為大算力需求集中在做大模型的公司，保留彈性"]),
    ar(["AI 應用", "AI Factory 接多家模型；兩家 AI 子公司", "AI 與雲服務營收 2026 Q1 年增 471%（低基期）", "自研平台「遠傳智靈」；微軟授權方案年增 51%"]),
    ar(["風險", "投資額、報酬率都不揭露", "押單一大客戶、單一機房", "AI 熱潮若持續，可能錯過機房需求"]),
    takeaway("中華電信的牌最多（機房、電力、信任），但也最不透明"),
    source("中華：2026 Q2 法說、公司新聞稿；台灣大、遠傳：民報、iThome、經濟日報、各公司法說（部分為搜尋摘要，未逐字核對；台灣大 AIDC 地點說法不一）"));

  // ── 03 行動 · 對手棋盤 ─────────────────────────────────────
  const MCW2 = [110, (W - 110) / 3, (W - 110) / 3, (W - 110) / 3];
  const mc = (cells, h = 34) => trow(MCW2, cells, { h, sizes: [10.5, 10, 10, 10], colors: [INK, BLUE, INK, INK] });
  const mobileComp = page(
    ...header("03 行動通信 · 對手棋盤", "合併後三家各有算盤：台灣大衝規模，遠傳衝 5G 升級",
      "中華電信用戶最多、頻譜位置最好；兩家對手靠合併補人數和頻譜，各自找不同的成長方向"),
    row({ gap: 0, align: "center", h: 28 },
      col({ w: MCW2[0] }),
      ...[["cht-logo.png", 90], ["twm-logo.png", 90], ["fet-logo.png", 70]].map(([f, w], i) => col({ w: MCW2[i + 1] }, image(IMG + f, { w, h: 22, fit: "contain" })))),
    trow(MCW2, ["", "中華電信", "台灣大哥大", "遠傳電信"], { head: true, h: 18 }),
    mc(["行動寬頻用戶", "1,132 萬（40%）", "892 萬（31%）", "816 萬（29%）"]),
    mc(["月租 5G 滲透率", "45.8%", "43.6%", "49.8%（三家最高）"]),
    mc(["3.5GHz 5G 頻寬", "90MHz（位置最好）", "100MHz（含台灣之星 40）", "80MHz"]),
    mc(["2025 營收／EPS", "2,361 億／4.99 元", "1,988 億／4.77 元（含 momo 電商）", "1,104 億／3.81 元"]),
    mc(["處境", "第一名，守住高價值用戶", "2023 併台灣之星，用戶衝到第二", "2023 併亞太，拿到用戶和頻譜"], 40),
    mc(["最近的棋與理由", "不殺價、靠 5G 升級和漫遊漲 ARPU；錢投向機房", "桃園 25MW AI 機房；2030 年營收目標 3,500–4,000 億，要從電信跳到科技集團", "不蓋新 AI 機房，主攻 5G 升級和企業應用；頻寬最少，先把用戶升上 5G"], 52),
    takeaway("三家不再搶同一批人：價格戰的條件消失，是中華電信 ARPU 回升的前提"),
    source("用戶與 5G 滲透率：NCC（經 SOGI 手機王，2026/8）；頻譜：中華 20-F FY2025、2020 標售結果（公視）；營收、EPS：公開資訊觀測站；\n台灣大目標與 AI 機房、遠傳策略：民報、iThome、經濟日報（部分為搜尋摘要）"));

  // ── 07 競爭總覽 ───────────────────────────────────────────
  const BCW = (W - 32) / 3;
  const coCard = (logo, lw, name, what, rev, hi) =>
    card(BCW, 96, [9, 14, 9, 14],
      row({ gap: 10, align: "center" },
        image(IMG + logo, { w: lw, h: 18, fit: "contain" }),
        text(name, { size: 12, bold: true, color: hi ? BLUE : INK, w: BCW - 28 - lw - 10 })),
      text(what, { size: 10, color: INK, w: BCW - 28, lineSpacingMultiple: 1.2 }),
      col({ grow: 1, justify: "end" }, text(rev, { size: 12, bold: true, color: hi ? BLUE : INK, w: BCW - 28 })));
  const BPW = 66, BNW = 92, BXW = (W - BPW - BNW - 4 * 10) / 3;
  const bfRow = (img, name, cells, head) =>
    col({ gap: 0 },
      row({ gap: 10, align: "center", h: head ? 18 : 40 },
        head ? col({ w: BPW }) : image(IMG + img, { w: BPW, h: 34, fit: "cover" }),
        text(name, { size: head ? 10 : 11.5, bold: !head, color: head ? GRAY : INK, w: BNW, lineSpacingMultiple: 1.15 }),
        ...cells.map((c, j) => text(c, { size: head ? 10 : 10, bold: head ? false : j === 0, color: head ? GRAY : j === 0 ? BLUE : INK, w: BXW, lineSpacingMultiple: 1.2 }))),
      shape({ geom: "rect", w: W, h: head ? 0.75 : 0.5, fill: head ? INK : LGRAY, line: { color: LGRAY, width: 0 } }));
  const battleMap = page(
    ...header("07 競爭總覽 · 競爭地圖", "中華電信在哪個戰場、跟誰打？",
      "行動是三雄對打；寬頻對手是有線電視；機房一家獨大；雲端和 AI 則要面對外商"),
    row({ gap: 16 },
      coCard("cht-logo.png", 80, "中華電信", "行動、固網、機房、資安全都有；交通部最大股東", "2025 營收 2,361 億", true),
      coCard("twm-logo.png", 80, "台灣大哥大", "行動第二＋momo 電商＋有線電視；富邦集團", "2025 營收 1,988 億"),
      coCard("fet-logo.png", 64, "遠傳電信", "行動第三＋企業 ICT；遠東集團", "2025 營收 1,104 億")),
    gap(8),
    bfRow(null, "戰場", ["中華電信", "主要對手", "對手的優勢"], true),
    bfRow("bts-5g-antenna.jpg", "行動", ["營收市占 41%，第一", "台灣大、遠傳（各約 29%）", "合併後規模接近；遠傳 5G 滲透率最高"]),
    bfRow("fiber-distribution-box.jpg", "固網寬頻", ["HiNet 市占 52%、市話 91%", "有線電視業者", "價格低；和行動業者綁售"]),
    bfRow("idc-banqiao-exterior.jpg", "機房 IDC", ["市占 78%（含是方）", "遠傳、台灣固網、宏碁資訊", "規模小，但可以專攻特定客戶"]),
    bfRow("ai-datacenter-immersion-cooling-vertiv.jpg", "雲端／AI", ["算力雲、AI Factory、整合", "AWS、Google、微軟；台灣大 AI 機房", "外商功能多、規模大；台灣大搶先完售"]),
    takeaway("本業是穩定的三雄；成長戰場（雲端、AI）對手變成外商和台灣大"),
    source("營收：公開資訊觀測站（2025）；市占：中華電信 2026 Q3 簡報、20-F FY2025、2026 Q2 法說；對手名單：20-F FY2025；台灣大 AI 機房：民報、iThome"));

  // ══ 09 財務模型與估值（數字與 Google Sheet「[Model] 2412 中華電信」一致） ══
  const PQR = [
    ["月租門號（萬）", "—", "991", "998", "1,010", "1,020", "1,030"],
    ["月租 ARPU（元）", "547", "553", "561", "573", "585", "597"],
    ["行動服務（億）", "643", "662", "685", "708", "730", "752"],
    ["固網服務（億）", "819", "817", "815", "823", "827", "831"],
    ["銷貨（億）", "368", "372", "385", "431", "410", "410"],
    ["ICT（億）", "275", "318", "345", "414", "463", "510"],
    ["其他（億）", "126", "130", "132", "197", "140", "145"],
    ["營收（億）", "2,232", "2,300", "2,361", "2,572", "2,569", "2,647"],
    ["毛利率", "36.5%", "36.3%", "36.8%", "36.8%", "36.1%", "36.0%"],
    ["營益率", "20.8%", "20.4%", "20.6%", "21.3%", "20.5%", "20.4%"],
    ["EPS（元）", "4.76", "4.80", "4.99", "5.55", "5.35", "5.47"],
  ];
  const PQCW = [150, ...Array(6).fill((W - 150) / 6)];
  const pqHist = page(
    ...header("09 財務模型與估值 · 量價拆解", "2027 年 EPS 估 5.35 元：一次性收益消失，ICT 補回大半",
      "行動用「門號 × ARPU」、固網持平、ICT 用成長率（2026 +20%、2027 +12%）、手機銷售跟著 iPhone 週期"),
    trow(PQCW, ["", "2023", "2024", "2025", "2026F", "2027F", "2028F"], { head: true, h: 18 }),
    ...PQR.map((r, i) => trow(PQCW, r, { h: i === 7 || i === 10 ? 26 : 23, sizes: Array(7).fill(i === 10 ? 12.5 : 10.5),
      colors: [INK, INK, INK, INK, i === 5 || i === 10 ? BLUE : INK, i === 5 || i === 10 ? BLUE : INK, i === 5 || i === 10 ? BLUE : INK] })),
    takeaway("模型的核心假設：ICT 一年長 1–2 成、ARPU 一年漲 2%；其他都差不多不動"),
    source("實際年：公開資訊觀測站、各季財務分析表（行動＝個家＋企客行動服務；固網＝三事業群固網服務；ICT＝企客＋國際 ICT）；預估：Google Sheet「[Model] 2412 中華電信」基本情境；\n各產品毛利率為自估（行動 50%、固網 45%、銷貨 5%、ICT 20%）；2026F 其他營收含 Q3 一次性收益"));

  // ── 09 2027 三情境 ─────────────────────────────────────────
  const SCW = (W - 24) / 3;
  const scen = (n, eps, rev, items, hi) => card(SCW, 300, [12, 14, 12, 14],
    text(n, { size: 15, bold: true, color: hi ? BLUE : INK }),
    row({ gap: 4, align: "end" }, text(eps, { size: 40, bold: true, color: hi ? BLUE : INK }), text("元 EPS", { size: 12, bold: true })),
    text(rev, { size: 10.5, color: GRAY }),
    gap(4),
    col({ gap: 5 }, ...items.map((t) => row({ gap: 6 }, text("—", { size: 10, color: BLUE, w: 14 }), text(t, { size: 10.5, w: SCW - 28 - 20, lineSpacingMultiple: 1.25 })))));
  const scenarios = page(
    ...header("09 財務模型與估值 · 2027 三情境", "好壞情境只差 0.4 元：電信本業穩，變數在 ICT",
      "三個情境都扣掉 2026 年的一次性收益；差別在 ICT 成長、ARPU 漲幅和毛利率"),
    row({ gap: 12 },
      scen("保守", "5.12", "營收 2,499 億（−3%）", ["ICT 只長 5%（大案結束、沒有新大案）", "ARPU +1%、門號持平", "iPhone 換機潮過，銷貨 −10%", "毛利率調整項 +0.6 個百分點"]),
      scen("基本", "5.35", "營收 2,569 億（持平）", ["ICT +12%（新簽約已是去年 1.4 倍）", "ARPU +2%、門號 +1%", "銷貨 −5%", "毛利率調整項 +1.1 個百分點（同 2025）"], true),
      scen("樂觀", "5.54", "營收 2,647 億（+3%）", ["ICT +20%（AI 機房滿載、海外建廠案延續）", "ARPU +3%、門號 +2%", "銷貨持平", "毛利率調整項 +1.5 個百分點"])),
    takeaway("就算樂觀，2027 EPS 也只比 2026（含一次性）持平：成長是「慢慢變好」"),
    source("Google Sheet「[Model] 2412 中華電信」基本情境；保守、樂觀為同一模型改假設計算；營收年增以 2026F 2,572 億為基期"));

  // ── 09 估值 ───────────────────────────────────────────────
  const PE = [22, 25, 28, 31, 34], EPSS = [["保守", 5.12], ["基本", 5.35], ["樂觀", 5.54]], PRICE = 161.5, MCW = 92;
  const valuation = page(
    ...header("09 財務模型與估值 · 估值", "現價 161.5 元 ≈ 2027 基本情境 EPS × 30 倍",
      "股價＝EPS × 本益比。過去 5 年中華電信本益比在 23–30 倍；現在 31.7 倍，站上 5 年最高"),
    row({ gap: 30 },
      col({ gap: 0 },
        row({ gap: 0 },
          text("2027 EPS ＼ 本益比", { size: 10.5, color: GRAY, w: 130 }),
          ...PE.map((p) => text(`${p} 倍`, { size: 13, bold: true, w: MCW, align: "center" }))),
        gap(6),
        ...EPSS.map(([n, e]) =>
          row({ gap: 0, align: "center", h: 62 },
            col({ w: 130, gap: 2 }, text(n, { size: 13, bold: true }), text(`EPS ${e} 元`, { size: 11, color: GRAY })),
            ...PE.map((p) => {
              const v = e * p, near = Math.abs(v - PRICE) / PRICE < 0.05;
              return col({ layer: true, w: MCW, h: 56 },
                rect(4, 0, MCW - 8, 56, { fill: near ? BLUE : WHITE, line: { color: near ? BLUE : LGRAY, width: 0.75 } }),
                label(4, 0, MCW - 8, 56, Math.round(v).toString(), { size: 18, bold: true, color: near ? WHITE : INK }));
            })))),
      col({ grow: 1, gap: 12 },
        card(W - 130 - MCW * 5 - 30, 106, [12, 16, 12, 16],
          text("現在股價（11/5）", { size: 11, color: GRAY }),
          text("161.5 元", { size: 26, bold: true, color: BLUE }),
          text("市值約 1.25 兆；一個月 +11%", { size: 10.5, color: GRAY, w: W - 130 - MCW * 5 - 62 })),
        card(W - 130 - MCW * 5 - 30, 106, [12, 16, 12, 16],
          text("殖利率", { size: 11, color: GRAY }),
          text("3.2%", { size: 26, bold: true, color: INK }),
          text("2025 股利 5.2 元；若 2027 照 104% 配發約 5.6 元 → 3.4%", { size: 10.5, color: GRAY, w: W - 130 - MCW * 5 - 62 })))),
    gap(8),
    text("藍底＝和現在股價差不到 5% 的組合。回到 5 年區間上緣 28 倍，基本情境約 150 元；外資目標價（2026/6）150 元", { size: 11, color: GRAY }),
    takeaway("股價已經反映「電信股＋AI 機房」的溢價；要再漲，得看到 AI 營收數字"),
    source("股價、本益比、殖利率：證交所（2026/11/5，本益比以近四季至 2026 Q2）；5 年本益比區間：財報狗河流圖；外資目標價：經濟日報（2026/6/24，未具名）；EPS：Google Sheet 模型"));

  // ── 09 結論：要追蹤什麼 ───────────────────────────────────
  const CW20 = (W - 30) / 4;
  const watch = (n, t, d, sig) =>
    card(CW20, 224, [14, 14, 14, 14],
      text(n, { size: 26, bold: true, color: BLUE }),
      text(t, { size: 14, bold: true, color: INK, w: CW20 - 28 }),
      text(d, { size: 10.5, color: INK, w: CW20 - 28, lineSpacingMultiple: 1.3 }),
      col({ grow: 1, justify: "end" }, text(sig, { size: 10, color: GRAY, w: CW20 - 28, lineSpacingMultiple: 1.3 })));
  const tracking = page(
    ...header("09 財務模型與估值 · 結論", "押的是 ICT 和 AI 機房：這四件事最先告訴你對不對",
      "下一個檢查點：11/10 十月營收、2027 年 1 月的全年財測（看 ICT 和資本支出怎麼寫）"),
    row({ gap: 10 },
      watch("01", "ICT 成長與新簽約", "2026 前三季 +20%、簽約 1.4 倍；看 2027 財測有沒有給 ICT 目標", "ICT 年增掉到 10% 以下 → 成長故事變弱"),
      watch("02", "扣一次性後的 EPS", "Q3 含資產活化收益；Q4 與 2027 Q1 才看得到真實獲利水準", "2027 Q1 EPS 低於 1.30 元 → 本業沒有變快"),
      watch("03", "AI 機房揭露", "崙坪 36MW 的出租率、投資額；有沒有開始揭露 AI 營收", "持續不揭露、資本支出又花不完 → 市場會打折"),
      watch("04", "配息與治理", "配發率能否維持 104%；罷工投票結果；政府交替（2028 總統大選）", "配發率降到 100% 以下，或人事大換 → 存股族會走")),
    takeaway("中華電信不會暴衝；要看的是 ICT 能不能讓它「每年穩定多賺一點」"));

  return [cover, summary, div1, intro, endMarkets, narrative, bgDiv, history, keySuccess, rules, revMix,
    div2, govStruct, leaders, team, chairs, govCompare,
    div3, mobileMkt, mobilePQ, mobileComp,
    div4, fixedMkt, fixedProd,
    div5, ictMkt, ictProd, ictComp,
    div6, aiPaths, aiOrg, aiBiz, aiInternal, aiTimeline, aiGoals, aiRivals,
    battleMap,
    div8, segSplit, guide, annual, cashUse,
    div9, pqHist, scenarios, valuation, tracking];
}
