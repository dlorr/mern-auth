import {
  Alert,
  AlertIcon,
  Box,
  Heading,
  Link as ChakraLink,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../lib/api";

const ResetPasswordForm = ({ code }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const {
    mutate: resetUserPassword,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: resetPassword,
  });

  return (
    <>
      <Heading fontSize="4xl" mb={8}>
        Change your password
      </Heading>
      <Box rounded="lg" bg="gray.700" boxShadow="lg" p="8">
        {isError && (
          <Box mb="3" color="red.400">
            {error.message || "An error occurred"}
          </Box>
        )}
        {isSuccess ? (
          <Box>
            <Alert status="success" borderRadius={12} mb={3}>
              <AlertIcon />
              Password updated successfully!
            </Alert>
            <ChakraLink as={Link} to="/login" replace>
              Sign in
            </ChakraLink>
          </Box>
        ) : (
          <Stack spacing="4">
            <FormControl id="password">
              <FormLabel>New Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </FormControl>
            <FormControl id="confirmPassword">
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !(password.length < 6 || password !== confirmPassword) &&
                  resetUserPassword({
                    password,
                    confirmPassword,
                    verificationCode: code,
                  })
                }
              />
            </FormControl>
            <Button
              my={2}
              isLoading={isPending}
              isDisabled={password.length < 6 || password !== confirmPassword}
              onClick={() =>
                resetUserPassword({
                  password,
                  confirmPassword,
                  verificationCode: code,
                })
              }
            >
              Reset Password
            </Button>
          </Stack>
        )}
      </Box>
    </>
  );
};
export default ResetPasswordForm;
