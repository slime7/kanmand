# kanmand

## 功能

《艦隊これくしょん -艦これ-》（Kancolle）指令发送器，一键发送游戏数据完成多个操作。

***项目还在测试中，目前还不知道用这种方式是否会封号，请勿用于大号，后果自负。***

## 安装使用

### 从 github 安装
```
git clone https://github.com/slime7/kanmand && cd kanmand
npm install
npm run electron:serve
```

### 填写数据举例
游戏链接：`http://203.104.209.102/kcs2/index.php?api_root=/kcsapi&voice_root=/kcs/sound&osapi_root=osapi.dmm.com&version=4.2.2.0&api_token=5a19226927ddfff54bxxxxxxxxxx2a67f3b762ea&api_starttime=15424xxxxxxxx`

发送路径：`/kcsapi/api_req_hensei/change`

发送数据：`{"api_id":1,"api_ship_idx":1,"api_ship_id":5}`

## TODO

- [x] 一次执行多个
- [x] 显示/编辑请求列表
- [x] 导入/导出多个请求配置
- [ ] ~~定时执行~~
- [ ] 改进已有功能

## License

MIT