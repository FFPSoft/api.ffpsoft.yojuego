var Validator = require('no-if-validator').Validator;
var NotNullOrUndefinedCondition = require('no-if-validator').NotNullOrUndefinedCondition;

class Routes {
    constructor() { }

    add(server){
        let validator = new Validator();
        validator.addCondition(new NotNullOrUndefinedCondition(server).throw(Routes.INVALID_SERVER));

        validator.execute(() => this._addAllRoutes(server), (err) => { throw err; });
    }

    _addAllRoutes(server){
    }

    static get INVALID_SERVER(){
        return 'El server no puede ser null ni undefined';
    }
}

module.exports = Routes;