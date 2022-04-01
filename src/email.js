const nodemailer = require('nodemailer')
const { htmlToText } = require('html-to-text')

const { renderTemplateFile } = require('./template.js')

const send = async ({ from = null, to, subject, html }) => {
  if (!process.env.NEXSS_EMAIL_SMTP_ADDRESS || !process.env.NEXSS_EMAIL_SMTP_PASSWORD) {
    console.error(
      'Setup environment variables for emailing: NEXSS_EMAIL_SMTP_ADDRESS and NEXSS_EMAIL_SMTP_PASSWORD'
    )
    return
  }

  // Check if DEBUG is on

  if (process.env.NODE_ENV !== 'production') {
    if (process.env.NEXSS_EMAIL_DEBUG_EMAIL) {
      subject = `[${
        process.env.NODE_ENV ? process.env.NODE_ENV.toUpperCase() : 'NODE_ENV: not set'
      }] ${to}: ${subject}`
      to = process.env.NEXSS_EMAIL_DEBUG_EMAIL
    } else {
      console.warn(
        `Email to ${to} has not been sent as is in not in production NODE_ENV. set the NEXSS_EMAIL_DEBUG_EMAIL to debug.`
      )
      return
    }
  }

  if (!from) {
    from = process.env.NEXSS_EMAIL_FROM_ADDRESS
      ? process.env.NEXSS_EMAIL_FROM_ADDRESS
      : process.env.NEXSS_EMAIL_SMTP_ADDRESS
    if (process.env.NEXSS_EMAIL_FROM_NAME) {
      from = `${process.env.NEXSS_EMAIL_FROM_NAME} <${from}>`
    }
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // port: 587,
    secure: true,
    requireTLS: true,
    service: 'gmail',
    auth: {
      user: process.env.NEXSS_EMAIL_SMTP_ADDRESS,
      pass: process.env.NEXSS_EMAIL_SMTP_PASSWORD,
    },
  })

  const sentResult = await transporter.sendMail({
    from,
    // from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
    text: htmlToText(html),
  })

  return sentResult
}

const templatesPath = require('path').resolve(
  process.env.NEXSS_EMAIL_TEMPLATE_PATH || './templates/'
)

const templatePath = (name) => `${templatesPath}/emails/${name}/`

const bodyPath = (name) => `${templatePath(name)}body.pug`
const subjectPath = (name) => `${templatePath(name)}subject.pug`

const renderEmailTemplate = (templateName, data = {}) => {
  data.NEXSS_APP_NAME = process.env.NEXSS_APP_NAME
  const subject = renderTemplateFile(subjectPath(templateName), data)
  const body = renderTemplateFile(bodyPath(templateName), data)

  return { subject, body }
}

const sendEmailFromTemplate = async (to, templateName, data = {}, { from, subject } = {}) => {
  const rendered = renderEmailTemplate(templateName, data)

  if (!subject) {
    subject = rendered.subject
  }

  return await send({ from, to, subject, html: rendered.body })
}

module.exports = { send, renderEmailTemplate, sendEmailFromTemplate }
