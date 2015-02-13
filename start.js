var http = require('follow-redirects').http;
var https = require('follow-redirects').https;
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
    templateParam.formTag = cheerio.load(data)('form').toString();
    templateParam.formTagTemplate = twig({
        id: "formTagTemplate", // id is optional, but useful for referencing the template later
        data: templateParam.formTag
    });
}
function getUrlContents(param)
{
    var url = param.request.url_parts.query.pinUrl;
    if (url.substring(0,5) == 'https'){
        https.get(url ,responseContentToCallBack.bind({param:param}));
    }
    else{
        http.get(url ,responseContentToCallBack.bind({param:param}));
    }
}


function logError(err)
{
    if (typeof err === 'object') {
        if (err.message) {
            console.log('\nMessage: ' + err.message)
        }
        if (err.stack) {
            console.log('\nStacktrace:')
            console.log('====================')
            console.log(err.stack);
        }
    } else {
        console.log('dumpError :: argument is not an object');
    }
}
function responseContentToCallBack(getUrlResponse)
{
    try{
        var body = '';
        this.getUrlResponse = getUrlResponse;
        // Continuously update stream with data
        getUrlResponse.on('data', function(d,x,y) {
            console.log('adding data to bod ');
            body += d;
        });
        getUrlResponse.on('end', function() {
            console.log('end');
            var url  = this.param.request.url_parts.query.pinUrl;
            if (!body){
                var message = 'Unable to load url <a href="' + url +
                    '">' + url + '</a>' ;
                this.param.response.write(message);
                this.param.response.end();
            }
            if (this.param && this.param.callBack){
                this.param.body = body;
                delete this.getUrlResponse;
                this.param.callBack(this.param);
            }
        }.bind(this));
    }
    catch(error){
        logError(error);
    }


}
function afterContents(param)
{
    try{
        var formContent = getFormHtml(param.request,{formType:'tag'});
        var content;
        if (param.request.url_parts.query.imageUrl &&  param.request.url_parts.query.pinUrl){
            var imageTag = '<img src="imageUrl">'.replace('imageUrl',param.request.url_parts.query.imageUrl);
            var jQ =cheerio.load(param.body)
                jQ('body').prepend(imageTag).prepend(formContent);
            var content = jQ.html();


            var baseUrl = param.request.url_parts.query.pinUrl.split('/').reverse()[0];
            var baseTag = '<base href="baseUrl" />'.replace('baseUrl',baseUrl);
            var jQ = cheerio.load(content);
            jQ('head').prepend(baseTag);
            content = jQ.html();
        }
        else{
            content = getFormHtml(param.request,{formType:'full'});
        }
        param.response.write(content);
        param.response.end();
    }
    catch (error){
        logError(error);
    }

}

function onRequest(request, response) {
    try{
        request.url_parts = url.parse(request.url, true);
        var query = request.url_parts.query;
        response.writeHead(200, {"Content-Type": "text/html"});
        if (query.action && (query.action == 'pinImage')){
            if (!templateParam.formTemplate){
                response.write('twig file not loaded yet. Please refresh')
                response.end();
                return;
            }
            var param ={
                callBack:afterContents,
                request:request,
                response:response,
                templateParam:templateParam
            };
            if (query.pinUrl && query.imageUrl){
                getUrlContents(param);
            }
            else{
                afterContents(param);
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
    catch(err){
        logError(err);
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

function getFormHtml(request, parameters) {
    if (!templateParam.formTemplate) {
        return '';
    }
    if (!parameters){
        parameters = {};
    }
    parameters.pinUrl = request.url_parts.query.pinUrl ? request.url_parts.query.pinUrl : '';
    parameters.imageUrl = request.url_parts.query.imageUrl ? request.url_parts.query.imageUrl : '';
    var output;
    if (parameters.formType && (parameters.formType =='tag')){
        output = templateParam.formTagTemplate.render(parameters);
    }
    else{
        output = templateParam.formTemplate.render(parameters);
    }
    return output;
}


http.createServer(onRequest)
    .listen(8888);


console.log("Server has started on port 8888. Try http://localhost:8888")

//getUrlContents('http://www.google.com.au',afterContents);

//http://localhost:8888/?action=pinImage&pinUrl=http%3A%2F%2Fgithub.com%2Fjustjohn%2Ftwig.js%2Fwiki%2FImplementation-Notes&imageUrl=http%3A%2F%2Fwww.pinceladasdaweb.com.br%2Fblog%2Fuploads%2Fjs-templates%2Ftwig.jpg
//http://localhost:8888/?action=pinImage&pinUrl=http%3A%2F%2Fwww.google.com&imageUrl=http%3A%2F%2Fwww.pinceladasdaweb.com.br%2Fblog%2Fuploads%2Fjs-templates%2Ftwig.jpg
//http://localhost:8888/?action=pinImage&pinUrl=http%3A%2F%2Fpeshawarjobs.com&imageUrl=http%3A%2F%2Fwww.pinceladasdaweb.com.br%2Fblog%2Fuploads%2Fjs-templates%2Ftwig.jpg
