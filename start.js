var http = require("http");
var url = require('url');
var Twig = require('twig');
var twig = Twig.twig;
var fs = require('fs');
var formTemplate;
templateFile = __dirname + '/form.html';
fs.readFile(templateFile, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    formTemplate = twig({
        id: "formTemplate", // id is optional, but useful for referencing the template later
        data: data
    });
});

function onRequest(request, response) {
    response.writeHead(200, {"Content-Type": "text/html"});
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;
    var formHtml = getFormHtml(query);
    if (formHtml) {
        response.write(formHtml);
        response.end();
        return;
    }
    response.write("Hello World \n <br/>");
    response.write(request.url + "\n <br/>");
    response.write(query.toString() + "Query \n <br/>");
    response.write(getCurrentDateString());
    response.end();
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
    if (!formTemplate) {
        return '';
    }
    parameters.pinUrl = parameters.pinUrl ? parameters.pinUrl : '';
    parameters.imageUrl = parameters.imageUrl ? parameters.imageUrl : '';

    var output = formTemplate.render(parameters);
    return output;
}


http.createServer(onRequest)
    .listen(8888);


console.log("Server has started on port 8888. Try http://localhost:8888")

