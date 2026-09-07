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
