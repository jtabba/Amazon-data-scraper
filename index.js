const axios = require("axios")
const cheerio = require("cheerio")
const fs = require('fs')
const url = "https://www.amazon.com.au/s?k=earphones&crid=3SWH9F531HPAZ&sprefix=%2Caps%2C708&ref=nb_sb_noss"

const fetchData = async () => {
    try {
        const response = await axios.get(url)
        const html = response.data
        const $ = cheerio.load(html)
        const earbuds = []

        $("div.sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16.sg-col.s-widget-spacing-small.sg-col-4-of-20").each((_idx, el) => {
            const earbud = $(el)
            const title = earbud.find("h2.a-size-mini.a-spacing-none.a-color-base.s-line-clamp-4").text()
            const image = earbud.find("img.s-image").attr("src")
            const link = earbud.find("a.a-link-normal.s-link-style.a-text-normal").attr("href")
            const reviews = earbud.find('div.a-section.a-spacing-none.a-spacing-top-micro > div.a-row.a-size-small').children('span').last().attr('aria-label')

            const stars = earbud.find('div.a-section.a-spacing-none.a-spacing-top-micro > div > span').attr('aria-label')
            const price = earbud.find("span.a-price > span.a-offscreen").text()

            let earbudData = {
                title,
                image,
                link: `https://amazon.com.au${link}`,
                price,
            }

            if (reviews) {
                earbudData.reviews = reviews
            }

            if (stars) {
                earbudData.stars = stars
            }

            earbuds.push(earbudData)

            let createCSV = earbuds.map(data => {
                return Object.values(data).map(information => `"${information}"`).join(",")
            }).join("\n")
            
            fs.writeFile('saved-earbuds.csv', "Title, Image, Link, Price, Reviews, Stars" + '\n' + createCSV, 'utf8', function (err) {
                if (err) {
                    console.log("An error occurred - file either corrupted or unsaved.")
                } else {
                    console.log("Creation of saved-earbuds.csv successful.")
                }
            })
        })

        return earbuds
    } catch (error) {
        throw error
    }

   
}


fetchData().then((earbuds) => console.log(earbuds))


// const axios = require("axios");
// const cheerio = require("cheerio");

// const fetchShelves = async () => {
//    try {
//        const response = await axios.get('https://www.amazon.com/s?crid=36QNR0DBY6M7J&k=shelves&ref=glow_cls&refresh=1&sprefix=s%2Caps%2C309');

//        const html = response.data;

//        const $ = cheerio.load(html);

//        const shelves = [];

//  $('div.sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16.sg-col.sg-col-4-of-20').each((_idx, el) => {
//            const shelf = $(el)
//            const title = shelf.find('span.a-size-base-plus.a-color-base.a-text-normal').text()

//            shelves.push(title)
//        });

//        return shelves;
//    } catch (error) {
//        throw error;
//    }
// };

// fetchShelves().then((shelves) => console.log(shelves));