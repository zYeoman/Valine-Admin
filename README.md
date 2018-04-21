# Valine Admin
使用 LeanCloud 存储你的评论数据，在 LeanEngine 云引擎上管理你的评论，包括邮件通知和垃圾评论标记。

这是用于 [Valine 评论](https://valine.js.org/) 的后台管理，可以部署到你的 LeanCloud。它可以帮你完成：

- 更好用的邮件通知：包括新评论通知和@评论通知
- 评论管理

## 演示

邮件通知展示：

![](https://cdn.jun6.net/201803191302_68.png)

还支持 @ 其他人功能，如果被 @ 的人留下了邮箱，则也会发邮件通知他：
![](https://cdn.jun6.net/201803191328_614.png)


![](https://cdn.jun6.net/201803191329_979.png)

废话不多说了，开始配置吧。



## 前置工作

配置 Valine 评论，我这里就不再多说了，很多主题都已经集成了，请参考 [Valine 文档](https://valine.js.org/quickstart/)。


## 食用方法
虽然 Valine 是无后端的，但为了实现邮件通知，需要部署少量的 LeanEngine 代码。

1. 进入云引擎设置页。
    填写代码库并保存：`https://github.com/zhaojun1998/Valine-Admin`  

![](https://cdn.jun6.net/201804211508_545.png)
切换到部署标签页，分支使用 master，点击部署即可：
![](https://cdn.jun6.net/201801112055_212.png)
![](https://cdn.jun6.net/201804211336_271.png)
然后默默等待部署完成。

2. 此外，你需要设置云引擎的环境变量以提供必要的信息，点击云引擎的设置页，设置如下信息：
![](https://cdn.jun6.net/201804211513_158.png)


3. 设置二级域名后你可以访问评论管理后台。
![](https://cdn.jun6.net/201801112118_120.png)

后台登录需要账号密码，需要在这里设置，只需要填写 email、password、username，这三个字段即可，使用 usernmae 或 email 登陆即可。
![](https://cdn.jun6.net/201801112133_467.png)

4. 设置完成后重启一下云引擎实例一切就正常工作啦！
![](https://cdn.jun6.net/201801112133_955.png)



### LeanCloud 休眠策略

免费版的 LeanCloud 容器，是有强制性休眠策略的，不能 24 小时运行：

* 每天必须休眠 6 个小时
* 30 分钟内没有外部请求，则休眠。
* 休眠后如果有新的外部请求实例则马上启动（但激活时发送邮件会失败）。

分析了一下上方的策略，如果不想付费的话，最佳使用方案就设置定时器，每天 7 - 23 点每 20 分钟访问一次，这样可以保持每天的绝大多数时间邮件服务是正常的。

附 `crontab` 定时器代码：

```bash
*/20 7-23 * * * curl https://你配置的域名前缀.leanapp.cn
```

那么点个 `Star` 呗。

## 本地运行

**以下内容仅用于 LeanEngine 开发，普通用户无需理会**

首先确认本机已经安装 [Node.js](http://nodejs.org/) 运行环境和 [LeanCloud 命令行工具](https://leancloud.cn/docs/leanengine_cli.html)，然后执行下列指令：

```
$ git clone https://github.com/zhaojun1998/Valine-Admin.git
$ cd Valine-Admin
```

安装依赖：

```
npm install
```

登录并关联应用：

```
lean login
lean switch
```

启动项目：

```
lean up
```

之后你就可以在 [localhost:3000](http://localhost:3000) 访问到你的应用了。

## 部署到 LeanEngine

部署到预备环境（若无预备环境则直接部署到生产环境）：
```
lean deploy
```

## License

[MIT License](https://github.com/panjunwen/LeanComment/blob/master/LICENSE)
