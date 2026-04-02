class CommentDetails {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, username, date, content, replies, likeCount } = this._formatPayload(payload);

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.likeCount = likeCount;
    this.replies = replies;
  }

  _verifyPayload({
    id,
    username,
    date,
    content,
    replies,
    likeCount,
    is_deleted: isDeleted,
  }) {
    if (
      !id
      || !username
      || !date
      || !content
      || !replies
      || likeCount === undefined
      || isDeleted === undefined
    ) {
      throw new Error('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || !(date instanceof Date)
      || typeof content !== 'string'
      || !(
        Array.isArray(replies)
        && replies.every((reply) => typeof reply === 'object' && reply !== null)
      )
      || typeof likeCount !== 'number'
      || typeof isDeleted !== 'boolean'
      // replies must be array of object(s) and not null since typeof null also returns 'object'
    ) {
      throw new Error('COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _formatPayload({
    id,
    username,
    date,
    content,
    replies,
    likeCount,
    is_deleted: isDeleted,
  }) {
    return {
      id,
      username,
      date,
      content: isDeleted ? '**komentar telah dihapus**' : content,
      replies,
      likeCount,
    };
  }
}

export default CommentDetails;
