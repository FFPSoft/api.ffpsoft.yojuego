
 var _db;

 class MongoRepository {
    constructor(source){
        if(source === undefined || source === null){
            throw new Error(MongoRepository.INVALID_SOURCE());
        }

        this.source = source;
        _db = null;
        //var url = 'mongodb://localhost:27017/yojuego';
    }

    connect(){
        return new Promise( (resolve, reject) => {
            var mongodb = require('mongodb');
            mongodb.MongoClient.connect(this.source, function (err, db) {
                console.log('err: ' + err);
                console.log('db: ' + db);
                if (!err){
                    _db = db;
                    resolve(MongoRepository.CONNECTION_ESTABLISHED());
                }else{
                    resolve(MongoRepository.CONNECTION_NOT_ESTABLISHED());
                }
            });
        });
    }

    closeConnection(){
        return new Promise( (resolve, reject) => {
            _db.close();
            _db = null;
            resolve();
        });
    }

    insert(rootDocument, childDocument){
        if (rootDocument === undefined || rootDocument === null){
            throw new Error(MongoRepository.INVALID_DOCUMENT());
        }

        if (childDocument === undefined || childDocument === null){
            throw new Error(MongoRepository.INVALID_CHILD_DOCUMENT());
        }

        // var collection = _db.collection(rootDocument);
        // collection.insert(childDocument);

        return new Promise( (resolve, reject) => {
            reject(MongoRepository.CONNECTION_NOT_ESTABLISHED());
        });
    }

    update(document){
        return new Promise( (resolve, reject) => {
            reject(MongoRepository.CONNECTION_NOT_ESTABLISHED());
        });
    }

    delete(document){
        return new Promise( (resolve, reject) => {
            reject(MongoRepository.CONNECTION_NOT_ESTABLISHED());
        });
    }

    get(document, criteria){

        if (document === undefined || document === null){
            throw new Error(MongoRepository.INVALID_DOCUMENT());
        }

        if (criteria === undefined  || criteria === null){
            throw new Error(MongoRepository.INVALID_CRITERIA());
        }

        // var collection = _db.collection(document);
        // return collection.find(criteria);

        return new Promise( (resolve, reject) => {
            reject(MongoRepository.CONNECTION_NOT_ESTABLISHED());
        });
    }

    static INVALID_SOURCE() {
        return "El origen de datos debe contener un valor.";
    }

    static CONNECTION_NOT_ESTABLISHED() {
        return "La conexión no fue establecida.";
    }

    static CONNECTION_ESTABLISHED() {
        return "La conexión fue establecida exitosamente.";
    }

    static INVALID_DOCUMENT() {
        return "Debe proporcionar un documento valido.";
    }

    static INVALID_CRITERIA() {
        return "Debe proporcionar un criterio valido.";
    }

    static INVALID_CHILD_DOCUMENT() {
        return "El elemento a insertar no es válido.";
    }
}

module.exports = MongoRepository;