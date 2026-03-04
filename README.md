# サブスク管理 - Subscription Manager

月額・年額のサブスクリプション支出を一元管理できる無料 Web アプリ（PWA 対応）です。

## 特徴

- 📋 **プリセット搭載**: ChatGPT、Claude、Netflix、Spotify など 100+ の日本国内主要サービスをワンタップで追加
- 💰 **支出の可視化**: 月額・年額合計、カテゴリ別ドーナツチャートで支出を把握
- 🌙 **ダークモード対応**: システム設定の自動検出 + 手動切替
- 📱 **PWA 対応**: ホーム画面に追加してネイティブアプリのように使用可能
- 🔒 **プライバシー**: データはすべてブラウザの localStorage に保存（サーバー送信なし）
- 📤 **データ管理**: JSON エクスポート / インポート対応

## 技術スタック

- React（Vite）
- Tailwind CSS v4
- recharts（チャート描画）
- lucide-react（アイコン）
- PWA（Service Worker + Web App Manifest）

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run preview
```

## ライセンス

MIT
