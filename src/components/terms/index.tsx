"use client";

import { useEffect } from "react";
import { GoLaw } from "react-icons/go";
import { usePageRouter } from "@/hooks/use-page-router";
import * as S from "./../privacy-policy/styled";

export const Terms = () => {
  const { stopPageLoading } = usePageRouter();

  useEffect(() => {
    stopPageLoading();
  });

  return (
    <S.PrivacyRoot>
      <S.PrivacyHeader>
        <GoLaw className="icon" />
        <S.Header>
          <h1>Terms and Conditions</h1>
          <S.ValidFrom>Effective from 01 Sep 2025&nbsp;</S.ValidFrom>
        </S.Header>
      </S.PrivacyHeader>

      <p className="intro">
        We are Zoltron Tech s.r.o, a company registered in Lahore Pakistan.{" "}
        <br /> <br />
        We operate the website{" "}
        <a href="https://novelist.world">https://novelist.world</a> (the
        <strong>`Site`</strong>), as well as any other related products and
        services that refer or link to these legal terms (the{" "}
        <strong>`Legal Terms`</strong>
        (collectively, the <strong>`Services`</strong>)). <br />
        <br />
        You can contact us by email at{" "}
        <a href="mailto:support@zoltrontech.com">support@zoltrontech.com</a> or
        by contacting one of our social accounts (Discord, Facebook,
        Intstagram). <br /> <br />
        These Legal Terms constitute a legally binding agreement made between
        you, whether personally or on behalf of an entity (
        <strong>`you`</strong>), and Zoltron Tech s.r.o, concerning your access
        to and use of the Services. You agree that by accessing the Services,
        you have read, understood, and agreed to be bound by all of these Legal
        Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE
        EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE
        USE IMMEDIATELY. <br />
        <br />
        Supplemental terms and conditions or documents that may be posted on the
        Services from time to time are hereby expressly incorporated herein by
        reference. We reserve the right, in our sole discretion, to make changes
        or modifications to these Legal Terms from time to time. We will alert
        you about any changes by updating the <strong>`Last updated`</strong>{" "}
        date of these Legal Terms, and you waive any right to receive specific
        notice of each such change. We will provide the history of every version
        availabe at the terms and conditions page.It is your responsibility to
        periodically review these Legal Terms to stay informed of updates. You
        will be subject to, and will be deemed to have been made aware of and to
        have accepted, the changes in any revised Legal Terms by your continued
        use of the Services after the date such revised Legal Terms are posted.{" "}
        <br />
        <br />
        The Services are intended for users who are at least 16 years of age.
        All users who are minors in the jurisdiction in which they reside
        (generally under the age of 18) must have the permission of, and be
        directly supervised by, their parent or guardian to use the Services. If
        you are a minor, you must have your parent or guardian read and agree to
        these Legal Terms prior to you using the Services. We recommend that you
        print a copy of these Legal Terms for your records.
      </p>

      <S.AccordionRoot type="single" collapsible defaultValue="user-accounts">
        <S.AccordionItem value="user-accounts">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>User Accounts & Registration</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              You may be required to register to use the Services. Users may
              link social media accounts for registeration and login. You agree
              to keep your password confidential and will be responsible for all
              use of your account and password. We reserve the right to remove,
              reclaim, or change a username you select if we determine, in our
              sole discretion, that such username is inappropriate, obscene, or
              otherwise objectionable.
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="user-content">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>User-Generated Content</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <ul>
                <li>
                  The Services may invite you to chat, contribute to, or
                  participate in blogs, message boards, online forums, and other
                  functionality, and may provide you with the opportunity to
                  create, submit, post, display, transmit, perform, publish,
                  distribute, or broadcast content and materials to us or on the
                  Services, including but not limited to text, writings, video,
                  audio, photographs, graphics, comments, suggestions, or other
                  material (collectively, <strong>`Contributions`</strong>).
                  Contributions may be viewable by other users of the Services
                  and through third-party websites. As such, any Contributions
                  you transmit may be treated as non-confidential and
                  non-proprietary.
                </li>

                <li>
                  When you create or make available any Contributions, you
                  represent and warrant that:
                </li>
                <ul>
                  <li>
                    The creation, distribution, transmission, public display, or
                    performance, and the accessing, downloading, or copying of
                    your Contributions do not and will not infringe the
                    proprietary rights, including but not limited to the
                    copyright, patent, trademark, trade secret, or moral rights
                    of any third party.
                  </li>
                  <li>
                    You are the creator and owner of or have the necessary
                    licenses, rights, consents, releases, and permissions to use
                    and to authorize us and other users of the Services to use
                    your Contributions in any manner contemplated by the
                    Services and these Legal Terms.
                  </li>
                  <li>
                    Your Contributions are not false, inaccurate, or misleading.
                  </li>
                  <li>
                    Your Contributions are not obscene, violent, harassing,
                    defamatory, or otherwise objectionable.
                  </li>
                  <li>
                    Your Contributions do not ridicule, mock, disparage,
                    intimidate, or abuse anyone.
                  </li>
                  <li>
                    Your Contributions do not violate any applicable law or
                    regulation.
                  </li>
                  <li>
                    Your Contributions do not violate the privacy or publicity
                    rights of any third party.
                  </li>
                </ul>

                <li>
                  Any use of the Services in violation of the foregoing violates
                  these Legal Terms and may result in, among other things,
                  termination or suspension of your rights to use the Services.
                </li>
              </ul>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="intellectual-property">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>Intellectual Property</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                We are <strong>Zoltron Tech</strong> (`Company,` `we,` `us,`
                `our`), the owner or licensee of all intellectual property
                rights in our services, including all source code, databases,
                functionality, software, website designs, audio, video, text,
                photographs, and graphics in the Services (collectively,{" "}
                <strong>`Content`</strong>), as well as the trademarks, service
                marks, and logos contained therein (<strong>`Marks`</strong>).
              </p>

              <p>
                All <strong>`Content`</strong> and <strong>`Marks`</strong> are
                protected by copyright, trademark, and other intellectual
                property laws, both in the United States and globally. The{" "}
                <strong>`Content`</strong> and <strong>`Marks`</strong> are
                provided <strong>`AS IS`</strong> for your personal,
                non-commercial use only.
              </p>
              <br />
              <h3>Your Use of Our Services</h3>
              <p>
                Subject to your compliance with these Legal Terms, including the{" "}
                <strong>`Prohibited Activities`</strong> section, we grant you a
                non-exclusive, non-transferable, revocable license to:
              </p>
              <ul>
                <li>Access the Services;</li>
                <li>
                  Download or print a copy of any portion of the{" "}
                  <strong>`Content`</strong> to which you have properly gained
                  access, solely for your personal, non-commercial use.
                </li>
              </ul>

              <p>
                No part of the Services, <strong>`Content`</strong>, or{" "}
                <strong>`Marks`</strong> may be copied, reproduced, republished,
                uploaded, posted, publicly displayed, transmitted, distributed,
                sold, licensed, or otherwise exploited for any commercial
                purpose without our prior written permission.
              </p>
              <p>
                For permission requests, contact us at{" "}
                <a href="mailto:support@zoltrontech.com">
                  support@zoltrontech.com
                </a>
                . If granted permission, you must credit{" "}
                <strong>Zoltron Tech</strong> as the owner or licensor of the
                Services, <strong>`Content`</strong>, or{" "}
                <strong>`Marks`</strong>, and display any applicable copyright
                or proprietary notices.
              </p>
              <p>
                We reserve all rights not expressly granted to you. Any breach
                of these Intellectual Property Rights may result in immediate
                termination of your access to the Services.
              </p>

              <br />
              <h3>Your Submissions and Contributions</h3>
              <p>
                Please review this section and the{" "}
                <strong>`Prohibited Activities`</strong> section carefully to
                understand the rights you grant us and your obligations when
                posting content through the Services.
              </p>

              <ul>
                <li>
                  <strong>Submissions:</strong> By sending us any questions,
                  comments, suggestions, ideas, feedback, or other information
                  about the Services (<strong>`Submissions`</strong>), you agree
                  to assign all intellectual property rights in such{" "}
                  <strong>`Submissions`</strong> to{" "}
                  <strong>Zoltron Tech</strong>. We may use these{" "}
                  <strong>`Submissions`</strong> for any lawful purpose,
                  commercial or otherwise, without acknowledgment or
                  compensation to you.
                </li>
                <li>
                  <strong>Contributions:</strong> The Services may allow you to
                  contribute to blogs, forums, or other interactive features by
                  posting content and materials (
                  <strong>`Contributions`</strong>), including:
                  <ul>
                    <li>Text</li>
                    <li>Images</li>
                    <li>Video</li>
                    <li>Audio</li>
                    <li>Other materials</li>
                  </ul>
                  Publicly posted <strong>`Submissions`</strong> will also be
                  treated as <strong>`Contributions`</strong>.
                </li>
              </ul>

              <p>
                When you post <strong>`Contributions`</strong>, you grant us a
                perpetual, irrevocable, worldwide, royalty-free license to:
              </p>
              <ul>
                <li>
                  Use, copy, reproduce, distribute, publish, display, perform,
                  translate, reformat, prepare derivative works, and sublicense
                  your <strong>`Contributions`</strong> in connection with the
                  Services.
                </li>
                <li>
                  Use your name, company name, or any trademarks, service marks,
                  logos, or personal images you provide.
                </li>
              </ul>

              <br />
              <h4>Your Responsibilities</h4>
              <ul>
                <li>
                  You confirm that your <strong>`Contributions`</strong> comply
                  with the <strong>`Prohibited Activities`</strong> section.
                </li>
                <li>
                  You waive any moral rights to the{" "}
                  <strong>`Contributions`</strong> where allowed by law.
                </li>
                <li>
                  You warrant that your <strong>`Contributions`</strong> are
                  original or that you have the necessary rights to grant us the
                  above licenses.
                </li>
                <li>
                  You warrant that your <strong>`Submissions`</strong> and{" "}
                  <strong>`Contributions`</strong> are not confidential.
                </li>
              </ul>
              <p>
                You are solely responsible for your{" "}
                <strong>`Submissions`</strong> and{" "}
                <strong>`Contributions`</strong> and agree to indemnify{" "}
                <strong>Zoltron Tech</strong> for any losses arising from a
                breach of these terms or infringement of third-party rights.
              </p>

              <h4>Content Removal</h4>
              <p>
                We may remove or edit any <strong>`Contributions`</strong> at
                our discretion without notice if we consider them harmful or in
                breach of these Legal Terms. We may also suspend or disable your
                account and report violations to authorities.
              </p>

              <br />
              <h3>Copyright Infringement</h3>
              <p>
                We respect the intellectual property rights of others. If you
                believe any material on or through the Services infringes your
                copyright, please refer to the{" "}
                <strong>Copyright Infringements</strong> section.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="prohibited activities">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>Prohibited Activities</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                You may not access or use the Services for any purpose other
                than that for which we make the Services available. The Services
                may not be used in connection with any commercial endeavors
                except those specifically endorsed or approved by{" "}
                <strong>Zoltron Tech</strong>.
              </p>

              <p>As a user of the Services, you agree not to:</p>
              <ul>
                <li>
                  Systematically retrieve data or other content from the
                  Services to create or compile a collection, database, or
                  directory without written permission from us.
                </li>
                <li>
                  Trick, defraud, or mislead us or other users, including
                  attempting to gain sensitive account information such as user
                  passwords.
                </li>
                <li>
                  Circumvent or interfere with security features of the
                  Services, including features that prevent or restrict copying
                  of any <strong>`Content`</strong>.
                </li>
                <li>
                  Disparage, tarnish, or otherwise harm, in our opinion,{" "}
                  <strong>Zoltron Tech</strong> and/or the Services.
                </li>
                <li>
                  Use any information obtained from the Services to harass,
                  abuse, or harm another person.
                </li>
                <li>
                  Make improper use of our support services or submit false
                  reports of abuse or misconduct.
                </li>
                <li>
                  Use the Services in a manner inconsistent with any applicable
                  laws or regulations.
                </li>
                <li>Attempt to impersonate another user or person.</li>
                <li>
                  Upload or transmit viruses, malware, or other harmful material
                  that disrupts the Services or interferes with other users’
                  enjoyment of the Services.
                </li>
                <li>
                  Delete or alter copyright or other proprietary rights notices
                  from any <strong>`Content`</strong>.
                </li>
                <li>
                  Engage in unauthorized use of the Services to collect
                  usernames or email addresses for unsolicited messages or
                  create accounts under false pretenses.
                </li>
                <li>
                  Use the Services to compete with us or to generate revenue
                  outside of any commercial activities specifically approved by{" "}
                  <strong>Zoltron Tech</strong>.
                </li>
              </ul>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="Social Media">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>Social Media</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                As part of the functionality of the services, you may link your
                account with online accounts you have with third-party service
                providers (each, a `third-party account`) in one of two ways:
                <ul>
                  <li>
                    by providing your third-party account login information
                    through the services; or
                  </li>
                  <li>
                    by allowing us to access your third-party account, as
                    permitted under the terms of that third-party account.
                  </li>
                </ul>
              </p>
              <br />
              <p>
                By linking a third-party account, you represent and warrant that
                you are authorized to share your login information and/or grant
                access to us, without violating the terms of the third-party
                account or incurring fees or limitations from the third-party
                provider.
              </p>
              <br />
              <p>
                Once linked, you acknowledge and agree that:
                <ul>
                  <li>
                    we may access, store, and display content from your
                    third-party account (`social network content`) on and
                    through your account on the services, including friend lists
                    and other shared information;
                  </li>
                  <li>
                    we may send and receive additional information from your
                    third-party account, as notified when you link the account;
                  </li>
                  <li>
                    depending on your privacy settings in your third-party
                    accounts, personally identifiable information may be
                    available through your services account;
                  </li>
                  <li>
                    if a third-party account becomes unavailable or we lose
                    access, social network content may no longer be accessible
                    through the services.
                  </li>
                </ul>
              </p>
              <br />
              <p>
                You may disable or disconnect any third-party account from your
                services account at any time through your account settings or by
                contacting us. we will attempt to delete information obtained
                from the third-party account, except for your username and
                profile picture associated with your services account.
              </p>
              <br />
              <p>
                <strong>Please note:</strong>
                <ul>
                  <li>
                    your relationship with third-party service providers is
                    governed solely by your agreement(s) with them;
                  </li>
                  <li>
                    we do not review social network content for accuracy,
                    legality, or non-infringement, and are not responsible for
                    any such content;
                  </li>
                  <li>
                    we may access your email contacts or mobile device contacts
                    solely to identify and inform you of contacts who have also
                    registered to use the services.
                  </li>
                </ul>
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="third-party">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>Third-Party Services</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                the services may contain, or you may be sent via the site, links
                to other websites (<strong>`third-party websites`</strong>) as
                well as articles, photographs, text, graphics, music, video,
                applications, software, and other content from third parties (
                <strong>`third-party content`</strong>).
              </p>
              <br />
              <p>
                such third-party websites and third-party content are not
                monitored, verified, or checked for accuracy, appropriateness,
                or completeness by us. we are not responsible for the content,
                opinions, reliability, privacy practices, or other policies of
                any third-party websites or third-party content accessed through
                the services.
              </p>
              <br />
              <p>
                linking to or allowing the use or installation of any
                third-party websites or content does not imply our approval or
                endorsement. if you decide to visit third-party websites or
                use/install third-party content, you do so at your own risk, and
                these terms no longer govern your activities on those sites.
              </p>
              <br />
              <p>
                you should review the applicable terms, privacy policies, and
                data practices of any website you access or any applications you
                use or install from the services. any purchases you make through
                third-party websites are solely between you and the applicable
                third party, and we take no responsibility for them.
              </p>
              <br />
              <p>
                by using third-party websites or content, you agree that we do
                not endorse the products or services offered there, and you
                shall hold us harmless from any losses or harm caused by your
                interactions with third-party websites or content.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="service-management">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>Service Management</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>We reserve the right, but are not obligated, to:</p>

              <ul>
                <li>
                  Monitor the services for violations of these legal terms;
                </li>
                <li>
                  Take appropriate legal action against anyone who, in our sole
                  discretion, violates the law or these legal terms, including
                  reporting such users to law enforcement authorities;
                </li>
                <li>
                  Refuse, restrict access to, limit the availability of, or
                  disable (to the extent technologically feasible) any of your
                  contributions or any portion thereof, at our sole discretion;
                </li>
                <li>
                  Remove or disable files and content that are excessive in size
                  or otherwise place a burden on our systems, without notice or
                  liability;
                </li>
                <li>
                  Manage and operate the services in a manner designed to
                  protect our rights and property and to ensure the proper
                  functioning of the services.
                </li>
              </ul>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="liability">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>Limitation of Liability</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                Novelist world, zoltron tech, and their directors, employees, or
                agents are not liable to you or any third party for any direct,
                indirect, incidental, special, or consequential damages,
                including lost content, lost profits, lost revenue, or loss of
                business opportunities, arising from your use of the services,
                even if we have been advised of the possibility of such damages.
              </p>
              <br />
              <p>
                To the extent permitted by applicable law, our liability to you
                for any cause of action arising from your use of the services is
                limited to the amount, if any, you have paid to us during the
                three (3) months prior to the event giving rise to the claim.
              </p>
              <br />
              <p>
                Some state and international laws may not allow certain
                limitations on liability or the exclusion of certain damages. if
                such laws apply to you, some or all of these disclaimers or
                limitations may not apply, and you may have additional rights.
              </p>
              <br />
              <p>
                The services are provided <strong>`as-is`</strong> without
                warranties of any kind, whether express or implied, including
                but not limited to implied warranties of merchantability or
                fitness for a particular purpose.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="privacy-data">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>Privacy & Data Protection</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              We do not collect or store personal data except for optional login
              features. Users are encouraged to maintain privacy and avoid
              sharing sensitive information. All servers are located in Europe,
              and GDPR principles are respected where applicable. <br /> <br />
              We will maintain certain data that you transmit to the Services
              for the purpose of managing the performance of the Services, as
              well as data relating to your use of the Services. Although we
              perform regular routine backups of data, you are solely
              responsible for all data that you transmit or that relates to any
              activity you have undertaken using the Services. You agree that we
              shall have no liability to you for any loss or corruption of any
              such data, and you hereby waive any right of action against us
              arising from any such loss or corruption of such data.
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="privacy policy">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>Privacy Policy</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                We care about data privacy and security. please review our full
                privacy policy{" "}
                <a
                  href="https://novelist.world/rp/privacy-policy"
                  target="_blank"
                  rel="noopener"
                >
                  <strong>here</strong>
                </a>
                . by using the services, you agree to be bound by our privacy
                policy, which is incorporated into these legal terms.
              </p>
              <br />
              <p>
                Please be advised that the services are hosted in pakistan. if
                you access the services from any other region with laws or
                regulations governing personal data collection, use, or
                disclosure that differ from those in pakistan, then through your
                continued use of the services, you are transferring your data to
                pakistan, and you expressly consent to have your data
                transferred to and processed in pakistan.
              </p>
              <br />
              <p>
                We do not knowingly accept, request, or solicit information from
                children, nor do we knowingly market to children. in accordance
                with applicable laws, including the u.s. children’s online
                privacy protection act (COPPA), if we receive actual knowledge
                that anyone under the age of 13 has provided personal
                information to us without verifiable parental consent, we will
                delete that information from the services as quickly as
                reasonably possible.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="governing-law">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>Governing Law & Dispute Resolution</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              <p>
                <strong>Governing Law:</strong> these legal terms are governed
                by and interpreted according to the laws of Pakistan. the United
                Nations convention on contracts for the international sale of
                goods is expressly excluded. if your habitual residence is in
                the EU and you are a consumer, you also have the protections
                provided by mandatory laws in your country of residence. Zoltron
                Tech and you agree to submit to the non-exclusive jurisdiction
                of the courts of pakistan for any claims related to these legal
                terms. this means that you can bring a claim in pakistan or, if
                you reside in the eu, in your country of residence to enforce
                your consumer protection rights.
              </p>
              <br />
              <p>
                <strong>Informal Negotiations:</strong> to expedite resolution
                and manage costs, any dispute, controversy, or claim arising
                from these legal terms (each a `dispute`) shall first be
                addressed through informal negotiations for at least thirty (30)
                days. informal negotiations begin when one party provides
                written notice to the other.
              </p>
              <br />
              <p>
                <strong>Binding Arbitration:</strong> any dispute not resolved
                through informal negotiations shall be resolved through binding
                arbitration. the arbitration will be conducted by a single
                arbitrator chosen in accordance with the rules of the Pakistani
                arbitration act or any recognized arbitration body in Pakistan.
                the seat of arbitration shall be in Lahore, Pakistan. the
                proceedings shall be conducted in english, and the applicable
                substantive law shall be the law of Pakistan.
              </p>
              <br />
              <p>
                <strong>Restrictions:</strong> the parties agree that any
                arbitration shall be limited to the individual dispute between
                the parties. to the fullest extent permitted by law:
                <ul>
                  <li>
                    No arbitration may be combined with any other proceeding;
                  </li>
                  <li>
                    Disputes cannot be arbitrated on a class-action basis or use
                    class action procedures; and
                  </li>
                  <li>
                    No dispute may be brought on behalf of the general public or
                    any other person.
                  </li>
                </ul>
              </p>
              <br />
              <p>
                <strong>Exceptions:</strong> the following disputes are excluded
                from informal negotiations and arbitration:
                <ul>
                  <li>
                    Disputes concerning the enforcement or validity of
                    intellectual property rights;
                  </li>
                  <li>
                    Disputes arising from allegations of theft, piracy, invasion
                    of privacy, or unauthorized use; and
                  </li>
                  <li>Claims seeking injunctive or equitable relief.</li>
                </ul>
                <br />
                If any part of this provision is deemed illegal or
                unenforceable, the dispute shall be resolved by a court of
                competent jurisdiction in Pakistan, and the parties agree to
                submit to the personal jurisdiction of that court.
              </p>
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="copyright-infringements">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>Copyright Infringements</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              We respect the intellectual property rights of others. If you
              believe that any material available on or through the Services
              infringes upon any copyright you own or control, please
              immediately notify us using the contact information provided below
              (a `Notification`). A copy of your Notification will be sent to
              the person who posted or stored the material addressed in the
              Notification. <br />
              <br />
              Please be advised that pursuant to applicable law you may be held
              liable for damages if you make material misrepresentations in a
              Notification. Thus, if you are not sure that material located on
              or linked to by the Services infringes your copyright, you should
              consider first contacting an attorney.
            </S.AccordionContentInner>
          </S.AccordionContent>
        </S.AccordionItem>

        <S.AccordionItem value="modifications">
          <S.AccordionHeader>
            <S.AccordionTrigger>
              <span>Modifications to Terms</span>
              <S.Chevron aria-hidden />
            </S.AccordionTrigger>
          </S.AccordionHeader>
          <S.AccordionContent>
            <S.AccordionContentInner>
              Novelist World reserves the right to update or modify these Terms
              at any time. Continued use of the platform constitutes acceptance
              of updated Terms.
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
