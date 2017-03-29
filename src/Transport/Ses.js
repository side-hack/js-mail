import _ from 'lodash';
import Ses from 'node-ses';

import { Transport } from './Transport';

export class SesTransport extends Transport {
	constructor(config) {
		super(config);
		this.key = config.key;
		this.secret = config.secret;
		this.amazon = config.amazon;
		_.omit(this.config, ['key', 'secret', 'amazon']);
	}

	get client() {
		if(!this.key)
			throw 'SesTransport requires `key` in the configuration.';

		if(!this.secret)
			throw 'SesTransport requires `secret` in the configuration.';

		return Ses.createClient({ key: this.key, secret: this.secret, amazon: this.amazon });
	}

	send(options) {
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
