import { CosmosClient } from "@azure/cosmos";
import {v4} from "uuid";
import Account from "../Entities/account";
import Client from "../Entities/client";
import { insufficientFundsError, ResourceNotFoundError, wrongFundsError } from "../Errors/errorSet";


const functs = require("../functs");

const client = new CosmosClient(process.env.COSMOS_CONNECTION);
const database = client.database('rpas-db');
const container = database.container('Client');



export interface ClientDaoInterface{
    
    // Create New Client
    createClient(Client: Client): Promise <Client>;
    // Create new Account for Client ID
    createAccountforClientID(id: string, account: Account): Promise <Client>;
    // GET Clients
    getAllClients(): Promise<Client[]>;
    getClientByID(id: string): Promise<Client>;
    // GET Accounts
    getClientAccounts(id:string, amountLessThan: number, amountGreaterThan: number):Promise<Account[]>;
    modifyClientAccount(id:string, accountName: string, action: string, amount: string);
    // UPDATE Client
    updateClient(Client: Client, id:string): Promise<Client>;

    // DELETE Client
    deleteClientByID(id: string): Promise<boolean>;


}

export default class ClientDao implements ClientDaoInterface{
    // Create New Client
    async createClient(client: Client): Promise <Client>{
        client.id = v4();
        client.accounts = client.accounts ?? [];
        const response = await container.items.create(client);
        return response.resource;
    }

    // CREATE ACCOUNT for CLIENT ID
    async createAccountforClientID(id: string, account: Account): Promise<Client>{
        let client:Client = await this.getClientByID(id);
        client.accounts.push(account);
        const response = await container.item(id, id).replace<Client>(client);
        return response.resource;
    }

    // GET Clients
    async getAllClients(): Promise<Client[]>{
        const query = container.items.query(`SELECT Client.id, Client.fname, Client.lname, accounts  FROM Client JOIN (SELECT * FROM Client.accounts) AS accounts`);
        const response = await query.fetchAll();
        return response.resources;
    }

    // GET Clients By ID
    async getClientByID(ID: string): Promise<Client>{
        const response = await container.item(ID,ID).read<Client>();
        if(!response.resource){
            throw new ResourceNotFoundError(`The client with id: ${ID}, could not be found!`);
        }
        const {id, fname, lname, accounts} = response.resource;
        return {id, fname, lname, accounts};
    }

    //Get Client Accounts or by range
    async getClientAccounts(id: string, lessThan: number, greaterThan: number):Promise<Account[]>{
        let acc:Account[];
        const client: Client = await this.getClientByID(id);
        const predicate = functs.checkForPredicate(lessThan, greaterThan);
        if(predicate == null)
            acc = client.accounts;
        else if(predicate != null)
            acc = client.accounts.filter(x => predicate(x.balance));
        return acc;
    }

    // UPDATE Client
    async updateClient(client: Client, id:string): Promise<Client>{
        const checkClient:Client = await this.getClientByID(id);
        if(!checkClient){
            throw new ResourceNotFoundError(`The client with id: ${id}, could not be found!`);
        }
        else{
            const response = await container.items.upsert<Client>(client);
            return response.resource;
        }
    }

    async modifyClientAccount(id:string, accountName: string, action: string, amount: string){
        let client:Client = await this.getClientByID(id);
        let checker:boolean = false;
        client.accounts.find(c=>{
            if(c.name === accountName){
                checker = true;
                if(action == 'withdraw'){
                    if(Number(amount) < 0){
                        throw new wrongFundsError(`Please Enter an appropriate amount > 0`)
                    }
                    const num = c.balance - Number(amount);
                    if(num < 0)
                        throw new insufficientFundsError(`The account does not have enough funds to withdraw ${amount}!`);
                    c.balance -= Number(amount);
                }
                else if(action == 'deposit'){
                    const num = Number(amount);
                    if(num < 0){
                        throw new wrongFundsError(`Cannot deposit an amount less than 0`);
                    }
                    c.balance += Number(amount);
                }
            }
        });
        if(!checker){
            throw new ResourceNotFoundError(`The client does not have an account with the name: ${accountName}`);
        }
        this.updateClient(client, id);
        return client;
    }

    // DELETE Client
    async deleteClientByID(ID: string): Promise<boolean>{
        await this.getClientByID(ID);
        await container.item(ID, ID).delete();
        
        return true;
    }
}