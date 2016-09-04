jest.mock('elasticsearch');

import ESRepository from '../../../src/repositories/ESRepository';

describe('ESRepository', () => {
  var es = require('elasticsearch');
  
  it('Cannot create with an undefined ESClient', () => {
    let undefinedESClient;

    expect(() => new ESRepository(undefinedESClient)).toThrowError(ESRepository.INVALID_CLIENT);
  });

  it('Cannot create with a null ESClient', () => {
    let nullESClient = null;

    expect(() => new ESRepository(nullESClient)).toThrowError(ESRepository.INVALID_CLIENT);
  });

  it('Can create a valid ESRepository', () => {
    let es = require('elasticsearch');
    es.Client = jest.fn();
    let client = new es.Client();
    
    let repo = new ESRepository(client);

    expect(repo.esclient).toEqual(client);
  });

  pit('Can get a document by id ', () => {
    //let es = require('elasticsearch'); lo pongo a nivel de clase
    var client = new es.Client();
    client.search = jes.fn((criteria, callback) => { console.log('cuando llame al seacrh, vas a ver esto'); callback(false, 'algo que retorne'); }); // Simulo el comportamiento que deseo
    
    let repo = new ESRepository(client);

    expect(repo.esclient.search.mock.calls.length).toEqual(2);
    expect(repo.esclient.search.mock.calls[1][0].host).toEqual('http://localhost:9200/');
  });
});
