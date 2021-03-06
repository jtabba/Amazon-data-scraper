const axios = require("axios")
const cheerio = require("cheerio")
const fs = require('fs')
const url = "https://www.amazon.com.au/s?k=earphones&crid=3SWH9F531HPAZ&sprefix=%2Caps%2C708&ref=nb_sb_noss"

const fetchData = async () => {
    try {
        const response = await axios.get(url)
        const html = response.data
        const $ = cheerio.load(html)
        const data = []

        $("div.sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16.sg-col.s-widget-spacing-small.sg-col-4-of-20").each((_idx, el) => {
            const product = $(el)
            const title = product.find("h2.a-size-mini.a-spacing-none.a-color-base.s-line-clamp-4").text()
            const image = product.find("img.s-image").attr("src")
            const link = product.find("a.a-link-normal.s-link-style.a-text-normal").attr("href")
            const reviews = product.find('div.a-section.a-spacing-none.a-spacing-top-micro > div.a-row.a-size-small').children('span').last().attr('aria-label')
            const stars = product.find('div.a-section.a-spacing-none.a-spacing-top-micro > div > span').attr('aria-label')
            const price = product.find("span.a-price > span.a-offscreen").text()

            let productData = {
                title,
                image,
                link: `https://amazon.com.au${link}`,
                price,
            }

            if (reviews) {
                productData.reviews = reviews
            }

            if (stars) {
                productData.stars = stars
            }

            data.push(productData)

            let createCSV = data.map(data => {
                return Object.values(data).map(information => `"${information}"`).join(",")
            }).join("\n")
            
            fs.writeFile('scraped-data.csv', "Title, Image, Link, Price, Reviews, Stars" + '\n' + createCSV, 'utf8', function (err) {
                if (err) {
                    console.log("An error occurred - file either corrupted or unsaved.")
                } else {
                    console.log("Creation of saved-data.csv successful.")
                }
            })
        })

        return data
    } catch (error) {
        throw error
    } 
}

fetchData().then((data) => console.log(data))