const {
    emailHost,
    emailPort,
    emailAuthUsername,
    emailAuthPassword,
} = require('../config/config')
const { nodeMailer } = require('../services/imports')

async function sendEmail(email, subject, text) {
    const transporter = nodeMailer.createTransport({
        host: emailHost,
        port: emailPort,
        auth: {
            user: emailAuthUsername,
            pass: emailAuthPassword,
        },
    })
    const mailOptions = {
        from: emailAuthUsername,
        to: email,
        subject,
        text,
        // html: getEmailTemplate(email, 'demo', 'check')
    }
    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) { console.log(error) }
        console.log('------------', info)
        // console.log(`Email sent: ${info}`);
    })
}
async function sendMultipleEmails(emailsArray, subject, text) {
    try {
        // emailsArray.map(async(email) => {
        //   await sendEmail(email, subject, text);
        // } );
        const sendEmails = []
        for (const emailObj of emailsArray) {
            // const { email, subject, text } = emailObj;
            console.log('emailObj--------', emailObj)
            const info = await sendEmail(emailObj, subject, text)
            console.log('info----------', info)
            sendEmails.push(info)
        }
        console.log('sendEmails----------', sendEmails)
        return sendEmails
    } catch (error) {
        console.log('error-------', error)
        return error
    }
}

async function sendMultipleEmailsWithMultiContent(details) {
    try {
        // emailsArray.map(async(email) => {
        //   await sendEmail(email, subject, text);
        // } );
        const sendEmails = []
        for (const emailObj of details) {
            // const { email, subject, text } = emailObj;
            console.log('emailObj--------', emailObj)
            const info = await sendEmail(emailObj.email, emailObj.subject, emailObj.text)
            console.log('info----------', info)
            sendEmails.push(info)
        }
        console.log('sendEmails----------', sendEmails)
        return sendEmails
    } catch (error) {
        console.log('error-------', error)
        return error
    }
}
module.exports = { sendEmail, sendMultipleEmails, sendMultipleEmailsWithMultiContent, }
