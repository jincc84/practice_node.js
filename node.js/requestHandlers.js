var querystring = require("querystring"),
  fs = require("fs"),
  formidable = require("formidable");

function start(res, req) {
  console.log("Request handler 'start' was called");
  
  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" '+
    'content="text/html; charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/upload" enctype="multipart/form-data" '+
    'method="post">'+
    '<input type="file" name="upload">'+
    '<input type="submit" value="Upload file" />'+
    '</form>'+
    '</body>'+
    '</html>';
    
  res.writeHead(200, {"content-type":"text/html"});
  res.write(body);
  res.end();
}

function upload(res, req) {
  console.log("Request handler 'upload' was called");
  
  var form = formidable.IncomingForm();
  console.log("about to parse");
  form.parse(req, function(error, fields, files) {
    console.log("parsing done");
    fs.renameSync(files.upload.path, "/tmp/test.png");
    res.writeHead(200, {"Content-type": "text/html"});
    res.write("received image:<br />");
    res.write("<img src='/show' />");
    res.end();
  });
}

function show(res) {
  console.log("Request handler 'show' was called.");
  fs.readFile("/tmp/test.png", "binary", function(error, file) {
    if(error) {
      res.writeHead(500, {"Content-type": "text/plain"});
      res.write(error + "\n");
      res.end();
    } else {
      res.writeHead(200, {"Content-type": "image/png"});
      res.write(file, "binary");
      res.end();
    }
  });
}

exports.start = start;
exports.upload = upload;
exports.show = show;