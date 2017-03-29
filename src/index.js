import _ from 'lodash';

export class Mail {
	constructor(config = {}) {
		this.config(config);
	}

	get template() {
		let template = this.config('template');

		if(!template) return false;

		if(_.isFunction(template)) {
			// functions may not return a promise, so pre-empt this
			return (...args) => {
				return Promise.resolve(template.apply(null, args));
			};
		}

		if(template.render) {
			// functions may not return a promise, so pre-empt this
			return (...args) => {
				return Promise.resolve(template.render.apply(template, args));
			};
		}

		throw '`config.template` must be a function or an object with a `render` function.';
	}

	set template(template) {
		this.config('template', template);
	}

	get transport() {
		let transport = this.config('transport');

		if(_.isFunction(transport)) {
			// functions may not return a promise, so pre-empt this
			return (...args) => {
				return Promise.resolve(transport.apply(null, args));
			};
		}

		if(transport.send) {
			// functions may not return a promise, so pre-empt this
			return (...args) => {
				return Promise.resolve(transport.send.apply(transport, args));
			};
		}

		throw '`config.transport` must be a function or an object with a `send` function.';
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

	render(body = null) {
		body = body || this.config('body');

		if(!body)
			throw '`config.body` is required. Please provide a string, or an object along with `config.template`.';

		// return template if we have one
		if(_.isFunction(this.template)) {
			if(_.isString(body)) {
				throw '`config.body` must be an object if `config.template` is provided.';
			}
			return this.template(body);
		}
		if(_.isString(body)) {
			body = {
				html: body
			};
		}
		return Promise.resolve(body);
	}

	send(options = {}) {
		let to = options.to || this.config('to') || [];
		let from = options.from || this.config('from');
		let subject = options.subject || this.config('subject') || '';
		let transport = this.transport;

		// validate recipients
		if(!to.length) {
			throw 'No recipients defined.';
		}

		// validate from
		if(!from) {
			throw 'No from address defined.';
		}

		return this.render(options.body)
			.then(body => {
				if(_.isString(body)) {
					return {
						html: body
					};
				}

				if(!body.html)
					throw '`config.template`\'s render function must return an object containing at least an `html` property.';

				return body;
			})
			.then(body => {
				return this.transport({
					to: to,
					from: from,
					html: body.html,
					text: body.text,
					subject: body.subject || subject
				})
			})
		;
	}
}
