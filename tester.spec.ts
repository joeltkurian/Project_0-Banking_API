import ClientDaoAzure from './DAOS/client-dao-azure';
import Client from './Entities/client';
import Account from './Entities/account';

const clientDao:ClientDaoAzure = new ClientDaoAzure();

let testClient: Client = null;

describe('Dealship DAO Specs', ()=>{

    // Create a new Client
    it('Should create a new Client', async ()=>{
        const client:Client = await clientDao.createClient({id: "", fname: "Geralt", lname: "of Rivia", accounts: []});
        expect(client.id).not.toBe('');
        testClient = client;
    });

    //Create a new Account for Client
    it('Should create a new Account for Client :id', async ()=>{
        const client:Client = await clientDao.createAccountforClientID(testClient.id, {name: 'New Sword', balance: 2000});
        expect(client.accounts[0].name).not.toBe('');
    });

    // Get All Clients
    it('Should get all Clients', async ()=>{
        const clients:Client[] = await clientDao.getAllClients();
        expect(clients.length).toBeGreaterThanOrEqual(1);
    });

    // Get Client by ID
    it('Should get a client by ID', async ()=>{
        const client:Client = await clientDao.getClientByID(testClient.id);
        expect(client.id).toBe(testClient.id);
    });

    // Get All of a Clients Accounts?
    it('Should get Client accounts', async ()=>{
        let client:Client = await clientDao.createAccountforClientID(testClient.id, {name: "New Armor", balance: 1000});
        client = await clientDao.createAccountforClientID(testClient.id, {name: "Roach Armor", balance: 500});
        const accounts:Account[] = await clientDao.getClientAccounts(testClient.id, null, null);
        expect(accounts.length).toBeGreaterThanOrEqual(1);
    });

    // Get All of a Clients accounts ? 
    it('Should get Client accounts Greater than 600 and less than 1500', async ()=>{
        await clientDao.createAccountforClientID(testClient.id, {name: "Alchemy Ingredients", balance: 800});
        const accounts:Account[] = await clientDao.getClientAccounts(testClient.id, 1500, 600);
        expect(accounts.length).toBe(2);
    });

    // Modify Client Account
    it('Should modify client account deposit into New Armor: 1000, withdraw from New Sword: 1000', async ()=>{
        let clients:Client = await clientDao.createAccountforClientID(testClient.id, {name: "Stable Armor", balance: 1000});
        await clientDao.modifyClientAccount(testClient.id, "Stable Armor", 'deposit', '1000');
        await clientDao.modifyClientAccount(testClient.id, "New Sword", 'withdraw', '1000');

        const client:Client = await clientDao.getClientByID(testClient.id);
        let boolean = false;
        client.accounts.find((c)=>{
            if(c.name == "New Armor"){
                if(c.balance == 2000)
                    boolean = true;
                else
                    boolean = false;
            }
            if(c.name == "New Sword"){
                if(c.balance == 1000)
                    boolean = true;
                else
                    boolean = false;
            }
        });
        expect(boolean).toBeTruthy;
    });

    // UPDATE Client
    it('Should update Client name to first name: Witcher, last name: Geralt and only 1 New Armor account', async ()=>{
        const client:Client ={id: testClient.id, fname: 'Witcher', lname: 'Geralt', accounts: [{name: 'New Armor', balance: 2000}]};
        await clientDao.updateClient(client, testClient.id);
        expect(client.fname).toBe('Witcher');
        expect(client.lname).toBe('Geralt');
        expect(client.accounts.length).toBe(1);
    });

    // DELETE Client
    it('Should delete the above Client', async()=>{
        expect(await clientDao.deleteClientByID(testClient.id)).toBeTruthy;
    })
});