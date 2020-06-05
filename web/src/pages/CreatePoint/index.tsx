import React,
{
    useEffect,
    useState,
    Fragment,
    ChangeEvent,
    FormEvent
} from 'react'

// Router
import { Link, useHistory } from 'react-router-dom'

// React Icons
import { FiArrowLeft } from 'react-icons/fi'

// Leaflet map API
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'

// Leaftlet
import { LeafletMouseEvent } from 'leaflet'

// axios
import axios, { AxiosResponse } from 'axios'
import api from 'services/api'

// Components
import Dropzone from '../../components/Dropzone'

// UI components
import logo from 'assets/logo.svg'

// CSS styles
import './CreatePoint.css'

interface CollectionItems {
    image_url: string,
    title: string,
    id: number,
    selected: boolean
}

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

const CreatePoint = () => {

    const [selectedFile, setSelectedFile] = useState<File>()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [whatsapp, setWhatsapp] = useState('')

    const [uf, setUf] = useState('0')

    const [north, setNorth] = useState<State[]>([])
    const [northeast, setNortheast] = useState<State[]>([])
    const [southeast, setSoutheast] = useState<State[]>([])
    const [south, setSouth] = useState<State[]>([])
    const [centerwest, setCenterwest] = useState<State[]>([])

    const [cities, setCities] = useState<IBGECITYResponse[]>([])
    const [city, setCity] = useState('0')

    const [items, setItems] = useState<CollectionItems[]>([])

    const [position, setPosition] = useState<[number, number]>([0, 0])

    const history = useHistory()

    function handleMapClick(e: LeafletMouseEvent) {
        setPosition([e.latlng.lat, e.latlng.lng])
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

                const northRegion: State[] = []
                const northeastRegion: State[] = []
                const southeastRegion: State[] = []
                const southRegion: State[] = []
                const centerwestRegion: State[] = []

                parsedStates.forEach(state => {
                    switch (state.region) {
                        case 'Norte':
                            {
                                northRegion.push(state)
                                break
                            }
                        case 'Nordeste':
                            {
                                northeastRegion.push(state)
                                break
                            }
                        case 'Sudeste':
                            {
                                southeastRegion.push(state)
                                break
                            }
                        case 'Sul':
                            {
                                southRegion.push(state)
                                break
                            }
                        case 'Centro-Oeste':
                            {
                                centerwestRegion.push(state)
                                break
                            }
                    }
                })

                setNorth(northRegion)
                setNortheast(northeastRegion)
                setSoutheast(southeastRegion)
                setSouth(southRegion)
                setCenterwest(centerwestRegion)
            })

        api.get('/items')
            .then(response => {
                setItems(response.data.map((item: CollectionItems) => {
                    return {
                        ...item,
                        selected: false
                    }
                }))
            })
            .catch(err => console.error(err.message))

        navigator.geolocation.getCurrentPosition(
            pos =>
                setPosition([pos.coords.latitude, pos.coords.longitude]),
            error =>
                console.error(
                    error.message,
                    '| Enable geolocation in browser settings to access location map'
                )
        )

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

    function ufChangedHandler(e: ChangeEvent<HTMLSelectElement>) {
        setCity('0')
        setCities([])
        setUf(e.target.value)
    }

    function itemSelectedHandler(id: number) {
        const updatedSelectedState = items.map(item => {
            if (item.id === id) item.selected = !item.selected
            return item
        })

        setItems(updatedSelectedState)
    }

    function createPointHandler(e: FormEvent) {
        e.preventDefault()

        const itemsSelected = items.filter(item => item.selected).map(item => item.id)
        const [latitude, longitude] = position

        const pointData = new FormData()

        pointData.append('name', name)
        pointData.append('email', email)
        pointData.append('whatsapp', whatsapp)
        pointData.append('uf', uf)
        pointData.append('city', city)
        pointData.append('latitude', String(latitude))
        pointData.append('longitude', String(longitude))
        pointData.append('items', itemsSelected.join(','))
        
        if(selectedFile) pointData.append('image', selectedFile)

        api.post('/points', pointData)
            .then(() => history.goBack())
            .catch(err => console.log(err))
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <span><FiArrowLeft /></span>
                    <strong>Voltar para a home</strong>
                </Link>
            </header>

            <form onSubmit={createPointHandler}>
                <h1>Cadastro do ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile}/>

                {/* DADOS */}
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            name="name"
                            id="name"
                        />
                    </div>

                    {/* [DADOS] CONTATO DA ENTIDADE DE COLETA */}
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail da entidade</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                name="email"
                                id="email"
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                value={whatsapp}
                                onChange={e => setWhatsapp(e.target.value)}
                                name="whatsapp"
                                id="whatsapp"
                            />
                        </div>
                    </div>

                </fieldset>

                {/* ENDEREÇO DA ENTIDADE */}
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map
                        id="map"
                        center={position}
                        zoom={15}
                        onClick={handleMapClick}
                    >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={position}>
                            <Popup>
                                A pretty CSS3 popup. <br /> Easily customizable.
                            </Popup>
                        </Marker>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                name="uf"
                                onChange={ufChangedHandler}
                                value={uf}
                            >
                                <option
                                    value="0"
                                    disabled
                                >Selecione uma UF</option>
                                <optgroup label="Região Norte">
                                    {
                                        north.map(state => (
                                            <option
                                                key={state.uf}
                                                value={state.uf}
                                            >{state.name} - {state.uf}</option>
                                        ))
                                    }
                                </optgroup>

                                <optgroup label="Região Nordeste">
                                    {
                                        northeast.map(state => (
                                            <option
                                                key={state.uf}
                                                value={state.uf}
                                            >{state.name} - {state.uf}</option>
                                        ))
                                    }
                                </optgroup>

                                <optgroup label="Região Sudeste">
                                    {
                                        southeast.map(state => (
                                            <option
                                                key={state.uf}
                                                value={state.uf}
                                            >{state.name} - {state.uf}</option>
                                        ))
                                    }
                                </optgroup>

                                <optgroup label="Região Sul">
                                    {
                                        south.map(state => (
                                            <option
                                                key={state.uf}
                                                value={state.uf}
                                            >{state.name} - {state.uf}</option>
                                        ))
                                    }
                                </optgroup>

                                <optgroup label="Região Centro-Oeste">
                                    {
                                        centerwest.map(state => (
                                            <option
                                                key={state.uf}
                                                value={state.uf}
                                            >{state.name} - {state.uf}</option>
                                        ))
                                    }
                                </optgroup>

                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="cidade">Cidade</label>
                            <select
                                name="cidade"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                            >
                                <option
                                    value="0"
                                    disabled
                                >Selecione uma cidade</option>

                                {
                                    cities.length === 0
                                        ? (
                                            <Fragment>
                                                <option disabled>
                                                    Escolha um Estado (UF) primeiro
                                                </option>
                                                <option disabled>
                                                    para carregar as cidades!
                                                </option>
                                            </Fragment>
                                        )
                                        : null
                                }

                                {
                                    cities.map(ct => (
                                        <option
                                            key={ct.nome}
                                            value={ct.nome}
                                        >{ct.nome}</option>
                                    ))
                                }

                            </select>
                        </div>
                    </div>
                </fieldset>

                {/* ITENS DE COLETA DA ENTIDADE */}
                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {
                            items.map(item => {
                                return (
                                    <li
                                        key={item.id}
                                        onClick={() => itemSelectedHandler(item.id)}
                                        className={item.selected ? "selected" : ""}
                                    >
                                        <img src={item.image_url} alt={item.title} />
                                        <span>{item.title}</span>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </fieldset>

                {/* BOTÃO PARA CADASTRO DA ENTIDADE */}
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreatePoint