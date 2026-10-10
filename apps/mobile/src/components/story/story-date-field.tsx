import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/text";
import { readStoryTime, writeStoryTime } from "@/lib/story";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * When a chapter happens — web's `DateTimePicker`.
 *
 * An in-story date is the authors' own and can fall well before year 1, where
 * a calendar grid (weekdays, leap years) stops meaning anything; so this is
 * typed, not picked, exactly as on web. AD is one field that formats itself
 * as `dd-mm-yyyy` from digits alone — a number pad has no dash. BC is a year
 * with an optional month and day. Time is opt-in: left off, it is midnight,
 * which every reader of the value shows as no time at all.
 *
 * Reports the backend's wire value, or null while what is typed is not yet a
 * date. Seeded from `initial` once; give it a `key` to re-seed.
 */
const digits = (raw: string, max: number) => raw.replace(/\D/g, "").slice(0, max);

const formatDate = (raw: string) => {
  const d = digits(raw, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join("-");
};

const formatTime = (raw: string) => {
  const d = digits(raw, 4);
  return [d.slice(0, 2), d.slice(2, 4)].filter(Boolean).join(":");
};

const pad = (n: number, width = 2) => String(n).padStart(width, "0");

/** Ranges only, not days-in-month: enough to catch a typo. */
const parseDate = (text: string) => {
  const match = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { day, month, year: Number(match[3]) };
};

const parseTime = (text: string) => {
  if (!text) return { hour: 0, minute: 0 };
  const match = text.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour > 23 || minute > 59 ? null : { hour, minute };
};

interface Draft {
  bc: boolean;
  bcDay: string;
  bcMonth: string;
  bcYear: string;
  date: string;
  hasTime: boolean;
  time: string;
}

const wireOf = (draft: Draft): string | null => {
  const time = parseTime(draft.hasTime ? draft.time : "");
  if (!time) return null;
  if (!draft.bc) {
    const date = parseDate(draft.date);
    return date ? writeStoryTime({ ...date, ...time, bc: false }) : null;
  }
  if (!draft.bcYear.trim()) return null;
  const month = Number(draft.bcMonth) || 1;
  const day = Number(draft.bcDay) || 1;
  if (month > 12 || day > 31) return null;
  return writeStoryTime({
    ...time,
    bc: true,
    day,
    month,
    year: Number(draft.bcYear) || 1,
  });
};

export const StoryDateField = ({
  initial,
  onChange,
}: {
  initial: string | null;
  onChange: (value: string | null) => void;
}) => {
  const theme = useAppTheme();

  const [draft, setDraft] = useState<Draft>(() => {
    const parsed = readStoryTime(initial);
    const timed = Boolean(parsed && (parsed.hour !== 0 || parsed.minute !== 0));
    return {
      bc: parsed?.bc ?? false,
      bcDay: parsed?.bc ? String(parsed.day) : "",
      bcMonth: parsed?.bc ? String(parsed.month) : "",
      bcYear: parsed?.bc ? String(parsed.year) : "",
      date:
        parsed && !parsed.bc
          ? `${pad(parsed.day)}-${pad(parsed.month)}-${pad(parsed.year, 4)}`
          : "",
      hasTime: timed,
      time: parsed && timed ? `${pad(parsed.hour)}:${pad(parsed.minute)}` : "",
    };
  });

  const update = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    onChange(wireOf(next));
  };

  const dateInvalid = !draft.bc && draft.date.length > 0 && !parseDate(draft.date);
  const timeInvalid =
    draft.hasTime && draft.time.length > 0 && !parseTime(draft.time);

  const field = (invalid = false) => [
    styles.input,
    {
      backgroundColor: theme.glass.field,
      borderColor: invalid ? theme.error : theme.glass.fieldEdge,
      color: theme.text,
    },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        {draft.bc ? (
          <>
            <TextInput
              accessibilityLabel="Year"
              keyboardType="number-pad"
              onChangeText={(text) => update({ bcYear: digits(text, 6) })}
              placeholder="Year"
              placeholderTextColor={theme.textGray}
              style={[field(), styles.grow]}
              value={draft.bcYear}
            />
            <TextInput
              accessibilityLabel="Month, optional"
              keyboardType="number-pad"
              onChangeText={(text) => update({ bcMonth: digits(text, 2) })}
              placeholder="Mth"
              placeholderTextColor={theme.textGray}
              style={[field(Number(draft.bcMonth) > 12), styles.small]}
              value={draft.bcMonth}
            />
            <TextInput
              accessibilityLabel="Day, optional"
              keyboardType="number-pad"
              onChangeText={(text) => update({ bcDay: digits(text, 2) })}
              placeholder="Day"
              placeholderTextColor={theme.textGray}
              style={[field(Number(draft.bcDay) > 31), styles.small]}
              value={draft.bcDay}
            />
          </>
        ) : (
          <TextInput
            accessibilityLabel="Date, day month year"
            keyboardType="number-pad"
            onChangeText={(text) => update({ date: formatDate(text) })}
            placeholder="dd-mm-yyyy"
            placeholderTextColor={theme.textGray}
            style={[field(dateInvalid), styles.grow]}
            value={draft.date}
          />
        )}

        <View
          accessibilityRole="radiogroup"
          style={[
            styles.era,
            {
              backgroundColor: theme.glass.fillHover,
              borderColor: theme.glass.edge,
            },
          ]}
        >
          {(["AD", "BC"] as const).map((era) => {
            const on = draft.bc === (era === "BC");
            return (
              <Pressable
                accessibilityLabel={era}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                key={era}
                onPress={() => update({ bc: era === "BC" })}
                style={[
                  styles.eraOption,
                  on && { backgroundColor: theme.accent.surfaceActive },
                ]}
              >
                <Text
                  style={[
                    styles.eraLabel,
                    { color: on ? theme.accent.textStrong : theme.textGray },
                  ]}
                >
                  {era}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.row}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: draft.hasTime }}
          hitSlop={space.sm}
          onPress={() => update({ hasTime: !draft.hasTime, time: "" })}
          style={styles.toggle}
        >
          <Ionicons
            color={draft.hasTime ? theme.accent.text : theme.textGray}
            name={draft.hasTime ? "checkbox" : "square-outline"}
            size={20}
          />
          <Text style={[styles.toggleLabel, { color: theme.text }]}>
            Add a time
          </Text>
        </Pressable>
        {draft.hasTime ? (
          <TextInput
            accessibilityLabel="Time, hours and minutes"
            keyboardType="number-pad"
            onChangeText={(text) => update({ time: formatTime(text) })}
            placeholder="hh:mm"
            placeholderTextColor={theme.textGray}
            style={[field(timeInvalid), styles.time]}
            value={draft.time}
          />
        ) : null}
      </View>

      {dateInvalid ? (
        <Text style={[styles.error, { color: theme.error }]}>
          Date must be in dd-mm-yyyy format
        </Text>
      ) : null}
      {timeInvalid ? (
        <Text style={[styles.error, { color: theme.error }]}>
          Time must be in hh:mm format
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  era: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    padding: 2,
  },
  eraLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  eraOption: {
    alignItems: "center",
    borderRadius: radius.full,
    justifyContent: "center",
    minHeight: 36,
    minWidth: 44,
  },
  error: { fontSize: fontSize.caption },
  grow: { flex: 1, minWidth: 0 },
  input: {
    borderRadius: radius.field,
    borderWidth: border.edge,
    fontSize: fontSize.input,
    minHeight: 44,
    paddingHorizontal: space.m,
    paddingVertical: space.sm,
  },
  root: { gap: space.sm },
  row: { alignItems: "center", flexDirection: "row", gap: space.sm },
  small: { textAlign: "center", width: 62 },
  time: { textAlign: "center", width: 92 },
  toggle: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: space.sm,
    minHeight: 44,
  },
  toggleLabel: { fontSize: fontSize.body },
});
