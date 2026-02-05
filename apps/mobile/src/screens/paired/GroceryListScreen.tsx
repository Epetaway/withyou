import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useTheme } from "../../theme/ThemeProvider";
import { apiClient } from "../../lib/appState";
import type { GroceryList, GroceryItem } from "@withyou/shared";

export function GroceryListScreen() {
  const theme = useTheme();
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  const fetchLists = async () => {
    try {
      const response = await apiClient.request<{ lists: GroceryList[]; count: number }>({
        method: "GET",
        url: "/grocery/lists",
      });
      setLists(response.lists);
      if (response.lists.length > 0 && !activeListId) {
        setActiveListId(response.lists[0].id);
      }
    } catch (error: any) {
      if (error.code === "NO_RELATIONSHIP") {
        Alert.alert("Not Paired", "You need to be in a relationship to use grocery lists");
      } else {
        Alert.alert("Error", error.message || "Failed to load grocery lists");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const createList = async () => {
    Alert.prompt(
      "New Grocery List",
      "Enter a name for your grocery list",
      async (text) => {
        if (!text || text.trim() === "") return;
        try {
          const response = await apiClient.request<{ list: GroceryList }>({
            method: "POST",
            url: "/grocery/lists",
            body: { name: text.trim() },
          });
          setLists([response.list, ...lists]);
          setActiveListId(response.list.id);
        } catch (error: any) {
          Alert.alert("Error", error.message || "Failed to create list");
        }
      }
    );
  };

  const addItem = async () => {
    if (!activeListId || !newItemName.trim()) return;
    
    setAddingItem(true);
    try {
      const response = await apiClient.request<{ item: GroceryItem }>({
        method: "POST",
        url: `/grocery/lists/${activeListId}/items`,
        body: { name: newItemName.trim() },
      });
      
      // Update the list with the new item
      setLists(lists.map(list => {
        if (list.id === activeListId) {
          return {
            ...list,
            items: [...(list.items || []), response.item],
          };
        }
        return list;
      }));
      
      setNewItemName("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add item");
    } finally {
      setAddingItem(false);
    }
  };

  const toggleItemComplete = async (item: GroceryItem) => {
    if (!activeListId) return;
    
    try {
      const response = await apiClient.request<{ item: GroceryItem }>({
        method: "PUT",
        url: `/grocery/lists/${activeListId}/items/${item.id}`,
        body: { completed: !item.completedAt },
      });
      
      // Update the list
      setLists(lists.map(list => {
        if (list.id === activeListId) {
          return {
            ...list,
            items: (list.items || []).map(i => i.id === item.id ? response.item : i),
          };
        }
        return list;
      }));
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update item");
    }
  };

  const vetoItem = async (item: GroceryItem) => {
    if (!activeListId) return;
    
    Alert.prompt(
      "Veto Item",
      "Why do you want to veto this item? (optional)",
      async (reason) => {
        try {
          const response = await apiClient.request<{ item: GroceryItem }>({
            method: "POST",
            url: `/grocery/lists/${activeListId}/items/${item.id}/veto`,
            body: { vetoReason: reason || undefined },
          });
          
          // Update the list
          setLists(lists.map(list => {
            if (list.id === activeListId) {
              return {
                ...list,
                items: (list.items || []).map(i => i.id === item.id ? response.item : i),
              };
            }
            return list;
          }));
        } catch (error: any) {
          Alert.alert("Error", error.message || "Failed to veto item");
        }
      },
      "plain-text",
      ""
    );
  };

  const deleteItem = async (item: GroceryItem) => {
    if (!activeListId) return;
    
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.request({
                method: "DELETE",
                url: `/grocery/lists/${activeListId}/items/${item.id}`,
              });
              
              // Update the list
              setLists(lists.map(list => {
                if (list.id === activeListId) {
                  return {
                    ...list,
                    items: (list.items || []).filter(i => i.id !== item.id),
                  };
                }
                return list;
              }));
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete item");
            }
          },
        },
      ]
    );
  };

  const renderItem = (item: GroceryItem) => {
    const isCompleted = !!item.completedAt;
    const isVetoed = item.vetoed;

    return (
      <View
        key={item.id}
        style={[
          styles.itemCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          isCompleted && { opacity: 0.6 },
          isVetoed && { borderColor: "#EF4444", backgroundColor: "#FEE2E2" },
        ]}
      >
        <Pressable
          style={styles.itemContent}
          onPress={() => toggleItemComplete(item)}
        >
          <View
            style={[
              styles.checkbox,
              { borderColor: isCompleted ? theme.colors.primary : theme.colors.border },
              isCompleted && { backgroundColor: theme.colors.primary },
            ]}
          >
            {isCompleted && <FontAwesome6 name="check" size={14} color="#FFFFFF" />}
          </View>
          
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.itemName,
                { color: theme.colors.text },
                isCompleted && { textDecorationLine: "line-through" },
              ]}
            >
              {item.name}
            </Text>
            {item.quantity > 1 && (
              <Text style={[styles.itemQuantity, { color: theme.colors.text2 }]}>
                Qty: {item.quantity}{item.unit ? ` ${item.unit}` : ""}
              </Text>
            )}
            {isVetoed && (
              <View style={styles.vetoedBadge}>
                <FontAwesome6 name="ban" size={12} color="#DC2626" />
                <Text style={[styles.vetoedText, { color: "#DC2626" }]}>
                  Vetoed{item.vetoReason ? `: ${item.vetoReason}` : ""}
                </Text>
              </View>
            )}
          </View>
        </Pressable>

        <View style={styles.itemActions}>
          {!isVetoed && !isCompleted && (
            <Pressable style={styles.actionButton} onPress={() => vetoItem(item)}>
              <FontAwesome6 name="ban" size={18} color="#F59E0B" />
            </Pressable>
          )}
          <Pressable style={styles.actionButton} onPress={() => deleteItem(item)}>
            <FontAwesome6 name="trash" size={18} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Grocery List</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  const activeList = lists.find(l => l.id === activeListId);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {activeList?.name || "Grocery List"}
        </Text>
        <Pressable style={styles.createButton} onPress={createList}>
          <FontAwesome6 name="plus" size={20} color={theme.colors.primary} />
        </Pressable>
      </View>

      {lists.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome6 name="basket-shopping" size={64} color={theme.colors.text2} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Lists Yet</Text>
          <Text style={[styles.emptyDescription, { color: theme.colors.text2 }]}>
            Create your first shared grocery list
          </Text>
          <Pressable
            style={[styles.createButtonLarge, { backgroundColor: theme.colors.primary }]}
            onPress={createList}
          >
            <Text style={styles.createButtonText}>Create List</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {lists.length > 1 && (
            <ScrollView
              horizontal
              style={styles.tabsContainer}
              contentContainerStyle={styles.tabsContent}
              showsHorizontalScrollIndicator={false}
            >
              {lists.map(list => (
                <Pressable
                  key={list.id}
                  style={[
                    styles.tab,
                    { borderColor: theme.colors.border },
                    list.id === activeListId && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => setActiveListId(list.id)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: list.id === activeListId ? "#FFFFFF" : theme.colors.text },
                    ]}
                  >
                    {list.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <View style={[styles.addItemContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <TextInput
              style={[styles.addItemInput, { color: theme.colors.text }]}
              placeholder="Add item..."
              placeholderTextColor={theme.colors.text2}
              value={newItemName}
              onChangeText={setNewItemName}
              onSubmitEditing={addItem}
              returnKeyType="done"
            />
            <Pressable
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={addItem}
              disabled={addingItem || !newItemName.trim()}
            >
              {addingItem ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <FontAwesome6 name="plus" size={18} color="#FFFFFF" />
              )}
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeList?.items && activeList.items.length > 0 ? (
              activeList.items.map(renderItem)
            ) : (
              <View style={styles.emptyList}>
                <Text style={[styles.emptyListText, { color: theme.colors.text2 }]}>
                  No items yet. Add your first item above!
                </Text>
              </View>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  createButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  addItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  addItemInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemQuantity: {
    fontSize: 14,
    marginTop: 2,
  },
  vetoedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  vetoedText: {
    fontSize: 13,
    fontWeight: "500",
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  createButtonLarge: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyList: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyListText: {
    fontSize: 16,
    textAlign: "center",
  },
});
