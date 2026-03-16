import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    Image,
    Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { API_URL } from '../config';

const CORAL = '#FF6B6B';

export default function DashboardScreen({ route, navigation }) {
    const token = route?.params?.token;
    const [recipes, setRecipes] = useState([]);
    const [quickInput, setQuickInput] = useState('');
    const [isStarting, setIsStarting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        setIsLoading(true);
        try {
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(`${API_URL}/recipes/`, { headers });
            if (response.ok) {
                const data = await response.json();
                setRecipes(data);
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const isUrl = (str) => {
        const trimmed = str.trim();
        return trimmed.startsWith('http://') || trimmed.startsWith('https://');
    };

    const handleStartQuickCook = async () => {
        const input = quickInput.trim();
        if (!input) {
            Alert.alert('Enter something', 'Paste a recipe URL, or type a dish name (e.g. "Spaghetti Carbonara") or description (e.g. "quick pasta with eggs")');
            return;
        }
        setIsStarting(true);
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const body = isUrl(input) ? { url: input } : { query: input };
            const response = await fetch(`${API_URL}/recipes/quick-cook`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const data = await response.json();
                setQuickInput('');
                fetchRecipes();
                navigation.navigate('Cooking', { recipeId: data.id });
            } else {
                const err = await response.json();
                Alert.alert('Failed', err.detail || 'Could not fetch or generate recipe. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Check that the backend is running.');
        } finally {
            setIsStarting(false);
        }
    };

    const recentActivity = [
        { id: '1', title: 'Truffle Risotto', status: 'Completed • 45 mins', time: '2h ago' },
        { id: '2', title: 'Miso Glazed Salmon', status: 'Completed • 25 mins', time: 'Yesterday' },
    ];

    const recommended = recipes.length > 0 ? recipes.slice(0, 4) : [
        { id: 'spaghetti-carbonara', title: 'Spaghetti Carbonara', description: 'Classic Italian pasta', time: '15m', difficulty: 'Easy' },
        { id: 'harvest-bowl', title: 'Harvest Buddha Bowl', description: 'Grains, avocado, egg', time: '15m', difficulty: 'Easy' },
    ];

    const renderRecipeCard = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.recipeCard}
            onPress={() => navigation.navigate('Cooking', { recipeId: item.id })}
            activeOpacity={0.8}
        >
            <View style={styles.recipeCardImage} />
            <Text style={styles.recipeCardTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.recipeMeta}>
                <Text style={styles.recipeMetaText}>{item.time || '15m'}</Text>
                <Text style={styles.recipeMetaText}> • </Text>
                <Text style={styles.recipeMetaText}>{item.difficulty || 'Easy'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.avatar, { backgroundColor: '#333' }]}>
                            <MaterialIcons name="person" size={24} color="#888" />
                        </View>
                        <View>
                            <Text style={styles.proLevel}>PRO LEVEL</Text>
                            <Text style={styles.brand}>CookAlong</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <MaterialIcons name="search" size={24} color="#A0AEC0" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
                            <MaterialIcons name="notifications-none" size={24} color="#A0AEC0" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Welcome */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.welcomeName}>Chef Julian</Text>
                    <Text style={styles.welcomeSub}>What's on the menu today?</Text>
                </View>

                {/* Input field for URL / food name / description */}
                <View style={styles.inputSection}>
                    <TextInput
                        style={styles.input}
                        placeholder="Paste a recipe URL, or type a dish name (e.g. Spaghetti Carbonara)"
                        placeholderTextColor="#666"
                        value={quickInput}
                        onChangeText={setQuickInput}
                        onSubmitEditing={handleStartQuickCook}
                        returnKeyType="go"
                    />
                    <TouchableOpacity
                        style={[styles.submitBtn, isStarting && styles.submitBtnDisabled]}
                        onPress={handleStartQuickCook}
                        disabled={isStarting}
                    >
                        {isStarting ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <MaterialIcons name="play-arrow" size={28} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Start Quick Cook - Main CTA */}
                <TouchableOpacity
                    style={styles.quickCookButton}
                    onPress={handleStartQuickCook}
                    disabled={isStarting}
                    activeOpacity={0.85}
                >
                    {isStarting ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <>
                            <MaterialIcons name="bolt" size={24} color="#FFF" style={{ marginRight: 12 }} />
                            <Text style={styles.quickCookText}>Start Quick Cook</Text>
                            <MaterialIcons name="arrow-forward" size={24} color="#FFF" style={{ marginLeft: 'auto' }} />
                        </>
                    )}
                </TouchableOpacity>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <TouchableOpacity><Text style={styles.sectionLink}>View History</Text></TouchableOpacity>
                    </View>
                    {recentActivity.map((item) => (
                        <View key={item.id} style={styles.activityCard}>
                            <View style={[styles.activityThumb, { backgroundColor: '#2a2a2a' }]} />
                            <View style={styles.activityContent}>
                                <Text style={styles.activityTitle}>{item.title}</Text>
                                <Text style={styles.activityStatus}>{item.status}</Text>
                                <Text style={styles.activityTime}>{item.time}</Text>
                            </View>
                            <MaterialIcons name="check-circle" size={24} color={CORAL} />
                        </View>
                    ))}
                </View>

                {/* Recommended for You */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recommended for You</Text>
                        <TouchableOpacity><Text style={styles.sectionLink}>Explore All</Text></TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipeScroll}>
                        {(recommended.length > 0 ? recommended : [{ id: 'spaghetti-carbonara', title: 'Spaghetti Carbonara', time: '15m', difficulty: 'Easy' }]).map((item) => renderRecipeCard(item))}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="home" size={24} color={CORAL} />
                    <Text style={[styles.navLabel, { color: CORAL }]}>HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('RecipesList')}>
                    <MaterialIcons name="menu-book" size={24} color="#666" />
                    <Text style={styles.navLabel}>RECIPES</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Cooking', { recipeId: 'spaghetti-carbonara' })}>
                    <MaterialIcons name="restaurant" size={24} color="#666" />
                    <Text style={styles.navLabel}>COOK</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
                    <MaterialIcons name="settings" size={24} color="#666" />
                    <Text style={styles.navLabel}>SETTINGS</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#000' },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 100, paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 24 : 0 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    proLevel: { fontSize: 10, color: '#888', letterSpacing: 1, fontWeight: '700' },
    brand: { fontSize: 20, color: '#FFF', fontWeight: '800' },
    headerRight: { flexDirection: 'row', gap: 8 },
    iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

    welcomeSection: { marginBottom: 20 },
    welcomeText: { fontSize: 18, color: '#A0AEC0', fontWeight: '500' },
    welcomeName: { fontSize: 28, color: CORAL, fontWeight: '800', marginTop: 4 },
    welcomeSub: { fontSize: 16, color: '#888', marginTop: 4 },

    quickCookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CORAL,
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    quickCookText: { fontSize: 18, color: '#FFF', fontWeight: '700' },

    inputSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#333',
        paddingHorizontal: 16,
        marginBottom: 32,
    },
    input: { flex: 1, height: 52, color: '#FFF', fontSize: 16 },
    submitBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: CORAL,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnDisabled: { opacity: 0.6 },

    section: { marginBottom: 28 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 18, color: '#FFF', fontWeight: '700' },
    sectionLink: { fontSize: 14, color: CORAL, fontWeight: '600' },

    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#222',
    },
    activityThumb: { width: 50, height: 50, borderRadius: 25, marginRight: 14 },
    activityContent: { flex: 1 },
    activityTitle: { fontSize: 16, color: '#FFF', fontWeight: '600' },
    activityStatus: { fontSize: 13, color: '#888', marginTop: 2 },
    activityTime: { fontSize: 12, color: '#666', marginTop: 2 },

    recipeScroll: { marginHorizontal: -4 },
    recipeCard: {
        width: 160,
        marginRight: 14,
        backgroundColor: '#1a1a1a',
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#222',
    },
    recipeCardImage: { width: '100%', height: 100, backgroundColor: '#2a2a2a' },
    recipeCardTitle: { fontSize: 15, color: '#FFF', fontWeight: '700', padding: 12, paddingBottom: 4 },
    recipeMeta: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 12 },
    recipeMetaText: { fontSize: 12, color: '#888' },

    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    navItem: { alignItems: 'center' },
    navLabel: { fontSize: 10, color: '#666', marginTop: 4, fontWeight: '600' },
});
