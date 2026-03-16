import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image, SafeAreaView, Platform } from 'react-native';
import { MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
    const [voiceFeedback, setVoiceFeedback] = useState(true);
    const [gestureControl, setGestureControl] = useState(false);
    const [noiseSuppression, setNoiseSuppression] = useState(true);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Settings',
            headerStyle: { backgroundColor: '#000000' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 20 },
            headerRight: () => (
                <TouchableOpacity style={{ marginRight: 16 }}>
                    <Feather name="help-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleLogout = () => {
        navigation.replace('Login');
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Profile Section */}
                <View style={styles.profileCard}>
                    <View style={styles.profileImageContainer}>
                        {/* Placeholder for Profile Image */}
                        <View style={styles.profileImagePlaceholder}>
                            <MaterialIcons name="person" size={40} color="#A0AEC0" />
                        </View>
                        <TouchableOpacity style={styles.editProfileBadge}>
                            <MaterialIcons name="edit" size={14} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>Chef Julian</Text>
                        <Text style={styles.profileSubtitle}>Pro Member •</Text>
                        <Text style={styles.profileEmail}>julian@cookalong.ai</Text>
                    </View>
                </View>

                {/* AI Voice Settings */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>AI VOICE SETTINGS</Text>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <MaterialIcons name="record-voice-over" size={20} color="#FF6B6B" />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingLabel}>Assistant Voice</Text>
                            <Text style={styles.settingSubLabel}>Currently: "Warm Kitchen"</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#666" />
                    </TouchableOpacity>

                    <View style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <MaterialIcons name="volume-up" size={20} color="#FF6B6B" />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingLabel}>Voice Feedback</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#333", true: "#FF6B6B" }}
                            thumbColor={"#FFF"}
                            ios_backgroundColor="#333"
                            onValueChange={setVoiceFeedback}
                            value={voiceFeedback}
                        />
                    </View>
                </View>

                {/* Camera & Audio */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>CAMERA & AUDIO</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <MaterialIcons name="videocam" size={20} color="#FF6B6B" />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingLabel}>Gesture Control</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#333", true: "#FF6B6B" }}
                            thumbColor={"#FFF"}
                            ios_backgroundColor="#333"
                            onValueChange={setGestureControl}
                            value={gestureControl}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <MaterialIcons name="mic" size={20} color="#FF6B6B" />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingLabel}>Noise Suppression</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#333", true: "#FF6B6B" }}
                            thumbColor={"#FFF"}
                            ios_backgroundColor="#333"
                            onValueChange={setNoiseSuppression}
                            value={noiseSuppression}
                        />
                    </View>
                </View>

                {/* App Preferences */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>APP PREFERENCES</Text>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <MaterialIcons name="straighten" size={20} color="#FF6B6B" />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingLabel}>Measurement Units</Text>
                        </View>
                        <Text style={styles.settingValueText}>Metric (kg, ml)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <MaterialIcons name="notifications-active" size={20} color="#FF6B6B" />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingLabel}>Cooking Reminders</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <MaterialIcons name="language" size={20} color="#FF6B6B" />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingLabel}>Language</Text>
                        </View>
                        <Text style={styles.settingValueText}>English</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialIcons name="logout" size={20} color="#A0AEC0" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>COOKALONG V2.4.0 • BUILT WITH AI</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: '#000000' },
    container: { flex: 1, paddingHorizontal: 20 },

    // Profile Section
    profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111111', borderRadius: 24, padding: 20, marginTop: 20, marginBottom: 32, borderWidth: 1, borderColor: '#222222' },
    profileImageContainer: { position: 'relative', marginRight: 20 },
    profileImagePlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FF6B6B' },
    editProfileBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FF6B6B', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#111' },
    profileInfo: { flex: 1 },
    profileName: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 22, color: '#FFFFFF', marginBottom: 4 },
    profileSubtitle: { fontFamily: 'SpaceGrotesk-Regular', fontSize: 14, color: '#A0AEC0', marginBottom: 2 },
    profileEmail: { fontFamily: 'SpaceGrotesk-Regular', fontSize: 14, color: '#A0AEC0' },

    // Sections
    sectionContainer: { marginBottom: 32 },
    sectionTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: '#A0AEC0', letterSpacing: 1.2, marginBottom: 16, marginLeft: 8 },

    // Setting Item
    settingItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 8 },
    settingIconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,107,107,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    settingTextContainer: { flex: 1 },
    settingLabel: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: '#FFFFFF', marginBottom: 2 },
    settingSubLabel: { fontFamily: 'SpaceGrotesk-Regular', fontSize: 13, color: '#666666' },
    settingValueText: { fontFamily: 'SpaceGrotesk-Regular', fontSize: 15, color: '#A0AEC0' },

    // Logout Button
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', borderRadius: 30, height: 60, borderWidth: 1, borderColor: '#222222', marginTop: 16, marginBottom: 32 },
    logoutButtonText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: '#A0AEC0' },

    // Footer
    footerContainer: { alignItems: 'center', marginBottom: 20 },
    footerText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: '#444444', letterSpacing: 1.5 },
});
