export class SesTransport {
	constructor(options) {}

	send(recipients, from, html, plaintext = null, subject = null) {
		console.log(recipients);
		console.log(from);
		console.log(html);
		console.log(plaintext);
		console.log(subject);
	}
}
