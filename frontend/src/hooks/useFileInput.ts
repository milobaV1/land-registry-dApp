import { useState } from 'react'
import { handleFileChange } from '@/utils/fileHelper'

export function useFileInput() {
  const [file, setFile] = useState<File | null>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = handleFileChange(e)
    if (selected) setFile(selected)
  }

  return { file, onChange }
}
