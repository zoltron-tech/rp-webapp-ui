"use client";

import { useEffect } from "react";
import { FaQuestion } from "react-icons/fa6";
import CharSelectScreen from "@/assets/images/FAQs/char-select.png";
import UserMenuCharsImage from "@/assets/images/FAQs/user-menu-chars.png";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import { usePageRouter } from "@/hooks/use-page-router";
import * as S from "./../privacy-policy/styled";

export const FAQs = () => {
  const { stopPageLoading } = usePageRouter();

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  return (
    <S.PrivacyRoot>
      <S.PrivacyHeader>
        <FaQuestion className="icon" />
        <S.Header>
          <h1>Frequently Asked Questions</h1>
        </S.Header>
      </S.PrivacyHeader>

      <p className="intro">
        Welcome to our Frequently Asked Questions (<strong>`FAQ`</strong>)
        section.
        <br />
        <br />
        Here you’ll find answers to common questions about{" "}
        <a href="https://novelist.world">https://novelist.world</a> (the{" "}
        <strong>`Site`</strong>) and our related services (the{" "}
        <strong>`Services`</strong>).
        <br />
        <br />
        If you need further assistance, please contact us at{" "}
        <a href="mailto:support@zoltrontech.com">support@zoltrontech.com</a> or
        reach out through our official social channels.
      </p>

      <S.AccordionRoot type="single" collapsible defaultValue="user-accounts">
        <S.AccordionItem value="user-accounts">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>How to add or edit characters?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <ol>
                <li>
                  Go to user menu by clicking on the avatar in top right corner.
                  <AppImageViewer
                    src={UserMenuCharsImage.src}
                    alt="User menu with Your Characters option"
                  >
                    <S.FAQImage
                      src={UserMenuCharsImage.src}
                      alt="User menu with Your Characters option"
                    />
                  </AppImageViewer>
                </li>
                <li>
                  In the user menu, click on <strong>'Your Characters'</strong>{" "}
                  option.
                </li>
                <li>You should see the list of all your characters there.</li>
                <AppImageViewer
                  src={CharSelectScreen.src}
                  alt="Character selection screen with list of characters and add new character card"
                >
                  <S.FAQImage
                    src={CharSelectScreen.src}
                    alt="Character selection screen with list of characters and add new character card"
                  />
                </AppImageViewer>
                <li>
                  To Add a new character, click on the first blank card that
                  says <strong>'Add New'</strong>.
                </li>
                <li>
                  To Edit an existing character, Hover onto the card of your
                  desired character and click on the pencil icon on top right
                  corner of the card.
                </li>
                <li>
                  Similarly, click on trashcan icon on top right of the
                  character card to delete the character.
                </li>
              </ol>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="edit-profile">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>How to edit my profile information?</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <ol>
                <li>
                  Go to user menu by clicking on the avatar in top right corner.
                </li>
                <li>
                  Click on <strong>'Edit Profile'</strong> option.
                </li>
                <li>
                  You can change first name and last name in the input fields.
                </li>
                <li>
                  To change avatar, click on the avatar and upload the desired
                  image that you want to set as your avatar.
                </li>
                <li>
                  <strong>Note:</strong> This is what appears next to your
                  avatar on your profile.
                </li>
                <li>
                  You can also share something about yourself in the bio
                  section.
                </li>
                <li>
                  You can select the theme. <br />
                  <em>
                    (This will be for your eyes only. The whole website will be
                    personalised according to your own selection only for you.)
                  </em>
                </li>
                <li>
                  Click <strong>'Save'</strong> to apply your changes.
                </li>
              </ol>
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
