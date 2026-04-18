"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BsArrowLeft, BsThreeDots } from "react-icons/bs";
import { CgExtensionAdd } from "react-icons/cg";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import {
  deleteMuseAboutSectionAction,
  getMuseAboutSectionsAction,
} from "@/app/rp/muse/actions";
import { AppAlertDialog } from "@/components/dialog";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import { AppDropdownMenu } from "@/components/profile-more-dropdown";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import type { MuseAboutSection } from "@/types/novelist";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

export default function MuseAboutListSectionsPage() {
  const id = useParams()?.id as string;
  const authState = useGlobalState("authState");
  const [aboutSections, setAboutSections] = useState<MuseAboutSection[] | null>(
    null,
  );
  const { successToast, errorToast } = useUIContext();
  const [showDeleteSectionAlert, setShowDeleteSectionAlert] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const { routeToPage, baseDataLoader } = usePageRouter();

  const handleDeleteSection = async () => {
    if (!selectedSectionId) {
      errorToast("Failed to delete section");
      setShowDeleteSectionAlert(false);
      return;
    }

    const response = await deleteMuseAboutSectionAction(selectedSectionId);

    if (response?.message === API_MESSAGE.Success) {
      setAboutSections((prevSections) =>
        prevSections
          ? prevSections.filter((section) => section.id !== selectedSectionId)
          : prevSections,
      );
      successToast("Section deleted successfully");
    } else {
      errorToast("Failed to delete section");
    }

    setSelectedSectionId(null);
    setShowDeleteSectionAlert(false);
  };

  const fetchMuseAboutSections = async () => {
    const _aboutSections = await baseDataLoader(() =>
      getMuseAboutSectionsAction(id),
    );
    setAboutSections(_aboutSections);
  };

  useEffect(() => {
    if (authState === "LOADING" || aboutSections) return;
    fetchMuseAboutSections();
  }, [authState, aboutSections]);

  return (
    <S.Container>
      <S.TopActionsRow>
        <S.BackButton
          onClick={() => routeToPage(ROUTES.Profile.Muses.Edit(id || ""))}
        >
          <BsArrowLeft size={18} />
        </S.BackButton>
        <S.SeeMoreLink
          onClick={() =>
            routeToPage(ROUTES.Profile.Muses.AboutCreate(id || ""))
          }
        >
          <span>
            Add a new section
            <CgExtensionAdd size={20} />
          </span>
        </S.SeeMoreLink>
      </S.TopActionsRow>
      <S.ListContainer>
        {aboutSections?.map((section) => {
          const dropdownItems = [
            {
              icon: <FaRegEdit />,
              label: "Edit section",
              onClick: () => {
                const sectionId = section.id ?? "";
                if (!sectionId) return;
                routeToPage(
                  ROUTES.Profile.Muses.AboutEdit(id || "", sectionId),
                );
              },
            },
            {
              separator: true,
            },
            {
              icon: <FaRegTrashCan />,
              label: "Delete this section",
              onClick: () => {
                setSelectedSectionId(section.id);
                setShowDeleteSectionAlert(true);
              },
              variant: "danger" as const,
            },
          ];

          return (
            <S.SectionItem key={section.id}>
              <S.SectionHeader>
                <AppDropdownMenu
                  trigger={<BsThreeDots size={18} />}
                  items={dropdownItems}
                />
              </S.SectionHeader>
              <S.SectionContent>
                {section.image && (
                  <AppImageViewer src={section.image} alt="Section attachment">
                    <S.SectionImage
                      src={section.image}
                      alt="Section attachment"
                    />
                  </AppImageViewer>
                )}
                <RichTextRenderer
                  savedText={section.text || ""}
                  overlayHidden
                />
              </S.SectionContent>
            </S.SectionItem>
          );
        })}
      </S.ListContainer>

      <AppAlertDialog
        heading={`Delete this section?`}
        text={`Deleting the section will remove all of its content. Are you sure you want to delete this section?`}
        open={showDeleteSectionAlert}
        onOpenChange={setShowDeleteSectionAlert}
        onConfirm={() => {
          handleDeleteSection();
        }}
        actionButtonLabel="Delete"
      />
    </S.Container>
  );
}
