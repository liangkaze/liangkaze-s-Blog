---

title: "SQL 注入 DVWA搭建教程 BurpSuite安装" 

published: 2026-04-12 

description: "抓包工具 靶场部署  sql注入初步了解"

tags: ["靶场", "工具", "网络安全"] 

category: "网络工程"

draft: false 

pinned: false 

image: "./0.webp" 

author: "liangkaze" 

---

# SQL 注入 DVWA搭建教程 BurpSuite安装

## SQL 注入的基本知识

### 常见注入类型

- **联合查询注入**：页面有数据回显时使用，通过`UNION`关键字拼接额外查询，直接获取数据库数据
- **报错注入**：页面显示数据库错误信息时使用，利用`updatexml()`、`extractvalue()`等函数的报错特性暴露数据
- **布尔盲注**：无数据回显但页面有真假差异时使用，通过构造条件语句逐字符猜解数据
- **时间盲注**：完全无页面回显时使用，通过`sleep()`等函数让数据库延迟响应，根据加载时间判断数据
- **堆叠注入**：数据库支持多语句执行时使用，用`;`分隔多条 SQL 语句，可执行插入、删除等任意操作

### 主要危害

- **数据泄露**：拖库获取所有用户账号、密码、身份证、银行卡等敏感信息
- **数据篡改**：修改用户余额、订单信息、提升普通用户为管理员权限
- **数据破坏**：删除数据库表、清空数据，导致业务系统瘫痪
- **服务器控制**：写入 Webshell 文件，进而控制整个服务器
- **权限提升**：从普通数据库用户权限提升至服务器系统管理员权限

<span style="font-weight:bold;">接下来我将使用DVWA进一步认识SQL注入</span>

## DVWA搭建教程以及BurpSuite安装

### DVWA BurpSuite 环境 下载

::github{repo="digininja/DVWA"}

没有魔法的可以使用这个[`[百度网盘]`](https://pan.baidu.com/s/1A6noMi3Z4ZU8XZkwfrEmkg?pwd=dne5 ) ，有了源码之后需要安装相应的环境推荐使用[phpstudy](https://www.xp.cn/phpstudy)

抓包工具推 [BurpSuite](https://www.52pojie.cn/thread-2005151-1-1.html)和[Yakit](https://github.com/yaklang/yakit)两个搭配使用在DVWA主要还是用BP

### 配置phpstudy

安装好后打开phpstudy，把鼠标指针移到WAMP的红点上会出现切换点击切换会出现例如下图按照图片配置

![](D:\desktop\bj\网络安全\sql注入\1.png)



确保端口没有被占用并且启动中间件和数据库

![](D:\desktop\bj\网络安全\sql注入\2.png)



### 部署DVWA

将DVWA压缩包解压到phpstudy_pro\WWW的文件夹下

![](D:\desktop\bj\网络安全\sql注入\3.png)

打开DVWA目录下的config文件夹将数据库的端口和用户名密码改为自己的并修改文件名为`config.inc.php`

```php
$_DVWA = array();
$_DVWA[ 'db_server' ]   = getenv('DB_SERVER') ?: '127.0.0.1';
$_DVWA[ 'db_database' ] = getenv('DB_DATABASE') ?: 'dvwa';
$_DVWA[ 'db_user' ]     = getenv('DB_USER') ?: 'root';
$_DVWA[ 'db_password' ] = getenv('DB_PASSWORD') ?: 'root';
$_DVWA[ 'db_port']      = getenv('DB_PORT') ?: '3306';
```

进入Powershell查询自己的IP，在浏览器上输入http://自己的IP/DVWA/setup.php，点击`creat database`

![](D:\desktop\bj\网络安全\sql注入\4.png)

部署已经完成
