var mongoose = require('mongoose');

var articleSchema = new mongoose.Schema({
    title : String,
    body : String,
    created_at : Date,
    comments : [{
        person : String,
        comment : String,
        created_at : Date
    }]
});

mongoose.model('article', articleSchema);






