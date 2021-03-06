var redis = require('redis');
var client = redis.createClient();
var client2 = redis.createClient();
var client3 = redis.createClient();
//扔一个漂流瓶
exports.throw = function(bottle,callback) {
	//先到2号数据库检查用户是否超过扔瓶次数
	client2.SELECT(2,function() {
		client2.GET(bottle.owner,function(err,result) {
			if(result>=10) {
				return callback({code:0,msg:"今天扔瓶子的机会已经用完了"});
			}
			//扔瓶子次数加一
			client2.INCR(bottle.owner,function() {
				//检测是否是当天第一次扔瓶子
				//若是，则设置记录该用户扔瓶子次数键的生存期为1天
				//若不是，生存期保持不变
				client2.TTL(bottle.owner,function(err,ttl) {
					if(ttl===-1) {
						client2.EXPIRE(bottle.owner,86400);
					}
				});
			});
			bottle.time = bottle.time ||Date.now();
			//为每个漂流瓶随机生成一个id
			var bottleId = Math.random().toString(16);
			var type = {male:0,female:1};
			//根据漂流瓶类型的不同将漂流瓶保存到不同的数据库
			client.SELECT(type[bottle.type],function() {
				//以hash类型保存漂流瓶对象
				client.HMSET(bottleId,bottle,function(err,result) {
					if(err) return callback({code:0,mag:"过后再试试吧"});
					callback({code:1,msg:result});
					//设置生存期为1天
					client.EXPIRE(bottleId,86400);
				}) 
			})
		})
	})
}






//捡一个漂流瓶
exports.pick = function(info,callback) {
	//先到3号数据库检查用户是否超过捡瓶次数限制
	client3.SELECT(3,function() {
		client3.GET(info.user,function(err,result) {
			if(result>=10) {
				return callback({code:0,msg:"今天捡瓶子的机会已经用完了"});
			}
			//捡瓶子次数加一
			client3.INCR(info.user,function() {
				//检测是否是当天第一次扔瓶子
				//若是，则设置记录该用户扔瓶子次数键的生存期为1天
				//若不是，生存期保持不变
				client3.TTL(info.user,function(err,ttl) {
					if(ttl===-1) {
						client2.EXPIRE(info.user,86400);
					}
				});
			});
			if(Math.random() <= 0.2) {
				return callback({code:0,msg:"海星"});
			}
			var type = {all:Math.round(Math.random()),male:0,female:1};
			info.type = info.type || 'all';
			//根据请求的瓶子的类型到不同的数据库中取
			client.SELECT(type[info.type],function() {
				//随机返回一个漂流瓶id
				client.RANDOMKEY(function(err,bottleId) {
					if(!bottleId) return callback({code:0,msg:"海星"});
					//根据漂流瓶id取到漂流瓶信息
					client.HGETALL(bottleId,function(err,bottle) {
						if(err) return callback({code:0,mag:"漂流瓶破损了"});
						callback({code:1,msg:bottle});
						client.DEL(bottleId);
					});
				});
			});
		})
	})
};


//将捡到的漂流瓶扔回海里
exports.throwBack = function(bottle,callback) {
	var type = {male:0,female:1};
	var bottleId = Math.random().toString(16);
	client.SELECT(type[bottle.type],function() {
		client.HMSET(bottleId,bottle,function(err,result) {
			if(err) return callback({code:0,msg:"过会在试试吧"});
			callback({code:1,msg:result});
			client.PEXPIRE(bottleId,bottle.time+86400000-Date.now());
		});
	});
};