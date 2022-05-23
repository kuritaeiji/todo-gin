## アプリケーション名
「Todo-Gin」

## アプリケーション概要
Todoリストを作成することができる

## テスト用アカウント
メールアドレス: user@example.com  
パスワード: Password1010

## アプリケーションの機能一覧
- 認証機能 (トークンとしてJWTを用いた）
- Googleアカウントを用いた認証機能 (oidc)
- Todoリスト作成機能
- Todoカード作成機能
- Todoリスト・Todoカードのドラッグアンドロップ機能（自作）

## アプリケーション内で使用しいる技術
- フロントエンド: Nuxt.js
- フロントエンドテスト: Jest
- バックエンド: Golang(Gin)
- データベース: Mysql
- 仮想化技術: docker-compose
- CI/CDツール: CircleCI
- バックエンドのインフラ: herokuのコンテナデプロイ
- フロントのインフラ: Route53 + ACM + CloudFront + S3 + Terraform
