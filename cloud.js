const AV = require('leanengine');
const mail = require('./utilities/send-mail');
const spam = require('./utilities/check-spam');

AV.Cloud.afterSave('Comment', function (request) {
    let currentComment = request.object;
    // 检查垃圾评论
    // spam.checkSpam(currentComment);

    // 发送博主通知邮件
    mail.notice(currentComment);
    
    // AT评论通知
    let comment = currentComment.get('comment');
    
    let rid = currentComment.get('rid');
    if (comment.indexOf("class=\"at\"") != -1) {
        var start = comment.indexOf("#") + 1;
        var end = comment.substr(start).indexOf("'");
        comment.substr(start, end);
        console.log(comment.substr(start, end));
    } else {
        console.log("not @");
    }

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
