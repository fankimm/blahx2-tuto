import FirebaseAdmin from '../firebase-admin';
import { InAuthUser } from '../in_auth_user';

const MEMBER_COL = 'members';
const SCR_NAME_COL = 'screen_names';
type AddResult = { result: true; id: string } | { result: false; message: string };
async function add({ uid, displayName, photoURL, email }: InAuthUser): Promise<AddResult> {
  try {
    const screenName = (email ?? '').toString().replace('@gmail.com', '');
    const addResult = await FirebaseAdmin.getInstance().Firebase.runTransaction(async (transaction) => {
      const memberRef = FirebaseAdmin.getInstance().Firebase.collection(MEMBER_COL).doc(uid);
      const screenNameRef = FirebaseAdmin.getInstance().Firebase.collection(SCR_NAME_COL).doc(screenName);
      const memberDoc = await transaction.get(memberRef);
      if (memberDoc.exists) {
        // 이미 추가된 상태
        return false;
      }
      const addData = {
        uid,
        email,
        displayName: displayName ?? '',
        photoURL: photoURL ?? '',
      };
      await transaction.set(memberRef, addData);
      await transaction.set(screenNameRef, addData);
      return true;
    });
    if (!addResult) {
      return { result: true, id: uid };
    }
    return { result: true, id: uid };
  } catch (err) {
    console.error(err);
    return { result: false, message: '서버에러' };
  }
}

const MemberModel = {
  add,
};

export default MemberModel;
