import React, { useState } from 'react'

// React Icons
import { FiUpload } from 'react-icons/fi'

// Image upload dropzone
import Dropzone from 'react-dropzone'

// CSS styles
import './styles.css'

interface Props {
    onFileUploaded: (file: File) => void
}

function DropZone(props: Props) {

    const [selectedFileUrl, setSelectedFileUrl] = useState('')

    function uploadedFileHandler(files: File[]) {
        if (files.length === 0)
            return alert('Apenas arquivos de imagem são permitidos!')

        setSelectedFileUrl(URL.createObjectURL(files[0]))
        props.onFileUploaded(files[0])
    }

    return (
        <Dropzone
            multiple={false}
            accept='image/*'
            onDrop={uploadedFileHandler}
        >
            {({ getRootProps, getInputProps }) => (
                <section>
                    <div {...getRootProps()} className="dropzone">
                        <input {...getInputProps()} accept="image/*" />

                        {
                            selectedFileUrl
                            ? <img src={selectedFileUrl} alt={selectedFileUrl} />
                            : (
                                <p>
                                    <FiUpload />
                                    Arraste ou clique para adicionar uma 
                                    imagem do estabelecimento
                                </p>
                            )
                        }
                    </div>
                </section>
            )}
        </Dropzone>
    )
}

export default DropZone