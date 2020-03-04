import checker from './lib/envVarsChecker';
import VersionModel from './model/Version';
import HookModel from './model/Hook';
import PlayStore from './updater/playStore';
import AppStore from './updater/appStore';
import DiscordHook from './webhook/discord/appVersion';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


export const handler = async event => {
    console.log("Updater triggered to update");
    const dynamoTable = process.env.DYNAMODB_TABLE;
    const hookTable = process.env.HOOK_TABLE;
    const gPlayID = process.env.GPLAY_ID;
    const aStoreID = process.env.ASTORE_ID;
    const missing = checker(process.env);

    if (missing.length) {
        const vars = missing.join(', ');
        return createResponse(500 ,{message: `Missing required environment variables: ${vars}`});
    }

    VersionModel(dynamoTable);
    const Versions = await VersionModel.GetAll();

    HookModel(hookTable);
    const Hooks = await HookModel.GetAll();

    const webhooksList = Hooks.filter(item => item.function == "versionapi");
    let hookContent = [];

    await PlayStore(gPlayID).then(async (gPlayResult) => {
        const searchResult = Versions.filter(item => item.platform == "android" && item.version == gPlayResult.version);
        if(searchResult.length == 0){
            hookContent.push({
                    name: gPlayResult.name,
                    image: gPlayResult.image,
                    author: gPlayResult.author,
                    version: gPlayResult.version,
                    platform: 'Android',
                });
        }

        await SaveVersionUpdate(VersionModel, 
            gPlayID,
            'android',
            gPlayResult,
        ).catch((err)=> {
            console.log("Error while saving data from google play store: \n" + err);
        });
    })
    .catch( (err) => {
        console.log("Error while query google play store: \n" + err);
    })

    
    await AppStore(aStoreID).then(async (aStoreResult) => {
        const searchResult = Versions.filter(item => item.platform == "ios" && item.version == aStoreResult.version);
        if(searchResult.length == 0){
            hookContent.push({
                name: aStoreResult.name,
                image: aStoreResult.image,
                author: aStoreResult.author,
                version: aStoreResult.version,
                platform: 'iOS',
            });
        }

        await SaveVersionUpdate(VersionModel, 
            aStoreID,
            'ios',
            aStoreResult,
        ).catch((err)=> {
            console.log("Error while saving data from apple store: \n" + err);
        });
    })
    .catch((err) => {
        console.log("Error while query apple store: \n" + err);
    });

    const discordHookList = webhooksList.filter(item => item.service == "discord");
    await DiscordHook(discordHookList, hookContent);

    console.log("Updater completed the task");
    return createResponse(200 ,{message: "It's ok so far"});
};

const SaveVersionUpdate = async (VersionModel, appId, platform, payload) => {
    return new Promise(async (resolve, reject) => {
        await VersionModel.Update(appId, {
            appId: payload.bundleId,
            platform: platform,
            version: payload.version,
            appInfo: {
                name: payload.name,
                image: payload.image,
                author: payload.author,
            },
            updateTime: Math.floor(new Date() / 1000),
        }).catch((err) => reject(err))
        resolve();
    })
    
}

const createResponse = async (code, body) => {
    return {
        statusCode: code,
        body: JSON.stringify(body),
    };
};

