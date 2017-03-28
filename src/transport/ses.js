export class SesTransport {
	constructor(options) {

	}

	send(recipients, from, body, subject) {
		return body.then(function(result) {
			console.log(recipients);
			console.log(from);
			console.log(subject);
			console.log(result);
		})
	}
}
