const util = require('util');
const request = util.promisify(require("request"));


const getJsonFromHTML = (bodyData) => {
    let result = bodyData.match(/\{\"\@context\".*\]\}\<\/script\>/g);
    if(!result) {
        return null;
    }
    result = JSON.parse(result[0].replace("</script>",""));
    return result;
};


const getVersionFromHTML = (bodyData) => {
    let result = bodyData.match("<div[^>]*?>Current Version<\/div><span[^>]*?><div[^>]*?><span[^>]*?>(.*?)<\/span><\/div>");
    if(!result) {
        return null;
    }

    result = {
        size : 0,
        version: result[1],
        minimum: 0
    };

	return result;
};



const Query = async (appId) => {
    return new Promise(async (resolve, reject) => {
        let {statusCode, body} = await request("https://play.google.com/store/apps/details?id=" + appId).catch((err) => {
            return reject(err);
        })

        if(statusCode !== 200){
            returnreject("HTTP Status Error");
        }

        const jsonResult = getJsonFromHTML(body);
        if(!jsonResult){
            return reject("Web data parsing failed.");
        }

        const versionResult = getVersionFromHTML(body);
        if(!versionResult){
            return reject("Version data parsing failed.");
        }
        
        resolve({
            name: jsonResult.name,
            bundleId: appId,
            image: jsonResult.image,
            author: jsonResult.author.name,
            version: versionResult.version
        });
    })
};

export default Query;
