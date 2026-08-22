// "use client";

// import { DefaultTheme } from "@novelist-world/ui";
// import { useRouter } from "next/navigation";
// import { type FC, useEffect, useState } from "react";
// import { ThemeProvider } from "styled-components";
// import {
//   getUserNovelist,
//   updateUserNovelist,
// } from "@/app/rp/novelists/actions";
// import { uploadMedia } from "@/app/rp/profile/actions";
// import {
//   Input,
//   ShouldRender,
//   UploadAvatar,
//   Username,
// } from "@/components/common";
// import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
// import { useForm, useUIContext } from "@/hooks";
// import { usePageRouter } from "@/hooks/use-page-router";
// import type { Novelist } from "@nw/types";
// import { API_MESSAGE, INITIAL_NOVELIST } from "@/utils/constants";
// import { ROUTES } from "@/utils/constants/routes";
// import { Logger } from "@/utils/services";
// import * as S from "./styles";

// export type EditProfileCardProps = {};

// export const EditProfileCard: FC<EditProfileCardProps> = ({}) => {
//   const authState = useGlobalState("authState");
//   const user = useGlobalState("user");
//   const novelist = useGlobalState("novelist");
//   const [avatarFile, setAvatarFile] = useState<FormData | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const novelists = useGlobalState("novelists");
//   const set = useGlobalStoreSet();
//   const { routeToPage } = usePageRouter();

//   const { successToast, errorToast } = useUIContext();

//   const updateUserAvatar = async () => {
//     if (!avatarFile) return;
//     Logger.error("avatarFile is", avatarFile);
//     const response = await uploadMedia(avatarFile);

//     if (response === API_MESSAGE.MediaError) {
//       errorToast(response);
//       return response;
//     }

//     updateValues((prev) => ({ ...prev, image: response }));
//     Logger.debug("response", response);

//     return response;
//   };

//   const beforeSubmit = async (novelist: Novelist) => {
//     Logger.debug("handleSave");

//     setLoading(true);

//     let updatedAvatarUrl = novelist?.image;
//     if (avatarFile) {
//       updatedAvatarUrl = (await updateUserAvatar()) || novelist?.image;
//     }

//     Logger.error("updatedAvatar: ", updatedAvatarUrl);

//     if (updatedAvatarUrl === API_MESSAGE.MediaError) {
//       setLoading(false);
//       return { ...novelist, abort: true };
//     }

//     const _novelist = {
//       ...novelist,
//       image: updatedAvatarUrl || "",
//     };

//     return _novelist;
//   };

//   const onSubmit = async (novelist: Novelist) => {
//     if (!novelist) {
//       setLoading(false);
//       errorToast("First name is required.");
//       return novelist;
//     }

//     const resonse = await updateUserNovelist(novelist);

//     setLoading(false);

//     Logger.debug("resonse", resonse);

//     if ("message" in resonse) {
//       return errorToast(API_MESSAGE.Error);
//     }

//     updateValues(novelist);

//     if (
//       novelists.find((_novelist) => _novelist.username === novelist.username)
//     ) {
//       set({
//         novelists: novelists
//           .filter((n) => n.username !== novelist.username)
//           .concat(novelist),
//       });
//     }

//     successToast("Data updated successfully.");
//   };

//   const { values, update, updateValues, submit } = useForm<Novelist>({
//     beforeSubmit,
//     initialValues: INITIAL_NOVELIST,
//     onSubmit,
//   });

//   const fetchData = async () => {
//     let _novelist = novelist;
//     if (_novelist === null) {
//       setLoading(true);
//       const response = await getUserNovelist();
//       if (!("message" in response)) {
//         _novelist = response;
//       }
//     }
//     setLoading(false);

//     if (_novelist) updateValues(_novelist);
//   };

//   const handleCancel = () => {
//     routeToPage(ROUTES.Profile.View(user?.username || "").Index);
//   };

//   useEffect(() => {
//     if (authState !== "LOGGED_IN") return;
//     fetchData();
//   }, [authState]);

//   useEffect(() => {
//     Logger.error("avatarFile is ->", avatarFile);
//   }, [avatarFile]);

//   Logger.info("EditProfileCard rendered");

//   return (
//     <>
//       <S.ProfileBackgroundBlurFilter
//         banner={
//           values?.image ||
//           "https://i.etsystatic.com/44068041/r/il/3bab40/5467123737/il_300x300.5467123737_1kne.jpg"
//         }
//       />
//       <ThemeProvider theme={DefaultTheme}>
//         <S.LocalContainer>
//           <UploadAvatar
//             image={values?.image}
//             onChange={(image) => setAvatarFile(image)}
//           />
//           <S.Profile>
//             <S.Title>Edit Your Prifile old Profile</S.Title>
//             <S.UsernameContainer>
//               <Username username={user?.username} primary />
//             </S.UsernameContainer>
//             <S.FormGroup>
//               <S.Name>
//                 <Input
//                   label="First Name"
//                   name="firstName"
//                   value={values?.firstName}
//                   onChange={update}
//                   onEnter={submit}
//                   maxLength={50}
//                 />
//                 <Input
//                   label="Last Name"
//                   name="lastName"
//                   value={values?.lastName}
//                   onChange={update}
//                   onEnter={submit}
//                   maxLength={50}
//                 />
//               </S.Name>
//               <Input
//                 label="Note"
//                 name="note"
//                 value={values?.note}
//                 onChange={update}
//                 onEnter={submit}
//                 maxLength={250}
//               />
//               <S.ButtonGroup>
//                 <ShouldRender
//                   if={
//                     novelist?.username !== undefined &&
//                     novelist?.firstName !== undefined
//                   }
//                 >
//                   <S.SaveButton
//                     variant="secondary"
//                     onClick={handleCancel}
//                     loading={loading}
//                   >
//                     Cancel
//                   </S.SaveButton>
//                 </ShouldRender>
//                 <S.SaveButton onClick={() => submit()} loading={loading}>
//                   Save <div className="sm-hide">Changes</div>
//                 </S.SaveButton>
//               </S.ButtonGroup>
//             </S.FormGroup>
//           </S.Profile>
//         </S.LocalContainer>
//       </ThemeProvider>
//     </>
//   );
// };

// export default EditProfileCard;
