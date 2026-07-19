// Names the synthesized entry can't surface: default-only exports (export *
// skips them) and named collisions esbuild drops as ambiguous. Re-exported
// here from their canonical source; merged into window.NovelistWorld via
// cfg.extraEntries.
export { default as EditMuseDataCard } from "@/components/edit-muse/edit-muse-data-card";
export { FandomSelect } from "@/components/edit-muse/fandom-select";
export { EditMuseForm } from "@/components/edit-muse";
export { default as EditMuseAboutSectionDataCard } from "@/components/edit-muse-about-section/edit-muse-about-section-data-card";
export { default as EditMuseExtraAttributesDataCard } from "@/components/edit-muse-extra-attributes/edit-muse-extra-attributes-data-card";
export { default as EditMusicDataCard } from "@/components/edit-music/edit-music-data-card";
export { default as EditStoryboardDataCard } from "@/components/edit-storyboard/edit-storyboard-data-card";
export { default as EditStoryboardEventDataCard } from "@/components/edit-storyboard-event-card/edit-storyboard-event-data-card";
export { FriendListItem } from "@/components/friend-list-item";
export { default as HomeTourGuide } from "@/components/home-tour-guide";
export { default as ProfileTourGuide } from "@/components/profile-tour-guide";
export { default as PWAInstallButton } from "@/components/PWAInstall/page";
export { SendButton } from "@/components/prompt-input/sent-button";
// Preview-authoring helper: several components (NovelistPreviewCard,
// NovelistCard's Swiper composition) branch on global-store state
// (currentNovelist, novelists list) that DSProvider's fixed initial state
// can't parameterize per-story. Exposing the setter lets a preview seed it
// on mount for the specific state it needs to demonstrate.
export { useGlobalStoreSet } from "@/context/store/stores";
