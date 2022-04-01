const pug = require('pug')

module.exports.renderTemplateFile = (file, data) => {
  return pug.renderFile(file, data)
}
