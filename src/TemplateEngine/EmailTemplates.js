import { EmailTemplate } from 'email-templates';

import { TemplateEngine } from './TemplateEngine';

export class EmailTemplatesTemplateEngine extends TemplateEngine {
	constructor(config) {
		super(config);
		this.path = config.path;
		delete this.config.path;
	}

	get client() {
		if(!this.path) {
			throw 'EmailTemplates requires `config.path`.';
		}

		return new EmailTemplate(this.path, this.config);
	}

	render(params) {
		return this.client.render(params);
	}
}
