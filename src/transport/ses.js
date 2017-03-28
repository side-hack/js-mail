export class SesTransport {
	send(recipients, from, body, subject, options) {
		return body.then(function(result) {
			console.log(options);
			console.log(recipients);
			console.log(from);
			console.log(subject);
			console.log(result);
		})
	}
}
