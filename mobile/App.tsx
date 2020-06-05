import React, { Fragment } from 'react'
import { StatusBar } from 'react-native'

// Spinner
import { AppLoading } from 'expo'

// Fonts
import { Ubuntu_700Bold, useFonts } from '@expo-google-fonts/ubuntu'
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto'

// Routes
import Routes from './src/routes'

export default function App() {
  
  const [fontsLoaded] = useFonts({
    Ubuntu_700Bold,
    Roboto_400Regular,
    Roboto_500Medium
  })

  if(!fontsLoaded) {
    return <AppLoading />
  }

  return (
    <Fragment>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent/>
      <Routes />
    </Fragment>
  )
}