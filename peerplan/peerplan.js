var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});
//scan Peerman Table
// Scan Planman Table
// Delete Cidr from Peerman Entires
// Get all regions from Planman in an array
// For Each Region Get the Cidr
// push the value to Appropriate Peerman entry based on location = Region
// cidr: {'EAST US':[],'Southeast Asia':[],'West Europe':[]}


var docClient = new AWS.DynamoDB.DocumentClient();
var account_id = "cccc"
var accountId = "cccc" 

async function init(){
    let subvalidOut = await validSub(account_id);
    if (!subvalidOut) {
        console.log ("provide a valid sub_id")
    }
    else {
        let scanOutput = await scanSub(account_id);
        console.log(scanOutput);
        for (i = 0; i < scanOutput.length; i++) {
          delete scanOutput[i].cidr;
        }
        console.log(scanOutput);

        let cidrOutput = await getCidr(accountId);
        console.log(cidrOutput);
        // let cidrArr = [];
        let regionArr = []
        let uniqrArr = []
        for (i = 0; i < cidrOutput.length; i++) {
          let cidrRegion = cidrOutput[i].Region;
          regionArr.push(cidrRegion);
          uniqrArr = [... new Set(regionArr)];

        }
        console.log(regionArr);
        console.log(uniqrArr);

        let cidrObj = new Object();
        // let cidrObj = {};
        // for (i = 0; i < cidrOutput.length; i++) {
          uniqrArr.forEach(region => {
            console.log(region);
            let cidrArr = [];
            for (i = 0; i < cidrOutput.length; i++) {
                if (region == cidrOutput[i].Region) {
                    // let cidrArr = [];
                    let cidrPrefix = cidrOutput[i].Prefix
                    let cidrBlockSize = cidrOutput[i].BlockSize;
                    let cidr = cidrPrefix.concat('/', cidrBlockSize);
                    cidrArr.push(cidr);
                    console.log(cidrArr);
                    // cidrObj.region = cidrArr;
                }
                cidrObj[region] = cidrArr;
                console.log(cidrObj);
            }
        });

        console.log(uniqrArr);

        uniqrArr.forEach(region => {
            console.log(region);
            if (region == "East US"){
                console.log("first region");
                for (i = 0; i < scanOutput.length; i++) {
                        if (scanOutput[i].location == 'Ashburn'){
                            // scanOutput[i].cidr = {"East US" : JSON.stringify(cidrObj['East US'])};
                            // let cidrRegion = region;
                            // let cidrValue = cidrObj[cidrRegion];
                            scanOutput[i].cidr = { };
                            console.log(scanOutput[i]);
                            // scanOutput[i].cidr
                            scanOutput[i].cidr[region] = JSON.stringify(cidrObj[region]);
                    }
                }
            }
            else if (region == "West Europe") {
                console.log("second region");
                for (i = 0; i < scanOutput.length; i++) {
                    if (scanOutput[i].location == 'Amsterdam'){
                    // scanOutput[i].cidr = cidrObj['West Europe'];
                    // scanOutput[i].cidr = {"West Europe" : JSON.stringify(cidrObj['West Europe'])};
                    scanOutput[i].cidr = { };
                    // scanOutput[i].cidr 
                    scanOutput[i].cidr[region] = JSON.stringify(cidrObj[region]);                    
                    }
                }
            }
            else {
                console.log("third region");
                for (i = 0; i < scanOutput.length; i++) {
                    if (scanOutput[i].location == 'Singapore'){
                    // scanOutput[i].cidr = cidrObj['Southeast Asia'];
                    // scanOutput[i].cidr = {"Southeast Asia" : JSON.stringify(cidrObj['Southeast Asia'])}; 
                    scanOutput[i].cidr = { };
                    scanOutput[i].cidr
                    scanOutput[i].cidr[region] = JSON.stringify(cidrObj[region]); 
                    }
                }
            }  
        }); 
      console.log(scanOutput);
    }
  }
init();
async function validSub(sub_id){

    // let regExpSubID = /^[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}$/;
    let regExpSubID = /^[0-9A-Fa-f]{4}$/;
    let checkSub = regExpSubID.test(sub_id);
    return checkSub;
};

async function scanSub(sub_id){
    var params = {
        TableName: "peering",
        FilterExpression: "sub_id = :sub_id",
        ExpressionAttributeValues: {
            ":sub_id": sub_id
        }
    }

    let scanResults = [];
    let scandata;
    do {
        scandata = await docClient.scan(params).promise();
        scandata.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey = scandata.LastEvaluatedKey;
    } while (typeof scandata.LastEvaluatedKey != "undefined");
    return scanResults;
};

async function getCidr(sub_id){
  var params = {
      TableName: "planman-blocks",
      FilterExpression: "AccountId = :sub_id",
      ExpressionAttributeValues: {
          ":sub_id": sub_id
      }
    }
  let scanResults = [];
  let scandata;
  do {
      scandata = await docClient.scan(params).promise();
      scandata.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey = scandata.LastEvaluatedKey;
  } while (typeof scandata.LastEvaluatedKey != "undefined");
  return scanResults;
};