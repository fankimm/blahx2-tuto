import { NextApiRequest, NextApiResponse } from 'next';
import MessageModel from '@/models/message/message.model';
import BadReqError from './error/bad_request_error';
import CustomServerError from './error/custom_server_error';
import FirebaseAdmin from '@/models/firebase-admin';

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
  const { uid, page, size } = req.query;
  if (!uid) {
    throw new BadReqError('uid 누락');
  }
  const convertPage = page === undefined ? '1' : page;
  const convertSize = page === undefined ? '10' : size;
  const uidToStr = Array.isArray(uid) ? uid[0] : uid;
  const pageToStr = Array.isArray(convertPage) ? convertPage[0] : convertPage;
  const sizeToStr = Array.isArray(convertSize) ? convertSize[0] : convertSize;

  const listResp = await MessageModel.listWithPage({
    uid: uidToStr,
    page: parseInt(pageToStr, 10),
    size: parseInt(sizeToStr, 10),
  });
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
async function updateMessage(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (!token) {
    throw new CustomServerError({ statusCode: 401, message: '권한이 없습니다.' });
  }
  let tokenUid: null | string = null;
  try {
    console.log(token);
    const decode = await FirebaseAdmin.getInstance().Auth.verifyIdToken(token);
    tokenUid = decode.uid;
  } catch (err) {
    throw new BadReqError('토큰에 문제가 있습니다.');
  }
  const { uid, messageId, deny } = req.body;
  if (!uid) {
    throw new BadReqError('uid 누락');
  }
  if (uid !== tokenUid) {
    throw new CustomServerError({ statusCode: 401, message: '수정 권한이 없습니다.' });
  }
  if (!messageId) {
    throw new BadReqError('메시지 ID 누락');
  }
  if (deny === undefined) {
    throw new BadReqError('deny 누락');
  }
  const result = await MessageModel.updateMessage({ uid, messageId, deny });
  return res.status(200).json(result);
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
  updateMessage,
  list,
  get,
  postReply,
};

export default MessageCtrl;
