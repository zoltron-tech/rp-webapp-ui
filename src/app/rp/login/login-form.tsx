import { Form } from "radix-ui";
import { FC, forwardRef, useCallback } from "react";
import * as S from "./styled";
import { useRouter } from "next/navigation";

export const LoginForm: FC = () => {
  return (
    <Form.Root>
      <Form.Field className="field" name="username">
        <Form.Label>Username</Form.Label>

        <Form.Control
          name="username"
          type="text"
          required
          placeholder="Username or email"
        />
      </Form.Field>
      <Form.Field className="field" name="password">
        <Form.Label>Password</Form.Label>
        <Form.Control
          aria-label="Password"
          name="password"
          type="password"
          required
        />
      </Form.Field>
      <Form.Submit className="submit-button" type="submit">
        Login
      </Form.Submit>
      <S.FrogotPasswordLink href="/rp/forgot-password" tabIndex={0}>
        Forgot Password?
      </S.FrogotPasswordLink>
    </Form.Root>
  );
};
