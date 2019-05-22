export class ConnectionQuery{
    "id":number;
    "host":string;
    "port":string;
    "username":string;
    "password":string
    "nameSchema":string;
    "db":number;

    constructor(){
        this.id=null;
        this.host='';
        this.port='';
        this.username='';
        this.password='';
        this.nameSchema='';
        this.db=1;
    }
}
