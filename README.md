#漂流瓶#
###1.启动流程###
- 启动mongodb服务
- 安装redis并启动
- 目录下node app

###2.项目功能###

- 扔漂流瓶POST owner=xxx&type=xxx&content=xxx[&time=xxx]
- 捡一个漂流瓶 GET /?user=xxx[&type=xxx]
- 扔回捡到的漂流瓶 POST owner=xxx&type=xxx&content=xxx&time=xxx
- 获取一个用户的所有漂流瓶 GET /user/:user
- 获取特定id的漂流瓶 GET /bottle/:_id
- 回复特定id的漂流瓶 GET /reply/:_id
- 删除特定id的漂流瓶 GET /delete/：_id