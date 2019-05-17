export class ConnectionQuery{
    "id":string;
    "host":string;
    "port":string;
    "username":string;
    "password":string
    "nameSchema":string;

    constructor(){
        this.id='';
        this.host='';
        this.port='';
        this.username='';
        this.password='';
        this.nameSchema='';
    }
}