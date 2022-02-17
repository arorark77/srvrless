'use strict';

const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = "peering";

module.exports.peermanget = async (event, context, callback) => {
  let res = {
    "statusCode": 200,
  };

  if (event.queryStringParameters && event.queryStringParameters.sub_id) {
    let sub_id = event.queryStringParameters.sub_id;
    let scanResult = await scanSubID(sub_id);
    res.body = JSON.stringify({
      value: scanResult
    });
    callback(null, res);
  }
  
  async function scanSubID(sub_id){
    try {      
      var params = {
        TableName: tableName,
        FilterExpression: "sub_id = :sub_id",
        ExpressionAttributeValues: {
          ":sub_id": sub_id        
        }            
      };

      var scanOutput = await docClient.scan(params).promise();
      return scanOutput;

    }

    catch (error) { 
      // res.statusCode = error.statusCode,
      // res.body = JSON.stringify({
      //   "error": "internal server error"
      // });
      // callback(null, res);
      handleError(error);
    }
  }
  
  function handleError(error) {
    res.statusCode = error.statusCode,
    res.body = JSON.stringify ({
      "error": "internal server error"
    });
    callback(null, res);
  }
};