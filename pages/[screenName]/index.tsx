import { NextPage } from 'next';
import { Avatar, Box, Button, Flex, FormControl, FormLabel, Switch, Text, Textarea, useToast } from '@chakra-ui/react';
import reactTextareaAutosize from 'react-textarea-autosize';
import { useState } from 'react';
import ServiceLayout from '@/components/service_layout';
import { useAuth } from '@/contexts/auth_user.context';

const userInfo = {
  uid: 'test',
  email: 'balocoding@gmail.com',
  displayName: 'jihwna kim',
  photoURL: 'https://lh3.googleusercontent.com/a/AEdFTp6rQJaYWb0bW5jVbCWMk-XlBn2C-JWhMa_o5iuV=s96-c',
};

const UserHomePage: NextPage = function () {
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const toast = useToast();
  const { authUser } = useAuth();
  return (
    <ServiceLayout title="user home" minH="100vh" backgroundColor="gray.50">
      <Box maxW="md" mx="auto" pt="6">
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white">
          <Flex p="6">
            <Avatar size="lg" src={userInfo.photoURL} mr="2" />
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

export default UserHomePage;
