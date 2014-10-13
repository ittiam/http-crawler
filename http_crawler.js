/**
 *
 * @authors chenzh (chenzh@newdi.cn)
 * @date    2014-05-12 10:51:04
 * @version $Id$
 */
 var http = require('http');
 var url = 'http://www.alloyteam.com/2012/10/common-javascript-design-patterns/'
 var articles = {};
 function parse_catalog(html) {
    var pattern = /<li><a title="(.*?)" href="(.*?)"[^>]*>[\s\S]*?<\/a>/g,
        title = '',
        url = '',
        match = null,
        catalogs = [];
    while(match = pattern.exec(html)) {
        catalogs.push({
            title: match[1],
            url: match[2]
        })
    }
    return catalogs;
 }
 function parse_content(html, callback) {
    var title = '',
        content = '',
        pattern = /<div\s+class="title1">\s+<a[^>]*>.*?<\/a>\s+<a href="(.*?)"\s+class="blogTitle\s+btitle"[^>]*>(.*?)<\/a>[\s\S]*?<div\s+class="text">([\s\S]*?)<h2>/g;
    var match = pattern.exec(html);
    if(match) {
        title = match[2];
        content = match[3];
        callback(title, content.replace(/<\/?[^>]*>/g,''));
    }
 }
 function parse_contents(catalogs, callback) {
    var series = [];
    (function next(i, len) {
        if(i < len) {
            http_request(catalogs[i].url, function(err, html) {
                if(err) {
                    callback(err);
                } else {
                    parse_content(html, function(title, content) {
                        console.log(title);
                        series.push({url: catalogs[i].url, title: title, content: content});
                        next(i + 1, len);
                    });
                }
            });
        } else {
            callback(null, series);
        }
    }(0, catalogs.length))
 }
 function parse_html(html, callback) {
    var match = /(<h2>.*?<\/h2>[\s\S]*?<\/ul>)/g.exec(html);
    if(match) {
        callback(null, match[1]);
    } else {
        callback(null);
    }
 }
 function http_request(url, callback) {
    var data = '';
    var req = http.request(url, function(res) {
        res.setEncoding('utf-8');
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            callback(null, data);
        });
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req.end();
 }
 function http_crawler(url) {
    http_request(url, function(e, html) {
        // 取得目录
        parse_html(html, function(e, catalog) {
            var catalogs = parse_catalog(catalog);
            parse_contents(catalogs, function(err, series) {
                console.log(series);
            });
        });
    });
 }
 function save_data() {
 }
 http_crawler(url);
