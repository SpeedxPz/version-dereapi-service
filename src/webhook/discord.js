const util = require('util');
const request = util.promisify(require("request"));



const formattedDateTime = (timestamp) => {
    var date = new Date((timestamp * 1000) );
    var year = date.getFullYear();
    var month = "0" + date.getMonth();
    var day = "0" + date.getDay();
    var hours = "0" + date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var formattedTime = year + "/" + month.substr(-2) + "/" + day.substr(-2) + " " + hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
}

const SendHook = async(url, payload) => {
    return new Promise(async (resolve,reject) => {
        var options = {
            uri: url,
            method: 'POST',
            json: payload,
          };


        let {statusCode, body} = await request(options).catch((err) => {
            return reject(err);
        });

        resolve();

    });
}

const RunHook = async (appInfo) => {
    return new Promise(async (resolve, reject) => {
        
        let fields = [];

        fields.push({
            name: appInfo.platform,
            value: appInfo.version,
            inline: true
        });
        
        const payload = {
            embeds: [
                {
                    title: appInfo.name,
                    description: appInfo.author,
                    color: 9895731,
                    thumbnail: {
                        url: appInfo.image
                    },
                    footer: {
                        text: "Last update at " + formattedDateTime(Math.floor(new Date() / 1000))
                    },
                    fields: fields,
                }
            ]
        }

        appInfo.hooks.forEach(hook => {
            console.log("Send to hook -> " + hook.url);
            SendHook(hook.url, payload);
        });
        
        resolve();

    })
};



export default RunHook;