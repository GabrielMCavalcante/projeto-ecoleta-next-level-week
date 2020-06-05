import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  Linking,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity
} from 'react-native'

// Navigation
import { useNavigation, useRoute } from '@react-navigation/native'

// React Native Icons
import { Feather as Icon, FontAwesome as Icon2 } from '@expo/vector-icons'

// Mail Composer
import * as MailComposer from 'expo-mail-composer'

// Gesture Handler Button
import { RectButton } from 'react-native-gesture-handler'

// Constants
import Constants from 'expo-constants'

// API
import api from '../../services/api'

interface RouteParams {
  id: number
}

interface CollectionPoint {
  name: string,
  email: string,
  whatsapp: string,
  city: string,
  uf: string,
  image_url: string,
  items: { title: string }[]
}

export default function Detail() {

  const navigation = useNavigation()
  const route = useRoute()

  const [point, setPoint] = useState<CollectionPoint>()

  useEffect(() => {
    const routeParams = route.params as RouteParams

    api.get(`/points/${routeParams.id}`).then(response => setPoint(response.data))
  }, [])

  function composeMailHandler() {
    const recipients: string[] = [point?.email as string]
    const subject = `${point?.name}: [Coleta de resíduos]`
    const body = `Olá ${point?.name}, estou notificando meu interesse na coleta de ${point?.items.map(item=>item.title).join(', ')}`

    MailComposer.composeAsync({ recipients, subject, body })
  }

  function whatsappHandler() {
    const message = `Olá ${point?.name}, estou notificando meu interesse na coleta de ${point?.items.map(item=>item.title).join(', ')}`
    Linking.openURL(`whatsapp://send?phone=${point?.whatsapp}&text=${message}`)
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={navigation.goBack}>
          <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Image
          style={styles.pointImage}
          source={{ uri: point?.image_url }}
        />

        <Text style={styles.pointName}>{point?.name}</Text>

        <Text 
          style={styles.pointItems}
        >{point?.items.map(item=>item.title).join(', ')}</Text>

        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereço</Text>
          <Text style={styles.addressContent}>{point?.city}, {point?.uf}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={whatsappHandler}>
          <Icon2 name="whatsapp" size={20} color="#fff" />
          <Text style={styles.buttonText}>Whatsapp</Text>
        </RectButton>

        <RectButton style={styles.button} onPress={composeMailHandler}>
          <Icon name="mail" size={20} color="#fff" />
          <Text style={styles.buttonText}>E-Mail</Text>
        </RectButton>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  pointImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 32,
  },

  pointName: {
    color: '#322153',
    fontSize: 28,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  pointItems: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  address: {
    marginTop: 32,
  },

  addressTitle: {
    color: '#322153',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },

  addressContent: {
    fontFamily: 'Roboto_400Regular',
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  button: {
    width: '48%',
    backgroundColor: '#34CB79',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
  },
});