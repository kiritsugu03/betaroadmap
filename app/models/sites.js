var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SiteSchema   = new Schema({
    site_name: String
});

module.exports = mongoose.model('beta', SiteSchema, 'beta');