const AV = require('leanengine');
const mail = require('./utilities/send-mail');

AV.Cloud.afterSave('Comment', function (request) {
    let currentComment = request.object;
    // 检查垃圾评论
    // spam.checkSpam(currentComment);

    // 发送博主通知邮件
    mail.notice(currentComment);
    console.log("收到一条评论, 已提醒站长");

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

AV.Cloud.define('SendEmail', function(request) {
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
    return 'Hello World!';
})
