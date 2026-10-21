# 阿母的客兄｜安親活力褲 15 秒鄉土劇短片

劇情、分鏡、台語台詞、配音設定、白模預演與 Nano Banana Pro 素材的整合頁面。

## 檔案結構

```
index.html                 15 秒主片「阿母的客兄」製作紀錄
5s.html                    5 秒短影音 ×3（媽媽、爸爸、子女）製作紀錄
.nojekyll                  讓 GitHub Pages 原樣提供檔案
assets/img/                生成的角色、場景與定格圖
assets/gb/                 白模參考畫面與白模空景
assets/video/              白模 v7 預演（對稿版、乾淨版）與封面圖
assets/5s/                 5 秒短影音的首尾格、icon、Kling 生成與成片（網頁壓縮版）
```

## 發佈到 GitHub Pages

1. 把這個資料夾的內容推到一個 GitHub repository 的根目錄（或 `docs/` 資料夾）。
2. 到 repository 的 **Settings → Pages**，Source 選 **Deploy from a branch**，分支選 `main`，資料夾選 `/ (root)`（或 `/docs`）。
3. 儲存後約一分鐘，網址會出現在同一頁上方。

所有路徑都是相對路徑，放在子目錄也能正常顯示。

## 更新素材

- 新的生成圖：放進 `assets/img/`，再到 `index.html` 裡的 `IMG` 對照表加上檔名（例如 `"09":["assets/img/key09_tao_kheh_hiann.jpg"]`）。
- 新的白模影片：覆蓋 `assets/video/` 裡同名的檔案即可。

> 注意：repository 若設為公開，頁面任何人都能看到。這份內容含未上市的廣告企劃，建議使用私有 repository（GitHub Pages 私有網站需要 GitHub Enterprise）或在客戶同意後再公開。
