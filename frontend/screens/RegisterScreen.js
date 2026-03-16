import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';

const API_URL = 'https://api.cookalong.app';

export default function RegisterScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Registration successful. Please login.');
                navigation.goBack();
            } else {
                Alert.alert('Registration Failed', data.detail || 'Unknown error');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.innerContainer}>
                        <View style={styles.heroSection}>
                            <Text style={styles.title}>Join CookAlong.</Text>
                            <Text style={styles.subtitle}>Create an account to start your culinary journey.</Text>
                        </View>

                        <View style={styles.formSection}>
                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconContainer}>
                                    <MaterialIcons name="person-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email or Username"
                                        placeholderTextColor="#A0AEC0"
                                        value={username}
                                        onChangeText={setUsername}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconContainer}>
                                    <MaterialIcons name="lock-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { paddingRight: 50 }]}
                                        placeholder="Password"
                                        placeholderTextColor="#A0AEC0"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                        <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={20} color="#A0AEC0" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
                                <Text style={styles.primaryButtonText}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or sign up with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.socialContainer}>
                            <TouchableOpacity style={styles.socialButton}>
                                <FontAwesome5 name="google" size={18} color="#FFF" style={{ marginRight: 10 }} />
                                <Text style={styles.socialButtonText}>Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <AntDesign name="apple1" size={18} color="#FFF" style={{ marginRight: 10 }} />
                                <Text style={styles.socialButtonText}>Apple</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footerContainer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.footerLink}>Log in</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 16 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    innerContainer: { flex: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'center', maxWidth: 480, width: '100%', alignSelf: 'center' },

    heroSection: { marginBottom: 48, marginTop: 20 },
    title: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 36, color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 8 },
    subtitle: { fontFamily: 'SpaceGrotesk-Regular', fontSize: 16, color: '#A0AEC0', lineHeight: 24 },

    formSection: { width: '100%', marginBottom: 32 },
    inputGroup: { marginBottom: 16 },
    inputIconContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 30, borderWidth: 1, borderColor: '#333333' },
    inputIcon: { paddingLeft: 20, paddingRight: 10 },
    input: { flex: 1, height: 60, color: '#FFFFFF', fontFamily: 'SpaceGrotesk-Regular', fontSize: 16, paddingRight: 20 },
    eyeIcon: { position: 'absolute', right: 20, padding: 5 },

    primaryButton: { marginTop: 16, backgroundColor: '#FFFFFF', height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    primaryButtonText: { fontFamily: 'SpaceGrotesk-Bold', color: '#000000', fontSize: 16 },

    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#333333' },
    dividerText: { fontFamily: 'SpaceGrotesk-Regular', color: '#666666', fontSize: 14, marginHorizontal: 16 },

    socialContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
    socialButton: { flex: 1, height: 56, backgroundColor: '#1A1A1A', borderRadius: 28, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333333' },
    socialButtonText: { fontFamily: 'SpaceGrotesk-Bold', color: '#FFFFFF', fontSize: 15 },

    footerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
    footerText: { fontFamily: 'SpaceGrotesk-Regular', color: '#A0AEC0', fontSize: 15 },
    footerLink: { fontFamily: 'SpaceGrotesk-Bold', color: '#FFFFFF', fontSize: 15 }
});
