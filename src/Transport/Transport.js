export class Transport {
	constructor(config) {
		this.config = config;
	}

	validate(options) {
		if(!options.to || !options.to.length)
			throw 'Transport requires the `to` parameter.';

		if(!options.from)
			throw 'Transport requires the `from` parameter.';

		if(!options.html)
			throw 'Transport requires the `html` parameter.';

		return true;
	}
}
