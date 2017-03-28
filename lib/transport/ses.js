"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SesTransport = exports.SesTransport = function () {
	function SesTransport() {
		_classCallCheck(this, SesTransport);
	}

	_createClass(SesTransport, [{
		key: "send",
		value: function send(recipients, from, body, subject, options) {
			return body.then(function (result) {
				console.log(options);
				console.log(recipients);
				console.log(from);
				console.log(subject);
				console.log(result);
			});
		}
	}]);

	return SesTransport;
}();