# sidehack-mail-js

## Example
### index.js
```js
var Mailer = require('sidehack-mail-js').Mail;
var path = require('path');

var mail = new Mailer({
	from: 'FROM',
	subject: 'sidehack-mail-js: testing',
	transport: {
		name: 'Ses',
		options: {
			key: 'SES_KEY',
			secret: 'SES_KEY',
			amazon: 'https://email.REGION.amazonaws.com' // omitting this will default to `https://email.us-east-1.amazonaws.com`
		}
	},
	template: {
		path: path.join(__dirname, 'templates', 'test'), // points to `templates/test/`, `html.hbs` is required at this path
	}
});

mail.send({
	to: 'TO', // string or array

	// when using templates, body is an object of parameters to be passed to the template engine
	body: {
		name: 'NAME',
		dob: 'DATE_OF_BIRTH',
	}
})
	.then(() => {
		console.log('Sent!');
	})
	.catch((err) => {
		console.log('Something went wrong!');
		console.log(err);
	})
;
```

### templates/test/html.hbs
```hbs
Hi {{name}}! Your date of birth is {{dob}}.
```
