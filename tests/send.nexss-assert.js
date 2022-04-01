require('dotenv').config()

const { renderEmailTemplate, sendEmailFromTemplate } = require('../src/email.js')

;(async () => {
  const t = await renderEmailTemplate('welcome', { name: 'Marcin' })
  console.log('t :>> ', t)
})()
;(async () => {
  const t = await sendEmailFromTemplate('mapoart@gmail.com', 'welcome', { name: 'Marcin' })
  console.log('t :>> ', t)
})()
