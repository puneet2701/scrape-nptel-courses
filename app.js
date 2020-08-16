const Express = require('express');
const Cheerio = require("cheerio");
const request = require('request');
const fs = require("fs");
const {
    error
} = require('console');


const PATH = "../nptel/Database-IIT"
fs.mkdir(PATH, {
    recursive: true
}, (err, result) => {
    if (err) return console.log("dir not created");
    console.log("Success");


})

const app = Express();

let scrapeUrl = "https://nptel.ac.in/courses/106/106/106106221/";




const port = 8081;

app.get("/", async function (req, res) {
    try {
        request(scrapeUrl, async (err, response, html) => {
            if (err) {
                res.status(404).json({
                    message: "Ahh resource not accessed"
                })
                return;
            }
            let {
                links,
                html: ok
            } = await parseHtmlAndGetLinks(html);
            downloadVideos(links);
            res.write(ok);
            res.end();



        })

    } catch (error) {
        res.status(404).json({
            message: "Ahh resource not accessed"
        })
        return;

    }



});

function downloadVideos(links) {

    let index = 0;

    (function loop() {
        if (index < links.length) {
            var target = fs.createWriteStream(`${PATH}/${links[index].lectureName}`)
            request({
                    uri: links[index].lectureUrl,
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                        'Cache-Control': 'max-age=0',
                        'Connection': 'keep-alive',
                        'Host': 'nptel.ac.in',
                        'Upgrade-Insecure-Requests': '1',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
                    },
                    /* GZIP true for most of the websites now, disable it if you don't need it */
                    gzip: true
                })
                .pipe(target)
                .on('finish', () => {
                    console.log(`The file is finished downloading.`);
                    index++;
                    loop();
                })
                .on('error', (err) => {
                    console.error(err);
                    process.exit(1);
                })
        } else {
            console.log('success');
        }

    }())

}

async function parseHtmlAndGetLinks(html) {
    return new Promise(function (fulfill, reject) {
        /* use cheerio to parse html */
        var $ = Cheerio.load(html);
        let links = []

        $("#download_videos tr:nth-of-type(1) ~ tr").each(function (i, elem) {
            let map = {}
            map.lectureName = `${i+1} - ${this.children[2].children[0].attribs.download}`
            map.lectureUrl = "https://nptel.ac.in" + this.children[2].children[0].attribs.href
            // map.lectureUrl =  map.lectureUrl ?  map.lectureUrl.match(/\/(.*)4'/)[0] : "";
            links.push(map);
        });
        console.log(links);


        fulfill({
            links,
            html
        });
        return;


    })
}



app.listen(port, () => {
    console.log("Application server started");
})