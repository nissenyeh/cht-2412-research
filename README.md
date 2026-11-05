# 中華電信（2412）公司研究簡報

公司研究讀書會用的研究簡報，47 頁，資料截至 2026/11/05（財報至 2026 Q3 公司自結）。

**內容**：公司概覽 · 管理層與治理（交通部、董事長、總經理、歷任董事長）· 行動 · 固網 · 企業 ICT · AI 布局（組織、業務、目標、對手）· 競爭 · 財務 · 2027 三情境與估值

## 檔案

| 檔案 | 說明 |
|---|---|
| `中華電信_2412.pptx` | 簡報成品 |
| `deck.mjs` | 簡報原始碼（所有文字與數字都在這裡） |
| `img/` | 照片；`img/IMAGES.md` 是來源與授權表，`img/_crop/` 是已裁好比例的照片 |
| `crop.py` | 新增照片時自動裁切比例 |
| `research_financial-market.md` | 財務與市場研究底稿（每個數字附來源） |
| `research_ai-management.md` | AI 布局與管理層研究底稿（每個事實附來源） |
| `docs/` | 2025 年中文年報（公開資訊觀測站） |

## 重新渲染

需要 Node.js 與 officeknife CLI（1.145.0）：

```bash
officeknife create deck.mjs --out 中華電信_2412.pptx --png preview/
```

有 `img/_crop/` 就不需要 Python；新增或更換照片時會呼叫 `uv run --with pillow python3 crop.py`，需要安裝 uv。

## 注意

- 這是個人研究筆記，不是投資建議；推估都有標示，可能有錯。
- 部分照片取自媒體報導（見 `img/IMAGES.md`），版權屬原作者，僅供研究討論引用。
