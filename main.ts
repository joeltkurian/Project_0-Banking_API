import express from 'express';
import ClientDaoAzure from './DAOS/client-dao-azure';
import Account from './Entities/account';
import Client from './Entities/client';
import errorHandler from './Errors/errorSet';

const functs = require("./functs");
const app = express();
app.use(express.json());

const clientDao:ClientDaoAzure = new ClientDaoAzure();

// CREATE
    // CREATE A NEW CLIENT
app.post('/clients', async(req, res)=>{
    try{
    const client:Client = req.body;
    const savedClient = await clientDao.createClient(client);
    res.status(201);
    res.send(savedClient);
    } 
    catch(error){
        errorHandler(error, req, res);
    }
});

    // CREATE A NEW ACCOUNT FOR CLIENT ID
app.post('/clients/:id/accounts', async(req,res)=>{
    try{
        const {id} = req.params;
        const account:Account = req.body;
        const client:Client = await clientDao.createAccountforClientID(id, account);
        res.status(201);
        res.send(client);
    }
    catch(error){
        errorHandler(error, req, res);
    }
});

// RETRIEVE
    // GET ALL CLIENTS
app.get('/clients', async (req, res)=>{
    try{
        const clients:Client[] = await clientDao.getAllClients();
        res.status(200);
        res.send(clients);
    }catch(error){
        errorHandler(error, req, res);
    }
});

    // GET CLIENT WITH ID
app.get('/clients/:id', async (req, res)=>{
    try{
        const {id} = req.params;
        const client = await clientDao.getClientByID(id);
        res.send(client);
    }catch(error){
        errorHandler(error, req, res);
    }
});

    //GET all of a clients accounts, ranges if exists
app.get('/clients/:id/accounts?', async(req,res)=>{
    try{
    const {id} = req.params;
    const {amountLessThan, amountGreaterThan} = req.query;
    const lessThan = functs.ConvertQueryToNum(amountLessThan);
    const greaterThan = functs.ConvertQueryToNum(amountGreaterThan);
    const accounts: Account[] = await clientDao.getClientAccounts(id, lessThan, greaterThan);
    res.send(accounts);
    }catch(error){
        errorHandler(error, req, res);
    }
});

// UPDATE
app.put('/clients/:id', async (req, res)=>{
    try{
        const {id} = req.params;
        const client:Client = req.body;
        const updatedClient = await clientDao.updateClient(client, id);
        res.send(`updated Client: ${updatedClient.fname} ${updatedClient.lname}\nwith id: ${updatedClient.id}`);
    }catch(error){
        errorHandler(error, req, res);
    }
});

    // UPDATE Client account
app.patch('/clients/:id/accounts/:accountName/:action', async(req, res)=>{
    try{
    const {id, accountName, action} = req.params;
    const {amount} = req.body;
    const client:Client = await clientDao.modifyClientAccount(id, accountName, action, amount);
    res.send(client);
    }catch(error){
        errorHandler(error, req, res);
    }
});

// DELETE
app.delete('/clients/:id', async(req,res)=>{
    try{
    const {id} = req.params;
    await clientDao.deleteClientByID(id);
    res.status(205);
    res.send("Deleted The following Client: " + id);
    }catch(error){
        errorHandler(error, req, res);
    }
});

app.listen(3000, ()=>{
    console.log("Application has started!");
});