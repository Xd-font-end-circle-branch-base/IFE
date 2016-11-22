### 申请github账号篇
---

- **首先你得有github账号，这个问题不难解决，到<a>http://github.com</a>注册一个账号就行**


  ** 填写账号信息**

 ![注册](http://img.blog.csdn.net/20160107142607507)

-  **然后你去你注册时留的邮箱确认下这个账号就没啥问题了。**

-  **这个时候你就可以去fork下我们的项目了**，链接：<a>https://github.com/Xd-font-end-circle-branch-base</a>

### git安装篇

---

- 首先去这个网址：[Git for windows](https://git-for-windows.github.io/)下载git客户端（当然如果不追求新版本的话可以去国内软件助手，比如百度，360，但一般都不是最新版，不是最新版理论上也不会出什么大问题，放心下载就是了。但此次教程是用的最新版本2.10.2），另外我电脑是64Bit。

- 或是直接去西电前端圈群里下载

**陪大家从零开始！电脑Git已卸载开始重装！**

OK！下载完成！重新安装，一直点next就好。安装好了切换到安装目录，打开`git-bash`。记得首次配置用户信息邮箱保持和github账号绑定的邮箱一致
如果一切顺利你会看到这么个窗口：

![git Bash](http://img.blog.csdn.net/20161118171715140)

### 配置SSH篇

---

到这里你有自己的github账号了，本地也已经安装好了git,接下来就得把git和你远程的github账号连接起来了~~~介绍他俩认识，那么认识的媒介是什么呢？就是标题中的`SSH`，这个可以直接看下这篇博客：[ Git SSH Key 生成步骤](http://blog.csdn.net/hustpzb/article/details/8230454/)

![这里写图片描述](http://img.blog.csdn.net/20161118173817449)

**成功之后(这个变绿的图标说明链接成功，暂时没看到没关系，我们接着往下来)：**

![这里写图片描述](http://img.blog.csdn.net/20161118173750855)

### Clone项目篇

---

OK！打开你的`git-bash`,在任意文件夹下面，输入

下面的damonare是我的昵称，在你克隆的时候要换成**你的github账号路径**
```git
$ git clone git@github.com:damonare/IFE-1.git
```

怎么看自己路径？看下图：

![这里写图片描述](http://img.blog.csdn.net/20161118174257267)


### 推送commit

现在你已经成功clone了自己github账号下面的文件到本地，两者已经相连了，在这里做的改动可以推送到你的仓库里，再推送到主仓库中。

在这里创建你的文件夹，名字可以是你的昵称，放入一个文件，例如：`index.html`。之后在git bash里执行命令准备推送。

首先，使用cd命令进入你的仓库文件夹，可以使用cd +复制的目录。或是在当前文件夹下面直接`git bash here`

例子：
```git
$ cd /c/Users/name/IFE
```

进入你的文件夹，然后推送本地文件到你的仓库，使用以下命令：

```git
$ git add .
$ git commit -m '任意字符'
$ git push origin master
```
tips:经过测试，发现最新版git 2.10.2和我2.6.2存在差异，最新版git add * 不会添加删除文件进暂存区，在git 2.x版本以后更稳妥的办法是git add .或者git add -A，可以将全部变动添加进暂存区。

![这里写图片描述](http://img.blog.csdn.net/20161118174647342)

成功后在即把本地所有文件推送到你的的仓库里，你能够在github中你的仓库里看到所有文件包括你新添加的文件夹。

接着我们来把你的仓库推送到主仓库：

点击New pull request按钮，在跳转的页面再点绿色按钮create pull request。

管理员通过之后就合并成功了。

### 后记

相信看完我写的这篇教程还是会有很多人弄不出来，很正常，这玩意儿本来就很费神。耐心点，加油。不会了查资料，报错了就把报的错扔给百度。实在不行了就在群里问。
