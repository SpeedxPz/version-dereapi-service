'use strict'
const dynamoose = require('dynamoose');


let workingTable = "";

const Model = (tableName) => {
    workingTable = tableName;
    return true;
}

const GetModel = (tableName) => {
    const model = dynamoose.model(
        tableName, 
        {
            id: String, 
            appId: String,
            platform: String, 
            version: String,
            updateTime: Number,
            appInfo: {
                name: String,
                image: String,
                author: String,
            }
        });
    
    return model;
}

const GetAll = () => {
    return new Promise((resolve, reject) => {
        const model = GetModel(workingTable);
        model.scan().exec((err, data) => {
            if(err) return reject(err);
            resolve(data);
        });
    });
}

const Update = (key, payload) => {
      return new Promise((resolve, reject) => {
        const model = GetModel(workingTable);
        model.update({id: key}, payload, function (err) {
            if (err) {
              return reject(err);
            }
            return resolve();
          });
    });
}

module.exports = Model;
Model.GetAll = GetAll;
Model.Update = Update;