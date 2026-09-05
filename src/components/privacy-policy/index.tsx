"use client";

import { MdOutlinePrivacyTip } from "react-icons/md";
import { SUPPORT_EMAIL } from "@/utils/constants";
import * as S from "./styled";

export const PrivacyPolicy = () => {
  return (
    <S.PrivacyRoot>
      <S.PrivacyHeader>
        <MdOutlinePrivacyTip className="icon" />
        <S.Header>
          <h1>Privacy Policy</h1>
          <S.ValidFrom>Effective from 01 Sep 2025&nbsp;</S.ValidFrom>
        </S.Header>
      </S.PrivacyHeader>

      <p className="intro">
        This privacy notice is for Zoltron Tech and describes how and why we may
        collect, store, use, and/or share (`<strong>process</strong>`) your
        information when you use our services (`<strong>Services</strong>`),
        such as when you:
        <ul>
          <li>
            Visit our website at{" "}
            <a href="https://novelist.world">https://novelist.world</a>, or any
            other website of ours that links to this privacy notice
          </li>
          <li>
            Engage with us in other related ways, including any sales,
            marketing, or events
          </li>
        </ul>
        <br />
        Questions or concerns? Reading this privacy notice will help you
        understand your privacy rights and choices. If you do not agree with our
        policies and practices, please do not use our Services.
        <br />
        <br />
        If you have any questions or concerns, you can contact us at &nbsp;
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <S.AccordionRoot type="single" collapsible defaultValue="info-collection">
        <S.AccordionItem value="info-collection">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>What information we collect?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                <strong>In short:</strong> We collect only personal information
                that you voluntarily provide to us.
              </p>
              <br />
              <p>
                We do not collect, store, or process personal information beyond
                what is voluntarily provided by users. Our platform is designed
                to function with minimal user data, and any details requested
                during account setup are strictly limited to non-personal
                information necessary for basic functionality and an optimal
                user experience.
              </p>
              <br />
              <p>
                In compliance with GDPR, CCPA, and other applicable privacy
                regulations, we do not engage in data profiling, targeted
                advertising, or the sale of user information. As no personal
                data is collected automatically, there is no risk of
                unauthorized disclosure or misuse. Should a user wish to remove
                any content or information they have voluntarily provided, they
                may contact us directly, and we will promptly comply in
                accordance with relevant legal requirements.
              </p>
              <br />
              <p>
                We collect personal information when you register on the
                Services, express interest in our products or services,
                participate in activities on the Services, or otherwise contact
                us. The personal information we may collect includes, but is not
                limited to:
                <ul>
                  <li>Email addresses</li>
                  <li>Usernames</li>
                  <li>Names</li>
                </ul>
              </p>
              <br />
              <p>
                <strong>Sensitive Information:</strong> We do not process
                sensitive information.
              </p>
              <br />
              <p>
                <strong>Social Media Login Data:</strong> You may have the
                option to register using your existing social media accounts,
                such as Google or Discord. If you choose this method, we will
                collect the information described in our{" "}
                <strong>`Social Logins`</strong> section.
              </p>
              <br />
              <p>
                All personal information you provide must be true, complete, and
                accurate. You must notify us of any changes to your personal
                information to ensure it remains current.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="cookies">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>How we your cookies?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                We do not use cookies for tracking, analytics, advertising, or
                profiling user activity. Our platform is committed to respecting
                your privacy and operates without any form of behavioral
                monitoring.
              </p>
              <br />
              <p>
                Any cookies that are used are strictly limited to essential
                purposes, such as enabling core platform features, maintaining
                session integrity, and ensuring the security and stability of
                our services. These essential cookies are not used to identify
                individual users and do not store any personal information. They
                exist solely to ensure that the platform functions as intended,
                for example, remembering temporary settings during your active
                session or safeguarding against unauthorized access.
              </p>
              <br />
              <p>
                In line with <strong>GDPR</strong> and other relevant privacy
                regulations, users are informed about the presence of such
                cookies and may manage or disable them through their browser
                settings, though doing so may impact certain functional aspects
                of the service.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="data-security">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>How we process your data?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                As we do not collect or store personal data, there are no direct
                risks to the security of your personal information. Our platform
                is designed to operate in compliance with the{" "}
                <strong>General Data Protection Regulation (GDPR)</strong> and
                other applicable global privacy laws.
              </p>
              <br />
              <p>
                This means that, even though we do not process personal
                information, we maintain transparency, uphold user privacy
                rights, and ensure that any limited operational data is handled
                responsibly. In the event that you provide any identifiable
                information voluntarily — for example, through public content or
                communications — you retain the right to request its removal at
                any time. Such requests can be made by contacting our support
                team, and we will ensure prompt action in accordance with
                applicable legal requirements.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="third-party">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>How we handle third-party links?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                Our platform may include links to third-party websites or
                services for informational or convenience purposes. Please note
                that we have no control over, and are not responsible for, the
                content, security, or privacy practices of these external sites.
                Accessing such links is at your own discretion, and we encourage
                you to review the privacy policies and terms of any third-party
                services you visit. Inclusion of these links does not constitute
                endorsement or affiliation with the respective site owners.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="social-logins">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>How we process social links?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                <strong>In Short:</strong> If you choose to register or log in
                to our Services using a social media account, we may have access
                to certain information about you.
              </p>
              <br />
              <p>
                Our Services offer you the ability to register and log in using
                your third-party social media account details, such as Google or
                Discord. If you choose this option, we may receive certain
                profile information from your social media provider. The
                information we receive may vary depending on the provider but
                often includes:
                <ul>
                  <li>Your name</li>
                  <li>Email address</li>
                  <li>Profile picture</li>
                  <li>
                    Other information you choose to make public on the social
                    media platform
                  </li>
                </ul>
              </p>
              <br />
              <p>
                We will use the information we receive only for the purposes
                described in this Privacy Policy or otherwise communicated to
                you through the Services. Please note that we do not control,
                and are not responsible for, how your third-party social media
                provider uses your personal information. We recommend reviewing
                their privacy notice to understand how they collect, use, and
                share your data, and how to manage your privacy settings on
                their platform.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="children">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>How we handle children’s privacy?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                Our platform is not directed toward, nor intended for use by,
                children under the age of 16, or the minimum age of digital
                consent in their country of residence where applicable. We do
                not knowingly collect, store, or process any personal
                information from children.{" "}
              </p>{" "}
              <br />{" "}
              <p>
                If we become aware that personal data from a child has been
                inadvertently collected, we will take immediate steps to delete
                such information in compliance with applicable laws, including
                the{" "}
                <strong>
                  U.S. Children’s Online Privacy Protection Act (COPPA)
                </strong>{" "}
                the ,{" "}
                <strong>EU General Data Protection Regulation (GDPR) </strong>,
                and other relevant regulations. Parents or legal guardians who
                believe their child’s information has been provided to us may
                contact us to request its removal.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="privacy-rights">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>What are your privacy rights?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                <strong>In Short:</strong> Depending on your region, such as the
                European Economic Area (EEA), United Kingdom (UK), or Canada,
                you may have rights to access, correct, or control your personal
                information. You may review, change, or terminate your account
                at any time.
              </p>
              <br />
              <p>
                In certain regions, you have rights under applicable data
                protection laws. These may include the right to:
                <ul>
                  <li>
                    Request access to and obtain a copy of your personal
                    information.
                  </li>
                  <li>
                    Request correction or erasure of your personal information.
                  </li>
                  <li>Restrict the processing of your personal information.</li>
                  <li>
                    Receive your data in a portable format (data portability).
                  </li>
                  <li>
                    Object to the processing of your personal information, where
                    applicable.
                  </li>
                </ul>
                You can make such requests by contacting us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              </p>
              <br />
              <p>
                If you are located in the EEA or UK and believe we are
                unlawfully processing your personal information, you also have
                the right to lodge a complaint with your local data protection
                authority. In Switzerland, you may contact the Federal Data
                Protection and Information Commissioner.
              </p>
              <br />
              <p>
                <strong>Withdrawing your consent:</strong> If we are processing
                your personal information based on your consent, you have the
                right to withdraw it at any time. Withdrawing consent does not
                affect the lawfulness of processing conducted before withdrawal
                or processing based on other legal grounds.
              </p>
              <br />
              <p>
                <strong>Opting out of marketing communications:</strong> You can
                unsubscribe from marketing and promotional messages at any time
                by clicking `unsubscrib` in emails, replying `STOP` or
                `UNSUBSCRIBE` to SMS messages, or contacting us directly. We may
                still send you service-related messages necessary for account
                administration or other non-marketing purposes.
              </p>
              <br />
              <p>
                <strong>Account Information:</strong> You may review or update
                your account information at any time by logging in to your
                account settings or contacting us. If you request account
                termination, we will deactivate or delete your account and
                information from our active databases, while retaining certain
                information as necessary to prevent fraud, resolve disputes,
                enforce legal terms, or comply with legal requirements.
              </p>
              <br />
              <p>
                <strong>Cookies and Similar Technologies:</strong> Most web
                browsers accept cookies by default, but you may configure your
                browser to remove or reject cookies. Doing so may affect certain
                features of our Services. You can also opt out of interest-based
                advertising by advertisers on our Services.
              </p>
              <br />
              <p>
                If you have questions or comments about your privacy rights,
                please contact us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="changes">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>How we handle changes to Privacy Policy?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                We may update this Privacy Policy from time to time to reflect
                changes in our practices, legal requirements, or the features of
                our platform. Any updates will be posted on this page with a
                revised “<strong>Effective From</strong>” date. We encourage you
                to review this policy periodically to stay informed about how we
                protect your information. Your continued use of the platform
                after any changes have been posted will signify your acceptance
                of the updated policy.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="data-revoke">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>How can you reivew, update or revoke data from us?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                Based on the applicable laws of your country, you may have the
                right to request access to the personal information we collect
                from you, change that information, or delete it.{" "}
              </p>{" "}
              <br />{" "}
              <p>
                To request to review, update, or delete your personal
                information, please visit:&nbsp;
                <a href="https://novelist.world/@[your username]">
                  https://novelist.world/@[your username]
                </a>{" "}
                &rarr; Edit profile.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>
      </S.AccordionRoot>
      <S.Footer>
        All rights reserved.&nbsp;<strong>©</strong>&nbsp;2025&nbsp;
        <a href="http://zoltron.tech">Zoltron Tech.</a>
      </S.Footer>
    </S.PrivacyRoot>
  );
};
