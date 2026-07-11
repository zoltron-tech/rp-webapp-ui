"use client";

import { type ChangeEvent, type FC, useEffect, useState } from "react";
import {
  type DateTimeFields,
  type Era,
  parseAdDateText,
  parseAdTimeText,
  parseWireValue,
  toAdDateText,
  toAdTimeText,
  toWireValue,
} from "./date-format";
import * as S from "./styled";

type Props = {
  id: string;
  /** Raw backend wire value ("yyyy-MM-dd HH:mm:ss.SSSSSS", "BC"-prefixed for
   *  BC dates) or null when unset. */
  value: string | null;
  onChange: (value: string | null) => void;
};

type BcFieldKey = "day" | "month" | "year" | "hour" | "minute";
type BcFieldsState = Record<BcFieldKey, string>;

const EMPTY_BC_FIELDS: BcFieldsState = {
  day: "",
  hour: "",
  minute: "",
  month: "",
  year: "",
};

function bcFieldsFromParsed(parsed: DateTimeFields | null): BcFieldsState {
  if (!parsed || parsed.era !== "BC") return EMPTY_BC_FIELDS;
  return {
    day: String(parsed.day),
    hour: String(parsed.hour),
    minute: String(parsed.minute),
    month: String(parsed.month),
    year: String(parsed.year),
  };
}

const REQUIRED_BC_FIELDS: BcFieldKey[] = ["year"];

/** Year is the only required BC field — day, month, hour and minute are all
 *  optional and fall back to sensible defaults (1st of month one, midnight). */
function requiredBcFieldsFilled(fields: BcFieldsState): boolean {
  return REQUIRED_BC_FIELDS.every((key) => fields[key].trim() !== "");
}

/** Blank optional fields default so the wire value stays a valid date: day and
 *  month to 1, hour and minute to 0. */
function toBcNumbers(fields: BcFieldsState): Omit<DateTimeFields, "era"> {
  const numberOr = (raw: string, fallback: number) =>
    raw.trim() === "" ? fallback : Number(raw);
  return {
    day: numberOr(fields.day, 1),
    hour: numberOr(fields.hour, 0),
    minute: numberOr(fields.minute, 0),
    month: numberOr(fields.month, 1),
    year: numberOr(fields.year, 1),
  };
}

/**
 * Chapter dates can fall well before year 1, where a normal calendar grid
 * (weekdays, leap years) stops applying reliably. Date and time are always
 * split into separate inputs, and the time input is styled with a dashed
 * border and an "(optional)" label so it reads as skippable at a glance.
 */
export const DateTimePicker: FC<Props> = ({ id, value, onChange }) => {
  const initialParsed = parseWireValue(value);
  const initialAdParsed = initialParsed?.era === "AD" ? initialParsed : null;

  const [era, setEra] = useState<Era>(initialParsed?.era ?? "AD");
  const [adDateText, setAdDateText] = useState(
    initialAdParsed ? toAdDateText(initialAdParsed) : "",
  );
  const [adTimeText, setAdTimeText] = useState(
    initialAdParsed ? toAdTimeText(initialAdParsed) : "",
  );
  const [bcFields, setBcFields] = useState<BcFieldsState>(
    bcFieldsFromParsed(initialParsed),
  );

  useEffect(() => {
    const parsed = parseWireValue(value);
    const adParsed = parsed?.era === "AD" ? parsed : null;
    setEra(parsed?.era ?? "AD");
    setAdDateText(adParsed ? toAdDateText(adParsed) : "");
    setAdTimeText(adParsed ? toAdTimeText(adParsed) : "");
    setBcFields(bcFieldsFromParsed(parsed));
  }, [value]);

  const adDateIsInvalid = adDateText.length > 0 && !parseAdDateText(adDateText);
  const adTimeIsInvalid = adTimeText.length > 0 && !parseAdTimeText(adTimeText);

  const commitAd = (dateText: string, timeText: string) => {
    const dateFields = parseAdDateText(dateText);
    const timeFields = parseAdTimeText(timeText);
    onChange(
      dateFields && timeFields
        ? toWireValue({ ...dateFields, ...timeFields, era: "AD" })
        : null,
    );
  };

  const handleEraChange = (nextEra: Era) => {
    setEra(nextEra);
    if (nextEra === "BC") {
      onChange(
        requiredBcFieldsFilled(bcFields)
          ? toWireValue({ ...toBcNumbers(bcFields), era: "BC" })
          : null,
      );
    } else {
      commitAd(adDateText, adTimeText);
    }
  };

  const handleAdDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setAdDateText(text);
    commitAd(text, adTimeText);
  };

  const handleAdTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setAdTimeText(text);
    commitAd(adDateText, text);
  };

  const handleBcFieldChange = (key: BcFieldKey, rawValue: string) => {
    const nextFields = { ...bcFields, [key]: rawValue };
    setBcFields(nextFields);
    onChange(
      requiredBcFieldsFilled(nextFields)
        ? toWireValue({ ...toBcNumbers(nextFields), era: "BC" })
        : null,
    );
  };

  const eraToggle = (
    <S.EraToggle role="radiogroup" aria-label="Era">
      <S.EraOption $active={era === "AD"}>
        <input
          type="radio"
          name={`${id}-era`}
          checked={era === "AD"}
          onChange={() => handleEraChange("AD")}
        />
        AD
      </S.EraOption>
      <S.EraOption $active={era === "BC"}>
        <input
          type="radio"
          name={`${id}-era`}
          checked={era === "BC"}
          onChange={() => handleEraChange("BC")}
        />
        BC
      </S.EraOption>
    </S.EraToggle>
  );

  return (
    <S.Wrap>
      {era === "AD" ? (
        <>
          {/* Line 1: date + era switch */}
          <S.Row>
            <S.TextInput
              id={id}
              type="text"
              inputMode="numeric"
              placeholder="dd-mm-yyyy"
              aria-label="Date (dd-mm-yyyy)"
              value={adDateText}
              aria-invalid={adDateIsInvalid}
              onChange={handleAdDateChange}
            />
            {eraToggle}
          </S.Row>
          {/* Line 2: time */}
          <S.Row>
            <S.TextInput
              id={`${id}-time`}
              type="text"
              inputMode="numeric"
              placeholder="hh:mm (optional)"
              aria-label="Time (optional)"
              value={adTimeText}
              aria-invalid={adTimeIsInvalid}
              $optional
              onChange={handleAdTimeChange}
            />
          </S.Row>
          {adDateIsInvalid && (
            <S.ErrorText>Date must be in dd-mm-yyyy format</S.ErrorText>
          )}
          {adTimeIsInvalid && (
            <S.ErrorText>Time must be in hh:mm format</S.ErrorText>
          )}
        </>
      ) : (
        <>
          {/* Line 1: year (required) + optional month/day + era switch */}
          <S.Row>
            <S.NumberInput
              id={id}
              type="number"
              inputMode="numeric"
              min={1}
              max={999999}
              placeholder="Year"
              aria-label="Year"
              value={bcFields.year}
              $wide
              onChange={(e) => handleBcFieldChange("year", e.target.value)}
            />
            <S.NumberInput
              id={`${id}-month`}
              type="number"
              inputMode="numeric"
              min={0}
              max={12}
              placeholder="Mth"
              aria-label="Month (optional)"
              value={bcFields.month}
              $optional
              onChange={(e) => handleBcFieldChange("month", e.target.value)}
            />
            <S.NumberInput
              id={`${id}-day`}
              type="number"
              inputMode="numeric"
              min={0}
              max={31}
              placeholder="Day"
              aria-label="Day (optional)"
              value={bcFields.day}
              $optional
              onChange={(e) => handleBcFieldChange("day", e.target.value)}
            />
            {eraToggle}
          </S.Row>
          {/* Line 2: time */}
          <S.Row>
            <S.NumberInput
              id={`${id}-hour`}
              type="number"
              inputMode="numeric"
              min={0}
              max={23}
              placeholder="Hour"
              aria-label="Hour (optional)"
              value={bcFields.hour}
              $optional
              onChange={(e) => handleBcFieldChange("hour", e.target.value)}
            />
            <S.NumberInput
              id={`${id}-minute`}
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              placeholder="Min"
              aria-label="Minute (optional)"
              value={bcFields.minute}
              $optional
              onChange={(e) => handleBcFieldChange("minute", e.target.value)}
            />
          </S.Row>
        </>
      )}
    </S.Wrap>
  );
};
