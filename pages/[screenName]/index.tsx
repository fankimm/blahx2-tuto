import { GetServerSideProps, NextPage } from 'next';
import { Avatar, Box, Button, Flex, FormControl, FormLabel, Switch, Text, Textarea, useToast } from '@chakra-ui/react';
import reactTextareaAutosize from 'react-textarea-autosize';
import { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import ServiceLayout from '@/components/service_layout';
import { useAuth } from '@/contexts/auth_user.context';
import { InAuthUser } from '@/models/in_auth_user';

interface Props {
  userInfo: InAuthUser | null;
}
const UserHomePage: NextPage<Props> = function ({ userInfo }) {
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const toast = useToast();
  const { authUser } = useAuth();
  console.log(userInfo);
  if (!userInfo) {
    return <p>사용자를 찾을 수 없습니다.</p>;
  }
  return (
    <ServiceLayout title="user home" minH="100vh" backgroundColor="gray.50">
      <Box maxW="md" mx="auto" pt="6">
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white">
          <Flex p="6">
            <Avatar size="lg" src={userInfo.photoURL ?? 'https://bit.ly/broken-link'} mr="2" />
            <Flex direction="column" justify="center">
              <Text fontSize="md">{userInfo.displayName}</Text>
              <Text fontSize="xs">{userInfo.email}</Text>
            </Flex>
          </Flex>
        </Box>
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white" p="2">
          <Flex align="center">
            <Avatar size="xs" src={isAnonymous ? 'https://bit.ly/broken-link' : authUser?.photoURL ?? ''} mr="2" />
            <Textarea
              bg="gray.100"
              border="none"
              placeholder="무엇이 궁금한가요"
              resize="none"
              minH="unset"
              mr="2"
              maxRows={7}
              as={reactTextareaAutosize}
              value={message}
              onChange={(e) => {
                if (e.currentTarget.value) {
                  // console.log(e.currentTarget.value.match);
                  const lineCount = e.currentTarget.value.match(/[^\n]*\n[^\n]*/gi)?.length ?? 1;
                  if (lineCount > 6) {
                    toast({
                      title: '최대 7줄만 가능',
                      position: 'top-right',
                    });
                    return;
                  }
                }
                setMessage(e.currentTarget.value);
              }}
            />
            <Button disabled={!message} bgColor="#FFB86C" color="white" colorScheme="yellow" variant="solid" size="sm">
              등록
            </Button>
          </Flex>
          <FormControl display="flex" alignItems="center" mt="1" pb="2">
            <Switch
              size="sm"
              colorScheme="orange"
              id="anonymous"
              mr="1"
              isChecked={isAnonymous}
              onChange={() => {
                if (!authUser) {
                  toast({ title: '로그인이 필요합니다.', position: 'top-right' });
                  return;
                }
                setIsAnonymous((prev) => !prev);
              }}
            />
            <FormLabel htmlFor="anonymous" mb="0" fontSize="xx-small">
              Anonymous
            </FormLabel>
          </FormControl>
        </Box>
      </Box>
    </ServiceLayout>
  );
};
export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  console.log('query', query);
  const { screenName } = query;
  if (!screenName) {
    return {
      props: {
        userInfo: null,
      },
    };
  }
  try {
    const protocol = process.env.PROTOCOL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `${protocol}://${host}:${port}`;
    const userInfoRes: AxiosResponse<InAuthUser> = await axios(`${baseUrl}/api/user.info/${screenName}`);
    console.log(userInfoRes.data);
    return {
      props: {
        userInfo: userInfoRes.data ?? null,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        userInfo: null,
      },
    };
  }
};

export default UserHomePage;
