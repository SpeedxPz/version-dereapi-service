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

        console.log("Status Code : " + statusCode);

        resolve();

    });
}

const DiscordHook = async(hookList, payload) => {
    return new Promise(async (resolve, reject) => {
        if(payload.length <= 0){
            return resolve();
        }

        
        const discordEmbed = PrepareEmbeded(payload);

        hookList.forEach(async (hook) => {
            console.log("Send to hook -> " + hook.url);
            await SendHook(hook.url, discordEmbed);
        });
        resolve();

    });
}

const PrepareEmbeded = (payload) => {
    const appName = payload[0].name;
    const appIcon = payload[0].image;
    const appAuthor = payload[0].author;
    const appTime = formattedDateTime(Math.floor(new Date() / 1000));
    let fields = [];
    
    payload.forEach(payloadItem => {
        fields.push({
            name: "**" + payloadItem.platform + "**",
            value: payloadItem.version,
            inline: true
        });
    });

    return {
        content: "**Deresute release new app version**",
        embeds: [
            {
                title: appName,
                description: appAuthor,
                color: 9895731,
                thumbnail: {
                    url: appIcon
                },
                footer: {
                    text: "Last update at " + appTime
                },
                fields: fields,
            }
        ]
    }

}




export default DiscordHook;