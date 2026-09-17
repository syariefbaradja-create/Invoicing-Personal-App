import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 90,
    fontFamily: "Helvetica-Bold",
    color: "#94A3B8",
    opacity: 0.18,
    transform: "rotate(-35deg)",
  },
});

export function Watermark({ text }: { text: string }) {
  return (
    <View style={styles.container} fixed>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
