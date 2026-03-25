import { useCallback, type ChangeEvent } from 'react'

export const useFileHandling = (formData: any, setFormData: (data: any) => void) => {
    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = error => reject(error)
        })
    }

    const handleFileChange = useCallback(
        (field: string, multiple: boolean = false) => async (e: ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files
            if (!files || files.length === 0) {
                setFormData({ ...formData, [field]: null })
                return
            }

            // Strictly allow only images
            const fileArray = Array.from(files)
            const nonImageFound = fileArray.some(file => !file.type.startsWith('image/'))
            if (nonImageFound) {
                alert("Only image files are allowed. Please select valid images.")
                e.target.value = '' // Clear input
                setFormData({ ...formData, [field]: null })
                return
            }

            try {
                if (multiple) {
                    const base64Files = await Promise.all(Array.from(files).map(convertToBase64))
                    const value = base64Files.length === 1 ? base64Files[0] : JSON.stringify(base64Files)
                    setFormData({ ...formData, [field]: value })
                } else {
                    const base64 = await convertToBase64(files[0])
                    setFormData({ ...formData, [field]: base64 })
                }
            } catch (error) {
                console.error("Error converting files to base64:", error)
            }
        },
        [formData, setFormData]
    )

    return { handleFileChange }
}
