import { ErrorBox } from "rp-webapp";

const wrap: React.CSSProperties = { padding: 24, maxWidth: 520 };

const infoIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2zm0-8h-2V7h2z" />
  </svg>
);

export const VerifyEmailNotice = () => (
  <div style={wrap}>
    <ErrorBox>
      <h1>{infoIcon}Verify your email</h1>
      <p>
        We sent a link to <strong>elena@inkwell.press</strong>. Some features —
        posting prompts, joining stories — stay locked until you confirm it.
      </p>
      <p>
        Didn't get it? <a href="#resend">Resend the email</a>
      </p>
    </ErrorBox>
  </div>
);

export const LoginError = () => (
  <div style={wrap}>
    <ErrorBox className="error">
      <h1>{infoIcon}Sign-in failed</h1>
      <p>
        That username and password don't match. After five failed attempts your
        account is briefly locked.
      </p>
      <p>
        Forgot it? <a href="#reset">Reset your password</a>
      </p>
    </ErrorBox>
  </div>
);

export const StoryNotFound = () => (
  <div style={wrap}>
    <ErrorBox className="not_found">
      <h1>{infoIcon}Story unavailable</h1>
      <p>
        "The Lighthouse at World's End" was set to private by its author, or no
        longer exists.
      </p>
      <p>
        <a href="#explore">Browse open prompts instead</a>
      </p>
    </ErrorBox>
  </div>
);
