import { Form } from "radix-ui";
import { FC, FormEventHandler, forwardRef, useCallback, useState } from "react";
import * as S from "./styled";
import { useRouter } from "next/navigation";
import { LoaderAction } from "@/components/common/loader-action";

export const LoginForm: FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;
      console.log("Form data:", { username, password });
      setLoading(true);

      // Simulate login action
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Login successful for:", username);
      setLoading(false);
    },
    []
  );

  return (
    <Form.Root onSubmit={handleSubmit}>
      <Form.Field className="field" name="username">
        <Form.Label>Username</Form.Label>

        <Form.Control
          name="username"
          type="text"
          required
          placeholder="Username or email"
          disabled={loading}
          autoComplete="username"
          autoFocus
        />
      </Form.Field>
      <Form.Field className="field" name="password">
        <Form.Label>Password</Form.Label>
        <Form.Control
          aria-label="Password"
          name="password"
          type="password"
          placeholder="Password"
          disabled={loading}
          autoComplete="current-password"
          autoCorrect="off"
          required
        />
      </Form.Field>
      <Form.Submit className="submit-button" type="submit" disabled={loading}>
        <LoaderAction
          text="Login"
          loadingText="Retrieving account..."
          loading={loading}
        />
      </Form.Submit>
      <S.FrogotPasswordLink href="/rp/forgot-password" tabIndex={0}>
        Forgot Password?
      </S.FrogotPasswordLink>
    </Form.Root>
  );
};
