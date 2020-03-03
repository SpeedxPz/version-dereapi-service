import checker from './lib/envVarsChecker';
import VersionModel from './model/Version';
import PlayStore from './updater/playStore';
import AppStore from './updater/appStore';

export const handler = async event => {
    const dynamoTable = process.env.DYNAMODB_TABLE;
    const gPlayID = process.env.GPLAY_ID;
    const aStoreID = process.env.ASTORE_ID;
    const missing = checker(process.env);

    if (missing.length) {
        const vars = missing.join(', ');
        return createResponse(500 ,{message: `Missing required environment variables: ${vars}`});
    }

    const gPlayResult = await PlayStore(gPlayID).catch( (err) => {
        //Do something when it's error
    })

    await UpdateAppVersion(dynamoTable, {
        id: gPlayID,
        appId: gPlayResult.bundleId,
        platform: 'android',
        version: gPlayResult.version,
        appInfo: {
            name: gPlayResult.name,
            image: gPlayResult.image,
            author: gPlayResult.author,
        }
    }).catch((err) => {
        //Do something when it's error
    });

    const aStoreResult = await AppStore(aStoreID).catch((err) => {
        //Do something when it's error
    })

    await UpdateAppVersion(dynamoTable, {
        id: aStoreID,
        appId: aStoreResult.bundleId,
        platform: 'ios',
        version: aStoreResult.version,
        appInfo: {
            name: aStoreResult.name,
            image: aStoreResult.image,
            author: aStoreResult.author,
        }
    }).catch((err) => {
        //Do something when it's error
    });
    

    /*console.log("Running Dynamo");
    const Versions = await UpdateAppVersion(dynamoTable);
    console.log("Hello");*/

    
    

    return createResponse(200 ,{message: "It's ok so far"});
};


const UpdateAppVersion = (dynamoTable, payload) => {
    return new Promise((resolve, reject) => {
        const Version = VersionModel(dynamoTable);

        Version.update({id: payload.id}, {appId: payload.appId, platform: payload.platform, version: payload.version, appInfo: payload.appInfo}, function (err) {
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