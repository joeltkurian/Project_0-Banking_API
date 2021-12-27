import Client from "./Entities/client";
import { insufficientFundsError } from "./Errors/errorSet";

function ConvertQueryToNum(parsedQuery): number{
    let temp = "";
    let num:number = 0;
    if(parsedQuery != undefined){
        for(let i =0; i<parsedQuery.length; i++){
            temp += parsedQuery[i];
        }
        num = parseInt(temp);
    }
    else num = null;
    return num;
}

function checkForPredicate(lessThan:number, greaterThan:number){
    let predicate = null;
    if(lessThan != null && greaterThan != null){
        predicate = (x) => {return (x <lessThan && x > greaterThan)};
    }
    else if(lessThan != null){
        predicate = (x) =>{return x < lessThan;}
    }
    else if(greaterThan != null){
        predicate = (x) => {return x > greaterThan;}
    }
    return predicate;
}


module.exports = { ConvertQueryToNum, checkForPredicate };