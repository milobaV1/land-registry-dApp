import { uploadToPinata } from "@/utils/pinataHelper"
import { useState } from "react"

export function usePinataUpload() {
  const [uploadStatus, setUploadStatus] = useState('')
  const [link, setLink] = useState('')

  const upload = async (file: File) => {
    try {
      setUploadStatus('Uploading...')
      const { url } = await uploadToPinata(file)
      setUploadStatus('Success!')
      setLink(url)
    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return { upload, uploadStatus, link }
}