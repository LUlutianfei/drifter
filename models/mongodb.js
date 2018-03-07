var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/drifter");

//定义漂流瓶模型，并设置到bottles集合中
var bottleModel = mongoose.model('Bottle',new mongoose.Schema({
	bottle:Array,
	message:Array
},{
	collection:'bottles'
}));

//将用户捡到的漂流瓶改变格式保存
exports.save = function(picker,_botter,callback) {
	var bottle = {bottle:[],message:[]};
	bottle.bottle.push(picker);
	bottle.message.push([_botter.owner,_botter.time,_botter.content]);
	bottle = new bottleModel(bottle);
	bottle.save(function(err) {
		callback(err);
	});
};


exports.getAll = function(user,callback) {
	bottleModel.find({"bottle":user},function(err,bottles) {
		if(err) return callback({code:0,msg:"获取漂流瓶列表失败"});
		callback({code:1,msg:bottles});
	})
}



exports.getOne = function(_id,callback) {
	bottleModel.findById(_id,function(err,bottle) {
		if(err) return callback({code:0,msg:"读取漂流瓶失败"});
		callback({code:1,mag:bottle});
	})
}



exports.reply = function(_id,reply,callback) {
	reply.time = reply.time || Date.now();
	bottleModel.findById(_id,function(err,_botter) {
		if(err) return callback({code:0,msg:"回复漂流瓶失败"});
		var newBottle = {};
		newBottle.bottle = _botter.bottle;
		newBottle.message = _botter.message;
		//如果捡瓶子的人第一次回复漂流瓶，则在bottle键添加漂流瓶主人
		//如果已回复过漂流瓶，则不再添加
		if(newBottle.bottle.length===1) {
			newBottle.bottle.push(_botter.message[0][0]);
		}
		//在message键添加一条回复信息
		newBottle.message.push([reply.user,reply.time,reple.content]);
		//更新数据库中该漂流瓶信息
		bottleModel.findByIdAndUpdate(_id,newBottle,function(err,bottle) {
			if(err) return callback({code:0,msg:"回复漂流瓶失败"});
			callback({code:1,msg:bottle});
		});
	});
};



exports.delete = function(_id,callback) {
	bottleModel.findByIdAndRemove(_id,function(err) {
		if(err) return callback({code:0,msg:"删除漂流瓶失败"});
		cacllback({code:1,msg:"删除成功"});
	});
};