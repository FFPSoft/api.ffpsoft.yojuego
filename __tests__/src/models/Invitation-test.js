jest.unmock('../../../src/models/Invitation');

import Invitation from '../../../src/models/Invitation';

describe('Invitation', () => {
  it('Cannot create with a Sender undefined', () => {
    var undefinedSender;

    expect(() => new Invitation(undefinedSender)).toThrowError(Invitation.INVALID_SENDER());
  });

  it('Cannot create with a Sender null', () => {
    var nullSender = null;

    expect(() => new Invitation(nullSender)).toThrowError(Invitation.INVALID_SENDER());
  });

  it('Cannot create with a Match undefined', () => {
    var anUndefinedMatch;

    expect(() => new Invitation('sender', anUndefinedMatch)).toThrowError(Invitation.INVALID_MATCH());
  });

  it('Cannot create with a Match null', () => {
    var aNullMatch = null;

    expect(() => new Invitation('sender', aNullMatch)).toThrowError(Invitation.INVALID_MATCH());
  });

  it('Can create a valid Invitation', () => {
    // var aSender = new Player('aUsername', 'aPassword', 'aEmail');
    //  var invitation = new Invitation(aSender);

    // expect(invitation.sender).toBe(aSender);
  });
});