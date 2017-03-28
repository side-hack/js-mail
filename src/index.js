import _ from 'lodash';
import { EmailTemplate } from 'email-templates';
import { SesTransport } from './Transport/Ses';

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

	get transport() {
		let transport = this.config('transport');
		if(_.isFunction(transport)) {
			return transport;
		}
		let transportClass = this.loadTransport(transport);
		return transportClass.send;
	}

	set transport(transport) {
		this.config('transport', transport);
	}

	addRecipients(...recipients) {
		let current = this.config('recipients') || [];
		let updated = _.concat(recipients, current);
		return this.config('recipients', updated);
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

	loadTransport(transport) {
		let classes = {
			'Ses': SesTransport
		};
		if(!classes[transport.name]) throw 'No valid transports defined.';
		return new classes[transport.name](transport.options || {});
	}

	render(body = null, template = null) {
		body = body || this.config('body');
		template = template || this.config('template');

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

		if(_.isString(body)) {
			return Promise.resolve({
				html: body,
				text: null
			});
		}

		return Promise.resolve(body);
	}

	send(recipients = null, from = null, subject = null, body = null, template = null) {
		recipients = recipients || this.config('recipients') || [];
		from = from || this.config('from');
		subject = subject || this.config('subject') || '';
		body = this.render(body, template);
		let that = this;

		// validate recipients
		if(!recipients.length) {
			throw 'No recipients defined.';
		}

		// validate from
		if(!from) {
			throw 'No from address defined.';
		}

		return body.then(function(body) {
			subject = body.subject || subject;
			return that.transport(recipients, from, body.html, body.text, subject);
		});
	}
}
