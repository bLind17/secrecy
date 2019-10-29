var helper = {};

helper.createMessage = function (action) {
	var args = Array.prototype.slice.call(arguments, 1);
	var param = args.join(";");
	return JSON.stringify({ action: action, param: param});
}

helper.parseMessage  = function (message) {
	return JSON.parse(message);
}

module.exports = helper;