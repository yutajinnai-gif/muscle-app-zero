# CHANGELOG

## [Phase 1] - 2025-11-15

### 🎉 新機能

#### コアシステム実装
- **スーパーセット対応**: 複数種目をグループ化して記録可能に
- **器具詳細記録**: 器具、アタッチメント、角度を種目ごとに記録
- **自力・補助レップ分離**: セットごとに自力と補助のレップ数を別々に記録
- **トレーナー名記録**: パーソナルトレーニング対応
- **種目順序の自動記録**: 追加順に種目が記録される

#### データ管理
- **LocalStorage統合**: オフラインでも動作、自動保存
- **データエクスポート/インポート**: JSONファイルでバックアップ・復元可能
- **過去データ比較**: 同じ条件（器具・角度・アタッチメント）での過去記録を自動表示

#### UI/UX
- **超コンパクトデザイン**: 
  - セット記録を1行表示（従来比66%削減）
  - 1種目の高さを50%削減（400px → 200px）
  - 情報密度の最大化
- **ダークテーマ**: 黒基調 + ネオンアクセント（グリーン/レッド）
- **レスポンシブ対応**: スマホ・タブレット・PCで最適表示
- **統計表示**: 合計セット数、総重量、平均RPEをリアルタイム表示

### 📁 ファイル構成

#### 新規作成ファイル
- `js/data-models.js` (4.6KB) - データ構造定義
- `js/storage.js` (7.0KB) - LocalStorage管理
- `js/ui-components.js` (11.7KB) - 動的UI生成
- `js/app.js` (9.5KB) - メインロジック
- `css/compact-style.css` (7.8KB) - コンパクトUIスタイル
- `index.html` (2.9KB) - メインHTML（既存ファイルを置き換え）
- `README.md` (2.8KB) - プロジェクトドキュメント
- `CHANGELOG.md` - このファイル

#### バックアップ
- `index.html.backup` - 既存index.htmlのバックアップ

### 🔧 技術スタック
- Pure JavaScript (ES6+)
- LocalStorage API
- CSS Grid / Flexbox
- レスポンシブデザイン

### 📊 データ構造

```javascript
WorkoutEntry {
  id: string (UUID)
  date: string (ISO 8601)
  trainer: string
  exerciseGroups: ExerciseGroup[]
  condition: { sleep, meal, stress, energy }
  createdAt: timestamp
}

ExerciseGroup {
  id: string (UUID)
  isSuperSet: boolean
  exercises: Exercise[]
}

Exercise {
  id: string (UUID)
  name: string
  equipment: string
  attachment: string
  angle: string
  sets: Set[]
}

Set {
  weight: number
  selfReps: number
  assistedReps: number
  rpe: number
}
```

### 🎯 Phase 1の目標達成状況
- ✅ スーパーセット対応
- ✅ 器具・アタッチメント・角度記録
- ✅ 自力・補助レップ分離
- ✅ トレーナー名記録
- ✅ 種目順序記録
- ✅ 過去データ比較（同条件フィルタ）
- ✅ 超コンパクトUI実装
- ✅ LocalStorage統合

### 🚀 次のフェーズ予定

#### Phase 2（体調管理）
- 体調チェックモーダル
- 体調×パフォーマンス相関分析
- 睡眠・食事・ストレス・エネルギーレベル記録

#### Phase 3（可視化強化）
- Chart.js統合
- 重量推移グラフ
- 成長ダッシュボード
- 筋群別成長率
- 強み・弱み分析

#### Phase 4（最終調整）
- パフォーマンス最適化
- ドキュメント整備
- デプロイ準備

---

## マイルストーン1チェックリスト

動作確認のため、以下をテストしてください：

- [ ] ブラウザで index.html を開ける
- [ ] 通常種目を追加できる
- [ ] スーパーセットを追加できる
- [ ] セットを記録できる（重量、自力レップ、補助レップ、RPE）
- [ ] 器具・アタッチメント・角度を設定できる
- [ ] トレーナー名を記録できる
- [ ] セットを削除できる
- [ ] 種目を削除できる
- [ ] グループを削除できる
- [ ] ワークアウトを保存できる
- [ ] ページをリロードしてもデータが残っている
- [ ] 統計（セット数、総重量、平均RPE）が更新される
- [ ] スマホ表示が適切
- [ ] 過去データが表示される（2回目以降）

問題があれば issue として報告してください。
