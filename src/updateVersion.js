import checker from './lib/envVarsChecker';
import VersionModel from './model/Version';
import HookModel from './model/Hook';
import PlayStore from './updater/playStore';
import AppStore from './updater/appStore';
import RunHook from './webhook/discord';




export const handler = async event => {
    const dynamoTable = process.env.DYNAMODB_TABLE;
    const hookTable = process.env.HOOK_TABLE;
    const gPlayID = process.env.GPLAY_ID;
    const aStoreID = process.env.ASTORE_ID;
    const missing = checker(process.env);

    if (missing.length) {
        const vars = missing.join(', ');
        return createResponse(500 ,{message: `Missing required environment variables: ${vars}`});
    }

    const Versions = await GetAppVersions(dynamoTable);
    const Hooks = await GetAppHooks(hookTable);
    const filterdHook = Hooks.filter(item => item.function == "versionapi");

    await PlayStore(gPlayID).then(async (gPlayResult) => {

        const searchResult = Versions.filter(item => item.platform == "android" && item.version == gPlayResult.version);
        if(searchResult.length == 0){
            console.log("Run hook!");
            await RunHook({
                name: gPlayResult.name,
                image: gPlayResult.image,
                author: gPlayResult.author,
                version: gPlayResult.version,
                platform: 'Android',
                hooks: filterdHook
            });
        }

        await UpdateAppVersion(dynamoTable, {
            id: gPlayID,
            appId: gPlayResult.bundleId,
            platform: 'android',
            version: gPlayResult.version,
            timestamp: Math.floor(new Date() / 1000),
            appInfo: {
                name: gPlayResult.name,
                image: gPlayResult.image,
                author: gPlayResult.author,
            }
        }).catch((err) => {
            //Do something when it's error
        });
    })
    .catch( (err) => {
        //Do something when it's error
    })

    

    await AppStore(aStoreID).then(async (aStoreResult) => {

        const searchResult = Versions.filter(item => item.platform == "ios" && item.version == aStoreResult.version);
        if(searchResult.length == 0){
            console.log("Run hook!");
            await RunHook({
                name: aStoreResult.name,
                image: aStoreResult.image,
                author: aStoreResult.author,
                version: aStoreResult.version,
                platform: 'iOS',
                hooks: filterdHook,
            });
        }

        await UpdateAppVersion(dynamoTable, {
            id: aStoreID,
            appId: aStoreResult.bundleId,
            platform: 'ios',
            version: aStoreResult.version,
            timestamp: Math.floor(new Date() / 1000),
            appInfo: {
                name: aStoreResult.name,
                image: aStoreResult.image,
                author: aStoreResult.author,
            }
        }).catch((err) => {
            //Do something when it's error
        });
    })
    .catch((err) => {
        //Do something when it's error
    })

    return createResponse(200 ,{message: "It's ok so far"});
};


const UpdateAppVersion = (dynamoTable, payload) => {
    return new Promise((resolve, reject) => {
        const Version = VersionModel(dynamoTable);

        Version.update({id: payload.id}, {appId: payload.appId, platform: payload.platform, version: payload.version, appInfo: payload.appInfo, updateTime: payload.timestamp}, function (err) {
            if (err) {
              return reject(err);
            }
            return resolve();
          });
    });
}

const createResponse = async (code, body) => {
    return {
        statusCode: code,
        body: JSON.stringify(body),
    };
};

const GetAppVersions = (dynamoTable) => {
    return new Promise((resolve, reject) => {
        const Version = VersionModel(dynamoTable);
        Version.scan().exec((err, data) => {
            if(err) return reject(err);
            resolve(data);
        });
    });
}

const GetAppHooks = (dynamoTable) => {
    return new Promise((resolve, reject) => {
        const Hook = HookModel(dynamoTable);
        Hook.scan().exec((err, data) => {
            if(err) return reject(err);
            resolve(data);
        });
    });
}