"use client";

import {
  STORAGE_WARNING_RATIO,
  type StorageUsage,
  storageDailySummary,
  storageExplainer,
  storageSummary,
  storageUsedRatio,
} from "@nw/utils";
import { useEffect, useState } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { TbDatabase } from "react-icons/tb";
import { AppAlertDialog } from "@/components/dialog";
import { getStorageUsage } from "../actions";
import * as T from "./storage-section.styled";
import * as S from "./styled";

/**
 * "Storage" in the account settings (AWS_COST_SECURITY_PLAN.md §2.2): how much
 * of the account's total its uploads take, today's uploads when there were
 * any, and a tap-through explainer in the shared dialog.
 *
 * Nothing renders when `/s3/usage` fails — no row beats a broken one — and the
 * row shows a placeholder value while it loads. Fits the 375 × 667 baseline:
 * one line of label and value, the bar, and at most one more line.
 */
export function StorageSection() {
  // undefined = loading, null = failed.
  const [usage, setUsage] = useState<StorageUsage | null | undefined>(
    undefined,
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let live = true;
    getStorageUsage()
      .catch(() => null)
      .then((result) => {
        if (live) setUsage(result);
      });
    return () => {
      live = false;
    };
  }, []);

  if (usage === null) return null;

  const ratio = usage ? storageUsedRatio(usage) : 0;
  const summary = usage ? storageSummary(usage) : "…";
  const daily = usage ? storageDailySummary(usage) : null;
  const explainer = usage ? storageExplainer(usage) : null;

  return (
    <S.AccountGroup>
      <S.AccountGroupHeading>
        <TbDatabase />
        Storage
      </S.AccountGroupHeading>

      <T.StorageRowButton
        type="button"
        disabled={!usage}
        aria-label={
          usage
            ? `Storage: ${summary} used${daily ? `. ${daily}` : ""}. About storage`
            : "Storage: loading"
        }
        onClick={() => setOpen(true)}
      >
        <T.StorageTopLine>
          <T.StorageLabel>
            Storage
            <BsInfoCircle aria-hidden />
          </T.StorageLabel>
          <T.StorageValue>{summary}</T.StorageValue>
        </T.StorageTopLine>
        {usage ? (
          <T.StorageTrack aria-hidden>
            <T.StorageFill
              $warning={ratio >= STORAGE_WARNING_RATIO}
              style={{ width: `${Math.round(ratio * 1000) / 10}%` }}
            />
          </T.StorageTrack>
        ) : null}
        {daily ? <T.StorageDaily>{daily}</T.StorageDaily> : null}
      </T.StorageRowButton>

      {explainer ? (
        <AppAlertDialog
          open={open}
          onOpenChange={setOpen}
          heading={explainer.title}
          text={null}
          body={
            <T.ExplainerBody>
              {explainer.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </T.ExplainerBody>
          }
          showConfirm={false}
          closeButtonText="Got it"
        />
      ) : null}
    </S.AccountGroup>
  );
}
