'use strict';

var AV = require('leanengine');
var mail = require('./utilities/send-mail');

AV.init({
  appId: process.env.LEANCLOUD_APP_ID,
  appKey: process.env.LEANCLOUD_APP_KEY,
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
});

// 如果不希望使用 masterKey 权限，可以将下面一行删除
AV.Cloud.useMasterKey();

var app = require('./app');

// 端口一定要从环境变量 `LEANCLOUD_APP_PORT` 中获取。
// LeanEngine 运行时会分配端口并赋值到该变量。
var PORT = parseInt(process.env.LEANCLOUD_APP_PORT || process.env.PORT || 3000);

let query = new AV.Query(AV.Object.extend('Comment'));
query.equalTo('isNotified', null);
query.find().then(function (results) {
    results.forEach(function(currentComment){

        // 发送博主通知邮件
        mail.notice(currentComment);
        // AT评论通知
        let rid;

        // 拿到评论内容
        let comment = currentComment.get('comment');

        // 判断是否包含 class="at", 如包含则表示 @ 了别人, 截取 @ 的邮箱 hash 值
        if (comment.indexOf("class=\"at\"") != -1) {
            let start = comment.indexOf("#") + 1;
            let end = comment.substr(start).indexOf("'");
            rid = comment.substr(start, end);
        } else {
            console.log("这条评论没有 @ 任何人");
            return;
        }

        // 查 @ 的人的邮箱, 并发送邮件.
        let query = new AV.Query('Comment');
        query.get(rid).then(function (parentComment) {
            if (parentComment.get('mail')) {
                mail.send(currentComment, parentComment);
                console.log("这条评论 @ 了其他人, 已提醒至对方邮箱:" + parentComment.get('mail'));
            } else {
                console.log("这条 @ 了其他人， 但被 @ 的人没留邮箱... 无法通知");
            }
        }, function (error) {
            console.warn('好像 @ 了一个不存在的人!');
        });
    });
}, function (err) {
});

app.listen(PORT, function (err) {
  console.log('Node app is running on port:', PORT);

  // 注册全局未捕获异常处理器
  process.on('uncaughtException', function(err) {
    console.error('Caught exception:', err.stack);
  });
  process.on('unhandledRejection', function(reason, p) {
    console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason.stack);
  });
});
