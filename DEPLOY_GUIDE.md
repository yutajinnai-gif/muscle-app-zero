# 🚀 デプロイガイド

## 方法1：GitHub + Vercel（推奨）⭐

### 前提条件
- GitHubアカウント
- Vercelアカウント（GitHubと連携済み）
- Gitがインストールされている

### 手順

#### 1. ZIPをダウンロード
修正版ZIPファイルをダウンロードして解凍

#### 2. GitHubリポジトリにプッシュ

```bash
# プロジェクトディレクトリに移動
cd muscle-app-phase1

# Gitリポジトリを初期化（初回のみ）
git init

# 既存のリポジトリがある場合は、リモートを追加
git remote add origin https://github.com/あなたのユーザー名/muscle-app-zero.git

# または既存リモートのURLを変更
git remote set-url origin https://github.com/あなたのユーザー名/muscle-app-zero.git

# 全てのファイルをステージング
git add .

# コミット
git commit -m "Phase 1: 基礎実装完了

- スーパーセット対応
- 器具・アタッチメント・角度記録
- 自力・補助レップ分離
- RPE自動計算機能
- 種目・グループ削除機能
- ナビゲーション + 履歴画面
- データ永続化（LocalStorage）
"

# プッシュ
git branch -M main
git push -u origin main
```

#### 3. Vercelで自動デプロイ
GitHubにプッシュすると、Vercelが自動的にデプロイを開始します。

**デプロイ状況の確認：**
- Vercelダッシュボード: https://vercel.com/dashboard
- デプロイ完了後、`https://muscle-app-zero.vercel.app` でアクセス可能

---

## 方法2：Vercel CLI（直接デプロイ）

### 前提条件
- Node.js v14以上
- Vercel CLIをインストール

### 手順

#### 1. Vercel CLIをインストール
```bash
npm install -g vercel
```

#### 2. Vercelにログイン
```bash
vercel login
```

#### 3. プロジェクトディレクトリに移動
```bash
cd muscle-app-phase1
```

#### 4. デプロイ
```bash
# 初回デプロイ
vercel

# 本番環境にデプロイ
vercel --prod
```

#### 5. 既存プロジェクトにリンク（既にVercelプロジェクトがある場合）
```bash
vercel link
# プロンプトに従って既存プロジェクトを選択

# 本番環境にデプロイ
vercel --prod
```

---

## 方法3：Vercel Web UI（ドラッグ&ドロップ）

### 手順

#### 1. Vercelダッシュボードを開く
https://vercel.com/dashboard

#### 2. 「Add New...」→ 「Project」

#### 3. 「Import Git Repository」
- GitHubリポジトリを選択
- または「Deploy」タブで直接ZIPをアップロード

#### 4. プロジェクト設定
- Framework Preset: `Other`
- Build Command: (空欄)
- Output Directory: `.`
- Install Command: (空欄)

#### 5. 「Deploy」をクリック

---

## トラブルシューティング

### 問題: 404 Not Found
**原因:** ルーティング設定が正しくない

**解決策:**
`vercel.json` ファイルが含まれているか確認
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### 問題: JavaScriptが読み込まれない
**原因:** パスが正しくない

**解決策:**
`index.html` のscriptタグが相対パスになっているか確認
```html
<script src="js/data-models.js"></script>
```
（`/js/data-models.js` ではなく `js/data-models.js`）

### 問題: LocalStorageが動作しない
**原因:** HTTPSでアクセスしていない

**解決策:**
Vercelは自動的にHTTPSを使用するため、通常は問題ありません。
ブラウザのコンソール（F12）でエラーを確認してください。

---

## 環境変数（将来の拡張用）

現在は環境変数は不要ですが、将来的にAPIを使用する場合：

### Vercelダッシュボードで設定
1. プロジェクト → Settings → Environment Variables
2. 変数を追加

### 例
```
API_KEY=your_api_key_here
```

---

## デプロイ後の確認

### チェックリスト
- [ ] https://muscle-app-zero.vercel.app にアクセスできる
- [ ] 通常種目を追加できる
- [ ] スーパーセットを追加できる
- [ ] セットを記録できる
- [ ] RPEが自動計算される
- [ ] 種目・グループを削除できる
- [ ] 履歴画面にアクセスできる
- [ ] データが保存される（リロード後も残る）
- [ ] iPhoneでアクセスできる
- [ ] スマホ表示が適切

---

## 推奨ワークフロー

### 開発フロー
1. ローカルで開発・テスト
2. GitHubにプッシュ
3. Vercelが自動デプロイ
4. 本番環境で確認

### ブランチ戦略（推奨）
- `main` → 本番環境
- `develop` → 開発環境
- `feature/*` → 機能開発

Vercelは各ブランチごとにプレビューURLを生成します。

---

## サポート

問題が発生した場合：
1. Vercelのデプロイログを確認
2. ブラウザのコンソール（F12）でエラーを確認
3. GitHubのissueで報告

---

**デプロイが完了したら、iPhoneのSafariで開いてテストしてください！** 📱✨
