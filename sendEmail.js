const env = require('./environment/envHandler.js');
const nodemailer = require('nodemailer');

module.exports = {
    send: send,
    sendToSupport: function (title, body) {
        send(env.get('SUPPORT_EMAIL'), title, body);
    },
    sendToProjectAndSupport: function (ecosystem, title, body) {
        // To support
        send(env.get('SUPPORT_EMAIL'), title, body);

        // Get project email
        try {
            const label = env.get('LABEL_PREFIX') + '.cleanEmail';
            const labelValues = ecosystem.services.filter(s => {
                const sourceLabels = s.Spec ? s.Spec.Labels || {} : {};
                let labels = Object.keys(sourceLabels).map(function (objectKey, index) {
                    return {
                        key: objectKey,
                        value: sourceLabels[objectKey]
                    };
                }).filter(l => l.key.toLowerCase() === label.toLowerCase());
                return labels.length > 0;
            }).map(s => s.Spec.Labels[label]);
            const projectEmail = labelValues && labelValues.length > 0 ? labelValues[0] : null;
            if (projectEmail) {
                send(projectEmail, title, body);
            }
        } catch (e) {
            console.log('Error while sending email to project!', e);
        }
    }
}

function send(to, subject, body) {
    if (to && subject && body) {
        let transporterConfig = {
            service: 'gmail',
            auth: {
                user: env.get('SMTP_GMAIL_USER'),
                pass: env.get('SMTP_GMAIL_PASSWORD')
            }
        };
        let transporter = nodemailer.createTransport(transporterConfig);
        let mailOptions = {
            from: env.get('EMAIL_FROM'),
            to: to,
            subject: '[SWARM][WARN] ' + subject,
            html: body
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Can not send email: ' + error);
            }
        });
    } else {
        console.log('Email sending failed! Missing to / subject / body !');
    }
}