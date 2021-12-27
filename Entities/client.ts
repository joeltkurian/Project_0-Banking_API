import account from "./account";

export default interface Client{
    id: string;
    fname: string;
    lname: string;
    accounts?: account[];
}