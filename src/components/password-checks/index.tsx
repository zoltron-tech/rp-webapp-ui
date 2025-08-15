import { FC, useEffect, useRef } from "react";
import classNames from "classnames";
import {
  verifyPasswordLength,
  verifyPasswordLowerCase,
  verifyPasswordNumber,
  verifyPasswordPattern,
  verifyPasswordsMatch,
  verifyPasswordSpecialChar,
  verifyPasswordUpperCase,
} from "@/utils/helpers/pattens";

import * as S from "./styled";

type PasswordChecksProps = {
  password: string;
  confirmPassword: string;
};

export const PasswordChecks: FC<PasswordChecksProps> = ({
  password,
  confirmPassword,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const isValid =
    verifyPasswordPattern(password) &&
    verifyPasswordsMatch(password, confirmPassword);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (rootRef.current) {
      if (isValid) {
        timerRef.current = setTimeout(() => {
          rootRef.current?.classList.add("hide");
        }, 500);
      }

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [isValid]);

  if (!password && !confirmPassword) {
    return null;
  }

  return (
    <S.PasswordChecksRoot
      ref={rootRef}
      className={classNames("error-box", {
        valid:
          verifyPasswordPattern(password) &&
          verifyPasswordsMatch(password, confirmPassword),
      })}
    >
      <span
        className={classNames("error-message", {
          valid: verifyPasswordLength(password),
        })}
      >
        Password must be at least 8 characters long.
      </span>
      <span
        className={classNames("error-message", {
          valid: verifyPasswordUpperCase(password),
        })}
      >
        Password must contain at least one uppercase letter.
      </span>
      <span
        className={classNames("error-message", {
          valid: verifyPasswordLowerCase(password),
        })}
      >
        Password must contain at least one lowercase letter.
      </span>

      <span
        className={classNames("error-message", {
          valid: verifyPasswordNumber(password),
        })}
      >
        Password must contain at least one number.
      </span>
      <span
        className={classNames("error-message", {
          valid: verifyPasswordSpecialChar(password),
        })}
      >
        Password must contain at least one special character.
      </span>
      <span
        className={classNames("error-message", {
          valid: verifyPasswordsMatch(password, confirmPassword),
        })}
      >
        Passwords must match.
      </span>
    </S.PasswordChecksRoot>
  );
};
