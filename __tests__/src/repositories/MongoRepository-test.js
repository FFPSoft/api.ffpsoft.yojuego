jest.mock('mongodb');
jest.unmock('../../../src/repositories/MongoRepository');

import MongoRepository from '../../../src/repositories/MongoRepository';

describe('MongoRepository', () => {
  var mongodb;
  var mockedDb = {
    collection: (document) => {},
    close: () => {}
  };
  var mockedConnect = jest.fn((error, db) => { return jest.fn((aUrl, aFunction) => aFunction(error, db)); });
  var baseDeleteOneMethod = jest.fn((err, result) => { return jest.fn((childDocument, callback) => callback(err, result)); });

  beforeEach(function() {
    mongodb = require('mongodb');
    mongodb.MongoClient.connect = mockedConnect(false, {});
  });

  afterEach(function() {
    mongodb = null;
  });

  it('Cannot create with a source undefined', () => {
    var undefinedSource;
  
    expect(() => new MongoRepository(undefinedSource)).toThrowError(MongoRepository.INVALID_SOURCE());
  });

  it('Cannot create with a source null', () => {
    var nullSource = null;
  
    expect(() => new MongoRepository(nullSource)).toThrowError(MongoRepository.INVALID_SOURCE());
  });

  it('Can create a valid MongoRepository', () => {
    var url = 'aValidUrl';
    var mongoRep = new MongoRepository(url);

    expect(mongoRep.source).toEqual(url);
  });

  pit('Connect must execute the resolve callback if connection succesful', () => {
    var mongoRep = new MongoRepository("aValidUrl");
    
    return mongoRep._connect()
    .then((db) => expect(db).not.toBeNull(), (err) => expect(true).toBe(false))
    .catch((err) => expect(true).toBe(false));
  });

  pit('Connect must execute the reject callback if connection fail', () => {
    mongodb.MongoClient.connect = mockedConnect(true, {});

    var mongoRep = new MongoRepository("anInvalidUrl");

    return mongoRep._connect()
          .then((db) => expect(true).toBe(false), (err) => expect(err).toEqual(MongoRepository.CONNECTION_NOT_ESTABLISHED()))
          .catch((err) => expect(true).toBe(false));
  });

  pit('The connection must be done with the source it has been created', () => {
    var aValidSource = 'aValidSource';
    var mongoRep = new MongoRepository(aValidSource);

    return mongoRep._connect()
          .then((db) => expect(mongodb.MongoClient.connect.mock.calls[0][0]).toEqual(aValidSource), (err) => expect(true).toBe(false))
          .catch((err) => expect(true).toBe(false));
  });

  pit('Insert executes reject callback if connection is not established', () => {
    var mongoRep = new MongoRepository('aValidSource');

    mongodb.MongoClient.connect = mockedConnect(true, mockedDb);

    return mongoRep.insert('rootDocument', {})
          .then(() => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.CONNECTION_NOT_ESTABLISHED()))
          .catch((err) => expect(true).toBe(false));
  });

  pit('Update executes reject callback if connection is not established', () => {
    var mongoRep = new MongoRepository('aValidSource');

    mongodb.MongoClient.connect = mockedConnect(true, mockedDb);

    return mongoRep.update('rootDocument', {_id: 'anId'}, {})
          .then((msj) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.CONNECTION_NOT_ESTABLISHED()))
          .catch((err) => expect(true).toBe(false));
  });

  pit('Delete executes reject callback if connection is not established', () => {
    var mongoRep = new MongoRepository('aValidSource');

    mongodb.MongoClient.connect = mockedConnect(true, mockedDb);

    return mongoRep.delete('aDocument', {})
          .then((msj) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.CONNECTION_NOT_ESTABLISHED()))
          .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot get any document if connection has not beed established', () => {
    var mongoRep = new MongoRepository('aValidSource');
    mongodb.MongoClient.connect = mockedConnect(true, mockedDb);

    return mongoRep.get('aDocument', {})
          .then((msj) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.CONNECTION_NOT_ESTABLISHED()))
          .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot get document if a undefined document is passed', () => {
    var undefinedDocument;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.get(undefinedDocument, {})
          .then((objReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_DOCUMENT()))
          .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot get document if a null document is passed', () => {
    var nullDocument = null;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.get(nullDocument, {})
           .then((objReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_DOCUMENT()))
           .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot get document if a undefined criteria is passed', () => {
    var undefinedCriteria;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.get('aDocument', undefinedCriteria)
           .then((objReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_CRITERIA()))
           .catch((err) => expect(true).toBe(false));  
  });

  pit('Cannot get document if a null criteria is passed', () => {
    var nullCriteria = null;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.get('aDocument', nullCriteria)
           .then((objReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_CRITERIA()))
           .catch((err) => expect(true).toBe(false)); 
  });

  pit('Collection method from db must be called in get', () => {
    var documentToFind = 'aDocument';
    var mockedCollectionMethod = jest.fn((document) => {return {find: (criteria) => { return {}; }}});
    var db = {collection: mockedCollectionMethod, close: () => {}};

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.get(documentToFind, {})
           .then((objectReturned) => expect(mockedCollectionMethod).toBeCalledWith(documentToFind), (err) => expect(true).toBe(false))
           .catch((err) => expect(true).toBe(false));
  });

  pit('Get must execute reject if an exception occurs', () => {
    var documentToFind = 'aDocument';
    var mockedGetThrowsException = jest.fn((document) => {return { find: (criteria) => { throw new Error(MongoRepository.UNEXPECTED_ERROR()); }, close: () => {} }});
    var db = {collection: mockedGetThrowsException};

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.get(documentToFind, {})
          .then((objectReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.UNEXPECTED_ERROR()))
          .catch((err) => { expect(true).toBe(false) });
  });

  pit('Find method from db must be called in get', () => {
    var documentToFind = 'aDocument';
    var db = { collection: (document) => { return { find: mockedFindMethod }},
               close: () => {} 
        };
    var mockedFindMethod = jest.fn((criteria) => {});

    var criteriaToApply = {};

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.get(documentToFind, criteriaToApply)
          .then((objectReturned) => expect(mockedFindMethod).toBeCalledWith(criteriaToApply), (err) => expect(true).toBe(false))
          .catch((err) => expect(true).toBe(false));
  });

  pit('Can get a document collection', () => {
    var expectedResult = [{name: 'element1'}, {name: 'element2'}];
    var db = {
        collection: (document) => { return {find: jest.fn((criteria) => expectedResult) }; },
        close: () => {}
    };
    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.get('aDocument', {})
           .then((objectReturned) => expect(objectReturned).toBe(expectedResult), (err) => expect(true).toBe(false))
           .catch(() => expect(true).toBe(false));
  });

  pit('After get connection must be closed', () => {
    var db = {
        collection: (document) => { return { find: (document) => {  } };},
        close: jest.fn(() => {})
    };

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.get('aDocumentToFind', {})
           .then((result) => {
                expect(db.close).toBeCalled();
           }, (err) => expect(true).toBe(false))
           .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot insert a childDocument with an undefined rootDocument', () => {
    var undefinedRootDocument;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.insert(undefinedRootDocument, {})
          .then(() => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_DOCUMENT()))
          .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot insert a childDocument with a null rootDocument', () => {
    var nullRootDocument = null;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.insert(nullRootDocument, {})
          .then(() => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_DOCUMENT()))
          .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot insert an undefined childDocument', () => {
    var undefinedChildtDocument;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.insert('rootDocument', undefinedChildtDocument)
          .then(() => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_CHILD_DOCUMENT()))
          .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot insert a null childDocument', () => { 
    var nullChildDocument = null;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.insert('rootDocument', nullChildDocument)
          .then(() => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_CHILD_DOCUMENT()))
          .catch((err) => expect(true).toBe(false));
  });

  pit('Collection method from db must be called when insert', () => {
    var rootDocument = 'aDocument';
    var mockedCollectionMethod = jest.fn((document) => {return {insert: jest.fn((childDoc, callback) => { callback(false, {}); })}});
    var db = {collection: mockedCollectionMethod, close: () => {}};

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.insert(rootDocument, {})
            .then(() => expect(mockedCollectionMethod).toBeCalledWith(rootDocument), (err) => expect(true).toBe(false))
            .catch((err) => expect(true).toBe(false));
  });

  pit('Insert method from db must be called when insert', () => {
    var mockedInsertMethod = jest.fn((childDoc, callback) => { callback(false, {}); });
    var db = { collection: () => {return {insert: mockedInsertMethod}}, close: () => {}};
    var childDocument = {};

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.insert('rootDocument', childDocument)
            .then((msj) => expect(mockedInsertMethod.mock.calls[0][0]).toBe(childDocument), (err) => expect(true).toBe(false))
            .catch((err) => expect(true).toBe(false));
  });

  pit('Insert must execute resolve after inserting', () => {
    var mockedInsertMethod = jest.fn((childDocument, callback) => {callback(false, {})});
    var childDocument = {};
    var db = { collection: () => {return {insert: mockedInsertMethod}}, close: () => {}};
    
    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.insert('rootDocument', childDocument)
            .then((msj) => expect(msj).toBe(MongoRepository.DOCUMENT_INSERTED()), (err) => expect(true).toBe(false))
            .catch((err) => expect(true).toBe(false));
  });

  pit('Can insert a child document', () => {
    var rootDocument = 'rootDocument';
    var nameDefined = 'aName'; 
    var documentInserted = {name: nameDefined, surname: 'aSurname', addree: 'aAddress'};
    var db = {
        collection: function(document) {
            return {
              find: jest.fn((criteria) => documentInserted),
              insert: jest.fn((document) => {})
            };
        },
        close: () => {}
    };
    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.get(rootDocument, {name: nameDefined})
            .then((objReturned) => expect(objReturned).toBe(documentInserted), (err) => expect(true).toBe(false))
            .catch((err) => expect(true).toBe(false));
  });

  pit('Insert must execute reject if an exception occurs', () => {
    var documentToFind = 'aDocument';
    var mockedDeleteOneThrowsException = jest.fn((document) => {return { insert: function(){ throw new Error(MongoRepository.UNEXPECTED_ERROR()); } }});
    var db = {collection: mockedDeleteOneThrowsException, close: () => {}};

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.insert(documentToFind, {})
            .then(() => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.UNEXPECTED_ERROR()))
            .catch((err) => { expect(true).toBe(false) });
  });

  pit('After insert connection must be closed', () => {
    var db = {
        collection: (document) => { return { insert: (document, callback) => { callback(false, {}) } };},
        close: jest.fn(() => {})
    };

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.insert('aDocumentToFind', {})
           .then((result) => {
                expect(db.close).toBeCalled();
           }, (err) => expect(true).toBe(false))
           .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot delete document if a undefined document is passed', () => {
    var undefinedDocument;
    var mongoRep = new MongoRepository('aValidSource');

    mongodb.MongoClient.connect = mockedConnect(false, mockedDb);

    return mongoRep.delete(undefinedDocument, {})
           .then((objReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_DOCUMENT()))
           .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot delete document if a null document is passed', () => {
    var nullDocument = null;
    var mongoRep = new MongoRepository('aValidSource');

    mongodb.MongoClient.connect = mockedConnect(false, mockedDb);

    return mongoRep.delete(nullDocument, {})
           .then((objReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_DOCUMENT()))
           .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot delete document if a undefined criteria is passed', () => {
    var undefinedCriteria;
    var mongoRep = new MongoRepository('aValidSource');

    mongodb.MongoClient.connect = mockedConnect(false, mockedDb);

    return mongoRep.delete('aDocument', undefinedCriteria)
           .then((objReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_CRITERIA()))
           .catch((err) => expect(true).toBe(false));  
  });

  pit('Cannot delete document if a null criteria is passed', () => {
    var nullCriteria = null;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.delete('aDocument', nullCriteria)
           .then((objReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_CRITERIA()))
           .catch((err) => expect(true).toBe(false)); 
  });

  pit('Collection method from db must be called in delete', () => {
    var documentToFind = 'aDocument';
    var db = mockedDb;
    db.collection = jest.fn((document) => { return { deleteOne: baseDeleteOneMethod(false, {}) }});

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.delete(documentToFind, {})
          .then(() => expect(db.collection.mock.calls[0][0]).toBe(documentToFind), (err) => expect(true).toBe(false))
          .catch((err) => expect(true).toBe(false));
  });

  pit('delete must execute reject if an exception occurs', () => {
    var documentToFind = 'aDocument';
    var mockedDeleteOneThrowsException = jest.fn((document, callback) => { throw new Error(MongoRepository.UNEXPECTED_ERROR()); });
    var db = mockedDb;
    db.collection = (document) => { return { deleteOne: mockedDeleteOneThrowsException }};

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.delete(documentToFind, {})
            .then(() => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.UNEXPECTED_ERROR()))
            .catch((err) => expect(true).toBe(false));
  });

  pit('deleteOne method from db must be called in delete', () => {
    var mockedDeleteOneMethod = jest.fn((document, callback) => callback(false, {}));
    var db = mockedDb;
    db.collection = (document) => { return { deleteOne: mockedDeleteOneMethod }}

    var criteriaToApply = {};

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.delete('aDocumentToDelete', criteriaToApply)
          .then(() => expect(mockedDeleteOneMethod.mock.calls[0][0]).toBe(criteriaToApply), (err) => expect(true).toBe(false))
          .catch((err) => expect(true).toBe(false));
  });

  pit('delete must execute reject if db.deleteOne returns error', () => {
    var mockedDeleteOneMethod = jest.fn((document, callback) => callback(true, {}));
    var db = mockedDb;
    db.collection = (document) => {return {deleteOne: mockedDeleteOneMethod}}

    var criteriaToApply = {};

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.delete('aDocumentToDelete', criteriaToApply)
          .then(() => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.ERROR_WHILE_DELETING()))
          .catch((err) => expect(true).toBe(false));
  });

  pit('After delete connection must be closed', () => {
    var db = {
      collection: jest.fn((document) => { return {deleteOne: (document, callback) => {callback(false, {})}}}), 
      close: jest.fn(() => {})
    };

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.delete('aDocumentToDelete', {})
           .then((result) => {
                expect(db.close).toBeCalled();
           }, (err) => expect(true).toBe(false))
           .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot update any document if connection has not beed established', () => {
    var mongoRep = new MongoRepository('aValidSource');
    mongodb.MongoClient.connect = mockedConnect(true, mockedDb);

    return mongoRep.update('aDocument', {_id: 'aId'}, {})
          .then((msj) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.CONNECTION_NOT_ESTABLISHED()))
          .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot update document if a undefined document is passed', () => {
    var undefinedDocument;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.update(undefinedDocument, {_id: 'aId'}, {})
          .then((objReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_DOCUMENT()))
          .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot update document if a null document is passed', () => {
    var nullDocument = null;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.update(nullDocument, {_id: 'aId'}, {})
           .then((objReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_DOCUMENT()))
           .catch((err) => expect(true).toBe(false));
  });

  pit('Cannot update document if a undefined id is passed', () => {
    var undefinedId;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.update('aDocument', undefinedId, {})
           .then((objReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_ID()))
           .catch((err) => expect(true).toBe(false));  
  });

  pit('Cannot update document if a null id is passed', () => {
    var nullId = null;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.update('aDocument', nullId, {})
           .then((objReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_ID()))
           .catch((err) => expect(true).toBe(false)); 
  });

  pit('Cannot update document if a undefined data to update is passed', () => {
    var undefinedDataToUpdate;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.update('aDocument', {_id: 'anId'}, undefinedDataToUpdate)
           .then((objReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_DATA_TO_UPDATE()))
           .catch((err) => expect(true).toBe(false));  
  });

  pit('Cannot update document if a null data to update is passed', () => {
    var nullDataToUpdate = null;
    var mongoRep = new MongoRepository('aValidSource');

    return mongoRep.update('aDocument', {_id: 'anId'}, nullDataToUpdate)
           .then((objReturned) => expect(true).toBe(false), (err) => expect(err).toBe(MongoRepository.INVALID_DATA_TO_UPDATE()))
           .catch((err) => expect(true).toBe(false)); 
  });

  pit('Collection method from db must be called in update', () => {
    var rootDocument = 'aDocument';
    var mockedCollectionMethod = jest.fn((document) => { return {update: (id, toUpdate, callback) => { callback(false, {})}}});
    var db = {collection: mockedCollectionMethod, close: () => {}};

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.update(rootDocument, {_id: 'anId'}, {})
           .then(() => expect(mockedCollectionMethod.mock.calls[0][0]).toBe(rootDocument), (err) => expect(true).toBe(false))
           .catch((err) => expect(true).toBe(false));
  });

  pit('Update method from db must be called in update', () => {
    var anId = {_id: 'anId'};
    var toUpdate = {somethigToUpdate: 'somethingToUpdate'};
    var mockedUpdate = jest.fn((id, toUpdate, callback) => {callback(false, {})});
    var db = {
      collection: jest.fn((document) => { return {update: mockedUpdate}}), 
      close: () => {}
    };

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.update('aDocument', anId, toUpdate)
           .then((result) => {
                expect(mockedUpdate.mock.calls[0][0]).toBe(anId);
                expect(mockedUpdate.mock.calls[0][1].$set).toBe(toUpdate);
           }, (err) => expect(true).toBe(false))
           .catch((err) => expect(true).toBe(false));
  });

  pit('Update must execute reject if an error occurs during update', () => {
    var rootDocument = 'aDocument';
    var mockedCollectionMethod = jest.fn((document) => { return {update: (id, toUpdate, callback) => { callback(true, {})}}});
    var db = {collection: mockedCollectionMethod, close: () => {}};

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.update(rootDocument, {_id: 'anId'}, {})
           .then(() => expect(false).toBe(true), (err) => expect(err).toBe(MongoRepository.ERROR_WHILE_UPDATING()))
           .catch((err) => expect(false).toBe(true));
  });

  pit('After update connection must be closed', () => {
    var db = {
      collection: jest.fn((document) => { return {update: (id, toUpdate, callback) => {callback(false, {})}}}), 
      close: jest.fn(() => {})
    };

    mongodb.MongoClient.connect = mockedConnect(false, db);

    var mongoRep = new MongoRepository('aValidSource');
    return mongoRep.update('aDocument', {_id: 'anId'}, {})
           .then((result) => {
                expect(db.close).toBeCalled();
           }, (err) => expect(true).toBe(false))
           .catch((err) => expect(true).toBe(false));
  });
});