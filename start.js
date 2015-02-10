var http = require("http");
var url = require('url');
var Twig = require('twig');
var twig = Twig.twig;
var fs = require('fs');
var cheerio = require('cheerio');

var templateParam = {};
templateParam.templateFile = __dirname + '/form.html';
fs.readFile(templateParam.templateFile, 'utf8', readTwigFile);

function readTwigFile(err,data)
{
    if (err) {
        return console.log(err);
    }
    templateParam.formTemplate = twig({
        id: "formTemplate", // id is optional, but useful for referencing the template later
        data: data
    });
}
function getUrlContents(url,param)
{
    http.get(url, responseContentToCallBack.bind({param:param}));
}


function responseContentToCallBack(getUrlResponse)
{
    var body = '';
    this.getUrlResponse = getUrlResponse;
    // Continuously update stream with data
    getUrlResponse.on('data', function(d) {
        console.log('adding data to body');
        body += d;
    });
    getUrlResponse.on('end', function() {
        console.log('end');
        if (this.param && this.param.callBack){
            this.param.body = body;
            delete this.getUrlResponse;
            this.param.callBack(this.param);
        }
    }.bind(this));
}
function afterContents(param)
{
    var jQuery = cheerio.load(param.body);
    var imageTag = '<img src="imageUrl">'.replace('imageUrl',param.imageUrl);
    jQuery('body').prepend(imageTag);
    content = jQuery.html();
    param.response.write(content);
    param.response.end();
}

function onRequest(request, response) {
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;
    response.writeHead(200, {"Content-Type": "text/html"});
    if (query.action && (query.action == 'pinImage')){
        if (!templateParam.formTemplate){
            response.write('twig file not loaded yet. Please refresh')
            response.end();
            return;
        }
        getUrlContents('http://www.google.com.au',{
            callBack:afterContents,
            request:request,
            response:response,
            imageUrl:'http://www.pinceladasdaweb.com.br/blog/uploads/js-templates/twig.jpg',
            formTemplate:templateParam.formTemplate
        });
        return;
        if (query.imageUrl && query.pinUrl){

        }
        var formHtml = getFormHtml(query);
        if (formHtml) {
            response.write(formHtml);
            response.end();
            return;
        }
    }

    //could not detect response
    else{
        response.write("Hello <b>World</b> \n <br/>");
        response.write(request.url + "\n <br/>");
        response.write(query.toString() + "Query \n <br/>");
        response.write(getCurrentDateString());
        response.end();
    }

}
function getCurrentDateString() {
    var currentDate;
    currentDate = new Date();
    var separator = '<b>:</b>';
    var dateString = 'time is ' + currentDate.getHours() + separator + currentDate.getMinutes()
        + separator + currentDate.getSeconds() + separator + currentDate.getMilliseconds();
    return dateString;
}

function getFormHtml(parameters) {
    if (!templateParam.formTemplate) {
        return '';
    }
    parameters.pinUrl = parameters.pinUrl ? parameters.pinUrl : '';
    parameters.imageUrl = parameters.imageUrl ? parameters.imageUrl : '';

    var output = templateParam.formTemplate.render(parameters);
    return output;
}


http.createServer(onRequest)
    .listen(8888);


console.log("Server has started on port 8888. Try http://localhost:8888")

//getUrlContents('http://www.google.com.au',afterContents);

//http://localhost:8888/?pinUrl=https%3A%2F%2Fgithub.com%2Fjustjohn%2Ftwig.js%2Fwiki%2FImplementation-Notes&imageUrl=http%3A%2F%2Fwww.pinceladasdaweb.com.br%2Fblog%2Fuploads%2Fjs-templates%2Ftwig.jpg