'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Mail = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _emailTemplates = require('email-templates');

var _ses = require('./transport/ses');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mail = exports.Mail = function () {
	function Mail() {
		var defaults = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, Mail);

		this._config = {};
		this.defaults = defaults;
	}

	_createClass(Mail, [{
		key: 'config',
		value: function config() {
			var config = _lodash2.default.merge(this._config, this.defaults);
			// get all
			if (!arguments.length) return config;
			// set all
			if (arguments.length && _lodash2.default.isObject(arguments.length <= 0 ? undefined : arguments[0])) {
				this._config = arguments.length <= 0 ? undefined : arguments[0];
				return this._config;
			}
			// get one
			if (arguments.length <= 1) return _lodash2.default.get(config, arguments.length <= 0 ? undefined : arguments[0]);
			// set
			return _lodash2.default.set(this._config, arguments.length <= 0 ? undefined : arguments[0], arguments.length <= 1 ? undefined : arguments[1]);
		}
	}, {
		key: 'addRecipients',
		value: function addRecipients() {
			var current = this.config('recipients') || [];

			for (var _len = arguments.length, recipients = Array(_len), _key = 0; _key < _len; _key++) {
				recipients[_key] = arguments[_key];
			}

			var updated = _lodash2.default.concat(recipients, current);
			return this.config('recipients', updated);
		}
	}, {
		key: 'render',
		value: function render() {
			var body = this.config('body');
			var template = this.config('template');

			// body & template
			if (!_lodash2.default.isString(body) && !template) {
				throw 'Body is required. Please provide a string, or params and a template.';
			}

			if (template && !_lodash2.default.isObject(body)) {
				throw 'Body must be an object when using a template.';
			}

			if (template) {
				var engine = new _emailTemplates.EmailTemplate(template);
				return engine.render(body);
			}

			return Promise.resolve(body);
		}
	}, {
		key: 'send',
		value: function send(config) {
			if (config) this.config(config);

			var recipients = this.config('recipients') || [];
			var from = this.config('from');
			var subject = this.config('subject') || '';
			var body = this.render();
			var transportOptions = this.config('transport.options') || {};

			// validate recipients
			if (!recipients.length) {
				throw 'No recipients defined.';
			}

			// validate from
			if (!from) {
				throw 'No from address defined.';
			}

			return this.transport(recipients, from, body, subject, transportOptions);
		}
	}, {
		key: 'defaults',
		get: function get() {
			return _lodash2.default.merge({
				transport: {
					name: 'Ses'
				}
			}, this._defaults);
		},
		set: function set() {
			var defaults = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			this._defaults = defaults;
		}
	}, {
		key: 'transport',
		get: function get() {
			var transport = this.config('transport');
			var method = function method() {
				throw 'No valid transports defined.';
			};

			if (_lodash2.default.isFunction(transport)) {
				method = transport;
			} else {
				var classes = {
					'Ses': _ses.SesTransport
				};
				var transportClass = new classes[transport.name]();
				method = transportClass.send;
			}

			return method;
		},
		set: function set(transport) {
			this.config('transport', transport);
		}
	}]);

	return Mail;
}();