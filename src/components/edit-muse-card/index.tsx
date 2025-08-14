"use client";

import {
  getMuseAction,
  updateMuseAction,
  searchFandomsAction,
} from "@/app/rp/muse/actions";
import { uploadMedia } from "@/app/rp/profile/actions";
import { ShouldRender, UploadAvatar, Username } from "@/components/common";
import { useForm, useUIContext } from "@/hooks";
import type { Fandom, Muse } from "@/types";
import { API_MESSAGE, INITIAL_MUSE } from "@/utils/constants";
import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { FC, ReactNode, useEffect, useState } from "react";
import * as S from "./styles";
import { ThemeProvider } from "styled-components";
import { DefaultTheme, Input } from "@novelist-world/ui";
import { FandomValue } from "@/app/rp/muse/[slug]/styles";
import { useGlobalState } from "@/context/store/stores";

export type EditMuseCardProps = {
  id?: string;
};

const Flex = ({ children }: { children?: ReactNode }) => {
  return (
    <S.Flex direction="column" align="flex-start">
      {children}
    </S.Flex>
  );
};

export const EditMuseCard: FC<EditMuseCardProps> = ({ id }) => {
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const [muse, setMuse] = useState<Muse>();
  const [fandomSearch, setFandomSearch] = useState("");
  const [fandoms, setFandoms] = useState<Fandom[] | null>(null);
  const [avatarFile, setAvatarFile] = useState<FormData | null>(null);
  const [videoFile, setVideoFile] = useState<FormData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { push } = useRouter();
  const [extraKey, setExtraKey] = useState("");
  const [extraValue, setExtraValue] = useState("");
  const [nicknameInput, setNicknameInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { successToast, errorToast } = useUIContext();

  const updateMuseMedia = async (media: FormData | null) => {
    if (!media) return;
    Logger.error("avatarFile", media);
    const response = await uploadMedia(media);

    if (response === API_MESSAGE.MediaError) {
      errorToast(response);
      return response;
    }

    Logger.debug("response", response);

    return response;
  };

  const uploadVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const isVideo = file.type.includes("video");

    if (!isVideo) {
      return errorToast("File type is not a valid video!");
    }

    const formData = new FormData();
    formData.append("file", file);
    setVideoFile(formData);
  };

  const beforeSubmit = async (muse: Muse) => {
    Logger.debug("handleSave");

    setLoading(true);

    let updatedAvatarUrl = muse?.image;
    let updatedVideoUrl = muse?.video;

    if (avatarFile) {
      updatedAvatarUrl = (await updateMuseMedia(avatarFile)) || muse?.image;
    }

    if (videoFile) {
      updatedVideoUrl = (await updateMuseMedia(videoFile)) || muse?.video;
    }

    Logger.debug("updatedAvatar: ", updatedAvatarUrl);

    if (
      updatedAvatarUrl === API_MESSAGE.MediaError ||
      updatedVideoUrl === API_MESSAGE.MediaError
    ) {
      setLoading(false);
      return { ...muse, abort: true };
    }

    const _muse = {
      ...muse,
      image: updatedAvatarUrl || "",
      video: updatedVideoUrl || "",
    };

    return _muse;
  };

  const onSubmit = async (muse: Muse) => {
    if (!muse) {
      setLoading(false);
      errorToast("First name is required.");
      return muse;
    }

    console.log(muse);

    const resonse = await updateMuseAction(muse);

    setLoading(false);

    Logger.debug("resonse", resonse);
    console.log(resonse);

    if ("message" in resonse) {
      return errorToast(API_MESSAGE.Error);
    }

    updateValues(muse);
    successToast("Data updated successfully.");
  };

  const { values, update, updateValues, submit } = useForm<Muse>({
    initialValues: INITIAL_MUSE,
    onSubmit,
    beforeSubmit,
  });

  const handlePrivacySelect = (privacyValue: string) => {
    update({
      target: {
        name: "privacy",
        value: privacyValue,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const addExtraAttribute = () => {
    if (!extraKey || !extraValue) return;

    const updatedMap = JSON.parse(JSON.stringify(values.extraAttributes || {}));
    updatedMap[extraKey] = extraValue;

    update({
      target: {
        name: "extraAttributes",
        value: updatedMap,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>);

    setExtraKey("");
    setExtraValue("");
  };

  // Add this handler inside EditMuseCard component
  const removeExtraAttribute = (keyToRemove: string) => {
    if (!values.extraAttributes) return;

    const updatedMap = JSON.parse(JSON.stringify(values.extraAttributes));
    delete updatedMap[keyToRemove];

    update({
      target: {
        name: "extraAttributes",
        value: updatedMap,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const addNickname = () => {
    if (!nicknameInput) return;

    const updatedNicknames = values.nicknames ? [...values.nicknames] : [];
    if (!updatedNicknames.includes(nicknameInput)) {
      updatedNicknames.push(nicknameInput);
      update({
        target: {
          name: "nicknames",
          value: updatedNicknames,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
    setNicknameInput("");
  };

  const removeNickname = (nicknameToRemove: string) => {
    if (!values.nicknames) return;

    const updatedNicknames = values.nicknames.filter(
      (n) => n !== nicknameToRemove
    );

    update({
      target: {
        name: "nicknames",
        value: updatedNicknames,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const fetchData = async () => {
    if (!id) return;

    setLoading(true);

    const response = await getMuseAction(id);
    if (response && !("message" in response)) {
      setMuse(response);
      updateValues(response);
    }
    setLoading(false);
  };

  const fetchFandoms = async (prefix: string) => {
    const response = await searchFandomsAction(prefix);
    if (response && !("message" in response)) {
      setFandoms(response);
    }
  };

  const handleCancel = () => {
    push(`/rp/profile/${user?.username}/muses`);
  };

  useEffect(() => {
    if (authState !== "LOGGED_IN") return;
    fetchData();
  }, [authState]);

  useEffect(() => {
    Logger.debug("avatarFile", avatarFile);
  }, [avatarFile]);

  Logger.info("EditMuseCard rendered");

  return (
    <>
      <S.ProfileBackgroundBlurFilter
        banner={
          values?.image ||
          "https://i.etsystatic.com/44068041/r/il/3bab40/5467123737/il_300x300.5467123737_1kne.jpg"
        }
      />
      <ThemeProvider theme={DefaultTheme}>
        <S.LocalContainer>
          <UploadAvatar
            image={values?.image || ""}
            onChange={(image) => setAvatarFile(image)}
          />
          <S.Profile>
            <S.Title>{id ? "EDIT" : "Create"} Muse</S.Title>
            <ShouldRender preserveSpace if={id != undefined}>
              <S.UsernameContainer>
                <span>PENNED BY: </span>
                <Username username={user?.username} primary />
              </S.UsernameContainer>
            </ShouldRender>
            <S.FormGroup>
              <Flex>
                <S.Label htmlFor="firstName">Visibility</S.Label>
                <S.PasteButton
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  <S.DropDownButton className={isDropdownOpen ? "open" : ""}>
                    {values.privacy.replaceAll("_", " ")} &nbsp; ▼
                  </S.DropDownButton>

                  {isDropdownOpen && (
                    <S.DropdownContent>
                      <button
                        type="button"
                        onClick={() => {
                          handlePrivacySelect("ONLY_ME");
                          setIsDropdownOpen(false);
                        }}
                      >
                        ONLY ME
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handlePrivacySelect("FRIENDS");
                          setIsDropdownOpen(false);
                        }}
                      >
                        FRIENDS
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handlePrivacySelect("PUBLIC");
                          setIsDropdownOpen(false);
                        }}
                      >
                        PUBLIC
                      </button>
                    </S.DropdownContent>
                  )}
                </S.PasteButton>
                <Flex>
                  <S.Label htmlFor="firstName">Name</S.Label>
                  <S.Name>
                    <Input
                      name="firstName"
                      value={values?.firstName}
                      onChange={update}
                      maxLength={25}
                    />
                    <Input
                      name="lastName"
                      value={values?.lastName}
                      onChange={update}
                      maxLength={25}
                    />
                  </S.Name>
                </Flex>

                <Flex>
                  <S.Label>Nicknames</S.Label>
                  <S.Name>
                    <Input
                      placeholder="Add nickname"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                    />
                    <S.SaveButton type="button" onClick={addNickname}>
                      Add Nickname
                    </S.SaveButton>
                  </S.Name>

                  <S.NicknamesWrapper>
                    {!values.nicknames || values.nicknames.length === 0 ? (
                      <div>No Nicknames</div>
                    ) : (
                      <S.ExtraAttributesList>
                        {values.nicknames.map((nickname) => (
                          <S.ExtraAttributeItem key={nickname}>
                            <span>{nickname}</span>
                            <S.RemoveButton
                              type="button"
                              onClick={() => removeNickname(nickname)}
                              aria-label={`Remove nickname ${nickname}`}
                            >
                              &times;
                            </S.RemoveButton>
                          </S.ExtraAttributeItem>
                        ))}
                      </S.ExtraAttributesList>
                    )}
                  </S.NicknamesWrapper>
                </Flex>

                <Flex>
                  <S.Label htmlFor="note">Note</S.Label>
                  <Input
                    name="note"
                    value={values?.note}
                    onChange={update}
                    maxLength={250}
                  />
                </Flex>

                <Flex>
                  <S.Label htmlFor="fandom">Fandom</S.Label>

                  <S.FandomWrapper>
                    <Input
                      placeholder="Search fandom"
                      value={fandomSearch}
                      onChange={async (e) => {
                        const text = e.target.value;
                        setFandomSearch(text);
                        if (text.length > 0) {
                          await fetchFandoms(text);
                        } else {
                          setFandoms(null);
                        }
                      }}
                      onBlur={() => {
                        // Delay so click can register before it closes
                        setTimeout(() => {
                          setFandoms(null);
                          setFandomSearch("");
                        }, 100);
                      }}
                    />

                    {values.fandom?.id && (
                      <FandomValue color={values.fandom.color || "red"}>
                        <strong>{values.fandom.id}</strong>
                      </FandomValue>
                    )}

                    {fandoms && fandoms.length > 0 && (
                      <S.FandomDropdown>
                        {fandoms.map((f) => (
                          <S.FandomOption
                            key={f.id}
                            onMouseDown={(e) => {
                              e.preventDefault(); // prevent input blur
                              update({
                                target: {
                                  name: "fandom",
                                  value: f,
                                },
                              } as unknown as React.ChangeEvent<HTMLInputElement>);
                              setFandomSearch("");
                              setFandoms(null);
                            }}
                          >
                            {f.id}
                          </S.FandomOption>
                        ))}
                      </S.FandomDropdown>
                    )}
                  </S.FandomWrapper>
                </Flex>

                <Flex>
                  <S.Label>Extra Attributes</S.Label>
                  <S.Name>
                    <Input
                      placeholder="Key"
                      value={extraKey}
                      onChange={(e) => setExtraKey(e.target.value)}
                    />
                    <Input
                      placeholder="Value"
                      value={extraValue}
                      onChange={(e) => setExtraValue(e.target.value)}
                    />
                  </S.Name>
                  <S.SaveButton type="button" onClick={addExtraAttribute}>
                    Add Attribute
                  </S.SaveButton>

                  <S.ExtraAttributesWrapper>
                    {!values.extraAttributes ||
                    Object.keys(values.extraAttributes).length === 0 ? (
                      <div>No Extra Attributes</div>
                    ) : (
                      <S.ExtraAttributesList>
                        {Object.entries(values.extraAttributes).map(
                          ([key, value]) => (
                            <S.ExtraAttributeItem key={key}>
                              <span>
                                <strong>{key}:</strong> {value}
                              </span>
                              <S.RemoveButton
                                type="button"
                                onClick={() => removeExtraAttribute(key)}
                                aria-label={`Remove attribute ${key}`}
                              >
                                &times;
                              </S.RemoveButton>
                            </S.ExtraAttributeItem>
                          )
                        )}
                      </S.ExtraAttributesList>
                    )}
                  </S.ExtraAttributesWrapper>
                </Flex>

                <Flex>
                  <S.Label htmlFor="video">Video</S.Label>
                  <Input name="video" type="file" onChange={uploadVideo} />
                </Flex>
                <Flex>
                  <S.Label htmlFor="story">Story</S.Label>

                  {!loading ? (
                    <S.RichText
                      height={200}
                      content={muse?.story ? JSON.parse(muse.story) : ""}
                      onChange={(content) => {
                        update({
                          target: {
                            name: "story",
                            value: JSON.stringify(content),
                          },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      editable
                    ></S.RichText>
                  ) : null}
                </Flex>
              </Flex>

              <S.ButtonGroup>
                <S.SaveButton
                  variant="secondary"
                  onClick={handleCancel}
                  loading={loading}
                >
                  Cancel
                </S.SaveButton>
                <S.SaveButton onClick={() => submit()} loading={loading}>
                  Save <div className="sm-hide">Changes</div>
                </S.SaveButton>
              </S.ButtonGroup>
            </S.FormGroup>
          </S.Profile>
        </S.LocalContainer>
      </ThemeProvider>
    </>
  );
};

export default EditMuseCard;
