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
          <S.ValidFrom>
            Effective from 01 Sep 2025 · Updated 03 Nov 2026&nbsp;
          </S.ValidFrom>
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
          <li>Use the Novelist World mobile app on iOS or Android</li>
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
                <strong>In short:</strong> We collect what you give us to run
                your account and what you create, plus a small amount of device
                and connection information needed to keep you signed in, send
                notifications and prevent abuse. We do not profile you, show
                ads, use analytics or tracking tools, or sell your information.
              </p>
              <br />
              <p>
                <strong>What you give us:</strong>
                <ul>
                  <li>
                    Account details: email address, username, first and last
                    name, and your password (stored only as a one-way hash).
                  </li>
                  <li>
                    What you create: your profile, characters, posts, comments,
                    stories, chapters, notes, bookshelf, and the images, videos
                    and music you upload.
                  </li>
                  <li>
                    Private messages you send (see{" "}
                    <strong>How we protect private messages?</strong>).
                  </li>
                  <li>
                    Messages you send to our support team, and reports you file.
                  </li>
                  <li>
                    Accounts you choose to connect, such as Discord or Spotify
                    (see <strong>Which third-party services do we use?</strong>
                    ).
                  </li>
                </ul>
              </p>
              <br />
              <p>
                <strong>What we collect automatically:</strong>
                <ul>
                  <li>
                    Sign-in sessions: a device label worked out from your
                    browser or app (for example &ldquo;Chrome on Windows&rdquo;),
                    the user-agent string, when the session was last used, and a
                    keyed hash of your IP address. You can see and sign out these
                    devices in your account settings.
                  </li>
                  <li>
                    A keyed hash of the network address you signed up from, kept
                    with your account to limit automated sign-ups. We do not
                    store the address itself.
                  </li>
                  <li>
                    If you allow notifications: a push token for each device
                    (see <strong>How we handle notifications and devices?</strong>
                    ).
                  </li>
                </ul>
              </p>
              <br />
              <p>
                <strong>Sensitive Information:</strong> We do not ask for
                sensitive information. Don&rsquo;t put it in your profile or
                public posts.
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
                our services. The main ones hold your sign-in session, which
                links your browser to your account while you are signed in.
                They are never used for tracking or advertising and are not
                shared with anyone. They exist solely to ensure that the
                platform functions as intended, for example keeping you signed
                in or safeguarding against unauthorized access.
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
                We keep the information you give us — your account details and
                what you write, upload and send — only to run the Services. It
                travels to and from our servers over encrypted connections
                (HTTPS), and private messages are also stored encrypted (see{" "}
                <strong>Private messages</strong> below). Our platform is
                designed to operate in compliance with the{" "}
                <strong>General Data Protection Regulation (GDPR)</strong> and
                other applicable global privacy laws.
              </p>
              <br />
              <p>
                We use your information only to run the Services: to keep your
                account working, show what you create to the people you share
                it with, deliver messages and notifications, keep the community
                safe, and answer you when you contact us. In the event that you
                provide any identifiable
                information voluntarily — for example, through public content or
                communications — you retain the right to request its removal at
                any time. Such requests can be made by contacting our support
                team, and we will ensure prompt action in accordance with
                applicable legal requirements.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="private-messages">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>How we protect private messages?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                <strong>In short:</strong> Private messages are encrypted in
                transit and at rest and deleted after 14 days. They are not
                end-to-end encrypted: we hold the keys, and our support team
                can read a message that is reported to us.
              </p>
              <br />
              <p>
                Messages travel over encrypted connections. Before a message is
                stored, its text is encrypted with AES-256 using a key specific
                to that conversation, so the message database does not hold
                readable text. The key is derived from a secret our servers
                keep. Because we hold that secret, this is encryption at rest,
                not end-to-end encryption.
              </p>
              <br />
              <p>
                We do not look at private messages unless one is reported to
                us. When you or another member of the conversation reports a
                message, a readable copy
                of that message is stored with the report so our support team
                can review it and take action. We may contact you about a
                report by private message from our verified{" "}
                <strong>@novelistworld</strong> account.
              </p>
              <br />
              <p>
                Messages, and their reactions, read receipts and attached
                images and videos, are deleted automatically 14 days after
                they are sent. A reported message
                is kept with its report for as long as we need it to handle
                the report. Images you send in private messages are not
                screened.
              </p>
              <br />
              <p>
                Our mobile app keeps a copy of your recent conversations on
                your device so they open quickly and work offline. That copy is
                kept in an encrypted database and is removed when you sign
                out.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="notifications-devices">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>How we handle notifications and devices?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                <strong>In short:</strong> If you allow notifications, we store
                a push token for that device so we can reach it. Tokens are
                removed when you sign out of that device or after 90 days
                without use.
              </p>
              <br />
              <p>
                Notifications are optional. When you allow them, your device
                gives us a push token: an Expo push token in the mobile app, or
                a browser push subscription on the web. We store it with your
                account, the platform it belongs to, and when it was last used
                and last delivered to. Notifications are delivered through
                Expo, Apple Push Notification service (iPhone and iPad), Google
                Firebase Cloud Messaging (Android) or your browser&rsquo;s push
                service. Those providers receive the token and the notification
                text, for example a name and &ldquo;liked your post&rdquo;. A
                notification about a private message never contains the
                message text.
              </p>
              <br />
              <p>
                You choose which notifications you get in your notification
                settings, and you can turn them off at any time in your
                device or browser settings. Notifications are about activity
                on your account only; we do not send marketing notifications.
              </p>
              <br />
              <p>
                Your account settings list the devices signed in to your
                account (see <strong>What information we collect?</strong>),
                and you can sign any of them out from there.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="service-providers">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>Which third-party services do we use?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                <strong>In short:</strong> We use a small number of providers to
                host the Services and to power a few features. Each receives
                only what that feature needs. We do not sell your information
                or share it for advertising.
              </p>
              <br />
              <p>
                <strong>Running the Services:</strong>
                <ul>
                  <li>
                    <strong>Amazon Web Services</strong> hosts our servers,
                    database and the files you upload, in the EU (Frankfurt).
                  </li>
                  <li>
                    <strong>Heroku</strong> (Salesforce) runs our real-time chat
                    server, which relays private messages and online status.
                  </li>
                  <li>
                    <strong>Microsoft 365</strong> sends account emails such as
                    verification and password-reset messages.
                  </li>
                  <li>
                    <strong>
                      Expo, Apple and Google (Firebase Cloud Messaging)
                    </strong>{" "}
                    deliver push notifications (see{" "}
                    <strong>How we handle notifications and devices?</strong>).
                  </li>
                  <li>
                    <strong>wsrv.nl</strong>, an image-resizing service, fetches
                    images already published on Novelist World and returns
                    smaller copies, which your device loads from it.
                  </li>
                </ul>
              </p>
              <br />
              <p>
                <strong>Features you choose to use:</strong>
                <ul>
                  <li>
                    <strong>Google and Discord sign-in</strong>: see{" "}
                    <strong>How we process social links?</strong>
                  </li>
                  <li>
                    <strong>Discord connection</strong>: if you connect Discord,
                    we store your Discord user ID, username and display name,
                    avatar and banner, email, locale and account flags, and use
                    them to show your Discord on your profile and to check
                    membership of our Discord server for badges. If you share a
                    post, character, story or profile to our Discord server,
                    our bot posts it there.
                  </li>
                  <li>
                    <strong>Spotify</strong>: if you connect Spotify, we store
                    your Spotify user ID, display name, email, country, plan
                    type, avatar and profile link, and the access tokens Spotify
                    issues. When you search for a song, the search words are
                    sent to Spotify from our servers. Playing a Spotify song
                    loads Spotify&rsquo;s own player, which connects your device
                    directly to Spotify under Spotify&rsquo;s privacy policy.
                  </li>
                  <li>
                    <strong>Open Library</strong> (Internet Archive): when you
                    search for books for your bookshelf, the search words are
                    sent to Open Library from our servers. Book covers load
                    directly from Open Library to your device.
                  </li>
                  <li>
                    <strong>Klipy</strong>: when you search for GIFs, stickers
                    or clips, the search words are sent to Klipy from our
                    servers, and the results load directly from Klipy to your
                    device.
                  </li>
                </ul>
              </p>
              <br />
              <p>
                When your device loads something directly from a provider (Open
                Library covers, Klipy media, Spotify&rsquo;s player, resized
                images), that provider can see your IP address, as with any
                website. Some providers may process data outside your country,
                including in the United States.
              </p>
              <br />
              <p>
                We do not use analytics, advertising, attribution or
                crash-reporting tools, and we do not track you across other
                apps or websites.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="retention">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>How long do we keep your information?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                <strong>In short:</strong> As long as your account exists, and
                shorter for messages, notifications and devices.
              </p>
              <br />
              <p>
                <ul>
                  <li>
                    <strong>Account and what you create</strong> (profile,
                    characters, posts, stories, uploads): until you delete them
                    or your account.
                  </li>
                  <li>
                    <strong>Private messages</strong>: deleted 14 days after
                    they are sent, with their reactions, read receipts and the
                    images and videos attached to them.
                  </li>
                  <li>
                    <strong>Reports</strong>: kept for as long as we need them
                    to handle the report and protect the community, including
                    the copy of a reported message or song.
                  </li>
                  <li>
                    <strong>Notifications</strong>: deleted 90 days after you
                    have read them, and in any case after 180 days.
                  </li>
                  <li>
                    <strong>Push tokens</strong>: removed when you sign out of
                    that device, or after 90 days without use.
                  </li>
                  <li>
                    <strong>Sign-in sessions</strong>: a session lasts up to 60
                    days; its record is deleted 30 days after it ends.
                  </li>
                  <li>
                    <strong>Sign-up network hash</strong>: kept with your
                    account, to limit automated sign-ups.
                  </li>
                  <li>
                    <strong>Connected accounts</strong> (Discord, Spotify):
                    until you disconnect them or delete your account.
                  </li>
                </ul>
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
                </strong>
                , the{" "}
                <strong>EU General Data Protection Regulation (GDPR)</strong>,
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
                unsubscribe from marketing and promotional emails at any time
                with the unsubscribe link in the email, or by contacting us. We
                may still send you service-related messages necessary for
                account administration, such as verification and
                password-reset emails.
              </p>
              <br />
              <p>
                <strong>Account Information:</strong> You may review or update
                your account information at any time in your account settings.
                To delete your account, see{" "}
                <strong>How can you review, update or delete your data?</strong>

              </p>
              <br />
              <p>
                <strong>Cookies and Similar Technologies:</strong> Most web
                browsers accept cookies by default, but you may configure your
                browser to remove or reject cookies. Our cookies only keep you
                signed in, so rejecting them signs you out of the website.
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
              <span>How can you review, update or delete your data?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                <strong>Review and update:</strong> you can change your profile,
                account details and notification settings, sign out devices,
                and disconnect Discord or Spotify at any time from your profile
                and account settings, on the website or in the app. You can
                delete anything you have posted or uploaded.
              </p>
              <br />
              <p>
                <strong>Delete your account:</strong> email{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> from the
                address on your account and ask us to delete it. We will confirm
                the request and delete your account and the content linked to it
                within one month. We keep only what we must: reports filed about
                your account while they are being handled, and records we are
                required to keep by law.
              </p>
              <br />
              <p>
                <strong>Copy of your data:</strong> email us from the address on
                your account and we will send you a copy of the personal
                information we hold about you within one month.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>
      </S.AccordionRoot>
      <S.Footer>
        All rights reserved.&nbsp;<strong>©</strong>&nbsp;{new Date().getFullYear()}&nbsp;
        <a href="http://zoltron.tech">Zoltron Tech.</a>
      </S.Footer>
    </S.PrivacyRoot>
  );
};
