const util = require('util');
const request = util.promisify(require("request"));



function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }


const Query = async (appId) => {
    return new Promise(async (resolve, reject) => {
        let {statusCode, body} = await request("https://itunes.apple.com/jp/lookup?id=" + appId + "&t=" + getRandomInt(10000, 99999)).catch((err) => {
            return reject(err);
        })

        if(statusCode !== 200){
            return reject("HTTP Status Error");
        }

        const jsonResult = JSON.parse(body);
        if(jsonResult.resultCount != 1) {
            return reject("Search result more than 1");
        }
        const appResult = jsonResult.results[0];

        
        resolve({
            name: appResult.trackName,
            bundleId: appResult.bundleId,
            image: appResult.artworkUrl512,
            author: appResult.artistName,
            version: appResult.version
        });
    })
};

export default Query;
