import checker from './lib/envVarsChecker';
import VersionModel from './model/Version';

export const handler = async event => {
    const dynamoTable = process.env.DYNAMODB_TABLE;
    const missing = checker(process.env);

    if (missing.length) {
        const vars = missing.join(', ');
        return createResponse(500 ,{message: `Missing required environment variables: ${vars}`});
    }

    const Versions = await UpdateAppVersion(dynamoTable);
    console.log("Hello");

    return createResponse(200 ,{message: "It's ok so far"});
};


const UpdateAppVersion = (dynamoTable) => {
    return new Promise((resolve, reject) => {
        const Version = VersionModel(dynamoTable);

        Version.update({id: 'test'}, {platform: 'mystore', version: '5.6.6'}, function (err) {
            if (err) {
              return console.log(err);
            }
          });
    });
}

const createResponse = async (code, body) => {
    return {
        statusCode: code,
        body: JSON.stringify(body),
    };
};