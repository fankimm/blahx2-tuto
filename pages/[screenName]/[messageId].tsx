/* eslint-disable no-return-await */
import { GetServerSideProps, NextPage } from 'next';
import { Avatar, Box, Button, Flex, Text } from '@chakra-ui/react';
import { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Link from 'next/link';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import ServiceLayout from '@/components/service_layout';
import { useAuth } from '@/contexts/auth_user.context';
import { InAuthUser } from '@/models/in_auth_user';
import MessageItem from '@/components/message_item';
import { InMessage } from '@/models/message/in_message';

interface Props {
  userInfo: InAuthUser | null;
  messageData: InMessage | null;
  screenName: string;
}

const MessagePage: NextPage<Props> = function ({ userInfo, messageData: initMsgData, screenName }) {
  const [messageData, setMessageData] = useState<null | InMessage>(initMsgData);
  const { authUser } = useAuth();
  async function fetchMessageInfo({ uid, messageId }: { uid: string; messageId: string }) {
    try {
      const res = await fetch(`/api/messages.info?uid=${uid}&messageId=${messageId}`);
      if (res.status === 200) {
        const data: InMessage = await res.json();
        setMessageData(data);
      }
    } catch (err) {
      console.error(err);
    }
  }
  if (!userInfo) {
    return <p>사용자를 찾을 수 없습니다.</p>;
  }
  if (!messageData) {
    return <p>메시지 정보가 없습니다.</p>;
  }
  return (
    <ServiceLayout title={`${screenName}의 홈`} minH="100vh" backgroundColor="gray.50">
      <Box maxW="md" mx="auto" pt="6">
        <Link href={`/${screenName}`}>
          <a>
            <Button leftIcon={<ChevronLeftIcon />} mb="2" fontSize="sm">
              {screenName} 홈으로
            </Button>
          </a>
        </Link>
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white">
          <Flex p="6">
            <Avatar size="lg" src={userInfo.photoURL ?? 'https://bit.ly/broken-link'} mr="2" />
            <Flex direction="column" justify="center">
              <Text fontSize="md">{userInfo.displayName}</Text>
              <Text fontSize="xs">{userInfo.email}</Text>
            </Flex>
          </Flex>
        </Box>
        <MessageItem
          item={messageData}
          uid={userInfo.uid}
          displayName={userInfo.displayName ?? ''}
          photoURL={userInfo.photoURL ?? 'https://bit.ly/broken-link'}
          screenName={screenName}
          isOwner={authUser && authUser.uid === userInfo.uid}
          onSendComplete={() => {
            fetchMessageInfo({ uid: userInfo.uid, messageId: messageData.id });
          }}
        />
      </Box>
    </ServiceLayout>
  );
};
export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  console.log('query', query);
  const { screenName, messageId } = query;
  if (!screenName) {
    return {
      props: {
        userInfo: null,
        messageData: null,
        screenName: '',
      },
    };
  }
  if (!messageId) {
    return {
      props: {
        userInfo: null,
        messageData: null,
        screenName: '',
      },
    };
  }
  try {
    const protocol = process.env.PROTOCOL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `${protocol}://${host}:${port}`;
    const userInfoRes: AxiosResponse<InAuthUser> = await axios(`${baseUrl}/api/user.info/${screenName}`);
    const screenNameToStr = Array.isArray(screenName) ? screenName[0] : screenName;
    if (userInfoRes.status !== 200 || userInfoRes.data === undefined || userInfoRes.data.uid === undefined) {
      return {
        props: {
          userInfo: null,
          messageData: null,
          screenName: screenNameToStr,
        },
      };
    }
    const messageInfoRes: AxiosResponse<InMessage> = await axios(
      `${baseUrl}/api/messages.info/?uid=${userInfoRes.data.uid}&messageId=${messageId} `,
    );
    return {
      props: {
        userInfo: userInfoRes.data,
        messageData: messageInfoRes.status !== 200 || messageInfoRes.data === undefined ? null : messageInfoRes.data,
        screenName: screenNameToStr,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        userInfo: null,
        messageData: null,
        screenName: '',
      },
    };
  }
};

export default MessagePage;