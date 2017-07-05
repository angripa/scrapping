  var express = require('express');
  var Promise = require("bluebird");
  var request = Promise.promisifyAll(require("request"), {multiArgs: true});
  var firstRequest = Promise.promisify(require("request"));
  var cheerio = require('cheerio');
  var fs      = require('fs');
  var app     = express();

  app.get('/scrape', function(req, res){
    mainUrl = 'https://m.bnizona.com/index.php/category/index/promo';
    var arr = {};
    var arrData=[];
    var urlDetail = [];
    firstRequest(mainUrl).then(function(result){

        // console.log(result.body);
        var $ = cheerio.load(result.body);
        var i=0;
        $('.menu>li>a').each(function(){
         var cat=$(this).text();
         var url=$(this).attr('href');
         urlDetail.push(url);
         arrData[i]=cat;
         i++;
       });
      }).then(function(){
        Promise.map(urlDetail, function(url) {
          return request.getAsync(url).spread(function(response, body) {
            return body;
          });
        }).then(function(results) {
      // console.log('results : '+results);
      for (var i = 0; i < results.length; i++) {
        var $ = cheerio.load(results[i]);
        arr[arrData[i]] = [];
        $('.list2>li>a').each(function(index){
         var obj = {image:'',merchantName:'',promoTitel:'',validUntil:''};
         var mn = $(this).find('span.merchant-name').text();
         var vu = $(this).find('span.valid-until').text();
         var pt = $(this).find('span.promo-title').text();
         var img = $(this).find('img').attr('src');

         obj.image=img;
         obj.merchantName=mn;
         obj.promoTitel=pt;
         obj.validUntil=vu;
         arr[arrData[i]][index]=obj;
         
       });
      }
    }, function(err) {
    }).finally(function(){
      res.send('File successfully written! - Check solution.json file');
      fs.writeFile('solution.json', JSON.stringify(arr, null, 4), function(err){
        console.log('File successfully written! - Check solution.json file');
      })
    });

  });
});

  app.listen('8081')
  console.log('active port 8081');
  exports = module.exports = app;
