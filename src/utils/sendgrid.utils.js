const client = require("@sendgrid/mail");

client.setApiKey(process.env.SENDGRID_API_KEY);


/**
 * 
 * @param {email address} reciever 
 * @param {subject, html} content 
 * @returns 
 */
const sendEmail = async (reciever, content) => {
    try {
        const data = {
            to: reciever,
            from: String(process.env.SENDER_EMAIL),
            subject: content.subject,
            html: content.html,
        };

        await MailService.send(data);

        return {
            code: 200,
            result: null,
            message: "Link sent",
        };
    } catch (err) {
        if (process.env.DEBUG === "TRUE") console.log(err);
        if (err.name === "ValidationError")
            return { code: 400, result: null, message: "Wrong input format" };
        return { code: 500, result: null, message: "Internal Server Error" };
    }
};

module.exports = {
    sendEmail
}