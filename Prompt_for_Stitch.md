# Prompt for UI Generation (Stitch)

**Context:**
You are building the UI for an Expo React Native application called "CookAlong". CookAlong is a live AI cooking coach powered by the Gemini Live API. The app uses the device's camera to "see" the kitchen and microphone to "hear" the user, providing real-time, interruptible voice guidance while cooking.

**Goal:**
Generate a highly polished, minimalistic, and modern user interface for the main application screen (`App.js` or `App.tsx`). The UI must be clean, distraction-free, and feel native to iOS and Android.

**Design System & Theme (Minimalistic):**
- **Colors:** Deep, immersive dark mode by default.
  - Background: Solid Black (`#000000`) or very dark gray (`#121212`).
  - Primary Accent: A vibrant, appetizing color like Coral Red (`#FF6B6B`) or Fresh Green (`#4CAF50`) used sparingly for active states (e.g., "Live" indicator, "Start Cooking" button).
  - Text/Icons: Pure White (`#FFFFFF`) or light gray (`#E0E0E0`) for maximum contrast.
  - Overlays: Semi-transparent black/gray (`rgba(0,0,0,0.6)`) to ensure text readability over the camera feed.
- **Typography:** Modern, sans-serif, clean fonts (e.g., System font, San Francisco, Roboto). Use bold weights for active status indicators and light/regular weights for secondary text.
- **Shapes:** Soft, rounded corners for buttons and floating pill-shaped containers (`borderRadius: 20` or `30`). No harsh sharp edges.

**Layout & Required Components:**

The entire screen should be a full-screen camera view (`CameraView` from `expo-camera`). All UI elements should float seamlessly *on top* of the camera feed using absolute positioning, creating an immersive AR-like experience.

1.  **Top Navigation / Status Bar (Floating Pill):**
    - Positioned at the top center of the screen (respecting safe area insets).
    - A pill-shaped, semi-transparent container.
    - Inside, it should display the current connection/session status.
    - **States to represent:**
      - "Connecting..." (Gray/Yellow indicator)
      - "Connected" (Green dot indicator)
      - "Agent Listening" (Animated subtle glow or mic icon)
      - "Agent Speaking" (Animated audio wave or speaker icon)

2.  **Recipe Selector (Pre-Cooking State):**
    - When the session is *not* active, show a clean, minimalistic modal or bottom sheet overlay.
    - It should allow the user to select a recipe from a small list (e.g., "Spaghetti Carbonara", "Avocado Toast", "Custom").
    - Use simple, large, touch-friendly list items or cards.

3.  **Bottom Controls (Floating Action Area):**
    - Positioned at the bottom center of the screen.
    - **Main Action Button:** A large, prominent, circular or pill-shaped button.
      - **State 1 (Idle):** Text says "Start Cooking" with a solid accent color background (e.g., Green).
      - **State 2 (Active):** Text says "Stop Session" or a simple square "Stop" icon, with a subtle dark background and red border.
    - **Secondary Buttons:** Smaller, circular icon buttons on either side of the main action button (e.g., a gear icon for settings, a mic mute toggle).

4.  **Feedback Overlay (Optional but nice):**
    - A very subtle text overlay near the bottom (above the controls) that occasionally shows what the agent understood or is currently doing (e.g., "Recognized: 'I don't have soy sauce'").

**Technical Requirements for Stitch:**
- Write valid Expo React Native code (React hooks, `StyleSheet.create`).
- Assume the use of `expo-camera` for the background. You can use a placeholder `<View style={{flex: 1, backgroundColor: '#333'}} />` if you cannot render the actual camera component, but structure it so the camera *would* be there.
- Use `@expo/vector-icons` (e.g., Ionicons or MaterialIcons) for all iconography (mic, speaker, settings, stop).
- Use `SafeAreaView` from `react-native-safe-area-context` to handle notches and bezels properly.
- Ensure the layout uses Flexbox and absolute positioning correctly to overlay the UI on the camera feed.
- Provide smooth, native-feeling styling (shadows, elevation, blur effects if possible using `expo-blur`).

**Example Structure to Generate:**
```javascript
<View style={{ flex: 1, backgroundColor: 'black' }}>
  {/* Full screen camera */}
  <CameraView style={StyleSheet.absoluteFillObject} />

  {/* Floating UI Overlay */}
  <SafeAreaView style={styles.overlayContainer}>

      {/* Top Status Pill */}
      <View style={styles.statusPill}>... </View>

      {/* Middle Spacer / Subtitles */}
      <View style={styles.middleArea}>... </View>

      {/* Bottom Controls */}
      <View style={styles.controlsRow}>... </View>

  </SafeAreaView>
</View>
```

Make it look like a premium, 2026-era AI consumer app!
