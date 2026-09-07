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
