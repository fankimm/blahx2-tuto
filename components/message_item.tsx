import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import resizeTextArea from 'react-textarea-autosize';
import { useState } from 'react';
import { InMessage } from '@/models/message/in_message';
import convertDateToString from './utils/conver_date_to_string';
import MoreBtnIcon from './more_btn_icon';
import FirebaseClient from '@/models/firebase-client';

interface Props {
  uid: string;
  displayName: string;
  screenName: string;
  isOwner: boolean;
  item: InMessage;
  photoURL: string;
  onSendComplete: () => void;
}

const MessageItem = function ({ uid, screenName, isOwner, photoURL, item, displayName, onSendComplete }: Props) {
  const toast = useToast();
  const haveReply = item.reply !== undefined;
  const isDeny = item.deny !== undefined ? item.deny === true : false;
  const [reply, setReply] = useState('');
  async function updateMessage({ deny }: { deny: boolean }) {
    const token = await FirebaseClient.getInstance().Auth.currentUser?.getIdToken();
    if (!token) {
      toast({
        title: '로그인한 사용자만 사용할 수 있는 메뉴입니다.',
      });
      return;
    }
    const res = await fetch('/api/messages.deny', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
      },
      body: JSON.stringify({
        uid,
        messageId: item.id,
        deny,
      }),
    });
    if (res.status < 300) {
      onSendComplete();
    }
  }
  async function postReply() {
    const res = await fetch('api/messages.add.reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid,
        messageId: item.id,
        reply,
      }),
    });
    if (res.status < 300) {
      onSendComplete();
    }
  }
  return (
    <Box borderRadius="md" width="full" bg="white" boxShadow="md">
      <Box>
        <Flex px="2" pt="2" alignItems="center">
          <Avatar
            size="xs"
            src={item.author ? item.author.photoURL ?? 'https://bit.ly/broken-link' : '"https://bit.ly/broken-link"'}
          />
          <Text fontSize="xx-small" ml="1">
            {item.author ? item.author.displayName : 'anonymous'}
          </Text>
          <Text whiteSpace="pre-line" fontSize="xx-small" color="gray.500" ml="1">
            {convertDateToString(item.createAt)}
          </Text>
          <Spacer />
          {isOwner && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<MoreBtnIcon />}
                width="24px"
                height="24px"
                borderRadius="full"
                variant="link"
                size="xs"
              />
              <MenuList>
                <MenuItem
                  onClick={() => {
                    window.location.href = `/${screenName}/${item.id}`;
                  }}
                >
                  메시지 상세 보기
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    updateMessage({ deny: item.deny !== undefined ? !item.deny : true });
                  }}
                >
                  {isDeny ? '비공개 처리 해제' : '비공개 처리'}
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Box>
      <Box p="2">
        <Box borderRadius="md" borderWidth="1px" p="2">
          <Text whiteSpace="pre-line" fontSize="sm">
            {item.message}
          </Text>
        </Box>
        {haveReply && (
          <Box pt="2">
            <Divider />
            <Box display="flex" mt="2">
              <Box pt="2">
                <Avatar mr="2" size="xs" src={photoURL} />
              </Box>
              <Box borderRadius="md" p="2" width="full" bg="gray.100">
                <Flex alignItems="center">
                  <Text fontSize="xs">{displayName}</Text>
                  <Text whiteSpace="pre-line" fontSize="xs" color="gray">
                    {convertDateToString(item.replyAt!)}
                  </Text>
                </Flex>
                <Text whiteSpace="pre-line" fontSize="xs">
                  {item.reply}
                </Text>
              </Box>
            </Box>
          </Box>
        )}
        {!haveReply && isOwner && (
          <Box pt="2">
            <Divider />
            <Box display="flex" mt="2">
              <Box pt="1">
                <Avatar mr="2" size="xs" src={photoURL} />
              </Box>
              <Box borderRadius="md" width="full" bg="gray.100" mr="2">
                <Textarea
                  border="none"
                  boxShadow="none !important"
                  resize="none"
                  as={resizeTextArea}
                  minH="unset"
                  overflow="hidden"
                  fontSize="xs"
                  placeholder="댓글을 입력하세요"
                  value={reply}
                  onChange={(e) => {
                    setReply(e.currentTarget.value);
                  }}
                />
              </Box>
              <Button
                disabled={reply.length === 0}
                colorScheme="pink"
                bgColor="#FF75B5"
                variant="solid"
                size="sm"
                onClick={() => postReply()}
              >
                등록
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MessageItem;
