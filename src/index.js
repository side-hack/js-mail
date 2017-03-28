import { EmailTemplate } from 'email-templates';
import _ from 'lodash';

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
		return function(...args) {
			return transportClass.send.apply(transportClass, args)
		};
	}

	set transport(transport) {
		this.config('transport', transport);
	}

	addRecipients(...recipients) {
		let current = this.config('to') || [];
		let updated = _.concat(recipients, current);
		return this.config('to', updated);
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

	render(options = {}) {
		let body = options.body || this.config('body');
		let template = options.template || this.config('template');

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

	send(options = {}) {
		let to = options.to || this.config('to') || [];
		let from = options.from || this.config('from');
		let subject = options.subject || this.config('subject') || '';
		let body = this.render({
			body: options.body,
			template: options.template
		});
		let transport = this.transport;

		// validate recipients
		if(!to.length) {
			throw 'No recipients defined.';
		}

		// validate from
		if(!from) {
			throw 'No from address defined.';
		}

		return body.then(body => {
			return transport({
				to: to,
				from: from,
				html: body.html,
				text: body.text,
				subject: body.subject || subject
			});
		});
	}
}
