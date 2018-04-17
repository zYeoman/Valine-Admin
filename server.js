'use strict';

var AV = require('leanengine');
var mail = require('./utilities/send-mail');
var spam = require('./utilities/check-spam');

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
        // 检查垃圾评论
        spam.checkSpam(currentComment);

        // 发送博主通知邮件
        mail.notice(currentComment);
        // AT评论通知
        let rid = currentComment.get('rid');
        if (!rid) {
            console.log('没有@任何人，结束!');
            return;
        }
        let query = new AV.Query('Comment');
        query.get(rid).then(function (parentComment) {
            mail.send(currentComment, parentComment);
        }, function (error) {
            console.warn('获取@对象失败！');
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
