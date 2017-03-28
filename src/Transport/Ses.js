import _ from 'lodash';
import Ses from 'node-ses';

import { Transport } from './Transport';

export class SesTransport extends Transport {
	constructor(config) {
		super(config);
	}

	get client() {
		return Ses.createClient({ key: this.config.key, secret: this.config.secret, amazon: this.config.amazon });
	}

	validate(options) {
		if(!this.config.key)
			throw 'SesTransport requires `key` in the configuration.';

		if(!this.config.secret)
			throw 'SesTransport requires `secret` in the configuration.';

		// validate ses requirements
		return super.validate(options);
	}

	send(options) {
		// merge options here
		this.validate(options);

		let client = this.client;

		return new Promise((resolve, reject) => {
			client.sendEmail({
			   to: options.to,
			   from: options.from,
			   cc: options.cc,
			   bcc: options.bcc,
			   subject: options.subject,
			   message: options.html,
			   altText: options.text
			}, function (err, data, res) {
				if(err) return reject(err.Message);
				return resolve(data);
			});
		});
	}
}
