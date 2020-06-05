import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity
} from 'react-native'

// Spinner
import { AppLoading } from 'expo'

// API
import api from '../../services/api'

// Map
import MapView, { Marker } from 'react-native-maps'

// Expo location
import * as Location from 'expo-location'

// React Native Icons
import { Feather as Icon } from '@expo/vector-icons'

// Expo Constants
import Constants from 'expo-constants'

// Navigation
import { useNavigation, useRoute } from '@react-navigation/native'

// React Native SVG integration
import { SvgUri } from 'react-native-svg'

interface CollectionPoints {
  id: number,
  name: string,
  latitude: number,
  longitude: number,
  image_url: string
}

interface CollectionItems {
  id: number,
  title: string,
  image_url: string,
  selected: boolean
}

interface RouteParams {
  city: string,
  uf: string
}

export default function Points() {
  const navigation = useNavigation()
  const route = useRoute()

  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])

  const [points, setPoints] = useState<CollectionPoints[]>([])
  const [items, setItems] = useState<CollectionItems[]>([])

  useEffect(() => {
    api.get('items')
      .then(response => {
        const data: CollectionItems[] = response.data
        setItems(data.map(d => { return { ...d, selected: false } }))
      })
  }, [])

  useEffect(() => {
    const filterItems = items.filter(item => item.selected).map(item => item.id)

    const { city, uf } = route.params as RouteParams

    api.get('/points', {
      params: {
        city, uf,
        items: filterItems.join(',')
      }
    })
      .then(response => {
        const data: CollectionPoints[] = response.data
        setPoints(data)
      })
      .catch(err => console.error(err.message))
  }, [items])

  useEffect(() => {
    async function loadMap() {
      const { status } = await Location.requestPermissionsAsync()

      if (status !== 'granted') {
        Alert.alert('Oops!', 'Precisamos de sua permissão para obter a localização')
        return
      }

      const location = await Location.getCurrentPositionAsync()

      const { latitude, longitude } = location.coords
      setInitialPosition([latitude, longitude])
    }

    loadMap()
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={navigation.goBack}>
          <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Text style={styles.title}>Bem Vindo.</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

        <View style={styles.mapContainer}>
          {
            initialPosition[0] !== 0 && (
              <MapView
                style={styles.map}
                loadingEnabled={initialPosition[0] === 0}
                initialRegion={{
                  latitude: initialPosition[0],
                  longitude: initialPosition[1],
                  latitudeDelta: 0.014,
                  longitudeDelta: 0.014
                }}
              >
                {
                  points.map(point => (
                    <Marker
                      key={String(point.id)}
                      style={styles.mapMarker}
                      coordinate={{
                        latitude: point.latitude,
                        longitude: point.longitude
                      }}
                      onPress={() => navigation.navigate('Detail', { id: point.id })}
                    >
                      <View style={styles.mapMarkerContainer}>
                        <Image
                          style={styles.mapMarkerImage}
                          source={{ uri: point.image_url }}
                        />
                        <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                      </View>
                    </Marker>
                  )
                  )
                }
              </MapView>
            )
          }
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 4 }}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {
            items.map(item => (
              <TouchableOpacity
                activeOpacity={0.6}
                key={String(item.id)}
                style={[styles.item, item.selected ? styles.selectedItem : {}]}
                onPress={() => {
                  setItems(items.map(i => {
                    if (i.id === item.id) i.selected = !i.selected
                    return i
                  }))
                }}
              >
                <SvgUri width={42} height={42} uri={item.image_url} />
                <Text style={styles.itemTitle}>{item.title}</Text>
              </TouchableOpacity>
            )
            )
          }
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80,
  },

  mapMarkerContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 11,
    padding: 2,
    textAlign: 'center',
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 4,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});