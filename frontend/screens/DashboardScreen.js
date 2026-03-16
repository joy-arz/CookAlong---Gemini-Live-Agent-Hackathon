import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = 'https://api.cookalong.app';

export default function DashboardScreen({ route, navigation }) {
    const { token } = route.params;
    const [recipes, setRecipes] = useState([]);
    const [importUrl, setImportUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginRight: 20 }}>
                        <MaterialIcons name="settings" size={24} color="#A0AEC0" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.replace('Login')} style={{ marginRight: 15 }}>
                        <MaterialIcons name="logout" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            ),
            title: "Your Kitchen",
            headerStyle: { backgroundColor: '#121212' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' }
        });
    }, [navigation]);

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/recipes/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRecipes(data);
            }
        } catch (error) {
            console.error("Error fetching recipes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async () => {
        if (!importUrl.trim()) return;
        setIsImporting(true);
        try {
            const response = await fetch(`${API_URL}/recipes/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url: importUrl })
            });
            if (response.ok) {
                Alert.alert("Success", "Recipe imported successfully!");
                setImportUrl('');
                fetchRecipes(); // Refresh list
            } else {
                const data = await response.json();
                Alert.alert("Import Failed", data.detail || 'Unknown error');
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setIsImporting(false);
        }
    };

    const renderRecipe = ({ item }) => (
        <TouchableOpacity
            style={styles.recipeCard}
            onPress={() => navigation.navigate('Cooking', { recipeId: item.id })}
            activeOpacity={0.8}
        >
            <View style={styles.recipeCardHeader}>
                 <Text style={styles.recipeTitle}>{item.title}</Text>
                 <MaterialIcons name="chevron-right" size={24} color="#007AFF" />
            </View>
            <Text style={styles.recipeDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.recipeFooter}>
                 <MaterialIcons name="restaurant" size={16} color="#4CAF50" />
                 <Text style={styles.cookAction}>Ready to cook</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>

                <View style={styles.importSection}>
                    <Text style={styles.sectionLabel}>Import new recipe</Text>
                    <View style={styles.inputRow}>
                        <MaterialIcons name="link" size={24} color="#757575" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="https://example.com/recipe"
                            value={importUrl}
                            onChangeText={setImportUrl}
                            autoCapitalize="none"
                            keyboardType="url"
                            placeholderTextColor="#999"
                        />
                        <TouchableOpacity
                            style={[styles.importButton, isImporting && styles.importButtonDisabled]}
                            onPress={handleImport}
                            disabled={isImporting}
                        >
                            {isImporting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <MaterialIcons name="add" size={24} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.listHeaderContainer}>
                    <Text style={styles.sectionLabel}>Saved Recipes</Text>
                    <Text style={styles.recipeCount}>{recipes.length} items</Text>
                </View>

                {isLoading ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Fetching recipes...</Text>
                    </View>
                ) : recipes.length === 0 ? (
                    <View style={styles.emptyBox}>
                         <MaterialIcons name="menu-book" size={64} color="#e0e0e0" />
                         <Text style={styles.emptyTitle}>No recipes found</Text>
                         <Text style={styles.emptySubtitle}>Import a recipe URL above to get started.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={recipes}
                        keyExtractor={item => item.id}
                        renderItem={renderRecipe}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: '#000' },
    container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

    sectionLabel: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 12 },
    listHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, marginBottom: 12 },
    recipeCount: { fontSize: 14, color: '#A0A0A0', fontWeight: '500' },

    importSection: {
        backgroundColor: '#1C1C1E',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#333'
    },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#333' },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, height: 50, fontSize: 16, color: '#FFF' },
    importButton: {
        backgroundColor: '#FF6B6B',
        borderRadius: 12,
        padding: 8,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        width: 40
    },
    importButtonDisabled: { backgroundColor: '#555' },

    recipeCard: {
        backgroundColor: '#1C1C1E',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#333'
    },
    recipeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    recipeTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', flex: 1, marginRight: 8 },
    recipeDesc: { color: '#A0A0A0', fontSize: 14, marginVertical: 8, lineHeight: 22 },
    recipeFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    cookAction: { color: '#4CAF50', marginLeft: 6, fontWeight: '700', fontSize: 14 },

    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#A0A0A0', fontSize: 16 },

    emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#E0E0E0', marginTop: 16 },
    emptySubtitle: { fontSize: 15, color: '#888', textAlign: 'center', marginTop: 8, lineHeight: 22 }
});
