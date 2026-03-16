import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { WebSocketService } from '../services/websocket';
import { AudioService } from '../services/audio';
import { Theme } from '../theme';

export default function CookingScreen({ route, navigation }) {
  const passedRecipeId = route?.params?.recipeId || "spaghetti-carbonara";

  const [permission, requestPermission] = useCameraPermissions();
  const [audioPermissionResponse, requestAudioPermission] = Audio.usePermissions();
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [agentState, setAgentState] = useState("disconnected");
  const [recipeId, setRecipeId] = useState(passedRecipeId);
  const [isMuted, setIsMuted] = useState(false);

  const cameraRef = useRef(null);
  const wsService = useRef(new WebSocketService());
  const audioService = useRef(new AudioService(wsService.current));

  // Hide the standard navigation header for this screen to make it immersive
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) await requestPermission();
      if (!audioPermissionResponse?.granted) await requestAudioPermission();
    })();
  }, []);

  useEffect(() => {
    const ws = wsService.current;
    ws.onConnect = () => setIsConnected(true);
    ws.onDisconnect = () => setIsConnected(false);
    ws.onMessage = (data) => {
       if (data instanceof ArrayBuffer) {
           audioService.current.playAudioChunk(data);
       } else if (typeof data === 'string') {
           try {
               const parsed = JSON.parse(data);
               if (parsed.type === 'interruption' && parsed.action === 'clear_buffer') {
                   audioService.current.clearPlaybackBuffer();
               } else if (parsed.type === 'agent_state') {
                   setAgentState(parsed.state);
               }
           } catch(e) {
               console.error("Error parsing message", e);
           }
       }
    };
    return () => {
      ws.disconnect();
      audioService.current.stopRecording();
    };
  }, []);

  const toggleConnection = () => {
    if (isConnected) {
      wsService.current.disconnect();
    } else {
      wsService.current.connect('wss://api.cookalong.app/ws');
    }
  };

  const toggleSession = async () => {
    if (!isConnected) {
        Alert.alert("Error", "Connect to server first using the connection icon.");
        return;
    }

    if (isSessionActive) {
      wsService.current.sendControlMessage('stop_session', null);
      setIsSessionActive(false);
      setAgentState("disconnected");
      audioService.current.stopRecording();
    } else {
      wsService.current.sendControlMessage('start_session', recipeId);
      setIsSessionActive(true);
      setAgentState("connecting...");
      await audioService.current.startRecording();
      startVisionLoop();
    }
  };

  const startVisionLoop = () => {
    const interval = setInterval(async () => {
       if (!isSessionActive || !cameraRef.current) {
           clearInterval(interval);
           return;
       }
       try {
           const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
           if (photo && photo.base64) {
               wsService.current.sendImageFrame(photo.base64);
           }
       } catch (e) {
           console.log("Camera capture error:", e);
       }
    }, 1000);
  };

  if (!permission || !audioPermissionResponse) {
    return <View style={styles.container} />;
  }

  if (!permission.granted || !audioPermissionResponse.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', padding: 20 }]}>
        <Text style={{ textAlign: 'center', color: Theme.colors.textPrimary, marginBottom: 20, fontFamily: 'SpaceGrotesk-Regular' }}>
          We need camera and microphone permissions to use the app.
        </Text>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: Theme.colors.success }]}
          onPress={async () => {
            if (!permission?.granted) await requestPermission();
            if (!audioPermissionResponse?.granted) await requestAudioPermission();
          }}
        >
          <Text style={styles.primaryButtonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusText = () => {
      if (agentState === 'speaking') return 'Agent Speaking...';
      if (agentState === 'listening') return 'Listening...';
      if (agentState === 'thinking (tool)') return 'Analyzing...';
      if (agentState === 'connecting...') return 'Connecting...';
      if (isConnected) return 'Ready to Cook';
      return 'Disconnected';
  };

  const getStatusColor = () => {
      if (agentState === 'speaking') return Theme.colors.success; // Green
      if (agentState === 'listening') return '#2196F3'; // Blue
      if (agentState === 'thinking (tool)') return '#FFC107'; // Yellow
      if (isConnected) return Theme.colors.success; // Green
      return Theme.colors.primary; // Red
  };

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef} facing="back" />

      {/* Top Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'transparent']}
        style={styles.topGradient}
      />

      {/* Bottom Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.bottomGradient}
      />

      <SafeAreaView style={styles.overlayContainer}>
        {/* Top Navigation / Status Bar */}
        <View style={styles.topContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
             <MaterialIcons name="close" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.statusPill}>
             <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
             <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>

          <TouchableOpacity onPress={toggleConnection} style={styles.iconCircle}>
             <MaterialIcons name={isConnected ? "wifi" : "wifi-off"} size={20} color={isConnected ? Theme.colors.success : Theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Middle Area: AR Overlay */}
        <View style={styles.arOverlayContainer}>
           <BlurView intensity={20} tint="dark" style={styles.arCard}>
             <View style={styles.arHeader}>
                <MaterialIcons name="restaurant-menu" size={20} color={Theme.colors.success} />
                <Text style={styles.arStepText}>Step 3 of 8</Text>
             </View>
             <Text style={styles.arInstruction}>Dice the onions finely and mince the garlic cloves.</Text>

             <View style={styles.ingredientsList}>
               <View style={styles.ingredientBadge}>
                 <Text style={styles.ingredientText}>1 Medium Onion</Text>
               </View>
               <View style={styles.ingredientBadge}>
                 <Text style={styles.ingredientText}>2 Garlic Cloves</Text>
               </View>
             </View>
           </BlurView>
        </View>

        {/* Bottom Area: Subtitles and Controls */}
        <View style={styles.bottomArea}>
            <View style={styles.subtitleContainer}>
                <Text style={styles.subtitleText}>
                    "I see you have the onions ready. Let's start by dicing them finely, keeping the root intact for easier chopping."
                </Text>
            </View>

            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.iconCircleLarge}>
                 <MaterialIcons name="help-outline" size={28} color={Theme.colors.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                 style={[styles.mainActionButton, isSessionActive ? styles.actionActive : styles.actionIdle]}
                 onPress={toggleSession}
              >
                 <MaterialIcons name={isSessionActive ? "stop" : "mic"} size={36} color={Theme.colors.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconCircleLarge} onPress={() => setIsMuted(!isMuted)}>
                 <MaterialIcons name={isMuted ? "mic-off" : "mic"} size={28} color={isMuted ? Theme.colors.primary : Theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusText: {
    color: Theme.colors.textPrimary,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 14,
  },
  arOverlayContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.md,
  },
  arCard: {
    borderRadius: Theme.borderRadius.large,
    padding: Theme.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  arHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  arStepText: {
    color: Theme.colors.success,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 14,
    marginLeft: Theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  arInstruction: {
    color: Theme.colors.textPrimary,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
    lineHeight: 32,
    marginBottom: Theme.spacing.md,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ingredientText: {
    color: Theme.colors.textPrimary,
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 14,
  },
  bottomArea: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
  },
  subtitleContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.large,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  subtitleText: {
    color: Theme.colors.textPrimary,
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  iconCircleLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mainActionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  actionIdle: {
    backgroundColor: Theme.colors.success,
  },
  actionActive: {
    backgroundColor: Theme.colors.primary,
  },
  primaryButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Theme.colors.textPrimary,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
  }
});
