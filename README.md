# reibun

高校英語の例文・問題を学習する React + Vite アプリです。

このリポジトリは **Vercel ではなく Cloudflare Workers Static Assets** で配信できる構成にしています。

## Local development

**Prerequisites:** Node.js 22 以上を推奨

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Vite のビルド成果物は `dist/` に出力されます。

## Cloudflare Workers にデプロイ

Cloudflare 用設定は `wrangler.jsonc` にあります。

```bash
npm install
npm run deploy:cloudflare
```

現在の構成は静的な React SPA なので、Worker のサーバーコードは不要です。`dist/` を Workers Static Assets として配信し、SPA の未一致パスは `index.html` にフォールバックします。

### Cloudflare の Git 連携を使う場合

Cloudflare Dashboard の **Workers & Pages → Create application → Import a repository** から、このリポジトリを接続してください。

- Repository: `yutateru6-collab/reibun`
- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`

接続後は `main` への push で Cloudflare 側が自動ビルド・自動デプロイできます。

## Cloudflare-compatible preview

```bash
npm run preview:cloudflare
```

## Environment variables / secrets

現在のアプリは実行時シークレットを必要としていません。

Vite の `VITE_*` 環境変数はブラウザ用 JavaScript に埋め込まれるため、API キーなどの秘密情報を入れないでください。秘密情報が必要になった場合は、Cloudflare Worker 側の Secret と API ルートへ移してください。

## 2026 midterm content

- Hope Example Bank: Lesson 1–12, 110 sentences
- Hope official fill-in tests: Test 1–6, 54 questions
- Vision Quest current range: Lesson 2-2 / 3-1 / 3-2
- Vision Quest numbered core examples: 45
- Vision Quest exercises available without missing illustrations: 66
- Illustration-dependent exercises held out: 9 (recorded in `src/data/exam_source_ledger.ts`)
- Known source inconsistencies are preserved and recorded instead of being silently corrected.

Run `npx tsx scripts/validate-content.ts` to verify source hashes, content counts, active card IDs, and range integrity.

## 時制の問題集・印刷（2026-09-13）

公開先は引き続き `https://reibun.itisnowornever271.workers.dev/`。別アプリは作成しません。

- ホームの「クイズ」から既存のクイズ一覧・文法説明に進みます。
- 「問題集・印刷」は時制①・②の元のExercises46問、同じ基本例文の形式変更32問、新作40問。暗唱例文Test3の元の問題10問は別の範囲から選べます（合計128問）。
- 元の英文・空欄・語群・解答・別解は元データを参照して維持。画像未収録の問題は除外。不整合は注記して黙って修正しません。
- 元の問題／形式変更／応用問題〔新作〕を各問に明示。種類ごとの問数・形式・範囲・並び順を選べます。
- 生成時点の問題・選択肢と正答を同じスナップショットとして保存し、練習・問題用紙・解答用紙で共有します。履歴は端末内の最新8セットです。
- 選択問題は自動採点、記述は別解を含む解説で自己採点。誤答だけの復習・印刷にも対応。入力中の解答と採点結果はメモリ内、復習対象IDと問題セットはlocalStorageに保存します。
- A4縦／JIS B4横2段。問題のみ・解答解説のみ・両方を選択。解答は新しいページから始まり、用紙上に同じセット番号を表示します。
- PDFはブラウザの印刷画面から保存します。用紙サイズを合わせ、倍率100％、ブラウザのヘッダー／フッターなしを推奨。字体・プリンタ依存の差は印刷プレビューで確認してください。

検証: `npx tsx scripts/workbook-model-regression.ts` と `node scripts/workbook-ui-regression.mjs`。ブラウザ検証はローカルプレビューを起動して実行します。GitHub ActionsでChromium/WebKit、既存学習モード、本番のビルド一致も確認します。

## 基本例文の入口をLessonごとに統合（2026-09-13）

- ホーム → 基本例文マスター → Lessonを選択 →「例文を覚える」「穴埋めで確認」「並べ替えで確認」。旧「例文／公式穴埋め」の二重の一覧は表示しません。
- 「例文を覚える」の中で「英語から見る／日本語から見る」を切り替えます。答えはタップするまで隠し、方向を変えても現在のカード位置を維持します。
- 自己申告テストとタイムアタックは、各Lessonの閉じた「その他の練習」にまとめました。元の穴埋めがあるLessonは、その出題内容も選べます。
- 元の穴埋めが収録されているのはLesson 1〜6のみ。7〜12に元の穴埋めがあるようには表示せず、新作も自動追加しません。
- 例文110文と元の穴埋め54問の本文・空欄・解答・解説・ID・既存の保存キーは変更していません。お気に入りと「まだ」は例文／問題それぞれの以前のIDを引き続き使います。問題セット・印刷履歴も維持します。
- ホームの旧「問題集・印刷」は「時制・完了形 強化練習」に改称しました。入った先で画面練習とプリント作成を選べます。
- 検証：`npx tsx scripts/unified-lessons-model.ts`、`npx tsx scripts/unified-lessons-ui.ts`（`BROWSER=webkit`も実行）。既存の回帰テストも新しい入口に合わせて更新しています。

## 試験前 最終チェック（2026-09-16）

- ホームに「試験前 最終チェック」を追加しました。添付された問題・解答解説の対応を番号で照合し、全200問を収録しています。
- 分野は「時制・完了形①」52問、「時制・完了形②」52問、「動詞①」50問、「動詞②」46問です。分野別に解くか、全範囲を4分野バランス／完全ランダムで解けます。
- 問題数は範囲内で10・20・30・50・100・200問から選択できます。各分野では、その分野の全問題も選べます。
- 選択問題は自動採点、それ以外は解答解説を見て「できた／もう一度」で自己採点します。結果は全体と分野別に表示し、間違えた問題は端末内に保存して解き直せます。
- 既存の「時制・完了形 強化練習」は、形式別に反復する練習としてそのまま残しています。最終チェックとは入口と目的を分けています。
- 検証：`npm run test:final-check:model` と `npm run test:final-check:ui`。GitHub ActionsでChromium／WebKitと本番反映も確認します。
