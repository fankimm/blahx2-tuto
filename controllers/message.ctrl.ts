import { NextApiRequest, NextApiResponse } from 'next';
import MessageModel from '@/models/message/message.model';
import BadReqError from './error/bad_request_error';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { uid, message, author } = req.body;
  if (!uid) {
    throw new BadReqError('uid 누락');
  }
  if (!message) {
    throw new BadReqError('메시지 누락');
  }
  await MessageModel.post({ uid, message, author });
  return res.status(201).end();
}

async function list(req: NextApiRequest, res: NextApiResponse) {
  const { uid } = req.query;
  if (!uid) {
    throw new BadReqError('uid 누락');
  }
  const uidToStr = Array.isArray(uid) ? uid[0] : uid;

  const listResp = await MessageModel.list({ uid: uidToStr });
  return res.status(200).json(listResp);
}
async function postReply(req: NextApiRequest, res: NextApiResponse) {
  const { uid, messageId, reply } = req.body;
  if (!uid) {
    throw new BadReqError('uid 누락');
  }
  if (!messageId) {
    throw new BadReqError('메시지 ID 누락');
  }
  if (!reply) {
    throw new BadReqError('reply 누락');
  }
  await MessageModel.postReply({ uid, messageId, reply });
  return res.status(201).end();
}
async function get(req: NextApiRequest, res: NextApiResponse) {
  const { uid, messageId } = req.query;
  if (!uid) {
    throw new BadReqError('uid 누락');
  }
  if (!messageId) {
    throw new BadReqError('메시지 ID 누락');
  }
  const uidToStr = Array.isArray(uid) ? uid[0] : uid;
  const messageIdToStr = Array.isArray(messageId) ? messageId[0] : messageId;
  const data = await MessageModel.get({ uid: uidToStr, messageId: messageIdToStr });
  return res.status(200).json(data);
}

const MessageCtrl = {
  post,
  list,
  get,
  postReply,
};

export default MessageCtrl;
