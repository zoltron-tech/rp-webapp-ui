import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/text";
import { env } from "@/lib/env";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's FAQs page. The same two questions, with the steps written for this
 * app: web's answers walk through a mouse and a top-right avatar.
 */
const FAQS = [
  {
    question: "How to add or edit characters?",
    steps: [
      "Open the menu from the three lines in the top right corner.",
      "Tap Characters. You will see the list of all your characters.",
      "To add a new character, tap the add button at the top of the list.",
      "To edit a character, open it and tap the pencil, or choose Edit from its menu.",
      "To delete a character, open its More section and tap Delete.",
    ],
  },
  {
    question: "How to edit my profile information?",
    steps: [
      "Open the menu from the three lines in the top right corner.",
      "Choose what you want to change under Edit profile.",
      "You can change your first and last name, and tap your avatar to set a new one.",
      "Your note is what appears next to your avatar on your profile.",
      "You can share something about yourself in About.",
      "You can select your theme under Appearance. This is for your eyes only: the app is personalised just for you.",
    ],
  },
];

export default function FaqsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <Text style={[styles.intro, { color: theme.textGray }]}>
        Answers to common questions about Novelist World.
        {env.SUPPORT_EMAIL ? " If you need more help, contact us at " : ""}
        {env.SUPPORT_EMAIL ? (
          <Text
            accessibilityRole="link"
            onPress={() => void Linking.openURL(`mailto:${env.SUPPORT_EMAIL}`)}
            style={{ color: theme.accent.text }}
          >
            {env.SUPPORT_EMAIL}
          </Text>
        ) : null}
        {env.SUPPORT_EMAIL ? "." : ""}
      </Text>

      {FAQS.map((faq, index) => {
        const expanded = open === index;
        return (
          <View
            key={faq.question}
            style={[
              styles.item,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setOpen(expanded ? null : index)}
              style={styles.question}
            >
              <Text style={[styles.questionLabel, { color: theme.text }]}>
                {faq.question}
              </Text>
              <Ionicons
                color={theme.textGray}
                name={expanded ? "chevron-up" : "chevron-down"}
                size={18}
              />
            </Pressable>
            {expanded ? (
              <View style={styles.steps}>
                {faq.steps.map((step, number) => (
                  <View key={step} style={styles.step}>
                    <Text
                      style={[styles.stepNumber, { color: theme.accent.text }]}
                    >
                      {number + 1}.
                    </Text>
                    <Text style={[styles.stepText, { color: theme.text }]}>
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.m, padding: space.md },
  intro: { fontSize: fontSize.body, lineHeight: 21 },
  item: {
    borderRadius: radius.card,
    borderWidth: border.edge,
    overflow: "hidden",
  },
  question: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.m,
    justifyContent: "space-between",
    padding: space.md,
  },
  questionLabel: { flex: 1, fontSize: fontSize.lead, fontWeight: "600" },
  step: { flexDirection: "row", gap: space.sm },
  stepNumber: {
    fontSize: fontSize.body,
    fontWeight: "700",
    lineHeight: 21,
    width: 20,
  },
  stepText: { flex: 1, fontSize: fontSize.body, lineHeight: 21 },
  steps: { gap: space.sm, paddingBottom: space.md, paddingHorizontal: space.md },
});
