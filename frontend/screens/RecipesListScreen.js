import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { API_URL } from '../config';

export default function RecipesListScreen({ route, navigation }) {
    const token = route?.params?.token;
    const [recipes, setRecipes] = useState([]);
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

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.recipeCard}
            onPress={() => navigation.navigate('Cooking', { recipeId: item.id })}
            activeOpacity={0.8}
        >
            <View style={styles.recipeCardHeader}>
                <Text style={styles.recipeTitle}>{item.title}</Text>
                <MaterialIcons name="chevron-right" size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.recipeDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.recipeFooter}>
                <MaterialIcons name="restaurant" size={16} color="#4CAF50" />
                <Text style={styles.cookAction}>Ready to cook</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Recipes</Text>
            </View>
            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#FF6B6B" />
                    <Text style={styles.loadingText}>Loading recipes...</Text>
                </View>
            ) : recipes.length === 0 ? (
                <View style={styles.center}>
                    <MaterialIcons name="menu-book" size={64} color="#444" />
                    <Text style={styles.emptyTitle}>No recipes yet</Text>
                    <Text style={styles.emptySub}>Use Start Quick Cook to add recipes</Text>
                    <TouchableOpacity
                        style={styles.sampleBtn}
                        onPress={() => navigation.navigate('Cooking', { recipeId: 'spaghetti-carbonara' })}
                    >
                        <Text style={styles.sampleBtnText}>Try Spaghetti Carbonara</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={recipes}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
    backBtn: { marginRight: 16 },
    title: { fontSize: 20, color: '#FFF', fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 12, color: '#888' },
    emptyTitle: { fontSize: 18, color: '#FFF', marginTop: 16 },
    emptySub: { fontSize: 14, color: '#666', marginTop: 8 },
    sampleBtn: { marginTop: 24, backgroundColor: '#FF6B6B', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
    sampleBtnText: { color: '#FFF', fontWeight: '700' },
    list: { padding: 16, paddingBottom: 40 },
    recipeCard: {
        backgroundColor: '#1a1a1a',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#222',
    },
    recipeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    recipeTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', flex: 1 },
    recipeDesc: { color: '#888', fontSize: 14, marginTop: 8 },
    recipeFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    cookAction: { color: '#4CAF50', marginLeft: 6, fontWeight: '600' },
});
