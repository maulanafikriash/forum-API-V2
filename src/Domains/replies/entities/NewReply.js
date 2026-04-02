import InvariantError from '../../../Commons/exceptions/InvariantError.js';

class NewReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { commentId, content, owner } = payload;

    this.commentId = commentId;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload({ commentId, content, owner }) {
    if (!commentId || !content || !owner) {
      throw new InvariantError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof commentId !== 'string'
      || typeof content !== 'string'
      || typeof owner !== 'string'
    ) {
      throw new InvariantError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default NewReply;
