import React, { useState, useEffect } from 'react'
import {
  View,
  ImageBackground,
  Text,
  StyleSheet,
  Image
} from 'react-native'

// Select HTML element -> mobile element
import RNPickerSelect from 'react-native-picker-select'

// React Native Icons
import { Feather as Icon } from '@expo/vector-icons'

// Gesture Handlers
import { RectButton } from 'react-native-gesture-handler'

// Navigation
import { useNavigation } from '@react-navigation/native'

// axios
import axios, { AxiosResponse } from 'axios'

interface State {
  region: string,
  name: string,
  uf: string
}

interface IBGEUFResponse {
  regiao: { nome: string },
  nome: string,
  sigla: string
}

interface IBGECITYResponse {
  nome: string
}

export default function Home() {
  const [uf, setUf] = useState('0')
  const [states, setStates] = useState<State[]>([])

  const [cities, setCities] = useState<IBGECITYResponse[]>([])
  const [city, setCity] = useState('0')

  const navigation = useNavigation()

  function navigateToPointsHandler() {
    navigation.navigate('Points', { city, uf })
  }

  useEffect(() => {
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        const data: IBGEUFResponse[] = response.data
        const parsedStates: State[] = []

        data.forEach(state => {
          parsedStates.push({
            region: state.regiao.nome,
            name: state.nome,
            uf: state.sigla
          })
        })
        setStates(parsedStates)
      })
  }, [])

  useEffect(() => {
    if (uf === '0') return
    axios.get(`
        https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios
    `)
      .then((response: AxiosResponse<IBGECITYResponse[]>) => {
        const fetchedCities = response.data.map(city => city.nome)
        setCities(fetchedCities.map(fetchedCity => {
          return { nome: fetchedCity }
        }))
      })
      .catch(err => console.error(err.message))
  }, [uf])

  function ufChangedHandler(uf: string) {
    setCity('0')
    setCities([])
    setUf(uf)
  }

  return (
    <ImageBackground
      source={require('../../assets/home-background.png')}
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />
        <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
        <Text
          style={styles.description}
        >Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente</Text>
      </View>

      <View style={styles.footer}>

        <RNPickerSelect
          placeholder={{ label: 'Escolha seu Estado (UF)', value: '0' }}
          onValueChange={(value: string) => ufChangedHandler(value)}
          items={states.map(state => {
            return { label: state.name, value: state.uf }
          })}
        />

        <RNPickerSelect
          placeholder={{ label: 'Escolha sua Cidade', value: '0' }}
          onValueChange={(value: string) => setCity(value)}
          items={cities.map(ct => {
            return { label: ct.nome, value: ct.nome }
          })}
        />

        <RectButton style={styles.button} onPress={navigateToPointsHandler}>
          <View style={styles.buttonIcon}>
            <Text>
              <Icon name='log-in' color="#fff" size={24} />
            </Text>
          </View>
          <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});