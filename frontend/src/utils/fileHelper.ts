export function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): File | null{
    if (e.target.files && e.target.files.length > 0) {
      return e.target.files[0]
    }
    return null
  }
