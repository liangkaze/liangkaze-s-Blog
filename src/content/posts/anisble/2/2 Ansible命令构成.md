---

title: "Ad-hoc 命令的构成和使用" 

published: 2026-04-11 

description: "学习Ad-hoc命令的构成和ansible命令中的模块"

tags: ["Ansible", "Linux", "自动化运维"] 

category: "网络工程"

draft: false 

pinned: false 

image: "./0.jpg" 

author: "liangkaze" 

---

# 2 Ad-hoc 命令

## Ansible 命令构成

**anisble 的命令构成**

```shell
ansible 目标主机/组  -m 模块名  -a "模块参数"  可选参数
```

1. **ansible**：命令本身，固定开头

2. **目标主机 / 组**：你要操作哪台机器，比如：all、主机名、web 组

3. **-m 模块名**：你要干什么：ping、user、shell、copy、file…

4. **-a "参数"**：模块需要的配置，比如 ”name = test shell =/bin/sh”

5. **可选参数（提权 / 密码等）**：最常用：**-b**（sudo 提权）

### 例子

1. **查询当前版本 ansible 有多少核心模块：**

   ```shell
   [example@example01 root]$ ansible-doc -l |wc -l
   ```

2. **查一下 ping 模块的帮助信息**

   ```shell
   [example@example01 root]$ ansible-doc ping
   ```



3. **查一下 user 模块的帮助信息，比较与 ping 有何不同**

   ```shell
   [example@example01 root]$ ansible-doc user
   ```



4. **写一个 ansible ping 指令，修改 ping 返回值**

   ```shell
   [example@example01 root]$ ansible all -m ping -a 'data=1'
   ```



5. **查看 user 模块用法**

   ```shell
   [example@example01 root]$ ansible-doc user
   [example@example01 root]$ ansible-doc -s user
   ```



6. **利用 user 模块在第三台主机上添加一个账号，并将账号的登录 shell 指向为/bin/sh**

```shell
[example@example01 root]$ ansible example03 -m user -a "name=test shell=/bin/sh state=present create_home=yes" -b
```

## 深入了解模块

**在例子中就运用了一个比较常用的模块 user模块就是用来创建用户的接下来只会给出常用且重要的模块例子来学习**

:::tip

ansible模块很多在2.9.27就有3387个所以只会举几个重要

:::

### shell 模块和command 模块

**`command` 模块**：直接在远程节点执行命令，**不经过 Shell 解析**（最安全，推荐优先使用）。

**`shell` 模块**：通过远程节点的 Shell（默认 `/bin/sh`）执行命令，**支持管道、重定向、变量等 Shell 特性**。

| 特性              | `command` 模块              | `shell` 模块                |            |
| :---------------: | :-------------------------: | :-------------------------: | :--------: |
| **Shell 解析**    | ❌ 不经过 Shell              | ✅ 经过 Shell（`/bin/sh`）   |            |
| **管道 / 重定向** | ❌ 不支持 `                  | >>>`                        | ✅ 完全支持 ||
| **环境变量**      | ❌ 不支持 `$VAR`             | ✅ 支持 `$VAR`               |            |
| **逻辑运算**      | ❌ 不支持 `&&` `||`          | ✅ 完全支持                  |            |
| **安全性**        | ✅ 最高（无 Shell 注入风险） | ⚠️ 较低（需防范 Shell 注入） |            |
| **幂等性**        | ⚠️ 需自行保证                | ⚠️ 需自行保证                |            |

 **使用建议**

1. **优先使用 `command`**：只要能满足需求，优先选 `command`，避免 Shell 注入风险。
2. **需要 Shell 特性时用 `shell`**：涉及管道、重定向、变量、逻辑运算时，必须用 `shell`。
3. **复杂脚本用 `script` 模块**：如果脚本超过 3 行，建议将脚本写在管理机本地，用 `script` 模块传输执行，更易维护。

:::tip

一般情况下的自动化运维不建议使用shell和command推荐使用更加精确的模块

:::

### script 模块

**`script` 模块**：将管理机本地的脚本传输到远程节点并执行，无需在远程节点预先存放脚本。

#### 核心特点

- 脚本位于**管理机本地**，Ansible 自动将其复制到远程节点临时目录执行
- 执行完毕后自动清理远程临时文件
- 支持 Shell、Python 等各类脚本（远程节点需有对应解释器）

#### 常用参数

- `chdir`：在远程节点执行脚本前切换到指定目录

- `creates`：若远程节点已存在该文件，则不执行脚本（实现幂等性）

- `removes`：若远程节点不存在该文件，则不执行脚本

#### 例子

```shell
[cfy@cfy01 ~]$ ansible 192.168.177.131 -m user -a "name=myuser groups=wheel append=yes state=present create_home=yes" -b
```

- `ansible`：Ansible Ad-Hoc 命令行工具的入口。

- `192.168.177.131`：**目标主机**，指定要操作的远程节点 IP。

- `-m user`：**调用模块**，`-m` 是 `module` 的缩写，这里使用 `user` 模块（专门用于管理 Linux 用户账户）。

- `-a "..."`：**模块参数**，`-a` 是 `args` 的缩写，引号内是传递给 `user` 模块的具体参数。

- `-b`：**提权选项**，`become` 的缩写，表示以 `root` 或 sudo 权限执行（创建用户需要管理员权限）。

### user 模块

**`user` 模块**：专门用于管理 Linux 系统的用户账户，包括创建、删除、修改用户属性（属组、家目录、Shell、密码等），且天然支持幂等性。

| 参数          | 作用                   |                             说明                             |
| ------------- | ---------------------- | :----------------------------------------------------------: |
| `name`        | **指定用户名**（必填） |                     要操作的用户账户名。                     |
| `state`       | **用户状态**           |    `present`（默认）：确保用户存在；`absent`：删除用户。     |
| `groups`      | **附加组列表**         | 将用户添加到指定的附加组（如 `wheel`、`docker`），多个组用逗号分隔。 |
| `append`      | **追加模式**           | `yes`：将用户**追加**到附加组，**不覆盖**原有属组；`no`（默认）：覆盖，仅保留 `groups` 指定的组。 |
| `create_home` | **创建家目录**         | `yes`：创建家目录（默认路径 `/home/用户名`）；`no`：不创建。 |
| `shell`       | **指定登录 Shell**     |        如 `/bin/bash`、`/sbin/nologin`（禁止登录）。         |
| `password`    | **设置密码**           |        需传入 **加密后的哈希值**（不能直接传明文）。         |
| `remove`      | **删除用户时清理文件** | 配合 `state=absent` 使用，`yes`：删除用户的同时删除家目录和邮箱。 |
| `uid`         | **指定 UID**           |            手动设置用户的 UID（需确保未被占用）。            |

```bash
# 1. 创建用户 myuser，添加到 wheel 组，创建家目录（你之前用的命令）
ansible 192.168.177.131 -m user -a "name=myuser groups=wheel append=yes state=present create_home=yes" -b
```

### copy 模块

**`copy` 模块**：将管理机本地文件 / 目录复制到远程节点，或直接在远程节点创建文件并写入指定内容，是文件分发的核心模块。

| 参数              | 作用                     | 说明                                                         |
| ----------------- | ------------------------ | ------------------------------------------------------------ |
| `dest`            | **远程目标路径**（必填） | 文件在远程节点的保存位置。                                   |
| `src`             | **管理机源文件路径**     | 要复制的本地文件 / 目录路径（与 `content` 二选一）。         |
| `content`         | **直接指定文件内容**     | 替代 `src`，直接将字符串写入远程文件（适合创建小文件）。     |
| `owner` / `group` | **设置文件属主 / 属组**  | 如 `owner=myuser`。                                          |
| `mode`            | **设置文件权限**         | 支持数字格式（`0644`）或符号格式（`u+rwx,g=rx,o=r`）。       |
| `backup`          | **覆盖前备份**           | `yes`：若远程文件已存在，覆盖前先备份（文件名加 `.bak` 时间戳）。 |
| `force`           | **强制覆盖**             | `yes`（默认）：若远程文件已存在则覆盖；`no`：仅当文件不存在时才创建。 |
| `directory_mode`  | **设置目录权限**         | 递归复制目录时，单独设置目录的权限。                         |

```bash
# 1. 直接在远程创建文件并写入内容（你之前任务2的用法）
ansible 192.168.177.131 -m copy -a 'content="hello,ansible" dest=/home/myuser/hello.txt owner=myuser group=myuser mode=0644' -b
```

### file 模块

**`file` 模块**：专门用于管理文件和目录的**属性**（创建、删除、修改权限 / 属主、创建软链接 / 硬链接），但不涉及文件内容的写入。

| 参数              | 作用                 | 说明                                                         |
| ----------------- | -------------------- | ------------------------------------------------------------ |
| `path`            | **目标路径**（必填） | 要操作的文件 / 目录 / 链接的路径。                           |
| `state`           | **操作类型**（核心） | `file`：确保为普通文件；`directory`：确保为目录；`link`：软链接；`hard`：硬链接；`absent`：删除。 |
| `src`             | **源文件路径**       | 仅在创建链接（`state=link/hard`）时使用，指定链接指向的源文件。 |
| `owner` / `group` | **设置属主 / 属组**  | 如 `owner=myuser`。                                          |
| `mode`            | **设置权限**         | 支持数字格式（`0755`）或符号格式。                           |
| `recurse`         | **递归修改**         | `yes`：递归修改目录下所有文件 / 子目录的属性（仅对 `state=directory` 有效）。 |
| `force`           | **强制操作**         | `yes`：创建链接时若目标已存在则覆盖；删除非空目录时强制删除。 |

```bash
# 1. 创建空目录（你之前任务5的用法：创建光驱挂载点）
ansible 192.168.177.130 -m file -a "path=/mnt/cdrom state=directory mode=0755" -b
```

###  fetch 模块

`fetch` 模块**：将远程节点的文件复制到管理机本地，是 `copy` 模块的反向操作，用于收集远程文件、日志、配置等。**

| 参数                | 作用                       | 说明                                                         |
| ------------------- | -------------------------- | ------------------------------------------------------------ |
| `src`               | **远程源文件路径**（必填） | 只能是**单个文件**，不支持直接取回目录。                     |
| `dest`              | **管理机目标路径**（必填） | 存放取回文件的根目录。                                       |
| `flat`              | **扁平化存储**             | `no`（默认）：按 `dest/主机IP/远程路径` 存储；`yes`：直接将文件存到 `dest` 下（需确保无重名）。 |
| `validate_checksum` | **校验文件完整性**         | `yes`（默认）：传输后对比校验和，确保文件未损坏。            |

```bash
# 1. 基本用法：取回文件，默认按主机IP创建目录结构（你之前任务3的用法）
# 文件会保存在管理机的 ./fetched/192.168.177.131/home/myuser/hello.txt
ansible 192.168.177.131 -m fetch -a "src=/home/myuser/hello.txt dest=./fetched/ flat=no" -b
```

### mount 模块

| 参数     | 作用                   | 说明                                                         |
| -------- | ---------------------- | ------------------------------------------------------------ |
| `path`   | **挂载点路径**（必填） | 如 `/mnt/cdrom`、`/data`。                                   |
| `src`    | **挂载源**（必填）     | 设备路径（如 `/dev/sr0`、`/dev/sda1`）或 UUID（推荐，更稳定）。 |
| `fstype` | **文件系统类型**       | 如 `iso9660`（光驱）、`ext4`、`xfs`、`nfs`。                 |
| `state`  | **挂载状态**（核心）   | 见下方详细说明。                                             |
| `opts`   | **挂载选项**           | 如 `ro`（只读）、`rw`（读写）、`defaults`，多个选项用逗号分隔。 |



| `state` 值  | 作用                               | 是否立即挂载 | 是否写入 `/etc/fstab` |
| ----------- | ---------------------------------- | ------------ | --------------------- |
| `mounted`   | **最常用**：确保挂载并开机自动挂载 | ✅ 是         | ✅ 是                  |
| `present`   | 仅写入 `/etc/fstab`，不立即挂载    | ❌ 否         | ✅ 是                  |
| `unmounted` | 仅卸载，不删除 `/etc/fstab` 配置   | ✅ 是（卸载） | ❌ 否                  |
| `absent`    | 卸载并删除 `/etc/fstab` 配置       | ✅ 是（卸载） | ✅ 是（删除）          |

## 任务实操

### 在第3台机器上新建一个帐号，并将新建的帐号添加至wheel组

```bash
# 我们来分析一下
# 要创建账号所以要调用user模块 
# 而且要添加到wheel组
# 任务没有说明覆不覆盖原本的用户组 所以append=yes
# 因为要创建用户所以确保用户存在state=present 
# 我们默认创建家目录create_home=yes
ansible 192.168.177.131 -m user -a "name=myuser groups=wheel append=yes state=present create_home=yes" -b
```

### 在第3台机器上新建帐号的家目录中新建一个空文件，并往文件中添加“hello,ansible”内容

```bash
# 要在远程创建文件并写入内容所以要调用 copy 模块
# 直接指定文件内容用 content 参数
# 目标路径是新建用户的家目录所以 dest=/home/myuser/hello.txt
# 文件属主和属组应该是新建的用户所以 owner=myuser group=myuser
# 设置合理的文件权限 mode=0644
ansible 192.168.177.131 -m copy -a 'content="hello,ansible" dest=/home/myuser/hello.txt owner=myuser group=myuser mode=0644' -b
```

### 将第3台机器上的新建的文件取回至管理机

```bash
# 要从远程主机取回文件到管理机，所以调用 fetch 模块
# 指定远程要取回的文件路径 src=/home/myuser/hello.txt
# 指定管理机存放文件的根目录 dest=./fetched/
# flat=no：按主机 IP 创建目录结构，避免多台主机同名文件覆盖（推荐默认值）
# 操作需要读取远程文件权限，所以加 - b 提权
ansible 192.168.177.131 -m fetch -a "src=/home/myuser/hello.txt dest=./fetched/ flat=no" -b
```

### 将取回管理机的文件传送至第2台机器

```bash
# 要将管理机本地文件传送到远程主机，所以调用 copy 模块
# 源文件是管理机上从第 3 台取回的文件，路径为 fetch 模块自动生成的 IP 目录结构
# 目标路径是第 2 台机器的 /tmp 目录，dest=/tmp/hello.txt
# 设置合理的文件权限 mode=0644
#操作需要远程写入权限，所以加 - b 提权
ansible 192.168.177.130 -m copy -a "src=./fetched/192.168.177.131/home/myuser/hello.txt dest=/tmp/hello.txt mode=0644" -b
```

### 将第2台机器的光驱挂载并设置为开机自动挂载

```bash
# 第一步：先创建光驱的挂载点目录，调用 file 模块
# 指定挂载点路径 path=/mnt/cdrom
# 确保是目录类型 state=directory
# 设置合理的目录权限 mode=0755
# 操作需要 root 权限，所以加 - b 提权
ansible 192.168.177.130 -m file -a "path=/mnt/cdrom state=directory mode=0755" -b

# 第二步：挂载光驱并设置开机自动挂载，调用 mount 模块
# 指定挂载点路径 path=/mnt/cdrom
# 指定光驱设备 src=/dev/sr0（根据你之前 lsblk 的结果）
# 指定文件系统类型 fstype=iso9660
# state=mounted：立即挂载，同时自动写入 /etc/fstab 实现开机自动挂载
# 设置只读挂载选项 opts=ro
# 操作需要 root 权限，所以加 - b 提权
ansible 192.168.177.130 -m mount -a "path=/mnt/cdrom src=/dev/sr0 fstype=iso9660 state=mounted opts=ro" -b
```

## 总结

1. Ansible Ad-hoc 是临时快速执行运维任务的命令模式，标准格式为`ansible 目标主机 -m 模块 -a "参数" -b`，其中`-b`用于 sudo 提权，绝大多数任务都需要添加。

2. 核心功能通过 8 个常用模块实现，包括测试连通性的 ping、管理用户的 user、双向传输文件的 copy 和 fetch、管理文件目录的 file、挂载磁盘的 mount，以及执行命令的 command（优先使用）和 shell。

3. 使用时需注意三个关键问题：给用户加组必须加`append=yes`避免覆盖原有属组，fetch 取回的文件默认带主机 IP 目录结构，虚拟机挂载光驱前需先在软件中勾选 "已连接"。
