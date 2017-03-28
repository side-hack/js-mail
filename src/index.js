import _ from 'lodash';
import { EmailTemplate } from 'email-templates';
import { SesTransport } from './transport/ses';

export class Mail {
	constructor(defaults = {}) {
		this._config = {};
		this.defaults = defaults;
	}

	get defaults() {
		return _.merge({
			transport: {
				name: 'Ses'
			}
		}, this._defaults);
	}

	set defaults(defaults = {}) {
		this._defaults = defaults;
	}

	config(...args) {
		let config = _.merge(this._config, this.defaults);
		// get all
		if(!args.length) return config;
		// set all
		if(args.length && _.isObject(args[0])) {
			this._config = args[0];
			return this._config;
		}
		// get one
		if(args.length <= 1) return _.get(config, args[0]);
		// set
		return _.set(this._config, args[0], args[1]);
	}

	get transport() {
		let transport = this.config('transport');
		let method = function() {
			throw 'No valid transports defined.';
		};

		if(_.isFunction(transport)) {
			method = transport;
		} else {
			var classes = {
				'Ses': SesTransport
			};
			let transportClass = new classes[transport.name](transport.options || {});
			method = transportClass.send;
		}

		return method;
	}

	set transport(transport) {
		this.config('transport', transport);
	}

	addRecipients(...recipients) {
		let current = this.config('recipients') || [];
		let updated = _.concat(recipients, current);
		return this.config('recipients', updated);
	}

	render(body = null, template = null) {
		var body = body || this.config('body');
		var template = template || this.config('template');

		// body & template
		if(!_.isString(body) && !template) {
			throw 'Body is required. Please provide a string, or params and a template.';
		}

		if(template && !_.isObject(body)) {
			throw 'Body must be an object when using a template.';
		}

		if(template) {
			let path = template;
			let options = {};
			if(_.isObject(template)) {
				path = template.path;
				options = template.options || {};
			}
			let engine = new EmailTemplate(path, options);
			return engine.render(body);
		}

		return Promise.resolve(body);
	}

	send(recipients = null, from = null, subject = null, body = null, template = null) {
		var recipients = recipients || this.config('recipients') || [];
		var from = from || this.config('from');
		var subject = subject || this.config('subject') || '';
		var body = this.render(body, template);

		// validate recipients
		if(!recipients.length) {
			throw 'No recipients defined.';
		}

		// validate from
		if(!from) {
			throw 'No from address defined.';
		}

		return this.transport(recipients, from, body, subject);
	}
}
