# todo-gin

## 課題
- ユーザー作成後にアカウント有効化メールを送信するが、sendgridのapiサーバーが落ちている等の理由でメール送信が失敗するケースのためにtransactionを使ってユーザー作成をrollbackするようにしたかったが、データアクセス層からビジネスロジック層にアクセスしようとするとimport cycle errorが発生してtransactionが使えなかった。